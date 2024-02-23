const mongoose = require('mongoose')
const {model} = require("mongoose");


const adminSchema = mongoose.Schema({
    user_id: {
        type: Number,
        default: null,
    },
    full_name: {
        type: String,
        required: true,
    },
    username: String,
    organization:{
        type: mongoose.Schema.ObjectId,
        ref: "Station"
    },
    role_id:{
        type: Number,
        default: 1,
    },
    role_name:{
        type: String,
        default: 'station_ds',
    },
    lang: String,
    phone: String,
    active: {
        type: Boolean,
        default: true,
    }

})

const ADMIN = mongoose.model("Admin", adminSchema)

module.exports = ADMIN