const ADMIN= require("../models/adminModels");
const customLogger = require("../config/customLogger");
const STATION = require("../models/StationModels");




const register_admin = async (data) => {
    try {

        let exist_admin = await ADMIN.findOne({
            phone:data.phone
        });
        console.log(exist_admin)

        if (!exist_admin){
            let admin_data = await ADMIN.create(data);
            return {
                status:true,
                data:admin_data,
                message:"Success"

            }
        }else{
            return {
                status:false,
                data:null,
                message:"Bazada mavjud telefon raqam!"

            }

        }



    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:false,
            data:null,
            message:"Server xatosi"
        }
    }
}

const check_user_admin = async (phone, user_id) => {
    try {
        let admin_data = await ADMIN.findOne({
            phone,
        }).populate('organization');
        if(admin_data){
            await ADMIN.findOneAndUpdate({
                _id:admin_data._id
            },
                {
                    user_id
                }
                )
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
const my_user_info = async (user_id)=>{
    try {
        let admin_data = await ADMIN.findOne({
            user_id,
        }).populate("organization")

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

const get_admin_list = async (phone, user_id) => {
    try {
        let admin_data = await ADMIN.find({}).populate('organization');

        return  {
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

const migration_collection_admin = async ()=>{
    try{

        return  await ADMIN.updateMany({}, { $set: { role_id: 1 }}, (err, result) => {
            if (err) {
                console.error(err);
            } else {
                console.log('Documents updated successfully!');
            }
        });

    }catch(error){
        customLogger.log({
            level: 'error',
            message: error
        });
        console.log(error)
        return 0;
    }
}



module.exports = {
    register_admin,
    check_user_admin,
    check_register_user,
    logOut_user,
    my_user_info,
    get_admin_list,
    migration_collection_admin
}


// db.grantRolesToUser("Jamshid", [{ role: "readWrite", db: "dasuty_bot" }])
//
// db.auth("Jamshid", "Jamshid2@@@")