const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        trim: true,
    },
    last_name: {
        type: String,
        trim: true,
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

    contact: {
        type: String,
        minlength: 10,
        // unique: true,
    },
    email: {
        type: String,
        required: true,

        trim: true,
        lowercase: true,
        // unique: true,
        validate(email) {
            if (!validator.isEmail(email)) {
                throw new Error('Invalid email address')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    }
    ,

    role: {
        type: "String",
        default: "User"
    },

    avatar: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},
    {
        timestamps: true
    }

)

userSchema.virtual('id', {
    ref: 'places',
    localField: '_id',
    foreignField: 'userId'
})

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


userSchema.methods.toJSON = function () {
    const user = this
    const userobject = user.toObject();

    delete userobject.password
    delete userobject.tokens

    return userobject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    console.log("sdsfsdf");

    const token = jwt.sign({ _id: user._id.toString(), role: user.role }, 'thisismydemoproject')
    console.log(token)

    user.tokens = user.tokens.concat({ token })

    await user.save()

    return token

}


userSchema.statics.findByCredentials = async (email, password) => {
    const user = await users.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }
    // console.log(user.password ,password)
    const isMatch = await bcrypt.compare(password, user.password)
    // console.log("is match",isMatch)
    if (!isMatch) {

        throw new Error("Unable to Login")
    }
    return user
}

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const users = mongoose.model('users', userSchema)

module.exports = users