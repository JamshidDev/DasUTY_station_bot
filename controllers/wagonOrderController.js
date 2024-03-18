
const WagonOrder = require("../models/WagonOrderModel");
const customLogger = require("../config/customLogger");


const register_order = async (data)=>{
    try {
        let result = await WagonOrder.create(data);
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
            message:"Field"
        }
    }
}

const wagon_order_report = async (role_id)=>{
    try {
        let current_date = new Date();
        let current_hour = current_date.getHours();
        let order_type = 1;
         if(current_hour>=17 && current_hour<6){
             order_type =0;
        }
        const startOfDay = new Date(current_date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(current_date);
        endOfDay.setHours(23, 59, 59, 999);


        let result = await WagonOrder.find({
            station_parent_id:role_id,
            order_type:order_type,
            // created_at:{
            //     $gte: startOfDay,
            //     $lte: endOfDay,
            // }
        }).populate("station_id")
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
            message:"Field"
        }
    }
}


const all_wagon_order_report = async (data)=>{
    try {

        let current_date = new Date();
        let current_hour = current_date.getHours();
        let order_type = 1;
        if(current_hour>=17 && current_hour<6){
            order_type =0;
        }
        const startOfDay = new Date(current_date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(current_date);
        endOfDay.setHours(23, 59, 59, 999);


        let result = await WagonOrder.find({
            order_type:order_type,
            created_at:{
                $gte: startOfDay,
                $lte: endOfDay,
            }
        }).populate("station_id")
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
            message:"Field"
        }
    }
}


module.exports = {
    register_order,
    wagon_order_report,
    all_wagon_order_report,
}