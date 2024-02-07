const mongoose = require('mongoose')


const ReportSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    }

})

const REPORT = mongoose.model("Report", ReportSchema)

module.exports = REPORT