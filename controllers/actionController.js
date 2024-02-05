const ACTION= require("../models/ActionModel");
const customLogger = require("../config/customLogger");






const register_unit_action = async (action_name) => {

    try {
        let data = {
            action_name,
        }
        let result;

        result = await ACTION.findOne({action_name});
        if(!result){
            result = await ACTION.create(data);
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
            status:false,
            data:null,
            message:"Failed"
        }
    }
}


const get_all_action = async () => {
    try {

        let result = await ACTION.find({});


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
            data:null,
            message:"Failed"
        }
    }
}


module.exports = {
    register_unit_action,
    get_all_action,
}