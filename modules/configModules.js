const { Composer, MemorySessionStorage, session, Keyboard} = require("grammy");
const { Menu, MenuRange } = require("@grammyjs/menu");
const { I18n, hears } = require("@grammyjs/i18n");
const { chatMembers } = require("@grammyjs/chat-members");
const {
    conversations,
} = require("@grammyjs/conversations");
const { check_user, register_user, remove_user, set_user_lang } = require("../controllers/userController");
const {check_register_user} = require("../controllers/adminController")
const channelController = require("../controllers/channelController")
const adapter = new MemorySessionStorage();

const bot = new Composer();

const i18n = new I18n({
    defaultLocale: "uz",
    useSession: true,
    directory: "locales",
    globalTranslationContext(ctx) {
        return { first_name: ctx.from?.first_name ?? "" };
    },
});
bot.use(i18n);

bot.use(session({
    type: "multi",
    session_db: {
        initial: () => {
            return {
                client: {
                    phone: null,
                    full_name: null,
                },
                subscribe_channels:[],
                group_station_list:[],
            }
        },
        storage: new MemorySessionStorage(),
    },
    conversation: {},
    __language_code: {},
}));

bot.use(chatMembers(adapter));
bot.use(conversations());

// bot.on("my_chat_member", async (ctx) => {
//     const status = ctx.update.my_chat_member.new_chat_member.status
//     if (status === "kicked") {
//         const stats = await ctx.conversation.active();
//         for (let key of Object.keys(stats)) {
//             await ctx.conversation.exit(key);
//         }
//         await remove_user(ctx.from.id)
//     }else if(status === "administrator"){
//         let data = {
//             telegram_id: ctx.update.my_chat_member.chat.id,
//             user_id: ctx.update.my_chat_member.from.id,
//             title: ctx.update.my_chat_member.chat.title,
//             username: ctx.update.my_chat_member.chat.username,
//             type: ctx.update.my_chat_member.chat.type,
//             new_chat: ctx.update.my_chat_member.new_chat_member, // object
//         }
//         channelController.store_item(data)
//     }else if(status === "left" || status=== "member"){
//         let telegram_id = ctx.update.my_chat_member.chat.id;
//         channelController.remove_item(telegram_id)
//
//     }
//
// });

bot.use(async (ctx, next) => {
    let res_data = await check_register_user(ctx.from.id);
    // 1038293334
    const super_admin_list = [1038293334,5175158552];
    const command_list = ["Bekor qilish"]
    if (command_list.includes(ctx.message?.text)) {
        const stats = await ctx.conversation.active();
        for (let key of Object.keys(stats)) {
            await ctx.conversation.exit(key);
        }
    }
    ctx.config = {
        super_admin: super_admin_list.includes(ctx.from?.id),
        is_registered:res_data.is_register,
    }

    let lang = await ctx.i18n.getLocale();
    if (!i18n.locales.includes(lang)) {
        await ctx.i18n.setLocale("uz");
        ctx.config.lang ='uz';
    }else{
        ctx.config.lang =lang;
    }


    // check user join to channel


    await next()
})

































// channel subscribe checker

const channel_menu = new Menu("language_menu")
    .url("➕ Обуна бўлиш", `https://t.me/das_uty`)
    .row()
    .text("✅ Тасдиқлаш", async (ctx)=>{

        console.log(ctx)
        const chatMembers = await ctx.chatMembers.getChatMember(-1002093178964, ctx.from.id);
        console.log(chatMembers.status)

        if(chatMembers.status ==='left'){
            await ctx.answerCallbackQuery( {
                callback_query_id:ctx.callbackQuery.id,
                text:"⚠️ Сиз каналга аъзо бўлмагансиз!",
                show_alert:true
            })
        }else{
            await ctx.deleteMessage()
            let retry_register_btn = new Keyboard()
                .text("🔒 Тизимга кириш")
                .resized();
            await ctx.reply(`
<b>Салом 👋. DAS UTY ботга хуш келибсиз</b> 

<i>♻️ Ботдан тўлиқ фойдаланиш учун олдин тизимга киришингиз лозим!</i>  
 
<i>Тизимга кириш учун <b>[🔒 Тизимга кириш]</b>  тугмасини босинг.</i>   
    `,{
                parse_mode:"HTML",
                reply_markup: retry_register_btn,
            })
        }
    })
bot.use(channel_menu)


bot.filter(async (ctx)=> !ctx.config.super_admin) .chatType("private").use(async (ctx, next)=>{
    const chatMembers = await ctx.chatMembers.getChatMember(-1002093178964, ctx.from.id);
    if(chatMembers.status ==='left'){
        await ctx.reply(`Ботдан тўлиқ фойдаланиш учун  <b>"DAS UTY"</b>  МЧЖнинг расмий телеграм каналига аъзо бўлишингиз керак.

        `,{
            parse_mode: "HTML",
            reply_markup: channel_menu,
        })
    }else{
        await next()
    }
})

























module.exports = bot