const {Composer, Keyboard} = require("grammy");
const {Menu, MenuRange} = require("@grammyjs/menu");
const {I18n, hears} = require("@grammyjs/i18n");
const {
    conversations,
    createConversation,
} = require("@grammyjs/conversations");
const {check_user, register_user, remove_user, set_user_lang} = require("../controllers/userController");
const {check_user_admin, logOut_user} = require("../controllers/adminController");
const {enter_to_station_report} = require("../controllers/reportController");

const bot = new Composer();
const i18n = new I18n({
    defaultLocale: "uz",
    useSession: true,
    directory: "locales",
    globalTranslationContext(ctx) {
        return {first_name: ctx.from?.first_name ?? ""};
    },
});
bot.use(i18n);
bot.use(createConversation(register_user_phone));
bot.use(createConversation(main_menu_conversation));
const pm = bot.chatType("private")


async function register_user_phone(conversation, ctx) {

    let phone_btn = new Keyboard()
        .requestContact("📞 Telefon raqam")
        .resized();
    await ctx.reply(`
<b>🔒 Tizimga kirish uchun telefon raqamingiz yuboring</b>

<i>👇Telefon raqam tugmasini bosing.</i> 
   `, {
        parse_mode: "HTML",
        reply_markup: phone_btn
    })

    ctx = await conversation.wait();
    if (check_phone_number(ctx.message, conversation)) {
        do {
            await ctx.reply("Noto'g'ri formatdagi telefon raqam", {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (check_phone_number(ctx.message, conversation));
    }
    let res_status = await  check_user_admin(ctx.session.session_db.client.phone);
    if(res_status.status){

        // success login
        await ctx.reply(`
<i>🎉 ${res_status.data.full_name} siz tizimga muvofaqiyatli ravishda kirdingiz!</i>      
        `, {
            parse_mode:"HTML",
            reply_markup: { remove_keyboard: true }
        });
        await main_menu_conversation(conversation, ctx)



    }else{
        // login failed
        let retry_register_btn = new Keyboard()
            .text("🔒 Tizimga kirish")
            .resized();
        await ctx.reply(`
<b>⚠️ Telefon raqam bazadan topilmadi!</b>   

<i>Agar siz buni xato deb hisoblasangiz quyidagi raqamlarga aloqaga chiqing!</i>  

<i>Ma'sul xodimlar</i>
<i>🧑‍💻 Jamshid Raximov +998(99) 501-60-04</i>   
<i>🧑‍💻 Jobir Boboqulov +998(97) 722-66-56</i>   
        `, {
            parse_mode:"HTML",
            reply_markup: retry_register_btn,

        })


    }



}
async function main_menu_conversation(conversation, ctx) {

    let main_btn = new Keyboard()
        .text("🗒 Kiruvchi vagonlar ma'lumoti")
        .row()
        .text("🗒 Chiquvchi vagonlar ma'lumoti")
        .row()
        .text("👤 Kabinetim")
        .text("📤 Chiqish")
        .resized();

    await ctx.reply(`<i>⚡️ Asosy menyu ⚡️</i> `, {
        parse_mode:"HTML",
        reply_markup: main_btn,
    });
    return;




}


const check_phone_number = (msg, conversation) => {
    if (msg?.contact) {
        conversation.session.session_db.client.phone = msg.contact.phone_number
        return false
    } else {
        let reg = new RegExp('^[012345789][0-9]{8}$');
        conversation.session.session_db.client.phone = reg.test(msg.text) ? "+998" + msg.text : null;
        return !reg.test(msg.text)
    }

}


pm.command("start", async (ctx) => {


    if(ctx.config.is_registered){
        await ctx.conversation.enter("main_menu_conversation");
    }else{
        let retry_register_btn = new Keyboard()
            .text("🔒 Tizimga kirish")
            .resized();
        await ctx.reply(`
<b>Salom 👋. DASUTY bot xush kelibsiz</b> 

<i>♻️ Botdan to'liq foydalanish uchun oldin tizimga kirishingiz lozim!</i>  
 
<i>Tizimga kirish uchun <b>[🔒 Tizimga kirish]</b> tugmasini bosing.</i>   
    `,{
            parse_mode:"HTML",
            reply_markup: retry_register_btn,
        })
    }

})

bot.hears("🔒 Tizimga kirish", async (ctx)=>{
    await ctx.conversation.enter("register_user_phone");
})
bot.hears("📤 Chiqish", async (ctx)=>{
    let res_data = await logOut_user(ctx.from.id);
    let retry_register_btn = new Keyboard()
        .text("🔒 Tizimga kirish")
        .resized();
    await ctx.reply("🔴 Tizimdan chiqdingiz!", {
        parse_mode:"HTML",
        reply_markup: retry_register_btn,
    })

})

bot.hears("🗒 Kiruvchi vagonlar ma'lumoti", async (ctx)=>{
    let user_id = ctx.from.id;
    let res_data = await enter_to_station_report(user_id);
    console.log(res_data.data.length)


   await ctx.reply(`
<b>📊 Qisqacha hisobot</b>

<b>🚃 Vagonlar soni:</b>  ${res_data.data.length}   
    `,{
       parse_mode:"HTML",
   })



})


module.exports = bot;