const express = require('express')
const users = require('../models/users')
const router = new express.Router()
const auth = require('../auth')
const usersDetails = require('../models/userDetails')
const multer = require('multer')
const sharp = require('sharp')
const userAddress = require('../models/userAddress')


router.post('/users', async (req, res) => {

    const user = new users(req.body)
    try {

        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    }
    catch (e) {
        res.status(400).send(e)
    }


})

router.post('/users/login', async (req, res) => {
    try {
        // console.log(req.body.password,)
        const user = await users.findByCredentials(req.body.email, req.body.password)


        const token = await user.generateAuthToken()

        res.send({ user, token })
    }
    catch (e) {
        res.status(400).send({ error: "Email Address and Password does not match " })
    }
})

// router.post('/users/logout' , auth , async (req, res) => {
//     try{
//         req.user.tokens = req.user.tokens.filter((token) => {
//             return token.token !== req.token         
//         })
//       await req.user.save()
//         res.send()
//     }
//     catch(e){
//         res.status(500).send()
//     }
// })

// router.post('/add-users', async (req, res) => {
//     const fixed = { name: req.body.name, email: req.body.email, password: req.body.password, age: req.body.age, number: req.body.number }
//     // console.log(req.body);

//     const user = new users(fixed)
//     try {

//         await user.save()
//         // console.log("saved");
//         // const token = await user.generateAuthToken()
//         const userDetails = new usersDetails({ address: req.body.address, salary: req.body.salary, zip: req.body.zip, country: req.body.country, employeeID: user._id })
//         // console.log(userDetails);
//         await userDetails.save();
//         // console.log("Details Saved");
//         // console.log({ user: { ...user, address: userDetails.address } });
//         res.status(201).send(user)
//         // res.status(201).send({ user, token })

//     }
//     catch (e) {
//         res.status(400).send(e)
//     }
// })


router.post('/add-users', async (req, res) => {

    const user = new users({ first_name: req.body.first_name, last_name: req.body.last_name, birth_date: req.body.birth_date, email: req.body.email, salary: req.body.salary, department: req.body.department, joining_date: req.body.joining_date, number: req.body.number })
    console.log(req.body);
    try {
        const validEmail = await users.findOne({ isDeleted: false, email: req.body.email })
        if (validEmail) {
            return res.status(404).send({ error: "Email should be unique" })
        }
        const validNumber = await users.findOne({ isDeleted: false, number: req.body.number })
        if (validNumber) {
            return res.status(404).send({ error: "Contact should be unique" })
        }
        await user.save()
        res.status(201).send(user)
    }
    catch (e) {

        // if (e.keyPattern.number) {
        res.status(400).send(e)
        // console.log(e.keyPattern.number);
        // }
        // if (e.keyPattern.email) {
        //     res.status(400).send({ error: "Email should be unique" })
        // }


    }
});

router.get('/users/get-all-employees', async (req, res) => {


    try {

        let filter = { isDeleted: false }
        if (req.query.name) {
            filter = {
                ...filter,
                $or: [
                    {
                        first_name: {
                            $regex: req.query.name,
                            $options: "i",
                        },
                    },
                    {
                        last_name: {
                            $regex: req.query.name,
                            $options: "i",
                        },
                    },
                    {
                        email: {
                            $regex: req.query.name,
                            $options: "i",
                        },
                    },
                    {
                        department: {
                            $regex: req.query.name,
                            $options: "i",
                        },
                    },

                    {
                        number: {
                            $regex: req.query.name,

                        },
                    },
                ],
            }
        }
        console.log(filter['$or']);
        users.find({ ...filter }).sort({ 'createdAt': -1 }).limit(Number(req.query.limit)).skip(Number(req.query.skip)).exec(async function (err, user) {
            const count = await users.find({ ...filter }).count({});

            res.send({ user, count })

        })
        // }



    }
    catch (e) {
        res.status(400).send(e)
    }
})

// router.get('/users/count', async (req, res) => {
//     try {

//         let filter = { isDeleted: false }
//         if (req.query.name) {
//             filter = {
//                 ...filter,
//                 $or: [
//                     {
//                         first_name: {
//                             $regex: req.query.name,
//                             $options: "i",
//                         },
//                     },
//                     {
//                         last_name: {
//                             $regex: req.query.name,
//                             $options: "i",
//                         },
//                     },
//                     {
//                         email: {
//                             $regex: req.query.name,
//                             $options: "i",
//                         },
//                     },
//                     {
//                         department: {
//                             $regex: req.query.name,
//                             $options: "i",
//                         },
//                     },
//                 ],
//             }
//         }
//         users.find({ ...filter }).count({}, function (err, result) {

//             if (err) {
//                 res.send(err)
//             }
//             else {
//                 res.json(result)
//             }

//         })
//     }
//     catch (e) {
//         res.status(400).send(e)
//     }
// })

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send("Logged Out")
    }
    catch (e) {
        res.status(500).send()
    }
})

router.get('/get-other-details/:id', async (req, res) => {
    try {
        // console.log(req.params.id);
        // console.log();
        const user = await usersDetails.findOne({ employeeID: req.params.id });
        res.send(user);
    }
    catch (e) {
        res.status(400).send(e)
    }
})


router.get('/delete-user/:id', async (req, res) => {
    const user = await users.findById({ _id: req.params.id })
    user.isDeleted = true;
    await user.save();
    res.send(user)
})

router.post('/edit-users/:id', async (req, res) => {
    //console.log(req.body);
    const updates = Object.keys(req.body)
    const allowedUpdates = ['first_name', 'last_name', "email", "number", "birth_date", "department", "joining_date", "salary"]

    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid) {
        // console.log("sdkjsdkl");
        return res.status(404).send({ error: 'Invalid Update' })

    }

    try {

        // const task = await tasks.findById(req.params.id)

        const user = await users.findOne({ _id: req.params.id })
        // const userDetails = await usersDetails.findOne({ employeeID: user._id })
        // console.log(user, userDetails);

        // const user = await users.findByIdAndUpdate(req.params.id , req.body , {
        //     new: true, 
        //     runValidators : true
        // })

        if (!user) {

            return res.status(404).send()
        }

        updates.forEach((update) => {
            // if (update !== "address" && update !== "salary" && update !== "country" && update !== "zip") {
            // console.log("ddfsdfdf");
            user[update] = req.body[update];

        });

        // console.log("sllhjdjl", user);
        await user.save()
        // await userDetails.save()
        // console.log("sllhjdjl", user);
        res.send(user)
    }
    catch (e) {
        if (e.keyPattern.number) {
            res.status(400).send({ error: "Contact should be unique" })
            console.log(e.keyPattern.number);
        }
        if (e.keyPattern.email) {
            res.status(400).send({ error: "Email should be unique" })
        }
    }
})


const avatar = multer({

    // limits: {
    //     fileSize: 1000000
    // },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image '))
        }
        cb(undefined, true)
    }
})

router.post('/users/:id/image', avatar.single('image'), async (req, res) => {
    console.log(req.file)
    const user = await users.findById(req.params.id)
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    user.avatar = buffer
    // console.log(user.avatar);
    await user.save()
    // console.log("req--->", user._id)
    res.set("Content-Type", 'image/jpg')
    res.send(new Buffer(user.avatar).toString('base64'))
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


router.get('/get-user-image/:id', async (req, res) => {
    const user = await users.findById(req.params.id)
    if (user.avatar) {
        res.set("Content-Type", 'image/jpg')
        res.send(new Buffer(user.avatar).toString('base64'))
    }
})

module.exports = router