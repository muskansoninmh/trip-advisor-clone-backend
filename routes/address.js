const express = require('express')

const router = new express.Router()
const auth = require('../auth')

const userAddress = require('../models/userAddress')
const users = require('../models/users')




router.post('/add-address/:id', async (req, res) => {
    console.log(req.body);
    const user = await users.findById(req.params.id);
    const user_address = new userAddress({ ...req.body, employeeID: req.params.id })
    try {

        await user_address.save()
        user.totalAddress = user.totalAddress + 1
        await user.save();
        res.status(201).send(user_address)

    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.get('/get-address-details/:id', async (req, res) => {
    try {

        const user = await userAddress.find({ employeeID: req.params.id, isDeleted: false }).sort({ 'createdAt': -1 }).exec(async function (err, user) {


            res.send(user)
            console.log(user);
        });
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