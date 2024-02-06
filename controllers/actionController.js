const ACTION= require("../models/ActionModel");
const ADMIN= require("../models/adminModels");
const STATISTIC_REPORT= require("../models/StationReportModels");
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


const filter_action_by_name = async (action_name, user_id)=>{
    try {
        let admin_data = await ADMIN.findOne({user_id})
        let result = await ACTION.findOne({action_name});
        let user_organization_id = admin_data?.organization;
        let action_name_id = result?._id;


        let report_data = await STATISTIC_REPORT.find({
            action_name_id,
            first_station:user_organization_id
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
                    action_name_id:null,

                }
                data.name = station.current_station.station_name_ru;
                data.id = station.current_station._id;
                data.user_station_id =user_organization_id;
                data.action_name_id =action_name_id;

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
            message:"Failed"
        }
    }
}


const find_cargo_by_action = async (current_station,first_station,action_name_id,) => {
    try {
        let result = await  STATISTIC_REPORT.find({
            first_station,
            current_station,
            action_name_id,
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
    register_unit_action,
    get_all_action,
    filter_action_by_name,
    find_cargo_by_action,
}