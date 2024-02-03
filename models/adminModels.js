const mongoose = require('mongoose')


const adminSchema = mongoose.Schema({
    user_id: {
        type: Number,
        unique: true,
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
    lang: String,
    phone: String,
    active: {
        type: Boolean,
        default: true,
    }

})

const ADMIN = mongoose.model("Admin", adminSchema)

module.exports = ADMIN