const {Composer, Keyboard} = require("grammy");
const {Menu, MenuRange} = require("@grammyjs/menu");
const {I18n, hears} = require("@grammyjs/i18n");
const {
    conversations,
    createConversation,
} = require("@grammyjs/conversations");
const {check_user, register_user, remove_user, set_user_lang} = require("../controllers/userController");

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
const pm = bot.chatType("private")


async function register_user_phone(conversation, ctx) {

    let phone_btn = new Keyboard()
        .requestContact("📞 Telefon raqam")
        .resized();
    await ctx.reply(`
<b>Salom 👋. DASUTY botga xush kelibsiz.</b>
Ro'yhatdan o'tish uchun telefon raqamingizni yuboring!

<i>👇Telefon raqam tugmasini bosing.</i> 
   `, {
        parse_mode: "HTML",
        reply_markup: phone_btn
    })

    ctx = await conversation.wait();
    if (check_phone_number(ctx.message, conversation)) {
        do {
            await ctx.reply(ctx.t("invalid_phone_text"), {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (check_phone_number(ctx.message, conversation));
    }
    await ctx.reply("Tekshirilmoqda...")

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
    await ctx.conversation.enter("register_user_phone");
})


module.exports = bot