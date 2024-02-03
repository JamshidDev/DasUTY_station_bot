const STATION= require("../models/StationModels");
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






module.exports = {
    register_station,
    register_unit_station,
}