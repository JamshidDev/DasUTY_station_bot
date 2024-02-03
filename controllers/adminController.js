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

const check_user_admin = async (phone) => {
    try {
        let admin_data = await ADMIN.findOne({
            phone,
        }).populate('organization');
        if(admin_data){
            return {
                status:true,
                data:admin_data,
                message:"Success"

            }
        }else{
            return {
                status:false,
                data:admin_data,
                message:"Not found"

            }
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

const check_register_user = async (user_id)=>{
    try {
        let admin_data = await ADMIN.findOne({
            user_id,
        })

        return {
            status:true,
            is_register:!!admin_data,
            message:"no message"
        }

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:false,
            is_register:null,
            message:"Failed"
        }
    }
};
const logOut_user = async (user_id)=>{
    try {
         await ADMIN.findOneAndUpdate({
            user_id,
        },{
            user_id:0,
        })

        return {
            status:true,
            message:"no message"
        }

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:false,
            is_register:null,
            message:"Failed"
        }
    }
};






module.exports = {
    register_admin,
    check_user_admin,
    check_register_user,
    logOut_user
}