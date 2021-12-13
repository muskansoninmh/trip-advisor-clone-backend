const express = require('express')

const router = new express.Router()
const auth = require('../auth')

const multer = require('multer')
const sharp = require('sharp')
const places = require('../models/places')
const users = require('../models/users')
const cartPlaces = require('../models/cartPlaces')
const { findOne } = require('../models/users')

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
    const buffer = await sharp(req.file.buffer).png().toBuffer()
    place.avatar = buffer
    // console.log(place.avatar);
    await place.save()
    // console.log("req--->", place._id)
    res.set("Content-Type", 'image/jpg')
    res.send(new Buffer(place.avatar).toString('base64'))
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.post('/add-place', auth, async (req, res) => {
    console.log(req.params.id);
    const place = new places({ ...req.body, userId: req.user._id })
    try {

        await place.save()
        res.status(201).send(place)

    }
    catch (e) {
        res.status(400).send(e)
    }
})


router.get('/get-all-places', async (req, res) => {


    try {
        console.log(req.query.limit, req.query.skip);
        let filters = [{ $match: { isDeleted: false } }];
        let sortFilter = { 'createdAt': -1 }

        if (req.query.rating) {
            filters.push({
                $sort: {
                    averageRating: -1
                }

            })
        }
        if (req.query.search) {
            filters.push({
                $match: {

                    $or: [{
                        [`state.id`]: {
                            $regex: req.query.search,
                            $options: "i"
                        }
                    },
                    {
                        [`city.name`]: {
                            $regex: req.query.search,
                            $options: "i"
                        }
                    },
                    ]
                }

            })
        }
        const count = await places.find({ isDeleted: false }).count({});
        console.log(filters);
        const user = await places.aggregate(filters)
        // console.log("user: ", user[0].averageRating)
        return res.send({ user, count })

        // .sort({ ...sortFilter }).limit(Number(req.query.limit)).skip(Number(req.query.skip)).exec(async function (err, user) {
        //     const count = await places.find({ ...filter }).count({});

        //     res.send({ user, count })
        //     console.log(user[0].state);

        // })
        // }



    }
    catch (e) {
        console.log("e", e)
        res.status(400).send(e)
    }
})
router.get('/get-one-place-of-each-city', async (req, res) => {

    const state = [];
    const uniqueplace = []
    try {

        let filter = { isDeleted: false }

        places.find({ ...filter }).sort({ 'createdAt': -1 }).limit(Number(req.query.limit)).skip(Number(req.query.skip)).exec(async function (err, user) {
            user.map((row) => {
                console.log(row.state.name)
                if (!state.includes(row.state.name)) { state.push(row.state.name); uniqueplace.push(row) }
            }
            )
            console.log(state);
            res.send({ uniqueplace })

        })
        // }




    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.get('/auth-get-all-places', auth, async (req, res) => {
    console.log(req.user._id);

    try {

        let filter = { isDeleted: false, userId: req.user._id }

        places.find({ ...filter }).sort({ 'createdAt': -1 }).limit(Number(req.query.limit)).skip(Number(req.query.skip)).exec(async function (err, user) {
            const count = await places.find({ ...filter }).count({});
            const countUser = await users.find({ isDeleted: false, role: "User" }).count({})

            res.send({ user, count, countUser })

        })
        // }



    }
    catch (e) {
        res.status(400).send(e)
    }
})
router.get('/get-place/:id', async (req, res) => {


    try {

        const place = await places.findOne({ _id: req.params.id })

        const cart = await cartPlaces.findOne({ placeId: req.params.id })

        if (cart) {
            place.trip = cart.trip;
            res.send(place)
        }
        else {
            res.send(place)
        }
        // }



    }
    catch (e) {
        res.status(400).send(e)
    }
})


router.post('/edit-place/:id', auth, async (req, res) => {
    console.log(req.body);
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'description', "category", "country", "city", "state", "season", "month", "package", "address"]

    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid) {
        console.log("sdkjsdkl");
        return res.status(404).send({ error: 'Invalid Update' })

    }

    try {



        const user = await places.findOne({ _id: req.params.id })


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

router.get('/delete-place/:id', auth, async (req, res) => {

    const user_address = await places.findById({ _id: req.params.id })



    try {

        user_address.isDeleted = true;
        await user_address.save()

        res.status(201).send(user_address)

    }
    catch (e) {
        res.status(400).send(e)
    }
})
router.post('/trip/:id', auth, async (req, res) => {

    const place = await places.findById(req.params.id)

    try {
        const cart = await cartPlaces.findOne({ userId: req.user._id, placeId: req.params.id })
        if (cart) {
            cart.trip = !cart.trip

            await cart.save();
            res.status(200).send(cart)
        }
        else {
            const cart = new cartPlaces({ userId: req.user._id, placeId: req.params.id, trip: true, placeName: place.name, placeImage: place.avatar })
            await cart.save();
            res.status(201).send(cart)
        }



    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.get('/get-all-trips', auth, async (req, res) => {

    try {

        const cart = await cartPlaces.find({ userId: req.user._id, trip: true })

        res.status(200).send(cart);

    }
    catch (e) {
        res.status(400).send(e)
    }
})


module.exports = router