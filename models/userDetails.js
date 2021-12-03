// const mongoose = require('mongoose')
// const validator = require('validator')
// const bcrypt = require('bcryptjs')


// const userSchema = mongoose.Schema({


//     address: {
//         type: String,
//         // required: true,
//         trim: true,
//         // minlength: 10
//         // minlength: 8
//     },
//     salary: {
//         type: Number,
//         trim: true,
//         minlength: 4
//     },
//     zip: {
//         type: Number,
//         trim: true,
//         minlength: 6
//     },
//     country: {
//         type: String,
//         trim: true,
//     },
//     employeeID:
//     {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         ref: 'users'
//     },
//     avatar: {
//         type: Buffer
//     }

// },


// )

// // userSchema.virtual('bikes' , {
// //     ref : 'Bike-Types',
// //     localField: "_id",
// //     foreignField : "owner"
// // })

// // userSchema.virtual('bike' , {
// //     ref : 'Bikes',
// //     localField: "_id",
// //     foreignField : "owner"
// // })



// const usersDetails = mongoose.model('users-details', userSchema)

// module.exports = usersDetails