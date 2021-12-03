const jwt = require('jsonwebtoken')
const users = require('./models/users')



const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')

        const decoded = jwt.verify(token, 'thisismydemoproject')

        const user = await users.findOne({ _id: decoded._id, 'tokens.token': token })
        console.log(user);
        if (!user) {
            throw new Error()
        }

        req.user = user
        req.token = token
        next()


    } catch (error) {
        res.status(401).send({ error: 'Please Authenticate' })
    }
}

module.exports = auth