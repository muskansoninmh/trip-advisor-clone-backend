
const express = require('express')

const router = new express.Router()
const auth = require('../auth')

const multer = require('multer')
const sharp = require('sharp')
const images = require('../models/images')
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
router.post('/places/:id/image', avatar.single('image'), async (req, res) => {
    console.log(req.params.id)
    const image = new images({ placesID: req.params.id })
    console.log(image);
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    image.avatar = buffer
    // console.log(image.avatar);
    await image.save();

    // console.log("req--->", image._id)
    res.set("Content-Type", 'image/jpg')
    res.send(image)
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})
router.get('/get-images/:id', async (req, res) => {
    try {

        await images.find({ placesID: req.params.id, isDeleted: false }).sort({ 'createdAt': -1 }).exec(async function (err, image) {


            res.send(image)

        });
    }
    catch (e) {
        res.status(400).send(e)
    }
})
router.get('/delete-image/:id', async (req, res) => {


    const image = await images.findById({ _id: req.params.id })

    console.log(image.isDeleted);

    try {

        image.isDeleted = true;
        await image.save()

        res.status(201).send(image)

    }
    catch (e) {
        res.status(400).send(e)
    }
})


module.exports = router