const mongoose = require('mongoose')


const actionSchema = mongoose.Schema({
    action_name: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    }

})

const ACTION = mongoose.model("Action", actionSchema)

module.exports = ACTION