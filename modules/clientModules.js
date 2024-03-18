const {Composer, Keyboard, InputFile, session} = require("grammy");
const {Menu, MenuRange} = require("@grammyjs/menu");
const {I18n, hears} = require("@grammyjs/i18n");
const moment = require('moment-timezone');
const {
    conversations,
    createConversation,
} = require("@grammyjs/conversations");
const {check_user_admin, logOut_user, my_user_info} = require("../controllers/adminController");
const {enter_to_station_report, find_cargo_by_station,filter_by_station_time, filter_by_leaving_station, find_leaving_station, filter_by_current_station, find_cargo_by_last_station, find_cargo_by_station_time, search_wagon, noden_report_by_station} = require("../controllers/stationReportController");
const {get_all_action, filter_action_by_name, find_cargo_by_action} = require("../controllers/actionController")
const {get_report} = require("../controllers/reportController");
const {register_order, wagon_order_report} = require("../controllers/wagonOrderController")
const ExcelJS = require('exceljs');
const {wagon_type_list} = require("../Enums/Enums")


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
bot.use(createConversation(local_station_conversation));
bot.use(createConversation(station_details_conversation));
bot.use(createConversation(duration_time_conversation));
bot.use(createConversation(search_wagon_by_number));
bot.use(createConversation(main_menu_conversation_noden));
bot.use(createConversation(wagon_type_conversation));
bot.use(createConversation(wagon_order_conversation));
bot.use(createConversation(confirm_order_conversation));
bot.use(createConversation(review_order_conversation));


const pm = bot.chatType("private")


async function register_user_phone(conversation, ctx) {

    let phone_btn = new Keyboard()
        .requestContact("📞 Телефон рақам")
        .resized();
    await ctx.reply(`
<b>🔒 Тизимга кириш учун телефон рақамингиз юборинг</b>

<i>👇Телефон рақам тугмасини босинг.</i> 
   `, {
        parse_mode: "HTML",
        reply_markup: phone_btn
    })

    ctx = await conversation.wait();
    if (check_phone_number(ctx.message, conversation)) {
        do {
            await ctx.reply("Нотўғри форматдаги телефон рақам", {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (check_phone_number(ctx.message, conversation));
    }

    let phone_number = ctx.session.session_db.client.phone
    if(phone_number[0] !== "+"){
        phone_number = "+"+phone_number;
    }


    let res_status = await  check_user_admin(phone_number, ctx.from.id);
    if(res_status.status){

        // success login
        await ctx.reply(`
<i>🎉 ${res_status.data.full_name} сиз тизимга мувофақиятли равишда кирдингиз!</i>      
        `, {
            parse_mode:"HTML",
            reply_markup: { remove_keyboard: true }
        });

        if(ctx.config.role_name === "station_noden"){
            await main_menu_conversation_noden(conversation, ctx)
        }else{
            await main_menu_conversation(conversation, ctx)
        }

    }else{
        // login failed
        let retry_register_btn = new Keyboard()
            .text("🔒 Тизимга кириш")
            .resized();
        await ctx.reply(`
<b>⚠️ Телефон рақам базадан топилмади!</b>   

<i>гар сиз буни хато деб ҳисобласангиз қуйидаги  маъсул ходимга алоқага чиқинг!</i>  

<i>Маъсул ходим</i>  
<i>🧑‍💻 Гуломов Бекзод @Programmer_277</i>   
        `, {
            parse_mode:"HTML",
            reply_markup: retry_register_btn,

        })


    }



}
async function main_menu_conversation(conversation, ctx) {

    let main_btn = new Keyboard()
        .text("📦 Маҳаллий юклар")
        .row()
        .text("📃 Вагон буюртма")
        .row()
        .text("👤 Маълумотларим")
        .text("🔍 Вагон қидирув")
        .row()
        .text("📤 Чиқиш")
        .text("☎️ Суппорт")
        .resized();

    await ctx.reply(`<i>⚡️ Асосий меню ⚡️</i> `, {
        parse_mode:"HTML",
        reply_markup: main_btn,
    });
   return;
}

async function main_menu_conversation_noden(conversation, ctx) {

    let main_btn = new Keyboard()
        .text("📉 Ҳисобот")
        .row()
        .text("🗞 Вагон буюртмалар")
        .row()
        .text("👤 Маълумотларим")
        .text("🔍 Вагон қидирув")
        .row()
        .text("📤 Чиқиш")
        .text("☎️ Суппорт")
        .resized();

    await ctx.reply(`<i>⚡️ Асосий меню ⚡️</i> `, {
        parse_mode:"HTML",
        reply_markup: main_btn,
    });
    return;
}
async function local_station_conversation(conversation, ctx) {

    let group_btn = new Keyboard()
        .text("🚏 Стансия бўйича")
        .row()
        .text("🗞 Амал бўйича")
        .row()
        .text("🔙 Асосий меню")
        .resized()
    await ctx.reply("📦 Маҳаллий юклар", {
        parse_mode:"HTML",
        reply_markup: group_btn,
    })
}

async function station_details_conversation(conversation, ctx) {

    let group_btn = new Keyboard()
        .text("🔽 Келаётган вагонлар")
        .row()
        .text("🔼 Кетаётган вагонлар")
        .row()
        .text("⏹ Турган вагонлар")
        .row()
        .text("🕐 Турган вагонлар муддати")
        .row()
        .text("🔙 Орқага")
        .resized()
    await ctx.reply("🚏 Стансия бўйича", {
        parse_mode:"HTML",
        reply_markup: group_btn,
    })
}

async function duration_time_conversation(conversation, ctx) {
    let res_data_0 = await  filter_by_station_time(ctx.from.id, 0,6);
    let res_data_5 = await  filter_by_station_time(ctx.from.id, 5,11);
    let res_data_10 = await  filter_by_station_time(ctx.from.id, 10,100);

    let button_label_list = [];

    if(res_data_0.data.amount !==0){
        button_label_list.push("1 кундан - 5 кунгача 🟢")
    }

    if(res_data_5.data.amount !==0){
        button_label_list.push("6 кундан - 10 кунгача 🟡")
    }

    if(res_data_10.data.amount !==0){
        button_label_list.push("11 кундан кўп 🔴")
    }

    if(button_label_list.length ===0){
        button_label_list.push("Стансиянда турган вагонлар йўқ")
    }


    const buttonRows = button_label_list
        .map((label) => [Keyboard.text(label)]);
    const keyboard = Keyboard.from(buttonRows)
        .row()
        .text("◀️ Орқага")
        .resized();
    await ctx.reply("🕐 Турган вагонлар муддати", {
        parse_mode:"HTML",
        reply_markup: keyboard,
    })
}

async function search_wagon_by_number(conversation, ctx){
    ctx = await conversation.wait();
    if (!ctx.message.text) {
        do {
            await ctx.reply(`
<b>⚠️ Нотўғри маълумот юбордингиз</b> 

<i>✍️ Вагон рақамини ёзиб юборинг</i>
<i>Масалан: <b>23355050</b></i>         
            `, {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (!ctx.message.text);
    }
    let wagon_number = ctx.message.text;
    let res_data = await search_wagon(wagon_number)
    if(res_data.status){
        await message_sender_station_data(ctx, res_data.data)
    }else{
        await ctx.reply(`
<b>🚫 Сиз юборган вагон номер бўйича базадан маълумот топилмади</b>  

<i>Илтимос қайта текшириб вагон рақамини ёзиб юборинг</i>`,
            {
                parse_mode: "HTML",
            }
            )
    }

    await search_wagon_by_number(conversation, ctx)




}

const check_phone_number = (msg, conversation) => {
    if (msg?.contact) {
        conversation.session.session_db.client.phone = msg.contact.phone_number
        return false
    } else {
        return true
    }

}

const check_order_time = ()=>{
    let current_hour = new Date().getHours() + 2;
    let current_minute = new Date().getMinutes();

    // if(current_hour>=6 && current_hour<9){
    //     return {
    //         status:true,
    //         type_id:1,
    //     }
    // }else if(current_hour>=17 && current_hour<21){
    //     return {
    //         status:true,
    //         type_id:0,
    //     }
    // }else{
    //     return {
    //         status:false,
    //         time:`${current_hour} : ${current_minute}`,
    //     }
    // }

    return {
        status:true,
        type_id:0,
    }
}

async function wagon_type_conversation(conversation, ctx) {

    let group_station = wagon_type_list.map((item)=>item.name +" 🚞")
    const buttonRows = group_station
        .map((label) => [Keyboard.text(label)]);
    const keyboard = Keyboard.from(buttonRows)
        .row()
        .text("🔙 Асосий меню")
        .resized();
    await ctx.reply(`<i>⚡️ Вагон турини танланг ⚡️</i> `, {
        parse_mode:"HTML",
        reply_markup: keyboard,
    });
}

async function wagon_order_conversation(conversation, ctx) {
    let group_btn = new Keyboard()
        .text("🔴 Бекор қилиш")
        .resized()
    await ctx.reply(`
<b>✍️ Вагон сонини киритинг</b>

<i>Масалан: 1; 4; 5</i>    
    `, {
        parse_mode:"HTML",
        reply_markup:group_btn,
    });


    ctx = await conversation.wait();


    if (!(ctx.message?.text && !isNaN(ctx.message?.text))) {
        do {
            await ctx.reply(`
<b>Нотўғри маълумот киритдингиз!</b>    

<i>✍️ Илтимос вагон сони ёзинг</i>
<i>Масалан: 1; 4; 5</i>        
            `, {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (!(ctx.message?.text && !isNaN(ctx.message?.text)));
    }

    let wagon_count = ctx.message?.text;
    let selected_wagon = ctx.session.session_db.selected_type_wagon;
    let wagon_list =  ctx.session.session_db.selected_wagon_list;

    wagon_list.push({
        name:selected_wagon.name,
        id:selected_wagon.id,
        count:wagon_count,
    });

    let action_type_btn = new Keyboard()
        .text("➕ Вагон қўшиш")
        .row()
        .text("☑️ Буюртмани якунлаш")
        .resized()
    await ctx.reply(`<i>${wagon_count} - ${selected_wagon.name} ✅</i>`, {
        parse_mode: "HTML",
        reply_markup:action_type_btn,
    });
}
async function confirm_order_conversation(conversation, ctx) {
    let group_btn = new Keyboard()
        .text("➡️ Ўтказиб юбориш")
        .resized();

    ctx.session.session_db.selected_wagon_comment = null;
    await ctx.reply(`
<b>✍️ Буюртма учун изоҳ ёзинг</b>

<i>💬 Изоҳсиз якунлаш учун <b>➡️ Ўтказиб юбориш</b> тугмасини босиб якунланг!</i>  
    `, {
        parse_mode:"HTML",
        reply_markup:group_btn,
    });


    ctx = await conversation.wait();


    if (!(ctx.message?.text)) {
        do {
            await ctx.reply(`
<b>Нотўғри маълумот киритдингиз!</b>    

<i>✍️ Илтимос изоҳ учун матнли хабар ёзинг</i>      
            `, {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (!(ctx.message?.text));
    }
    if(ctx.message?.text!=='➡️ Ўтказиб юбориш'){
        ctx.session.session_db.selected_wagon_comment = ctx.message?.text;
    }
    await  review_order_conversation(conversation, ctx);
}
async function review_order_conversation(conversation, ctx) {
    let group_btn = new Keyboard()
        .text("✅ Буюртмани тасдиқлаш")
        .row()
        .text("❌ Буюртмани бекор қилиш")
        .row()
        .resized();

    let message = `<b>✅ Буюртма маълумотлари</b>

`;
    let order_list = ctx.session.session_db.selected_wagon_list;
    let comment = ctx.session.session_db.selected_wagon_comment;
    let text = ``;
    for(let i=0; i< order_list.length; i++){
        let order = order_list[i];
        text = text + `
${i+1}) <b>${order.name} - ${order.count} та вагон</b>`
    }
    message = message + text +`


<i>💬 Изоҳ: ${comment || "Изоҳ ёзилмаган"}</i>    
    `;

    await ctx.reply(message, {
        parse_mode:"HTML",
        reply_markup:group_btn,
    });
}

pm.filter(async (ctx)=> ctx.config.role_name === "station_noden").command("start", async (ctx)=>{
    if(ctx.config.is_registered){
        await ctx.conversation.enter("main_menu_conversation_noden");
    }else{
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

// Station ds start
pm.command("start", async (ctx) => {

    console.log(ctx.config)

    if(ctx.config.is_registered){
        await ctx.conversation.enter("main_menu_conversation");
    }else{
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

pm.hears("🔒 Тизимга кириш", async (ctx)=>{
    await ctx.conversation.enter("register_user_phone");
})
pm.hears("📤 Чиқиш", async (ctx)=>{
    let res_data = await logOut_user(ctx.from.id);
    let retry_register_btn = new Keyboard()
        .text("🔒 Тизимга кириш")
        .resized();
    await ctx.reply("🔴 Тизимдан чиқдингиз!", {
        parse_mode:"HTML",
        reply_markup: retry_register_btn,
    })

})


async function message_sender_station_data(ctx, msg) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
let text_1 = `
<b><i>#Ҳисобот</i></b>
<b>${msg.first_station?.station_name_ru}</b> ➡️ <b>${msg.current_station?.station_name_ru}</b> ➡️ <b>${msg.last_station?.station_name_ru}</b>

🚃 Вагон рақами: <b>${msg.vagon_number}</b>`
                if(msg.index.length === 17){
                    text_1 = text_1 + `
🧾 Поезд индех: <b>${msg.index} </b>`
                }

                text_1 = text_1 + `

📦 Юк номи: <b>${msg.cargo_name}</b>    
🔍 Юк массаси: <b>${Math.ceil(msg.cargo_massa/1000)} т </b>  
 
🏗 Амал номи: <b>${msg.action_name}</b>    
🗓 Амал санаси: <b>${new Date(msg.action_date).toLocaleDateString('vi-VN')} </b> 
   
🏁 Чиққан стансия: <b>${msg.first_station?.station_name_ru}</b>     
🏳️ Жорий стансия: <b>${msg.current_station?.station_name_ru} </b>     
⏰ Сарифланган вақт: <b>${msg.wait_time} кун</b>     
🏴 Бораётган стансия: <b>${msg.last_station?.station_name_ru} </b>  

#Ҳисобот #dasuty_station_bot
Ⓜ️ Манба: @dasuty_station_bot                  
                    `


                await  ctx.reply(text_1, {
                    parse_mode:"HTML",
                });
                resolve(true);
            } catch (error) {
                console.log(error)
                reject(false)
            }

        }, 100)
    })
}


pm.hears("📦 Маҳаллий юклар", async (ctx)=>{
    await ctx.conversation.enter("local_station_conversation");
})


const leaving_station_btn = new Menu("leaving_station_btn")
    .dynamic(async (ctx, range) => {
        let list = ctx.session.session_db.group_station_list
        list.forEach((item, index) => {
            range
                .text( "🚞 "+item.name + " - "+item.count+ " та вагон" , async (ctx) => {
                    await ctx.answerCallbackQuery();
                    await ctx.deleteMessage();
                    let res_data = await find_leaving_station(item.user_station_id, item.id);

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
pm.use(leaving_station_btn)
pm.hears("🔼 Кетаётган вагонлар", async (ctx)=>{
    let user_id = ctx.from.id;
    let res_data = await filter_by_leaving_station(user_id);

    let group_station = res_data.data.group_station;
    ctx.session.session_db.group_station_list = group_station;
    let msg_template =  `
<b>📊 Стансиядан кетаётган вагонларнинг ҳозирда турган стансиялари бўйича ҳисоботи</b>
    `
    group_station.forEach((item, index)=>{
        msg_template =msg_template + `
 ${item.name}: <b>${item.count} </b> ta vagon`;
    })

    msg_template = msg_template +`

<i>📑 Умумий вагонлар сони</i>: <b>${res_data.data.amount}</b> ta vagon



<i>👇Баътафсил маълумотларни кўриш учун керакли стансияни танланг</i>    
    `
    await ctx.reply(msg_template,{
        parse_mode:"HTML",
        reply_markup: leaving_station_btn,
    })

})


const current_station_btn = new Menu("current_station_btn")
    .dynamic(async (ctx, range) => {
        let list = ctx.session.session_db.group_station_list
        list.forEach((item, index) => {
            range
                .text( "🚞 "+item.name + " - "+item.count+ " та вагон" , async (ctx) => {
                    await ctx.answerCallbackQuery();
                    await ctx.deleteMessage();
                    let res_data = await find_cargo_by_last_station(item.user_station_id, item.id);

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
pm.use(current_station_btn)
pm.hears("⏹ Турган вагонлар", async (ctx)=>{
    let user_id = ctx.from.id;
    let res_data = await filter_by_current_station(user_id);

    let group_station = res_data.data.group_station;


     ctx.session.session_db.group_station_list = group_station;
    let msg_template =  `
<b>📊 Стансияда турган вагонларнинг бораётган стансиялари бўйича ҳисоботи</b>
    `
    group_station.forEach((item, index)=>{
        msg_template =msg_template + `
 ${item.name}: <b>${item.count} </b> ta vagon`;
    })

    msg_template = msg_template +`

<i>📑 Умумий вагонлар сони</i>: <b>${res_data.data.amount}</b> ta vagon



<i>👇Баътафсил маълумотларни кўриш учун керакли стансияни танланг</i>
    `
   await ctx.reply(msg_template,{
       parse_mode:"HTML",
       reply_markup: current_station_btn,
   })

})


pm.hears("🕐 Турган вагонлар муддати", async (ctx)=>{
    await ctx.conversation.enter("duration_time_conversation");
})

pm.hears("🗞 Амал бўйича", async (ctx)=>{

    let res_data = await get_all_action();

    let group_station = res_data.data.map((item)=>item.action_name +" 📄")

    const buttonRows = group_station
        .map((label) => [Keyboard.text(label)]);
    const keyboard = Keyboard.from(buttonRows)
        .row()
        .text("🔙 Орқага")
        .resized();



    let msg_template =  `🗞 Амал бўйича`
    await ctx.reply(msg_template,{
        parse_mode:"HTML",
        reply_markup: keyboard,
    })

})


const station_btn = new Menu("station_btn")
    .dynamic(async (ctx, range) => {
        let list = ctx.session.session_db.group_station_list
        list.forEach((item, index) => {
            range
                .text( "🚞 "+item.name + " - "+item.count+ " та вагон" , async (ctx) => {
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
pm.hears("🔽 Келаётган вагонлар", async (ctx)=>{
    let user_id = ctx.from.id;
    let res_data = await enter_to_station_report(user_id);
    let group_station = res_data.data.group_station;
    ctx.session.session_db.group_station_list = group_station;
    let msg_template =  `
<b>📊 Стансияга келаётган вагонларнинг ҳозирда турган стансиялари бўйича ҳисоботи</b>
    `
    group_station.forEach((item, index)=>{
        msg_template =msg_template + `
 ${item.name}: <b>${item.count}</b>`;
    })

    msg_template = msg_template +`

<i>📑 Умумий вагонлар сони</i>: <b>${res_data.data.amount}</b>



<i>👇Баътафсил маълумотларни кўриш учун керакли стансияни танланг</i>    
    `
    await ctx.reply(msg_template,{
        parse_mode:"HTML",
        reply_markup: station_btn,
    })

})

pm.hears("🚏 Стансия бўйича", async (ctx)=>{
    await ctx.conversation.enter("station_details_conversation");
})

const duration_1_5_btn = new Menu("duration_1_5_btn")
    .dynamic(async (ctx, range) => {
        let list = ctx.session.session_db.group_station_list
        list.forEach((item, index) => {
            range
                .text( "🚞 "+item.name + " - "+item.count+ " та вагон" , async (ctx) => {
                    await ctx.answerCallbackQuery();
                    await ctx.deleteMessage();
                    let res_data = await find_cargo_by_station_time( item.user_station_id,item.id,0,6 );
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
pm.use(duration_1_5_btn)
pm.hears("1 кундан - 5 кунгача 🟢", async (ctx)=>{

    let res_data = await  filter_by_station_time(ctx.from.id, 0,6);
    let group_station = res_data.data.group_station;
    ctx.session.session_db.group_station_list = group_station;
    let msg_template =  `
<b>🟢 1 кундан - 5 кунгача стансияда турган вагонларнинг бораётган стансиялари бўйича ҳисоботи</b>
    `
    group_station.forEach((item, index)=>{
        msg_template =msg_template + `
 ${item.name}: <b>${item.count}</b>`;
    })

    msg_template = msg_template +`

<i>📑 Умумий вагонлар сони</i>: <b>${res_data.data.amount}</b>



<i>👇Баътафсил маълумотларни кўриш учун керакли стансияни танланг</i>    
    `
    await ctx.reply(msg_template,{
        parse_mode:"HTML",
        reply_markup: duration_1_5_btn,
    })
})

const duration_6_10_btn = new Menu("duration_6_10_btn")
    .dynamic(async (ctx, range) => {
        let list = ctx.session.session_db.group_station_list
        list.forEach((item, index) => {
            range
                .text( "🚞 "+item.name + " - "+item.count+ " та вагон" , async (ctx) => {
                    await ctx.answerCallbackQuery();
                    await ctx.deleteMessage();
                    let res_data = await find_cargo_by_station_time( item.user_station_id,item.id,5,11 );
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
pm.use(duration_6_10_btn)
pm.hears("6 кундан - 10 кунгача 🟡", async (ctx)=>{

    let res_data = await  filter_by_station_time(ctx.from.id, 5,11);
    let group_station = res_data.data.group_station;
    ctx.session.session_db.group_station_list = group_station;
    let msg_template =  `
<b>⛔️ 6 кундан - 10 кунгача стансияда турган вагонларнинг бораётган стансиялари бўйича ҳисоботи</b>
    `
    group_station.forEach((item, index)=>{
        msg_template =msg_template + `
 ${item.name}: <b>${item.count}</b>`;
    })

    msg_template = msg_template +`

<i>📑 Умумий вагонлар сони</i>: <b>${res_data.data.amount}</b>



<i>👇Баътафсил маълумотларни кўриш учун керакли стансияни танланг</i>    
    `
    await ctx.reply(msg_template,{
        parse_mode:"HTML",
        reply_markup: duration_6_10_btn,
    })
})


const duration_11_btn = new Menu("duration_11_btn")
    .dynamic(async (ctx, range) => {
        let list = ctx.session.session_db.group_station_list
        list.forEach((item, index) => {
            range
                .text( "🚞 "+item.name + " - "+item.count+ " та вагон" , async (ctx) => {
                    await ctx.answerCallbackQuery();
                    await ctx.deleteMessage();
                    let res_data = await find_cargo_by_station_time( item.user_station_id,item.id,10,1000 );
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
pm.use(duration_11_btn)
pm.hears("11 кундан кўп 🔴", async (ctx)=>{

    let res_data = await  filter_by_station_time(ctx.from.id, 10,1000);
    let group_station = res_data.data.group_station;
    ctx.session.session_db.group_station_list = group_station;
    let msg_template =  `
<b>⛔️ 11 кундан кўп стансияда турган вагонларнинг бораётган стансиялари бўйича ҳисоботи</b>
    `
    group_station.forEach((item, index)=>{
        msg_template =msg_template + `
 ${item.name}: <b>${item.count}</b>`;
    })

    msg_template = msg_template +`

<i>📑 Умумий вагонлар сони</i>: <b>${res_data.data.amount}</b>



<i>👇Баътафсил маълумотларни кўриш учун керакли стансияни танланг</i>    
    `
    await ctx.reply(msg_template,{
        parse_mode:"HTML",
        reply_markup: duration_11_btn,
    })
})

pm.hears("📉 Ҳисобот", async (ctx)=>{
    let res_data = await noden_report_by_station(ctx.config.role_id)
    if(res_data.status){
        await ctx.reply("🕓 Hisobot tayorlanmoqda kuting...");
        const workbook = new ExcelJS.Workbook();
        const worksheet  = workbook.addWorksheet("Hisobot");
        worksheet .addRow(['Vagon raqami', 'Chiqqan stansiya', 'Turgan stansiya', "Borayotgan stansiya", "Index"]);

        const rowNumber = 1;

        // Fill color you want to set
        const fillColor = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '85b2f9' } // Red background color
        };

        worksheet.getRow(rowNumber).eachCell({ includeEmpty: true }, cell => {
            cell.fill = fillColor;
        });

        let station_list = res_data.data;
        for(let i=0; i<station_list.length; i++){
            let station = station_list[i];
            worksheet .addRow([station.vagon_number, station.first_station.station_name_ru, station.current_station.station_name_ru, station.last_station.station_name_ru, station.index,]);
        }
        const filePath = './download/reportOfNoden.xlsx';
        workbook.xlsx.writeFile(filePath)
            .then(()=> {
                console.log('Excel file created successfully.');
                let file_path =  new InputFile(filePath)
                ctx.replyWithDocument(file_path)
            })
            .catch(function(error) {
                console.error('Error:', error);
            });
        await ctx.reply("✅ Yakunlandi");



    }

})
pm.hears("🗞 Вагон буюртмалар", async (ctx)=>{
    await ctx.reply("Илтимос кутинг")
    let res_data = await wagon_order_report(ctx.config.role_id);



    if(res_data.status){
        const workbook = new ExcelJS.Workbook();
        const worksheet  = workbook.addWorksheet("Вагон буюртма");
        worksheet .addRow(['Стансия номи', 'Вагон тури', 'Вагон сони', "Қўшимча изоҳ", "Вақт"]);

        const rowNumber = 1;

        // Fill color you want to set
        const fillColor = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '85b2f9' } // Red background color
        };
        worksheet.getRow(rowNumber).eachCell({ includeEmpty: true }, cell => {
            cell.fill = fillColor;
        });

        let report_list = res_data.data;
        for(let i=0; i<report_list.length; i++){
            let report = report_list[i];
            let station_name = report.station_id?.station_name_ru;
            let order_comment = report.order_comment;
            // let order_date = new Date(report.created_at).toLocaleString("uz-UZ");
            const selectedDate = moment(report.created_at);
            const order_date = selectedDate.tz('Asia/Tashkent').format('YYYY-MM-DD HH:mm:ss')


            for(let j=0; j<report.order_list.length; j++){
                let wagon_order = report.order_list[j]
                worksheet .addRow([station_name, wagon_order.name, wagon_order.count,order_comment, order_date ]);
            }

        }

        const filePath = './download/ВагонБуюртма.xlsx';
        workbook.xlsx.writeFile(filePath)
            .then(()=> {
                console.log('Excel file created successfully.');
                let file_path =  new InputFile(filePath)
                ctx.replyWithDocument(file_path)
            })
            .catch(function(error) {
                console.error('Error:', error);
            });
        await ctx.reply("✅ Якунланди");

    }else{
        await ctx.reply("⚠️ Сервер хатоси")
    }


})








pm.hears("📃 Вагон буюртма", async (ctx)=>{
   let check_time =  check_order_time();
   if(check_time.status){
       await ctx.conversation.enter("wagon_type_conversation");
   }else{
       await ctx.reply(`
<b>⚠️ Рухсат этилмади!</b>

<i>Вагон учун  буюртмалар соат <b>6:00 дан 9:00 гача </b> ва <b>17:00 дан 21:00 гача</b>  вақт оралиқларда қабул қилинади.</i>  

🕟 <i>Вақт <b>${check_time.time}</b></i>
     
       `, {
           parse_mode:"HTML"
       })
   }



})
pm.hears("➕ Вагон қўшиш", async (ctx)=>{
    await ctx.conversation.enter("wagon_type_conversation");

})
pm.hears("☑️ Буюртмани якунлаш", async (ctx)=>{
    await ctx.conversation.enter("confirm_order_conversation");

})
pm.hears("➡️ Ўтказиб юбориш", async (ctx)=>{
    await ctx.conversation.enter("review_order_conversation");

})

pm.hears("❌ Буюртмани бекор қилиш", async (ctx)=>{
    ctx.session.session_db.selected_wagon_list = [];
    ctx.session.session_db.selected_wagon_comment=null;
    await ctx.reply("Вагон буюртма бекор қилинди! ❌")
    await ctx.conversation.enter("main_menu_conversation");

})

pm.hears("✅ Буюртмани тасдиқлаш", async (ctx)=>{

    let check_time = check_order_time();
    if(check_time.status){
        let order_list = ctx.session.session_db.selected_wagon_list;
        let comment = ctx.session.session_db.selected_wagon_comment;
        let data = {
            user_id:ctx.from.id,
            order_list:order_list,
            order_comment:comment,
            order_type:0,
            station_id:ctx.config.station_id,
            station_parent_id:ctx.config.station_parent_id,
        }
        let res_data = await register_order(data);
        if(res_data.status){
            await ctx.reply("✅ Буюртма мувофақиятли тасдиқланди");

        }else{
            await ctx.reply("⚠️ Сервер хатоси");
        }
        await ctx.conversation.enter("main_menu_conversation");
    }else{

        await ctx.reply(`
<b>⚠️ Рухсат этилмади!</b>

<i>Вагон учун  буюртмалар соат <b>6:00 дан 9:00 гача </b> ва <b>17:00 дан 21:00 гача</b>  вақт оралиқларда қабул қилинади.</i>   

🕟 <i>Вақт <b>${check_time.time}</b></i>    
       `, {
            parse_mode:"HTML"
        })
        await ctx.conversation.enter("main_menu_conversation");
    }



})









// back buttons
pm.hears("🔙 Асосий меню", async (ctx)=>{
    await ctx.conversation.enter("main_menu_conversation");
})


pm.hears("🔙 Орқага", async (ctx)=>{
    await ctx.conversation.enter("local_station_conversation");
})

pm.hears("◀️ Орқага", async (ctx)=>{
    await ctx.conversation.enter("station_details_conversation");
})

pm.hears("🔴 Бекор қилиш", async (ctx)=>{
    await ctx.conversation.enter("main_menu_conversation");
})





// main menu buttons
pm.hears("👤 Маълумотларим", async (ctx)=>{

    let res_data = await my_user_info(ctx.from.id);
    let report_data = await get_report();
    let report = report_data.data[0];

    if(res_data.status){
        await ctx.reply(`
<b>👤 Профил маълумотларим</b>  

🚏 Стансия: <b>${res_data.data?.organization?.station_name_ru}</b>
👤 Исм: <b>${res_data.data.full_name}</b>
☎️ Телл: <b>${res_data.data.phone}</b>
🆔 Ид: <b>${ctx.from.id}</b>

<b>ҲИСОБОТ</b>

<i>♻️ Тури: <b>"${report?.type}"</b></i>
<i>📈 Номи: <b>"${report?.title}"</b></i>
<i>🔄 Охирги янгиланиш: <b>${report?.date.split('на')[1]}</b></i>


    `,{
            parse_mode:"HTML",
        })
    }


})
pm.hears("☎️ Суппорт", async (ctx)=>{
    await ctx.reply(`
<b>☎️ Тезкор қўллаб қуватлаш маркази</b>  

Маъсул мутахасислар:
<i>🧑‍💻 Бекзод Гуломов</i>
<b>☎️ @Programmer_277</b>  
<i>🧑‍💻 Жамшид Рахимов</i>
<b>☎️ @Jamacoder</b>  

<i>✍️ Ботдан фойдаланиш вақтида қандайдир хатоликни сезсангиз мутахасисларимизга хабар беришингизни сўраймиз!</i>

    `,{
        parse_mode:"HTML",
    })
})

pm.hears("🔍 Вагон қидирув", async (ctx)=>{
    let group_btn = new Keyboard()
        .text("🔴 Бекор қилиш")
        .row()
        .resized();

    await ctx.reply(`
<b>🔍 Вагонни номер орқали қидирув</b>

<i>✍️ Вагон рақамини ёзиб юборинг</i>
<i>Масалан: <b>23355050</b></i>

    
    `,{
        parse_mode:"HTML",
        reply_markup: group_btn,
    })
    await ctx.conversation.enter("search_wagon_by_number");
})
















const action_name_btn = new Menu("action_name_btn")
    .dynamic(async (ctx, range) => {
        let list = ctx.session.session_db.group_station_list
        list.forEach((item, index) => {
            range
                .text( "🚞 "+item.name + " - "+item.count+ " та вагон" , async (ctx) => {
                    await ctx.answerCallbackQuery();
                    await ctx.deleteMessage();
                    let res_data = await find_cargo_by_action(item.id, item.user_station_id, item.action_name_id);
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
pm.use(action_name_btn)

bot.filter(async (ctx)=> ctx.message?.text?.toString()?.includes('📄')).on("msg", async (ctx) => {
    let split_text = ctx.msg.text.split('📄')[0];
    let res_data = await  filter_action_by_name (split_text.trim(), ctx.from.id);
    if(res_data.data){
        console.log(res_data.data)

        let group_station = res_data.data.group_station
        ctx.session.session_db.group_station_list = group_station;
        let msg_template =  `
<b>📊 Ҳисобот</b>
    `
        group_station.forEach((item, index)=>{
            msg_template =msg_template + `
 ${item.name}: <b>${item.count}</b>`;
        })

        msg_template = msg_template +`

<i>📑 Умумий вагонлар сони</i>: <b>${res_data.data.amount}</b>



<i>👇 Баътафсил маълумотларни кўриш учун керакли стансияни танланг</i>    
    `
        await ctx.reply(msg_template,{
            parse_mode:"HTML",
            reply_markup: action_name_btn,
        })



    }
});

bot.filter(async (ctx)=> ctx.message?.text?.toString()?.includes('🚞')).on('msg', async (ctx)=>{
    let split_text = ctx.msg.text.split('🚞')[0];
    let selected_wagon = wagon_type_list.filter((item)=> item.name === split_text.trim());
    if(selected_wagon.length===1){
        ctx.session.session_db.selected_type_wagon =selected_wagon[0];
        await ctx.conversation.enter("wagon_order_conversation");
    }
})








module.exports = bot;