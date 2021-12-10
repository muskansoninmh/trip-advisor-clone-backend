const jwt = require('jsonwebtoken')
const users = require('./models/users')



const auth = async (req, res, next) => {
    try {
        console.log("dfgdf");
        const token = req.header('Authorization').replace('Bearer ', '')
        console.log("dsffdfgfd", token);
        const decoded = jwt.verify(token, 'thisismydemoproject')
        // console.log("dfdgfdfg", decoded);

        const user = await users.findOne({ _id: decoded._id, role: decoded.role, 'tokens.token': token })
        // console.log("dgfggf", user);
        if (!user) {
            throw new Error()
        }

        req.user = user
        req.token = token
        // console.log(req.token);
        next()
        console.log("req.user");

    } catch (error) {

        res.status(401).send({ error: 'Please Authenticate' })
    }
}

module.exports = auth