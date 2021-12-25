const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')


const bookPlacesSchema = mongoose.Schema({


    book: {
        type: Boolean,



    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    bookStartDate: {
        type: Date
    },
    bookEndDate: {
        type: Date
    },
    bookNoOfRoomsOrMembers: {
        type: Number
    },
    amount: {
        type: Number
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





const bookPlaces = mongoose.model('bookedPlaces', bookPlacesSchema)

module.exports = bookPlaces