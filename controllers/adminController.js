const ADMIN= require("../models/adminModels");
const customLogger = require("../config/customLogger");




const register_admin = async (data) => {
    try {

        let admin_data = await ADMIN.create(data);
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
            data:[],
            message:"Faild"
        }
    }
}





module.exports = {
    register_admin
}