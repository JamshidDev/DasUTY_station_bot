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
        return {
            status:true,
            data:report_data,
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



module.exports = {
    register_report,
    enter_to_station_report,
}