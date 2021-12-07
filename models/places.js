const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')


const placesSchema = mongoose.Schema({

    avatar: {
        type: Buffer
    },

    name: {
        type: String,
        trim: true,

    },
    description: {
        type: String,
        trim: true,

    },
    category: {
        type: String,
        trim: true,
    },
    season: {
        type: String,
        trim: true,
    },
    userId:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    month: {
        type: String
    },
    package: {
        type: Number
    },
    country: {
        type: Object,
        // required: true,
    },
    city: {
        type: Object,
        // required: true,
    },
    state: {
        type: Object,
        // required: true,
    },
    address: {
        type: String
    }


},

    {
        timestamps: true
    }


)

// placesSchema.virtual('bikes' , {
//     ref : 'Bike-Types',
//     localField: "_id",
//     foreignField : "owner"
// })

// placesSchema.virtual('bike' , {
//     ref : 'Bikes',
//     localField: "_id",
//     foreignField : "owner"
// })



const places = mongoose.model('places', placesSchema)

module.exports = places