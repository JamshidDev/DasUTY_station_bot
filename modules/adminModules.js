const { Composer,Keyboard } = require("grammy");
const { Menu, MenuRange } = require("@grammyjs/menu");
const { I18n, hears } = require("@grammyjs/i18n");
const xlsx_reader = require('xlsx')
const {
    createConversation,
} = require("@grammyjs/conversations");
const bot = new Composer();
const {register_station, register_unit_station} = require("../controllers/stationController");
const {register_report} = require("../controllers/reportController");
const {register_admin} = require("../controllers/adminController");
const {register_unit_action} = require("../controllers/actionController");

bot.use(createConversation(base_menu))



async function base_menu(conversation, ctx){
    const admin_buttons = new Keyboard()
        .text("🔗 Admin kanallar")
        .text("✍️ Xabar yozish")
        .row()
        .text("📈 Umumiy statistika")
        .text("📊 Kunlik statistika")
        .resized()

    await ctx.reply(`⚡️ Asosy menyu ⚡️`,{
        reply_markup:admin_buttons
    })
}














const pm = bot.chatType("private");



pm.command('start', async (ctx)=>{
    await ctx.reply("Salom admin")
    await ctx.conversation.enter("base_menu");
})





bot.command("settings", async (ctx)=>{
    let data = {
        station_name_uz:"Stansiya name",
        station_name_ru:"Stansiya name",
        station_index:'32423',
    };

    let status = await register_station(data);
    console.log(status)
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




// bot.on("msg:file", async (ctx)=>{
//     const file = await ctx.getFile();
//     let path_full = file.file_path;
//     const path = await file.download();
//     const workbook = xlsx_reader.readFile(path);
//     let workbook_sheet = workbook.SheetNames;
//     let workbook_response = xlsx_reader.utils.sheet_to_json(
//         workbook.Sheets[workbook_sheet[0]]
//     );
//     for(let i=0; i<workbook_response.length; i++){
//         let station = workbook_response[i];
//
//         let first_station_data = await register_unit_station(station.first_station.trim());
//         let last_station_data = await register_unit_station(station.last_station.trim());
//         let current_station_data = await register_unit_station(station.current_station.trim());
//
//         let action_name_data = await register_unit_action(station.action_name.toString().trim())
//         const serialNumber = station.action_date;
//         const excelBaseDate = new Date('1899-12-30'); // Excel's base date is December 30, 1899
//
//         const dateValue = new Date(excelBaseDate.getTime() + serialNumber * 24 * 60 * 60 * 1000);
//         let format_date = dateValue.toISOString()
//         console.log(format_date);
//         let report_data = {
//             vagon_number:station.vagon_number.toString().trim(),
//             index:station.index.toString().trim(),
//             current_station:current_station_data.data?._id,
//             first_station:first_station_data.data?._id,
//             last_station:last_station_data.data?._id,
//             action_date:format_date,
//             action_name_id:action_name_data.data._id,
//             action_name:station.action_name.toString().trim(),
//             cargo_name:station.cargo_name.toString().trim(),
//             cargo_massa:station.cargo_massa.toString().trim(),
//             wait_time:station.wait_time.toString().trim(),
//         };
//         let report_result =await register_report(report_data);
//
//     }
//
//     await ctx.reply("Yuklash yakunlandi...")
// })





bot.command('register_user', async (ctx)=>{
    let data = {
        user_id:106,
        full_name:"Jobir Boboqulov",
        username:null,
        organization:'65be758fbd34f1210ee7810b',
        phone:'998977226656'


    }
    let status =await  register_admin(data);
    console.log(status.message)
    await ctx.reply(status.message)


})










































module.exports = bot