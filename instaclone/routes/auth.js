const express = require('express');
const router = express.Router()

const mongoose = require('mongoose');
const User = mongoose.model("User")

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')
const requireLogin = require('../middleware/requireLogin')




router.get('/', (req, res) => {
    res.send("bello World")

})

router.post('/signup', (req, res) => {
    const { name, email, password } = req.body
    if (!email || !password || !name) {
        res.status(422).json({ error: "Plese add all field" })
    }
    User.findOne({ email: email })
        .then((savedUser) => {

            if (savedUser) {

                res.status(422).json({ error: "User Allredy Exist" })


            }
            bcrypt.hash(password, 12)
                .then(hashedpassword => {

                    const user = new User({
                        email,
                        password: hashedpassword,
                        name

                    })
                    user.save()
                        .then(user => {
                            res.json({ message: "saved successfully" })
                        })
                        .catch(err => {

                            console.log(err);

                        })

                })



        })
        .catch(err => {

            console.log(err);

        })

})



router.post('/signin', (req, res) => {

    const { email, password } = req.body

    if (!email || !password) {
        return res.status(422).json({ error: "Plese add email or password" })

    }

    User.findOne({ email: email })
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: "invalid email or password" })
            }

            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if (doMatch) {
                        const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET)
                        const {_id,name,email} = savedUser
                        res.json({ token ,user:{_id,name,email}})

                    } else {
                        return res.status(422).json({ error: "Invalid Passworrd or Email" })

                    }

                })

            .catch(err => {

                console.log(err);

            })
        })
})

module.exports = router