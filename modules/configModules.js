const { Composer, MemorySessionStorage, session, Keyboard} = require("grammy");
const { Menu, MenuRange } = require("@grammyjs/menu");
const { I18n, hears } = require("@grammyjs/i18n");
const { chatMembers } = require("@grammyjs/chat-members");
const {
    conversations,
} = require("@grammyjs/conversations");
const {register_user} = require("../controllers/userController");
const {check_register_user} = require("../controllers/adminController")
const adapter = new MemorySessionStorage();

require('dotenv').config()
const proccess_mode =  process.env.ENVIRONMENT || 'production';
let isProduction = proccess_mode === 'production'
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


                user:{
                    db_id:null,
                    station_id:null,
                    station_name:null,
                    phone: null,
                    full_name:null,
                    role_id:null,
                    role_name:null,
                    check_user:false,
                    station_parent_id:null,
                },
                register_user:false,
                selected_type_wagon:null,
                selected_wagon_list:[],
                selected_wagon_comment:null,
            }
        },
        storage: new MemorySessionStorage(),
    },
    conversation: {},
    __language_code: {},
}));

bot.use(chatMembers(adapter));
bot.use(conversations());


bot.use(async (ctx, next) => {

    const super_admin_list = [1038293334,5175158552];

    const command_list = ["🔴 Бекор қилиш", "Bekor qilish"]
    if (command_list.includes(ctx.message?.text)) {
        const stats = await ctx.conversation.active();
        for (let key of Object.keys(stats)) {
            await ctx.conversation.exit(key);
        }
    }




    if(!ctx.session.session_db.user.check_user){
        let res_data = await check_register_user(ctx.from.id);


        if(res_data.data){

            let user_data = res_data.data;
            ctx.session.session_db.user.full_name =user_data.full_name;
            ctx.session.session_db.user.role_id =user_data.role_id;
            ctx.session.session_db.user.role_name =user_data.role_name;
            ctx.session.session_db.user.phone =user_data.phone;
            ctx.session.session_db.user.db_id =user_data._id;
            ctx.session.session_db.user.station_name =user_data.organization.station_name_ru;
            ctx.session.session_db.user.station_id =user_data.organization._id;
            ctx.session.session_db.user.station_parent_id =user_data.organization.parent_id;

            ctx.session.session_db.user.check_user =true;
        }
    }

    if(!ctx.session.session_db.register_user){
        let data  = {
            user_id:ctx.from.id,
            full_name:ctx.from.first_name,
            username:ctx.from.username,
            lang:ctx.from.language_code
        }
        await register_user(data);
        ctx.session.session_db.register_user = true;
    }


    ctx.config = {
        super_admin: super_admin_list.includes(ctx.from?.id),
        is_registered:ctx.session.session_db.user.check_user,
        role_name: ctx.session.session_db.user.role_name,
        role_id: ctx.session.session_db.user.role_id,
        station_id:ctx.session.session_db.user.station_id,
        station_name:ctx.session.session_db.user.station_name,
        station_parent_id:ctx.session.session_db.user.station_parent_id,
    }


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


bot.filter(async (ctx)=> (isProduction && !ctx.config.super_admin)) .chatType("private").use(async (ctx, next)=>{
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