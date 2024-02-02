const STATISTIC_REPORT= require("../models/StationReportModels");
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


module.exports = {
    register_report
}