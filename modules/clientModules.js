const {Composer, Keyboard} = require("grammy");
const {Menu, MenuRange} = require("@grammyjs/menu");
const {I18n, hears} = require("@grammyjs/i18n");
const {
    conversations,
    createConversation,
} = require("@grammyjs/conversations");
const {check_user, register_user, remove_user, set_user_lang} = require("../controllers/userController");
const {check_user_admin, logOut_user, my_user_info} = require("../controllers/adminController");
const {enter_to_station_report, find_cargo_by_station} = require("../controllers/reportController");

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
    let res_status = await  check_user_admin(ctx.session.session_db.client.phone, ctx.from.id);
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
        .text("🗒 Kiruvchi vagonlar")
        .row()
        .text("👤 Ma'lumotlarim")
        .text("📤 Chiqish")
        .row()
        .text("☎️ Support")
        .resized();

    await ctx.reply(`<i>⚡️ Asosiy menyu ⚡️</i> `, {
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

pm.hears("🔒 Tizimga kirish", async (ctx)=>{
    await ctx.conversation.enter("register_user_phone");
})
pm.hears("📤 Chiqish", async (ctx)=>{
    let res_data = await logOut_user(ctx.from.id);
    let retry_register_btn = new Keyboard()
        .text("🔒 Tizimga kirish")
        .resized();
    await ctx.reply("🔴 Tizimdan chiqdingiz!", {
        parse_mode:"HTML",
        reply_markup: retry_register_btn,
    })

})



async function message_sender_station_data(ctx, msg) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                await  ctx.reply(`
<b><i>#Hisobot </i></b>
<b>${msg.first_station?.station_name_ru}</b> ➡️ <b>${msg.current_station?.station_name_ru}</b> ➡️ <b>${msg.last_station?.station_name_ru}</b>

🧾 Poyezd index: <b>${msg.index} </b> 
🚃 Vagon raqami: <b>${msg.vagon_number}</b>  

  
📦 Yuk nomi: <b>${msg.cargo_name}</b>    
🔍 Yuk massasi: <b>${msg.cargo_massa} </b>  
 
🏗 Amal nomi: <b>${msg.action_name}</b>    
🗓 Amal sanasi: <b>${new Date(msg.action_date).toLocaleDateString('vi-VN')} </b> 
   
🏁 Chiqqan stansiya: <b>${msg.first_station?.station_name_ru}</b>     
🏳️ Joriy stansiya: <b>${msg.current_station?.station_name_ru} </b>     
⏰ Sarflangan vaqt: <b>${msg.wait_time} </b>     
🏴 Borayotgan stansiya: <b>${msg.last_station?.station_name_ru} </b>  

#Hisobot #dasuty_station_bot
Ⓜ️ Manba: @dasuty_station_bot
    `, {
                    parse_mode:"HTML",
                });
                resolve(true);
            } catch (error) {
                reject(false)
            }

        }, 100)
    })
}







const station_btn = new Menu("station_btn")
    .dynamic(async (ctx, range) => {
        let list = ctx.session.session_db.group_station_list
        list.forEach((item, index) => {
            range
                .text((index+1)+ ") "+ item.name + " - "+item.count, async (ctx) => {
                    await ctx.answerCallbackQuery();
                    await ctx.deleteMessage();
                    let res_data = await find_cargo_by_station(item.id, item.user_station_id);
                    if(res_data.status){
                        let station_list = res_data.data;
                        for(let i=0; i<station_list.length; i++){
                            let message = station_list[i];
                            await message_sender_station_data(ctx, message)
                        }
                    }

                })
                .row();
        })
    })
pm.use(station_btn)


pm.hears("🗒 Kiruvchi vagonlar", async (ctx)=>{
    let user_id = ctx.from.id;
    let res_data = await enter_to_station_report(user_id);
    let group_station = res_data.data.group_station;
     ctx.session.session_db.group_station_list = group_station;
    let msg_template =  `
<b>HISOBOT</b>
<i>Jami vagonlar soni: ${res_data.data.amount}</i>
    `
    group_station.forEach((item, index)=>{
        msg_template =msg_template + `
 ${item.name}: <b>${item.count}</b>`;
    })

    msg_template = msg_template +`

<i>👇Ba'tafsil ma'lumotlarni ko'rish uchun kerakli stansiyani tanlang</i>    
    `
   await ctx.reply(msg_template,{
       parse_mode:"HTML",
       reply_markup: station_btn,
   })

})

pm.hears("👤 Ma'lumotlarim", async (ctx)=>{

    let res_data = await my_user_info(ctx.from.id);

    if(res_data.status){
        console.log(res_data.data)
        await ctx.reply(`
<b>👤 Profil ma'lumotlari</b>  

🚏 Stansiya: <b>${res_data.data?.organization?.station_name_ru}</b>
👤 Ism: <b>${res_data.data.full_name}</b>
☎️ Tell: <b>+${res_data.data.phone}</b>
🆔 Id: <b>${ctx.from.id}</b>




    `,{
            parse_mode:"HTML",
        })
    }


})
pm.hears("☎️ Support", async (ctx)=>{
    await ctx.reply(`
<b>☎️ Tezkor qo'llab quvatlash markazi</b>  

Ma'sul mutaxasislar:
<i>🧑‍💻 Jobir Boboqulov</i>
<b>☎️ +998(97) 772-66-56</b>  
<i>🧑‍💻 Jamshid Raximov</i>
<b>☎️ +998(99) 501-60-04</b>  

<i>✍️ Botdan foydalanish vaqtida qandaydir xatolikni sezsangiz mutaxasislarimizga xabar berishingizni so'raymiz!</i>

    `,{
        parse_mode:"HTML",
    })
})



module.exports = bot;