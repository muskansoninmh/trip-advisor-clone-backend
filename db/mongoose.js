const mongoose = require('mongoose')
const { db } = require('../models/users')

mongoose.connect('mongodb://127.0.0.1:27017/vacation-finder', {
    useNewUrlParser: true

})

