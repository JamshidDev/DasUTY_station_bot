const mongoose = require('mongoose')

const StationSchema = mongoose.Schema({
        // station_id: {
        //     type: Number,
        //     required: true,
        // },
        // station_name_uz: {
        //     type: String,
        //     required: true,
        // },
        station_name_ru: {
            type: String,
            required: true,
        },
        parent_id: {
            type: Number,
            default: null,
        },
        active: {
            type: Boolean,
            default: true,
        }

    },
    {
        timestamps: {
            createdAt: 'created_at', // Use `created_at` to store the created date
            updatedAt: 'updated_at' // and `updated_at` to store the last updated date
        }
    }
)

const Station = mongoose.model("Station", StationSchema)

module.exports = Station;