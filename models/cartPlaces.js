const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const places = require('./places')


const cartPlacesSchema = mongoose.Schema({


    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    trip: {
        type: Boolean
    },
    placeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'places'
    },


},

    {
        timestamps: true
    }


)



const cartPlaces = mongoose.model('cartPlaces', cartPlacesSchema)

module.exports = cartPlaces