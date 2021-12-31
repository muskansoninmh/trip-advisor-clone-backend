const express = require('express')

const router = new express.Router()
const auth = require('../auth')
const places = require('../models/places')
const bookPlaces = require('../models/bookPlaces')
const path = require('path')
const shortid = require('shortid')
const Razorpay = require('razorpay')


router.get('/tripadvisorLogo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'tripadvisorLogo.png'))
})

const razorpay = new Razorpay({
    key_id: 'rzp_test_vegePs7wfyBmEK',
    key_secret: 'iF6GqvK5m5NZVLd22Ihy2ie6'
})

router.get('/check-availability', auth, async (req, res) => {

    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        console.log(startDate, endDate);
        const placeid = req.query.id;

        const availableRooms = await places.findById(placeid);

        const existingbookedPlace = await bookPlaces.find({ placeId: placeid }).where("bookStartDate").lt(startDate).where("bookEndDate").gt(endDate)

        if (existingbookedPlace.length !== 0 || availableRooms.availableRoomsOrMembers === 0) {
            console.log("Booking not Available", existingbookedPlace)
            return res.status(400).send({
                error: "Booking not Available"
            })
        }
        res.status(200).send()

    }
    catch (e) {
        res.status(400).send({ error: e.message })
    }
})

router.post('/book-place', auth, async (req, res) => {
    let filter = {}
    let bookPlace
    try {
        const place = await places.findById(req.query.id)
        if (place.availableRoomsOrMembers > req.body.bookNoOfRoomsOrMembers) {
            filter = {

                $and: [
                    {
                        bookStartDate: req.body.bookStartDate,

                    },
                    {
                        bookEndDate: req.body.bookEndDate,


                    },
                    {
                        bookNoOfRoomsOrMembers: req.body.bookNoOfRoomsOrMembers,


                    },


                    {
                        placeId:
                            req.query.id,


                    },
                    {
                        userId: req.user._id,


                    },
                    {
                        book: true
                    },
                ],
            }


            const alreadyBookPlace = await bookPlaces.find({ ...filter })
            console.log(alreadyBookPlace);
            if (alreadyBookPlace.length !== 0) {
                return res.status(400).send({
                    error: "Already Booked"
                })
            }
            bookPlace = new bookPlaces({ ...req.body, userId: req.user._id, placeId: req.query.id });
            place.availableRoomsOrMembers -= bookPlace.bookNoOfRoomsOrMembers;
            bookPlace.book = true;
            await place.save();
            await bookPlace.save();
        }
        else {
            return res.status(400).send({
                error: "Booking not Available"
            })
        }

        res.status(201).send(bookPlace);

    }
    catch (e) {
        res.status(400).send({ error: e.message })
    }
})
router.post('/razorpay', async (req, res) => {
    const payment_capture = 1
    const amount = 499
    const currency = 'INR'

    const options = {
        amount: amount * 100,
        currency,
        receipt: shortid.generate(),
        payment_capture
    }

    try {
        const response = await razorpay.orders.create(options)
        console.log(response)
        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/get-all-booking', auth, async (req, res) => {
    try {
        const placeList = [];
        const bookPlace = await bookPlaces.find({ userId: req.user._id, book: true })
        console.log(bookPlace);
        for (i of bookPlace) {
            const place = await places.findById(i.placeId)
            placeList.push(place)
        }

        res.status(200).send({ bookPlace, placeList });

    }
    catch (e) {
        res.status(400).send(e)
    }
})



module.exports = router