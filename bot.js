const { Bot, session, MemorySessionStorage, Keyboard, InlineKeyboard, InputFile, InputMediaDocument, InputMediaBuilder } = require("grammy");
// const { Menu, MenuRange } = require("@grammyjs/menu");
// const { I18n, hears } = require("@grammyjs/i18n");
// const {
//     conversations,
//     createConversation,
// } = require("@grammyjs/conversations");
require('dotenv').config()
const Database = require("./db");
const customLogger = require("./config/customLogger");
const { FileFlavor, hydrateFiles } = require("@grammyjs/files")
// const { check_user,register_user, remove_user, set_user_lang } = require("./controllers/userController");

// modules

const client_bot = require("./modules/clientModules");
const config_bot = require("./modules/configModules")
const admin_bot = require("./modules/adminModules")


const bot_token = process.env.BOT_TOKEN;







const bot = new Bot(bot_token);


bot.use(config_bot)
bot.api.config.use(hydrateFiles(bot.token));
bot.filter(async (ctx)=> ctx.config.super_admin).use(admin_bot)
bot.filter(async (ctx)=> !ctx.config.super_admin).use(client_bot)





bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const message = err.error;
    customLogger.log({
        level: 'error',
        message: message
    });
});



bot.start({
    // Make sure to specify the desired update types
    allowed_updates: ["my_chat_member", "chat_member", "message", "callback_query", "inline_query"],
});