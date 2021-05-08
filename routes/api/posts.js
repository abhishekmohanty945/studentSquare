const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const User = require('../../models/Users');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');


//@route    POST api/posts
//@desc     Create a post by user
//@access   Private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty(),
    
]], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();
        
        // console.log(post);
        res.json(post);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Get all posts
//@route    POST api/posts
//@desc     Get all posts
//@access   Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({date: -1});
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Get post by id
//@route    get api/posts/:id
//@desc     Get post by id
//@access   Private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
           return res.status(404).json({ msg: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectId') {
            res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server error');
    }
});

// Delete post by id
//@route    DELETE api/posts/:id
//@desc     Delete post by id
//@access   Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        if(req.user.id !== post.user.toString()) {
            return res.status(400).json( { msg: 'Not authorized'} );
        }
        await post.remove();
        res.json({ msg: 'post deleted'});
    } catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectId') {
            res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server error');
    }
});

//@route    PUT api/posts/like/:id
//@desc     Update likes on a post
//@access   Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        //check if post is already liked by user
        if (post.likes.some((like) => like.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'Post already liked' });
        }
      
        post.likes.unshift({ user: req.user.id });
      
        await post.save();
      
        return res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

//@route    PUT api/posts/unlike/:id
//@desc     Update likes on a post
//@access   Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        //check if post is already liked by user
        if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'Post has not yet been liked'});
        }
      
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
      
        post.likes.splice(removeIndex, 1);

        await post.save();
      
        return res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

//@route    POST api/posts/comment/:id
//@desc     Create a comment by user
//@access   Private
router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty(),
]], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = ({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        post.comments.unshift(newComment);

        await post.save();
        
        // console.log(post);
        res.json(post.comments );

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

//@route    DELETE api/posts/comment/:id/:comment_id
//@desc     Delete comment by id
//@access   Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        if(!comment){
            return res.status(404).json({ msg: 'Comment not found'});
        }
        if(comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        post.comments = post.comments.filter(
            ({ id }) => id !== req.params.comment_id
        );

        await post.save();
        res.json(post.comments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;