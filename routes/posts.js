const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middlewares/ensureAuth')
const Post = require('../models/Post')
const { pagination, dashboard_pagination } = require('../middlewares/pagination')
const randomPosts = require('../middlewares/randomPosts')
const Comment = require('../models/Comment')
const popularPosts = require('../middlewares/popularPosts')
const app = express()
app.use(express.urlencoded({ extended: false, limit: '10mb' }))


//------------------- GET ALL POSTS ROUTE-----------------------

router.get('/', pagination(), popularPosts(), (req, res) => {
    //now extract the given res obj and pass it to ejs file
    let { posts, total_pages, next, previous, current_page, countIndex } = req.resObj
    res.render('posts/posts', {
        user: req.user, posts, total_pages, next, previous, current_page, countIndex,
        search: req.query.search,
        popularPosts: req.popularPosts
    })
})

//------------------- creating a new post route-----------------------
router.route('/create')
    .get(ensureAuth, (req, res) => {
        // send a post
        const post = new Post()
        res.render('dashboard/createPost', { user: req.user, post })
    }).post(ensureAuth, async (req, res) => {
        const { title, content, cover } = req.body
        // creating new post
        const postDoc = new Post({
            title,
            content,
            author: req.user._id
        })
        if (req.user.name=='Admin') {
            postDoc.approved=true
        }
        bufferImage(postDoc, cover)
        try {

            await postDoc.save()
            req.flash('success', 'Hurrah! Create New Post,Soon will be published!')
            res.redirect('/posts/view/pending')

        } catch (error) {
            req.flash('err_msg', 'Invalid Credentials, Try again!')
            res.render('dashboard/createPost', { user: req.user, post: postDoc })
        }

    })


//------------------------------------------- EDIT POST ROUTES----------------------------
router.route('/edit/:id')
    .get(ensureAuth, async (req, res) => {
        try {
            // found the post and send it to use for editing
            const post = await Post.findById(req.params.id).exec()
            if (!post) {
                res.send('no posts exists')
            }
            // render the posts page
            res.render('dashboard/editPost', { user: req.user, post, path: post.coverImageUrl })
        } catch (error) {
            res.send(error.message)
            console.log(error);
        }

    }).put(ensureAuth, async (req, res) => {
        const { title, content, cover } = req.body
        // update the doc after finding that doc
        const toUpateDoc = await Post.findById(req.params.id).exec()
        if (!toUpateDoc) {
            req.flash('err_msg', 'Post Not Exists!')
            res.redirect('/posts/create')
        }
        try {
            toUpateDoc.title = title
            toUpateDoc.content = content
            toUpateDoc.createAt = new Date()
            if (req.user.name=='Admin') {
                
                toUpateDoc.approved = true
            }else{

                toUpateDoc.approved = false
            }
            // else buffer image again
            bufferImage(toUpateDoc, cover)
            await toUpateDoc.save()
            // if book updated successfully!
            req.flash('success', 'Congrats! Updated Post Successfully!, Soon it will be Published!')
            res.redirect('/posts/view/pending')
        } catch (error) {
            req.flash('err_msg', 'Errow while Updating, Invalid Credentials!')
            res.render('dashboard/editPost', { user: req.user, post: toUpateDoc, path: toUpateDoc.coverImageUrl })
            console.log(error);
        }

    });






// ---------------------- 💥 DASHBOARD ROUTES 👨‍🏭-----------------------------------------------


//--------- dashboard all posts route-----------
router.get('/view/all', ensureAuth, dashboard_pagination(), async (req, res) => {
    let { posts, total_pages, next, previous, current_page, countIndex } = req.resObj
    res.render('dashboard/posts/allPosts', { user: req.user, posts, total_pages, next, previous, current_page, countIndex, search: req.query.search })
})


//--------- dashboard completed posts route-----------
router.get('/view/approved', ensureAuth, dashboard_pagination({ 'approved': true }), async (req, res) => {
    let { posts, total_pages, next, previous, current_page, countIndex } = req.resObj

    res.render('dashboard/posts/approvedPosts', { user: req.user, posts, total_pages, next, previous, current_page, countIndex, type: 'Completed' })
})


//--------- dashboard pending posts route-----------
router.get('/view/pending', ensureAuth, dashboard_pagination({ 'approved': false }), async (req, res) => {
    let { posts, total_pages, next, previous, current_page, countIndex } = req.resObj

    res.render('dashboard/posts/pendingPosts', { user: req.user, posts, total_pages, next, previous, current_page, countIndex, type: 'Pending' })
})

//----------------------------- DELETE POSTS----------------------------
router.delete('/delete', ensureAuth, async (req, res) => {
    try {

        const { post } = req.body
        if (!post) {
            throw new Error('Invalid Credentials!')
        }
        // find post and delete it
        await Post.findOneAndRemove({ _id: post }).exec()
        // delete all comments
        await Comment.deleteMany({ post })
        req.flash('success', 'Post Deleted Successfully!')
        res.redirect('/posts/view/all')
    } catch (error) {
        req.flash('err_msg', 'Something Went Wrong!')
        console.log(error.message);
        res.redirect('/posts/view/all')
    }
})

router.get('/:id', randomPosts, async (req, res) => {
    // find specific post and show the user
    try {

        //deep populate of populated filed
        //https://stackoverflow.com/questions/18867628/mongoose-deep-population-populate-a-populated-field

        const post = await Post.findById(req.params.id).populate('author').populate({
            path: 'comments',
            select: "comment _id",
            populate: {
                path: 'author',
                select: "name picUrl"
            }
        }).exec()
        // find the post comments
        if (!post) {
            res.status(403).send('No Post Exists!')
        }
        res.render('posts/post', { user: req.user, post, author: post.author, randomPosts: req.randomPosts })
    } catch (error) {
        console.log(error.message);
        res.sendStatus(500)
    }

})
// function that buffers the image
function bufferImage(post, coverEncoded) {
    if (coverEncoded === null) return;
    const cover = JSON.parse(coverEncoded)

    let imageMimeTypes = /image\/*/ig
    // creating buffer of base 64 string
    if (cover != null && imageMimeTypes.test(cover.type)) {
        post.coverImage = Buffer.from(cover.data, 'base64')
        post.coverImageType = cover.type
    }
    else
        throw Error('Invalid Credentials, While Creating Post,Try again!')

}
module.exports = router