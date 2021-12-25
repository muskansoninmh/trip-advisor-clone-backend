const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
function getDecimalNumber(val) { return (val); }
function setDecimalNumber(val) { return (val); }

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
    openingHours: {
        type: Date
    },
    closingHours: {
        type: Date
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
    },
    isDeleted: {
        type: Boolean,
        default: false
    },

    averageRating: {
        type: Number,
        get: getDecimalNumber,
        set: setDecimalNumber
    },
    trip: {
        type: Boolean,
        default: false
    },
    contactNo: {
        type: String
    },
    website: {
        type: String
    },
    roomOrMembers: {
        type: Number
    },
    availableRoomsOrMembers: {
        type: Number,

    },
    reviews: [{
        review: {
            type: String,
            trim: true
        },

        UserName: {
            type: String,
            ref: 'users'
        },
        rating: {
            type: Number,
            default: 0

        },
        userId:
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'users'
        },

    }],


},

    {
        timestamps: true
    }


)

placesSchema.virtual('id', {
    ref: 'bookedPlaces',
    localField: '_id',
    foreignField: 'placeId'
})

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

placesSchema.virtual('id', {
    ref: 'images',
    localField: '_id',
    foreignField: 'placesID'
})



const places = mongoose.model('places', placesSchema)

module.exports = places