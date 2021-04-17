const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/Users');

//@route    GET api/profile/me
//@desc     Get current user's profile
//@access   Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        if(!profile) {
            return res.status(400).json({ msg: "There is no profile for this user"});
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Server error'});
    }
});

//@route    POST api/profile
//@desc     Update current user's profile
//@access   Private
router.post('/', auth,[
    check('status', 'status is required').not().isEmpty(),
    check('skills', 'skills are required').not().isEmpty()
], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }

    const { 
        company,
        website, 
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter, 
        linkedin,
        instagram
    } = req.body;

    // build profile obj
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    
    // build social 
    profileFields.social = {};
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(facebook) profileFields.social.facebook = facebook;
    if(instagram) profileFields.social.instagram = instagram;

    // update/create profile
    try {
        let profile = await Profile.findOne({ user: req.user.id });
        if(profile) {
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, 
                { $set: profileFields},
                 { new: true }
            );
            return res.json(profile);
        }
        
        // create
        profile = new Profile(profileFields);
        await profile.save();
        return res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
});

//@route    GET api/profile
//@desc     Get user profiles
//@access   Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

//@route    GET api/profile/user/:user_id
//@desc     Get a user profile by ID
//@access   Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if(!profile) return res.status(400).json({ msg: 'Profile not found' });
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        if(error.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found'});
        }
        res.status(500).send('Server error');
    }
});

module.exports = router;