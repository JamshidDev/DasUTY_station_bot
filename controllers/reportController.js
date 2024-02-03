const STATISTIC_REPORT= require("../models/StationReportModels");
const ADMIN= require("../models/adminModels");
const customLogger = require("../config/customLogger");




const register_report = async (data) => {
    try {
        let result = await  STATISTIC_REPORT.create(data)
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
            status:false,
            data:[],
            message:"Faild"
        }
    }
}

const enter_to_station_report = async (user_id)=>{
    try{
        let admin_station = await ADMIN.findOne({
            user_id,
        }).populate("organization")
        let organization_id =admin_station.organization._id;
        let report_data =await STATISTIC_REPORT.find({
            last_station:organization_id
        }).populate("last_station").populate("first_station").populate("current_station")


        let group_station = [];
        let amount=0;

        for(let i=0; i<report_data.length; i++){
            let station = report_data[i];

            let is_counted_station = group_station.filter((a)=> a.id ===station.current_station._id).length;
            if(is_counted_station ===0){
                let data = {
                    name:null,
                    id:null,
                    count:0,
                    user_station_id:null,

                }

                data.name = station.current_station.station_name_ru;
                data.id = station.current_station._id;
                data.user_station_id =organization_id;

                data.count = report_data.filter((item)=> item.current_station._id === data.id).length;
                amount =amount + data.count;
                group_station.push(data)
            }

        }
        return {
            status:true,
            data:{
                group_station,
                amount,
            },
        }
    }catch (error){
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:false,
            data:[],

        }
    }
}

const find_cargo_by_station = async (current_station,last_station) => {
    try {
        let result = await  STATISTIC_REPORT.find({
            last_station,
            current_station,
        }).populate("last_station").populate("first_station").populate("current_station")
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
            status:false,
            data:[],
            message:"Faild"
        }
    }
}



module.exports = {
    register_report,
    enter_to_station_report,
    find_cargo_by_station,
}