
const express = require('express')

const router = new express.Router()
const auth = require('../auth')
const { cloudinary } = require('../utlis/cloudinary');
const multer = require('multer')
const sharp = require('sharp')
const images = require('../models/images')
const users = require('../models/users')



router.post('/places/:id/image',  async (req, res) => {
   const image = new images({ placesID: req.params.id })

   const fileStr = req.body.fileStr;
   try { 
       const uploadResponse = await cloudinary.uploader.upload(fileStr, {
         upload_preset: 'tripAdvisor',
     });
     image.avatar = uploadResponse.public_id;
     await image.save();
     res.status(201).send(image);
     
 }
 catch(e) {
     res.status(400).send({error : "Unable to Upload Image"})
 }
    

})
router.get('/get-images/:id', async (req, res) => {
    try {

        await images.find({ placesID: req.params.id, isDeleted: false }).sort({ 'createdAt': -1 }).exec(async function (err, image) {


            res.status(200).send(image)

        });
    }
    catch (e) {
        res.status(400).send(e)
    }
})
router.get('/delete-image/:id', async (req, res) => {


    const image = await images.findById({ _id: req.params.id })



    try {

        image.isDeleted = true;
        await image.save()

        res.status(200).send(image)

    }
    catch (e) {
        res.status(400).send(e)
    }
})


module.exports = router