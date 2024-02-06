const mongoose = require('mongoose')


const StationReportSchema = mongoose.Schema({

    vagon_number: {
        type: String,
        required: true,
    },
    index: {
        type: String,
        required: true,
    },
    current_station:{
        type: mongoose.Schema.ObjectId,
        ref: "Station"
    },
    first_station:{
        type: mongoose.Schema.ObjectId,
        ref: "Station"
    },
    last_station:{
        type: mongoose.Schema.ObjectId,
        ref: "Station"
    },
    action_date: {
        type: Date,
        required: true,
    },
    action_name:{
        type: String,
        required: true,
    },
    action_name_id:{
        type: mongoose.Schema.ObjectId,
        ref: "Action"
    },

    cargo_name:{
        type: String,
        required: true,
    },
    cargo_massa:{
        type: String,
        required: true,
    },
    wait_time:{
        type: Number,
        required: true,
    },

    // new field of database
    wagon_owner:{
        type: String,
        required: true,
    },
    train_number:{
        type: Number,
        required: true,
    },
    index_date:{
        type: Date,
        required: true,
    },
    first_country:{
        type: String,
        required: true,
    },
    last_country:{
        type: String,
        required: true,
    },
    last_date:{
        type: Date,
        default: null,
    },





    active: {
        type: Boolean,
        default: true,
    }

})

const StationReport = mongoose.model("StationReport", StationReportSchema)

module.exports = StationReport