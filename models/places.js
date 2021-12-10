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
    },
    isDeleted: {
        type: Boolean,
        default: false
    },

    averageRating: {
        type: Number,
        default: 2
    },
    reviews: [{
        reviewTitle: {
            type: String,
            trim: true
        },
        reviewDetails: {
            type: String,
            trim: true
        },
        UserId: {
            type: mongoose.Schema.Types.ObjectId
        },
        rating: {
            type: Number,
            default: 0

        }
    }],

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

placesSchema.virtual('id', {
    ref: 'images',
    localField: '_id',
    foreignField: 'placesID'
})



const places = mongoose.model('places', placesSchema)

module.exports = places