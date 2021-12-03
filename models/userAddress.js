const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')


const userSchema = mongoose.Schema({


    type: {
        type: String,

        trim: true,

    },
    appartment_detail: {
        type: String,
        trim: true,

    },
    street_address: {
        type: String,
        trim: true,

    },
    country: {
        type: Object,
        required: true,
    },
    city: {
        type: Object,
        required: true,
    },
    state: {
        type: Object,
        required: true,
    },
    zip: {
        type: String,
        trim: true,
        // minlength: 6
    },
    employeeID:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },

    isDeleted: {
        type: Boolean,
        default: false

    },


},
    {
        timestamps: true
    }



)

// userSchema.virtual('bikes' , {
//     ref : 'Bike-Types',
//     localField: "_id",
//     foreignField : "owner"
// })

// userSchema.virtual('bike' , {
//     ref : 'Bikes',
//     localField: "_id",
//     foreignField : "owner"
// })



const userAddress = mongoose.model('places', userSchema)

module.exports = userAddress