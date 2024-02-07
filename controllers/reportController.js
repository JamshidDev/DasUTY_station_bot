const REPORT= require("../models/ReportModel");
const customLogger = require("../config/customLogger");
const ADMIN = require("../models/adminModels");

const create_report = async (data) => {
    try {

        let admin_data = await REPORT.create(data);
        return {
            status:true,
            data:admin_data,
            message:"Success"

        }

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:false,
            data:null,
            message:"Faild"
        }
    }
}

const get_report = async (data) => {
    try {

        let admin_data = await REPORT.find();
        return {
            status:true,
            data:admin_data,
            message:"Success"

        }

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:false,
            data:null,
            message:"Faild"
        }
    }
}

const delete_report = async (data) => {
    try {

        let admin_data = await REPORT.deleteMany();
        return {
            status:true,
            data:admin_data,
            message:"Success"

        }

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:false,
            data:null,
            message:"Faild"
        }
    }
}



module.exports = {create_report, get_report,delete_report}
