const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const generateToken = require('../config/generateToken')


const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Plese Enter all the Feilds")
    }

    const userExits = await User.findOne({ email })
    if (userExits) {
        res.status(400)
        throw new Error("User is already exists")
    }

    const user = await User.create({
        name,
        email,
        password,
        pic
    })
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('failed to create user')
    }
})

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (user && (await user.matchPassword(password))) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    } else {
        res.status(401)
        throw new Error('Invaild email or password')
    }
})

// /api/user?search=vignesh
const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } }, //i-upperCase and lowerCase
            { email: { $regex: req.query.search, $options: 'i' } },
        ]
    } : {}
    // console.log("k",keyword);
    // const user = await User.find(keyword)
    // const user = await User.find(keyword).find({ _id: { $ne: req.user._id } })
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

    //it will return expect the current uer snd $ne-not equal-to
    // console.log(user);
    res.send(users)
})



module.exports = { registerUser, authUser, allUsers }