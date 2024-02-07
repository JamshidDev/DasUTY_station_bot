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
        .text("📦 Mahalliy yuklar")
        .row()
        // .text("📦 Import yuklar")
        // .row().text("📦 Eksport yuklar")
        // .row()
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


async function local_station_conversation(conversation, ctx) {

    let group_btn = new Keyboard()
        .text("🚏 Stansiya bo'yicha")
        .row()
        .text("🗞 Amal bo'yicha")
        .row()
        .text("🔙 Asosiy menyu")
        .resized()
    await ctx.reply("📦 Mahalliy yuklar", {
        parse_mode:"HTML",
        reply_markup: group_btn,
    })
}

async function station_details_conversation(conversation, ctx) {

    let group_btn = new Keyboard()
        .text("🔼 Kelayotgan vagonlar")
        .row()
        .text("🔼 Ketayotgan vagonlar")
        .row()
        .text("⏹ Turgan vagonlar")
        .row()
        .text("🕐 Turgan vagonlar muddati")
        .row()
        .text("🔙 Orqaga")
        .resized()
    await ctx.reply("🚏 Stansiya bo'yicha", {
        parse_mode:"HTML",
        reply_markup: group_btn,
    })
}

async function duration_time_conversation(conversation, ctx) {

    let group_btn = new Keyboard()
        .text("1 kundan - 5 kungacha 🟢")
        .row()
        .text("6 kundan - 10 kungacha  🟡")
        .row()
        .text("11 kundan ko'p 🔴")
        .row()
        .text("◀️️ Orqaga")
        .resized()
    await ctx.reply("🚏 Stansiya bo'yicha", {
        parse_mode:"HTML",
        reply_markup: group_btn,
    })
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
<b><i>#Hisobot</i></b>
<b>${msg.first_station?.station_name_ru}</b> ➡️ <b>${msg.current_station?.station_name_ru}</b> ➡️ <b>${msg.last_station?.station_name_ru}</b>

🚃 Vagon raqami: <b>${msg.vagon_number}</b>  
🧾 Poyezd index: <b>${msg.index} </b> 

📦 Yuk nomi: <b>${msg.cargo_name}</b>    
🔍 Yuk massasi: <b>${msg.cargo_massa} kg </b>  
 
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


pm.hears("📦 Mahalliy yuklar", async (ctx)=>{

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
                .text( "🚞 "+item.name + " - "+item.count+ " ta vagon" , async (ctx) => {
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
pm.hears("🔼 Ketayotgan vagonlar", async (ctx)=>{
    let user_id = ctx.from.id;
    let res_data = await filter_by_leaving_station(user_id);

    let group_station = res_data.data.group_station;
    ctx.session.session_db.group_station_list = group_station;
    let msg_template =  `
<b>📊 Stansiyadan ketayotgan vagonlarning hozirda turgan stansiyalari bo'yicha hisoboti</b>
    `
    group_station.forEach((item, index)=>{
        msg_template =msg_template + `
 ${item.name}: <b>${item.count} </b> ta vagon`;
    })

    msg_template = msg_template +`

<i>📑 Umumiy vagonlar soni</i>: <b>${res_data.data.amount}</b> ta vagon



<i>👇Ba'tafsil ma'lumotlarni ko'rish uchun kerakli stansiyani tanlang</i>    
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
                .text( "🚞 "+item.name + " - "+item.count+ " ta vagon" , async (ctx) => {
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
pm.hears("⏹ Turgan vagonlar", async (ctx)=>{
    let user_id = ctx.from.id;
    let res_data = await filter_by_current_station(user_id);

    let group_station = res_data.data.group_station;


     ctx.session.session_db.group_station_list = group_station;
    let msg_template =  `
<b>📊 Stansiyada turgan vagonlarning borayotgan stansiyalari bo'yicha hisoboti</b>
    `
    group_station.forEach((item, index)=>{
        msg_template =msg_template + `
 ${item.name}: <b>${item.count} </b> ta vagon`;
    })

    msg_template = msg_template +`

<i>📑 Umumiy vagonlar soni</i>: <b>${res_data.data.amount}</b> ta vagon



<i>👇Ba'tafsil ma'lumotlarni ko'rish uchun kerakli stansiyani tanlang</i>
    `
   await ctx.reply(msg_template,{
       parse_mode:"HTML",
       reply_markup: current_station_btn,
   })

})




pm.hears("🕐 Turgan vagonlar muddati", async (ctx)=>{
    await ctx.conversation.enter("duration_time_conversation");

})



pm.hears("🗞 Amal bo'yicha", async (ctx)=>{

    let res_data = await get_all_action();

    let group_station = res_data.data.map((item)=>item.action_name +" 📄")

    const buttonRows = group_station
        .map((label) => [Keyboard.text(label)]);
    const keyboard = Keyboard.from(buttonRows)
        .row()
        .text("🔙 Orqaga")
        .resized();



    let msg_template =  `🗞 Amal bo'yicha`
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
                .text( "🚞 "+item.name + " - "+item.count+ " ta vagon" , async (ctx) => {
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
pm.hears("🔼 Kelayotgan vagonlar", async (ctx)=>{
    let user_id = ctx.from.id;
    let res_data = await enter_to_station_report(user_id);
    let group_station = res_data.data.group_station;
    ctx.session.session_db.group_station_list = group_station;
    let msg_template =  `
<b>📊 Stansiyaga kelayotgan vagonlarning hozirda turgan stansiyalari bo'yicha hisoboti</b>
    `
    group_station.forEach((item, index)=>{
        msg_template =msg_template + `
 ${item.name}: <b>${item.count}</b>`;
    })

    msg_template = msg_template +`

<i>📑 Umumiy vagonlar soni</i>: <b>${res_data.data.amount}</b>



<i>👇Ba'tafsil ma'lumotlarni ko'rish uchun kerakli stansiyani tanlang</i>    
    `
    await ctx.reply(msg_template,{
        parse_mode:"HTML",
        reply_markup: station_btn,
    })

})

pm.hears("🚏 Stansiya bo'yicha", async (ctx)=>{
    await ctx.conversation.enter("station_details_conversation");
})

const duration_1_5_btn = new Menu("duration_1_5_btn")
    .dynamic(async (ctx, range) => {
        let list = ctx.session.session_db.group_station_list
        list.forEach((item, index) => {
            range
                .text( "🚞 "+item.name + " - "+item.count+ " ta vagon" , async (ctx) => {
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
pm.hears("1 kundan - 5 kungacha 🟢", async (ctx)=>{

    let res_data = await  filter_by_station_time(ctx.from.id, 0,6);
    let group_station = res_data.data.group_station;
    ctx.session.session_db.group_station_list = group_station;
    let msg_template =  `
<b>🟢 1 kundan - 5 kungacha stansiyada turgan vagonlarning borayotgan stansiyalari bo'yicha hisoboti</b>
    `
    group_station.forEach((item, index)=>{
        msg_template =msg_template + `
 ${item.name}: <b>${item.count}</b>`;
    })

    msg_template = msg_template +`

<i>📑 Umumiy vagonlar soni</i>: <b>${res_data.data.amount}</b>



<i>👇Ba'tafsil ma'lumotlarni ko'rish uchun kerakli stansiyani tanlang</i>    
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
                .text( "🚞 "+item.name + " - "+item.count+ " ta vagon" , async (ctx) => {
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
pm.hears("6 kundan - 10 kungacha  🟡", async (ctx)=>{

    let res_data = await  filter_by_station_time(ctx.from.id, 5,11);
    let group_station = res_data.data.group_station;
    ctx.session.session_db.group_station_list = group_station;
    let msg_template =  `
<b>⛔️ 6 kundan - 10 kungacha stansiyada turgan vagonlarning borayotgan stansiyalari bo'yicha hisoboti</b>
    `
    group_station.forEach((item, index)=>{
        msg_template =msg_template + `
 ${item.name}: <b>${item.count}</b>`;
    })

    msg_template = msg_template +`

<i>📑 Umumiy vagonlar soni</i>: <b>${res_data.data.amount}</b>



<i>👇Ba'tafsil ma'lumotlarni ko'rish uchun kerakli stansiyani tanlang</i>    
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
                .text( "🚞 "+item.name + " - "+item.count+ " ta vagon" , async (ctx) => {
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
pm.hears("11 kundan ko'p 🔴", async (ctx)=>{

    let res_data = await  filter_by_station_time(ctx.from.id, 10,1000);
    let group_station = res_data.data.group_station;
    ctx.session.session_db.group_station_list = group_station;
    let msg_template =  `
<b>⛔️ 11 kundan ko'p stansiyada turgan vagonlarning borayotgan stansiyalari bo'yicha hisoboti</b>
    `
    group_station.forEach((item, index)=>{
        msg_template =msg_template + `
 ${item.name}: <b>${item.count}</b>`;
    })

    msg_template = msg_template +`

<i>📑 Umumiy vagonlar soni</i>: <b>${res_data.data.amount}</b>



<i>👇Ba'tafsil ma'lumotlarni ko'rish uchun kerakli stansiyani tanlang</i>    
    `
    await ctx.reply(msg_template,{
        parse_mode:"HTML",
        reply_markup: duration_11_btn,
    })
})



// back buttons
pm.hears("🔙 Asosiy menyu", async (ctx)=>{
    await ctx.conversation.enter("main_menu_conversation");
})

pm.hears("🔙 Orqaga", async (ctx)=>{
    await ctx.conversation.enter("local_station_conversation");
})

pm.hears("◀️️ Orqaga", async (ctx)=>{
    await ctx.conversation.enter("station_details_conversation");
})






// main menu buttons
pm.hears("👤 Ma'lumotlarim", async (ctx)=>{

    let res_data = await my_user_info(ctx.from.id);
    let report_data = await get_report();
    let report = report_data.data[0];

    if(res_data.status){
        await ctx.reply(`
<b>👤 Profil ma'lumotlari</b>  

🚏 Stansiya: <b>${res_data.data?.organization?.station_name_ru}</b>
👤 Ism: <b>${res_data.data.full_name}</b>
☎️ Tell: <b>+${res_data.data.phone}</b>
🆔 Id: <b>${ctx.from.id}</b>

<b>HISOBOT</b>

<i>♻️ Turi: <b>${report?.type}</b></i>
<i>📈 Nomi: <b>${report?.title}</b></i>
<i>🔄 Oxirgi yangilanish: <b>${report?.date}</b></i>


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


















const action_name_btn = new Menu("action_name_btn")
    .dynamic(async (ctx, range) => {
        let list = ctx.session.session_db.group_station_list
        list.forEach((item, index) => {
            range
                .text( "🚞 "+item.name + " - "+item.count+ " ta vagon" , async (ctx) => {
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

bot.filter(async (ctx)=> ctx.message?.text.includes('📄')).on("msg", async (ctx) => {
    let split_text = ctx.msg.text.split('📄')[0];
    let res_data = await  filter_action_by_name (split_text.trim(), ctx.from.id);
    if(res_data.data){
        console.log(res_data.data)

        let group_station = res_data.data.group_station
        ctx.session.session_db.group_station_list = group_station;
        let msg_template =  `
<b>📊 Hisobot</b>
    `
        group_station.forEach((item, index)=>{
            msg_template =msg_template + `
 ${item.name}: <b>${item.count}</b>`;
        })

        msg_template = msg_template +`

<i>📑 Umumiy vagonlar soni</i>: <b>${res_data.data.amount}</b>



<i>👇Ba'tafsil ma'lumotlarni ko'rish uchun kerakli stansiyani tanlang</i>    
    `
        await ctx.reply(msg_template,{
            parse_mode:"HTML",
            reply_markup: action_name_btn,
        })



    }
});










module.exports = bot;