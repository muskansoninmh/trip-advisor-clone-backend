const mongoose = require('mongoose')



const imagesSchema = mongoose.Schema({

    avatar: {
        type: Buffer
    },

    placesID:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'places'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }


},

    {
        timestamps: true
    }


)




const images = mongoose.model('images', imagesSchema)

module.exports = images