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
const find_cargo_by_last_station = async (current_station,last_station) => {
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

const find_cargo_by_station_time = async (current_station,last_station, from, to) => {
    try {
        let result = await  STATISTIC_REPORT.find({
            last_station,
            current_station,
            wait_time: {
                $gt: from,
                $lt: to
            }
        }).populate("last_station").populate("first_station").populate("current_station")
        console.log(result)
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
const find_leaving_station = async (first_station, current_station) => {
    try {
        let result = await  STATISTIC_REPORT.find({
            first_station,
            current_station,
            action_name:"Отправ. поезда"
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


const filter_by_leaving_station = async (user_id) => {
    try{
        let admin_station = await ADMIN.findOne({
            user_id,
        }).populate("organization")
        let organization_id =admin_station.organization._id;
        let report_data =await STATISTIC_REPORT.find({
            first_station:organization_id,
            action_name:"Отправ. поезда"
        }).populate("last_station").populate("first_station").populate("current_station");

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

const filter_by_current_station = async (user_id) => {
    try{
        let admin_station = await ADMIN.findOne({
            user_id,
        }).populate("organization")
        let organization_id =admin_station.organization._id;
        let report_data =await STATISTIC_REPORT.find({
            current_station:organization_id,
        }).populate("last_station").populate("first_station").populate("current_station");
        let group_station = [];
        let amount=0;

        for(let i=0; i<report_data.length; i++){
            let station = report_data[i];

            let is_counted_station = group_station.filter((a)=> a.id ===station.last_station._id).length;
            if(is_counted_station ===0){
                let data = {
                    name:null,
                    id:null,
                    count:0,
                    user_station_id:null,

                }
                data.name = station.last_station.station_name_ru;
                data.id = station.last_station._id;
                data.user_station_id =organization_id;

                data.count = report_data.filter((item)=> item.last_station._id === data.id).length;
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

const filter_by_station_time = async (user_id, from, to) => {
    try{
        let admin_station = await ADMIN.findOne({
            user_id,
        }).populate("organization")
        let organization_id =admin_station.organization._id;
        let report_data =await STATISTIC_REPORT.find({
            current_station:organization_id,
            wait_time: {
                $gt: from,  // Documents where yourField is greater than 10
                $lt: to   // and less than 20
            }
        }).populate("last_station").populate("first_station").populate("current_station");

        let group_station = [];
        let amount=0;

        for(let i=0; i<report_data.length; i++){
            let station = report_data[i];

            let is_counted_station = group_station.filter((a)=> a.id ===station.last_station._id).length;
            if(is_counted_station ===0){
                let data = {
                    name:null,
                    id:null,
                    count:0,
                    user_station_id:null,

                }
                data.name = station.last_station.station_name_ru;
                data.id = station.last_station._id;
                data.user_station_id =organization_id;

                data.count = report_data.filter((item)=> item.last_station._id === data.id).length;
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

const search_wagon = async (wagon_number)=>{
    try{
        let result = await STATISTIC_REPORT.findOne({vagon_number:wagon_number}).populate("last_station").populate("first_station").populate("current_station");
        return {
            status:result || false,
            data:result
        }

    }catch (error){
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:false,
            data:null
        }
    }
}

const delete_all_old_reports = async () => {
    try{
       await STATISTIC_REPORT.deleteMany();
        return {
            status:true,
        }
    }catch (error){
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:false,
        }
    }
}


module.exports = {
    register_report,
    enter_to_station_report,
    find_cargo_by_station,
    filter_by_leaving_station,
    find_leaving_station,
    filter_by_current_station,
    find_cargo_by_last_station,
    filter_by_station_time,
    find_cargo_by_station_time,
    delete_all_old_reports,
    search_wagon,
}