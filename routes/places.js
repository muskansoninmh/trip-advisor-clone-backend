const express = require('express')

const router = new express.Router()
const auth = require('../auth')
const { cloudinary } = require('../utlis/cloudinary');

const places = require('../models/places')
const users = require('../models/users')
const cartPlaces = require('../models/cartPlaces')
const { findOne } = require('../models/users')
const bookPlaces = require('../models/bookPlaces')


router.post('/place/:id/image',  async (req, res) => {
    const place = await places.findById(req.params.id);
    const fileStr = req.body.fileStr;
      try { const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            upload_preset: 'tripAdvisor',
        });
        place.avatar = uploadResponse.public_id;
        await place.save();
        res.status(201).send(place.avatar);
        
    }
    catch(e) {
        res.status(400).send({error : "Unable to upload an image"})
    }
  
})

router.post('/add-place', auth, async (req, res) => {

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

        let filters = [{ $match: { isDeleted: false } }];


        if (req.query.rating === 'true') {


            filters.push({
                $sort: {
                    averageRating: -1
                }

            })
        }
        else {
            filters.push({
                $sort: { createdAt: -1 }
            })
        }
        if (req.query.search) {
            filters.push({
                $match: {

                    $or: [
                        {
                            [`state.name`]: {
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
                        {
                            [`country.name`]: {
                                $regex: req.query.search,
                                $options: "i"
                            }
                        },
                        {
                            [`name`]: {
                                $regex: req.query.search,
                                $options: "i"
                            }
                        },

                    ]
                }

            })
        }
        if (req.query.category) {
            filters.push({

                $match: {
                    [`category`]: {
                        $regex: req.query.category,
                        $options: "i"
                    }
                }
            })
        }


        if (Number(req.query.limit)) {


            filters.push(
                {
                    $skip: Number(req.query.skip)
                })
            filters.push({
                $limit: Number(req.query.limit)
            })

        }


        const user = await places.aggregate(filters)

        filters.pop(

            { $limit: Number(req.query.limit) },
        )
        filters.pop(
            {
                $skip: Number(req.query.skip)
            }

        )


        const count = (await places.aggregate(filters)).length


        return res.status(200).send({ user, count })





    }
    catch (e) {
        console.log("e", e)
        res.status(400).send(e)
    }
})
router.get('/get-one-place-of-each-state', async (req, res) => {

    const state = [];
    const uniqueplace = []
    try {

        let filter = { isDeleted: false }

    
        // const place = await places.find({...filter}).sort({ 'createdAt': -1 }).limit(Number(req.query.limit)).skip(Number(req.query.skip)).distinct('state.id')
  
        const place = await places.aggregate([
            {$match :  {'isDeleted' : false}},
            {$sort : { 'createdAt': -1 }},
           
            {
             $group : {
                  "_id" : "$state.name",
                 
                  "placeId" :{ "$first" : "$_id" },
                  "country" :{"$first"  :"$country.name"},
                  "avatar" :{"$first": "$avatar"}

                 } 
        },
        {$limit : Number(req.query.limit)},
    ])
        console.log(place.length)
        res.status(200).send({place})




    }
    catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.get('/auth-get-all-places', auth, async (req, res) => {


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

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'description', "category", "country", "city", "state", "season", "month", "package", "address", "openingHours", "closingHours", "contactNo", "website", "roomOrMembers"]

    const isValid = updates.some((update) => allowedUpdates.includes(update))

    if (!isValid) {

        return res.status(404).send({ error: 'Invalid Update' })

    }

    try {



        const user = await places.findOne({ _id: req.params.id })


        if (!user) {

            return res.status(404).send()
        }

        updates.forEach((update) => {


            user[update] = req.body[update];


        });

      
        await user.save()

        res.send(user)
    }
    catch (e) {
        res.status(400).send()
    }
});

router.get('/delete-place/:id', auth, async (req, res) => {

    const place = await places.findById({ _id: req.params.id })



    try {

        place.isDeleted = true;
        await place.save()

        res.status(201).send(place)

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
            const cart = new cartPlaces({ userId: req.user._id, placeId: req.params.id, trip: true })
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
        const placeList = [];
        const trip = await cartPlaces.find({ userId: req.user._id, trip: true })
        for (i of trip) {
            const place = await places.findById(i.placeId)
            placeList.push(place)
        }

        res.status(200).send({ trip, placeList });

    }
    catch (e) {
        console.log(e);
        res.status(400).send(e)
    }
});

router.post('/add-review', auth, async (req, res) => {
    try {

        const place = await places.findById(req.query.id);

        place.reviews = place.reviews.concat({

            review: req.body.review,
            rating: req.body.rating,
             
            userId: req.user._id

        })
        place.averageRating = 0;
        let ar = ((place.averageRating * (place.reviews.length - 1)) + (req.body.rating)) / place.reviews.length

        console.log(ar);
        place.averageRating = ar.toFixed(2);
        if(place.averageRating === 0) {
            place.averageRating = req.body.rating
        }
        await place.save();
        res.status(201).send(place.reviews[place.reviews.length - 1])
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e)
    }

})

router.get('/delete-review', auth, async (req, res) => {
    try {

        const place = await places.findById(req.query.id);


        const index = place.reviews.findIndex(i => i.userId.toString() === req.user._id.toString())

        let ar =
            (place.averageRating * place.reviews.length -
                place.reviews[index].rating) /
            (place.reviews.length === 1
                ? place.reviews.length
                : place.reviews.length - 1);

        place.reviews = await place.reviews.filter((rvw) =>
            rvw.userId.toString() !== req.user._id.toString())


        place.averageRating = ar.toFixed(2);

        await place.save();
        res.status(200).send({ averageRating: place.averageRating })
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e)
    }

});
router.post('/edit-review', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    let index = 0;
    const allowedUpdates = ['rating', 'review']

    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid) {

        return res.status(404).send({ error: 'Invalid Update' })

    }

    try {


        const place = await places.findById(req.query.id)
        const index = place.reviews.findIndex(i => i.userId.toString() === req.user._id.toString())

        let ar = (((place.averageRating * place?.reviews?.length) - place?.reviews[index].rating) + req.body.rating) / place.reviews?.length;



        places.findOneAndUpdate(
            {
                '_id': req.query.id,
                'reviews.userId': req.user._id
            },
            {
                $set: {
                    'reviews.$[element]': {
                        'rating': req.body.rating,
                        'review': req.body.review,
                        'userId': req.user._id,
                        'UserName': req.user.first_name + " " + req.user.last_name,
                        // '_id': place.reviews[index]._id
                    },
                    'averageRating': ar.toFixed(2)
                },
            },
            { arrayFilters: [{ 'element.userId': req.user._id }], "new": true },
            (err, plc) => {
                if (err) res.status(400)
                // console.log(plc.reviews);
                res.status(200)
                    .send({ review: plc.reviews[index], averageRating: plc.averageRating })
            }
        )




    }
    catch (e) {
        res.status(400).send({ error: e.message })
    }
});

router.get('/sales', auth, async (req, res) => {
    try {



        const sales = await bookPlaces.aggregate([

            {

                $project: {
                    'amount': true,
                    'month': { $month: '$createdAt' },
                    'createdAt': true,
                    'year': {
                        $cond: [
                            { $eq: [{ $year: "$createdAt" }, Number(req.query.year)] },
                            "$amount",
                            0

                        ]
                    }

                },
            },
            {
                $group: {

                    _id: '$month',
                    total: {
                        '$sum': '$year'
                    }
                }
            },
            {
                $sort: { "_id": 1 }
            }

        ])
        // console.log(sales);
        let filter = { isDeleted: false, userId: req.user._id }


        const count = await places.find({ ...filter }).count({});
        const countUser = await users.find({ isDeleted: false, role: "User" }).count({})


        res.status(200).send({ sales, count, countUser })
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e)
    }

});

module.exports = router