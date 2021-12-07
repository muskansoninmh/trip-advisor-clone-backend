const express = require('express')

const router = new express.Router()
const auth = require('../auth')

const multer = require('multer')
const sharp = require('sharp')
const places = require('../models/places')
const users = require('../models/users')

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
router.post('/place/:id/image', avatar.single('image'), async (req, res) => {
    console.log(req.file)
    const place = await places.findById(req.params.id)
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    place.avatar = buffer
    // console.log(place.avatar);
    await place.save()
    // console.log("req--->", place._id)
    res.set("Content-Type", 'image/jpg')
    res.send(new Buffer(place.avatar).toString('base64'))
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.post('/add-place/:id', async (req, res) => {
    console.log(req.params.id);
    const place = new places({ ...req.body, userId: req.params.id })
    try {

        await place.save()
        res.status(201).send(place)

    }
    catch (e) {
        res.status(400).send(e)
    }
})


router.get('/get-all-places/:id', async (req, res) => {


    try {

        let filter = { isDeleted: false }

        places.find({ userId: req.params.id }).sort({ 'createdAt': -1 }).limit(Number(req.query.limit)).skip(Number(req.query.skip)).exec(async function (err, user) {
            const count = await places.find({ userId: req.params.id }).count({});

            res.send({ user, count })

        })
        // }



    }
    catch (e) {
        res.status(400).send(e)
    }
})



router.post('/edit-address/:id', async (req, res) => {
    console.log(req.body);
    const updates = Object.keys(req.body)
    const allowedUpdates = ['type', 'appartment_detail', "street_address", "country", "city", "state", "zip"]

    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid) {
        console.log("sdkjsdkl");
        return res.status(404).send({ error: 'Invalid Update' })

    }

    try {



        const user = await userAddress.findOne({ _id: req.params.id })


        if (!user) {

            return res.status(404).send()
        }

        updates.forEach((update) => {

            console.log("ddfsdfdf");
            user[update] = req.body[update];

        });

        console.log("sllhjdjl", user);
        await user.save()

        console.log("sllhjdjl", user);
        res.send(user)
    }
    catch (e) {
        res.status(400).send()
    }
});

router.get('/delete-address/:id', async (req, res) => {

    const user_address = await userAddress.findById({ _id: req.params.id })

    const user = await users.findOne({ _id: user_address.employeeID });



    try {

        user_address.isDeleted = true;
        await user_address.save()
        user.totalAddress = user.totalAddress - 1
        await user.save();
        res.status(201).send(user_address)

    }
    catch (e) {
        res.status(400).send(e)
    }
})
module.exports = router