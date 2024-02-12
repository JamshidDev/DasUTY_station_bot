const STATION= require("../models/StationModels");
const ADMIN= require("../models/adminModels");

const customLogger = require("../config/customLogger");


const register_station = async (data) => {
    try {
        let station_count =await STATION.find().countDocuments({});
        console.log(station_count)
        data.station_id = station_count + 1;
         let stored_data = await STATION.create(data);
         return {
             status:true,
             data:stored_data,
             message:"Success"

         }

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:false,
            data:[],
            message:"Faild"
        }
    }
}


const register_unit_station = async (station_name_ru) => {

    try {
        let data = {
            station_name_ru,
        }
        let result;

        result = await STATION.findOne({station_name_ru});
        if(!result){
            result = await STATION.create(data);
        }

        return {
            status:true,
            data:result,
            message:"Success"
        }


    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:true,
            data:null,
            message:"Failed"
        }
    }
}


const download_station_list = async (data) => {
    try {
        let station_data =await STATION.find();
        let text = " ";
        for (let i=0; i<station_data.length; i++){
            let station = station_data[i];

            let admin = await  ADMIN.findOne({organization : station._id});
            let data = {
                name:station.station_name_ru,
                ds:admin? admin.full_name :"Yo'q",
                phone:admin? admin.phone :"Yo'q",
                id:admin? admin.user_id: "Yo'q"
            };
            text =text +   `
${data.name}#${data.ds}#${data.phone}#${data.id}`
        }

        return {
            status:true,
            data:text,
            message:"Success"

        }

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:false,
            data:[],
            message:"Faild"
        }
    }
}


module.exports = {
    register_station,
    register_unit_station,
    download_station_list,
}