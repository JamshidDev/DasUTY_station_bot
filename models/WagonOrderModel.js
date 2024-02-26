const mongoose = require('mongoose')


const WagonOrderSchema = mongoose.Schema({
    user_id: {
        type: Number,
        required: true,
    },
    station_id:{
        type: mongoose.Schema.ObjectId,
        ref: "Station"
    },
    station_parent_id:{
        type: Number,
        required: true,
    },
    order_list: {
        type: [Object],
        required:true,
    },
    order_comment: {
        type: String,
        default: null,
    },
    order_type: {
        type: String,
        required:true,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: {
        createdAt: 'created_at', // Use `created_at` to store the created date
        updatedAt: 'updated_at' // and `updated_at` to store the last updated date
    }
})

const WagonOrder = mongoose.model("WagonOrder", WagonOrderSchema)

module.exports = WagonOrder;