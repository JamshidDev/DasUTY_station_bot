const {Composer, Keyboard} = require("grammy");
const {Menu, MenuRange} = require("@grammyjs/menu");
const {I18n, hears} = require("@grammyjs/i18n");
const {
    conversations,
    createConversation,
} = require("@grammyjs/conversations");
const {check_user, register_user, remove_user, set_user_lang} = require("../controllers/userController");
const {check_user_admin, logOut_user, my_user_info} = require("../controllers/adminController");
const {enter_to_station_report, find_cargo_by_station,filter_by_station_time, filter_by_leaving_station, find_leaving_station, filter_by_current_station, find_cargo_by_last_station, find_cargo_by_station_time} = require("../controllers/stationReportController");
const {get_all_action, filter_action_by_name, find_cargo_by_action} = require("../controllers/actionController")
const {get_report} = require("../controllers/reportController")

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
        await main_menu_conversation(conversation, ctx)



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
        // .text("📦 Import yuklar")
        // .row().text("📦 Eksport yuklar")
        // .row()
        .text("👤 Маълумотларим")
        .text("📤 Чиқиш")
        .row()
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

    let group_btn = new Keyboard()
        .text("1 кундан - 5 кунгача 🟢")
        .row()
        .text("6 кундан - 10 кунгача 🟡")
        .row()
        .text("11 кундан кўп 🔴")
        .row()
        .text("◀️ Орқага")
        .resized()
    await ctx.reply("🕐 Турган вагонлар муддати", {
        parse_mode:"HTML",
        reply_markup: group_btn,
    })
}

const check_phone_number = (msg, conversation) => {
    if (msg?.contact) {
        conversation.session.session_db.client.phone = msg.contact.phone_number
        return false
    } else {
        // let reg = new RegExp('^[012345789][0-9]{8}$');
        // conversation.session.session_db.client.phone = reg.test(msg.text) ? "+998" + msg.text : null;
        // return !reg.test(msg.text)
        return true
    }

}


pm.command("start", async (ctx) => {
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
                await  ctx.reply(`
<b><i>#Ҳисобот</i></b>
<b>${msg.first_station?.station_name_ru}</b> ➡️ <b>${msg.current_station?.station_name_ru}</b> ➡️ <b>${msg.last_station?.station_name_ru}</b>

🚃 Вагон рақами: <b>${msg.vagon_number}</b>  
🧾 Поезд индех: <b>${msg.index} </b> 

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


pm.hears("📦 Маҳаллий юклар", async (ctx)=>{

    await ctx.conversation.enter("local_station_conversation");

})


pm.hears("📦 Import yuklar", async (ctx)=>{
    await ctx.reply(`
    <i>⚠️ Bu bo'lim tez orada ishga tushishi reja qilingan</i>
    `,{
        parse_mode:"HTML",
    })
})

pm.hears("📦 Eksport yuklar", async (ctx)=>{
    await ctx.reply(`
    <i>⚠️ Bu bo'lim tez orada ishga tushishi reja qilingan</i>
    `,{
        parse_mode:"HTML",
    })
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

<i>♻️ Тури: <b>${report?.type}</b></i>
<i>📈 Номи: <b>${report?.title}</b></i>
<i>🔄 Охирги янгиланиш: <b>${report?.date}</b></i>


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










module.exports = bot;