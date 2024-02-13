const {Composer, Keyboard,InputFile} = require("grammy");
const {Menu, MenuRange} = require("@grammyjs/menu");
const {I18n, hears} = require("@grammyjs/i18n");
const xlsx_reader = require('xlsx');
const fs = require('fs');
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
const {
    createConversation,
} = require("@grammyjs/conversations");
const bot = new Composer();
const {register_station, register_unit_station, download_station_list} = require("../controllers/stationController");
const {register_report, delete_all_old_reports} = require("../controllers/stationReportController");
const {register_admin, get_admin_list} = require("../controllers/adminController");
const {register_unit_action} = require("../controllers/actionController");
const {create_report, delete_report} = require("../controllers/reportController")

bot.use(createConversation(base_menu))

bot.use(createConversation(upload_local_database));
bot.use(createConversation(register_admin_conversation));

async function upload_local_database(conversation, ctx) {

    let abort_btn = new Keyboard()
        .text("Bekor qilish")
        .row()
        .resized();

    await ctx.reply(`<i>Excel faylni yuboring</i> `, {
        parse_mode: "HTML",
        reply_markup: abort_btn,
    });
    ctx = await conversation.wait();

    if (!(ctx.message?.document && ctx.message.document?.file_name.includes('.xlsx'))) {
        do {
            await ctx.reply(`
<b>Noto'g'ri turdagi fayl yubordingiz!</b> 

<i>Iltimos excel(.xlsx) turdagi fayl yuboring!</i>           
            `, {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (!(ctx.message?.document && ctx.message.document?.file_name.includes('.xlsx')));
    }


//     start upload excel file to database

    await ctx.reply("👀 Faylni o'qish jarayoni boshlandi...")
    const file = await ctx.getFile();
    let path_full = file.file_path;
    const path = await file.download();
    const workbook = xlsx_reader.readFile(path);
    let workbook_sheet = workbook.SheetNames;
    let workbook_response = xlsx_reader.utils.sheet_to_json(
        workbook.Sheets[workbook_sheet[0]]
    );

    await delete_all_old_reports();
    await delete_report()
    await ctx.reply("✅ Eski baza o'chirildi 🗑")

    let report ={
        title:null,
        date:null,
        type:null,
    }


    for(let i=0; i<workbook_response.length; i++){
        let station = workbook_response[i];



        if(i===0){
            report.title = station.report_number.toString().trim();
        }else if(i===1){
            report.date = station.report_number.toString().trim();
        }else if(i===2){
            report.type = station.report_number.toString().trim();
        }else{



            let first_station_data = await register_unit_station(station.first_station.toString().trim());
            let last_station_data = await register_unit_station(station.last_station.trim());
            let current_station_data = await register_unit_station(station.current_station.trim());

            let action_name_data = await register_unit_action(station.action_name.toString().trim())
            const serialNumber = station.action_date;

            const excelBaseDate = new Date('1899-12-30'); // Excel's base date is December 30, 1899
            const dateValue = new Date(excelBaseDate.getTime() + serialNumber * 24 * 60 * 60 * 1000);
            let format_date = dateValue.toISOString();

            let index_date_excel = new Date(excelBaseDate.getTime() + station.index_date * 24 * 60 * 60 * 1000);
            let format_index_date = index_date_excel.toISOString();

            let format_last_date = null;
            if(station.last_date){
                let last_date_excel = new Date(excelBaseDate.getTime() + station.last_date * 24 * 60 * 60 * 1000);
                format_last_date = last_date_excel?.toISOString();
            }else{
                format_last_date = null;
            }



            let report_data = {
                vagon_number:station.wagon_number.toString().trim(),
                index:station.train_index.toString().trim(),
                current_station:current_station_data.data?._id,
                first_station:first_station_data.data?._id,
                last_station:last_station_data.data?._id,
                action_date:format_date,
                action_name_id:action_name_data.data._id,
                action_name:station.action_name.toString().trim(),
                cargo_name:station.cargo_name.toString().trim(),
                cargo_massa:station.cargo_massa.toString().trim(),
                wait_time:station.wait_time.toString().trim(),
                wagon_owner:station.wagon_owner,
                train_number:station.train_number,
                index_date:format_index_date,
                first_country:station.first_country,
                last_country:station.last_country,
                last_date:format_last_date,
            }



            let report_result =await register_report(report_data);


        }



    }

    await create_report(report);
    await ctx.reply("✅ Yuklash jarayoni yakunlandi")

    await base_menu(conversation, ctx)





}



const replaceText = async(text)=>{
    let list = [
        {
            from:'2',
            to:'II'
        }
    ]

}



async function register_admin_conversation(conversation, ctx) {

    let abort_btn = new Keyboard()
        .text("Bekor qilish")
        .row()
        .resized();

    await ctx.reply(`<i>Excel faylni yuboring</i> `, {
        parse_mode: "HTML",
        reply_markup: abort_btn,
    });
    ctx = await conversation.wait();

    if (!(ctx.message?.document && ctx.message.document?.file_name.includes('.xlsx'))) {
        do {
            await ctx.reply(`
<b>Noto'g'ri turdagi fayl yubordingiz!</b> 

<i>Iltimos excel(.xlsx) turdagi fayl yuboring!</i>           
            `, {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (!(ctx.message?.document && ctx.message.document?.file_name.includes('.xlsx')));
    }


//     start upload excel file to database

    await ctx.reply("👀 Faylni o'qish jarayoni boshlandi...")
    const file = await ctx.getFile();
    let path_full = file.file_path;
    const path = await file.download();
    const workbook = xlsx_reader.readFile(path);
    let workbook_sheet = workbook.SheetNames;
    let workbook_response = xlsx_reader.utils.sheet_to_json(
        workbook.Sheets[workbook_sheet[0]]
    );

    let registeredPhone = []

    for(let i=0; i<workbook_response.length; i++){
        let boss = workbook_response[i];
        console.log(boss)

        if(boss?.station_name && boss?.boss_fulname && boss?.boss_phone){
            let format_phone =boss.boss_phone.toString().replace(/ /g, "");
            console.log(format_phone)
            let station = await register_unit_station(boss.station_name.toString().trim())
            console.log(station.data)
           if(station.data){
               let station_id = station.data._id;
               let data = {
                   user_id:null,
                   full_name:boss.boss_fulname,
                   organization:station_id,
                   phone:format_phone.toString()?.trim(),
                   username:null,
               }
               let res_data = await register_admin(data);

               if(res_data.status){
                   let template_text = `
${station.data.station_name_ru} - ${boss.boss_fulname} - ${format_phone}`
                   registeredPhone.push(template_text)
               }
           }

        }
    }

    let status_text = registeredPhone.length>0? registeredPhone.toString() : "Bazaga ma'lumot qo'wilmadi!"
    await ctx.reply(status_text, {
        parse_mode:"HTML",
    })
    await base_menu(conversation, ctx)





}
async function base_menu(conversation, ctx) {
    const admin_buttons = new Keyboard()
        .text("⬇️ Bazani yuklash")
        .row()
        .text("⬇️ Admin qo'shish")
        .resized()

    await ctx.reply(`⚡️ Asosy menyu ⚡️`, {
        reply_markup: admin_buttons
    })
}



const pm = bot.chatType("private");


pm.command('start', async (ctx) => {
    await ctx.conversation.enter("base_menu");
})




bot.command("admins_list", async (ctx)=>{
    await ctx.reply("Kuting...", {
        parse_mode: "HTML",
    });
    let res_data = await get_admin_list();
   if(res_data.status){
       const sheet = workbook.addWorksheet("Ma'sullar");
       sheet.addRow(['Stansiya nomi', 'Stansiya raxbari', 'Telefon raqam', "Telegram ID"]);

       for( let i=0; i<res_data.data.length; i++){
            let admin = res_data.data[i];
           sheet.addRow([admin.organization.station_name_ru, admin.full_name, admin.phone, admin.user_id]);

       }
       const filePath = './stationBoss.xlsx';
       workbook.xlsx.writeFile(filePath)
           .then(()=> {
               console.log('Excel file created successfully.');
           })
           .catch(function(error) {
               console.error('Error:', error);
           });


       await ctx.reply("Yakunlandi", {
           parse_mode: "HTML",
       });
       let file_path =  new InputFile(filePath)
       await  ctx.replyWithDocument(file_path)
   }

})


bot.command("get_station_list", async (ctx)=>
{
    try{
        await ctx.reply("Kuting...")
        let res_data = await download_station_list();
        let station_list = res_data.data;
        console.log(res_data.status)

        const sheet = workbook.addWorksheet("Stansiyalar");
        sheet.addRow(['Stansiya nomi', 'Stansiya raxbari', 'Telefon raqam', "Telegram ID"]);
        for(let i=0; i<station_list.length; i++){
            let station = station_list[i];
            sheet.addRow([station.station_name, station.ds || '-:-', station.phone || '-:-', station.id] || '-:-');
        }
        const filePath = './station_list.xlsx';
        workbook.xlsx.writeFile(filePath)
            .then(function() {
                console.log('Excel file created successfully.');
            })
            .catch(function(error) {
                console.error('Error:', error);
            });
        let file_path =  new InputFile(filePath);
        await ctx.replyWithDocument(file_path);
        await ctx.reply("Yakunlandi");
    }catch (error){
        console.log(error)
    }
})

// station list upload
// bot.on("msg:file", async (ctx)=>{
//     const file = await ctx.getFile();
//     let path_full = file.file_path;
//     const path = await file.download();
//     const workbook = xlsx_reader.readFile(path);
//     let workbook_sheet = workbook.SheetNames;
//     let workbook_response = xlsx_reader.utils.sheet_to_json(
//         workbook.Sheets[workbook_sheet[0]]
//     );
//    for(let i=0; i<workbook_response.length; i++){
//        let station = workbook_response[i];
//
//        let data = {
//            station_name_uz:station.name_uz.trim(),
//            station_name_ru:station.name_ru.trim(),
//            station_index:station.station_index.toString().trim(),
//        };
//        let status = await register_station(data);
//        console.log(status.message)
//
//    }
// })



pm.hears("⬇️ Bazani yuklash", async (ctx) => {
    await ctx.conversation.enter("upload_local_database");
})

pm.hears("⬇️ Admin qo'shish", async (ctx) => {
    await ctx.conversation.enter("register_admin_conversation");
})

pm.hears("Bekor qilish", async (ctx) => {
    await ctx.conversation.enter("base_menu");
})


module.exports = bot
