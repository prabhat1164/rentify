var express = require('express');
var router = express.Router();
const userModel = require("./users");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require('./multer')
const postModel = require('./posts');
const nodemailer = require('nodemailer');
const { render } = require('ejs');

passport.use(new localStrategy(userModel.authenticate()));

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_PASS  
  }
});


router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function (req, res, next) {
  res.render('login', {error: req.flash('error')});
})

router.get('/profile', isLoggedIN, async function (req, res, next) {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user
    }).populate('posts');

    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('profile', { user });
  } catch (error) {
    next(error);
  }
});


router.post('/register',function(req, res){
  const {username, email, fullname, role, contactNo} = req.body;
  const userData = new userModel({username, email, fullname, role, contactNo});
  userModel.register(userData,req.body.password)
  .then(function(){
    passport.authenticate('local')(req, res, function(){
      res.redirect("/profile");
    })
  })
})

router.post('/login', passport.authenticate('local', {
  successRedirect:'/profile',
  failureRedirect:'/login',
  failureFlash: true
}), function(req, res){

})

router.get('/logout', function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

//To update profile picture
router.post('/dpupload', isLoggedIN, upload.single('file'), async function (req, res, next) {
  if(!req.file){
    return res.status(400).send('No files uploaded');
  }
  const user = await userModel.findOne({username: req.session.passport.user});
  user.dp = req.file.filename;
  await user.save();
  res.redirect('/profile')
})

router.get('/uploadpost', isLoggedIN, function (req, res, next) {
  res.render('uploadpost');
  })

//Post upload
router.post('/upload', isLoggedIN, upload.single('file'), async function (req, res, next) {
  if(!req.file){
    return res.status(400).send('No files uploaded');
  }
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    image: req.file.filename,
    title: req.body.title,
    place: req.body.place,
    area: req.body.area,
    bedrooms: req.body.bedrooms,
    nearbyMall: req.body.nearbyMall,
    bathrooms: req.body.bathrooms,
    nearbyHospital: req.body.nearbyHospital,
    nearbyCollege: req.body.nearbyCollege,
    rent: req.body.rent,
    user: user._id
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile')
})

//Edit Profile
router.get('/editProfile', isLoggedIN, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  });
  console.log(user);
res.render('editProfile', {user});
})

//Update Profile
router.post('/updateProfile', isLoggedIN, async function (req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    user.fullName = req.body.fullName;
    user.email = req.body.email;
    user.contactNo = req.body.contactNo;
    if (req.body.password) {
      await user.setPassword(req.body.password);
    }
    await user.save();
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Error updating profile. Please try again later.');
  }
})

//Feeds
router.get('/feeds', async function (req, res, next) {
  try {
    const posts = await postModel.find();
    const usersList = await userModel.find();
    let user = null;

    if (req.session && req.session.passport && req.session.passport.user) {
      user = await userModel.findOne({
        username: req.session.passport.user
      });
    }

    res.render('feeds', { posts, user });
  } catch (error) {
    console.error('Error fetching feeds or user:', error);
    res.render('feeds', { posts: [], user: null });
  }
});


//Post Liked
router.post('/updatePostLike/:postId', isLoggedIN, async (req, res) => {
  try {
    // Find the post by its ID
    const postId = req.params.postId;
    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already liked the post
    const userId = req.session.passport.user;
    const likedIndex = post.likes.indexOf(userId);

    // If the user hasn't liked the post, add their ID to the likes array
    if (likedIndex === -1) {
      post.likes.push(userId);
    } else {
      // If the user has already liked the post, remove their ID from the likes array
      post.likes.splice(likedIndex, 1);
    }

    // Save the updated post document
    await post.save();

    // Send response indicating success
    res.status(200).json({ message: "Post like updated successfully" });
  } catch (error) {
    // Handle errors
    console.error('Error updating post like:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/interested/:postId', isLoggedIN, async (req, res) => {
  try {
    const postId = req.params.postId; 
    const userLoggedIn = await userModel.findOne({ username: req.session.passport.user });

    // Find the post by its ID
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postByUser = await userModel.findOne({ _id: post.user});

    // Define email options
    const toBuyer = {
      from: process.env.GMAIL_USER,
      to: userLoggedIn.email, 
      subject: "Rentify|Here's the Property details",
      text: `
      Hope you are enjoying Rentify!
      Seller Details:
      Name: ${postByUser.fullname}
      Email: ${postByUser.email}
      Contact No: ${postByUser.contactNo}

      Property Details:
      Title: ${post.title}
      Place: ${post.place}
      Area: ${post.area} sqft
      Bedrooms: ${post.bedrooms}
      Bathrooms: ${post.bathrooms}
      Nearby Hospital: ${post.nearbyHospital} km
      Nearby Mall: ${post.nearbyMall} km
      Nearby College: ${post.nearbyCollege} km
      Rent: ₹${post.rent}/month
    `
    };

    const toSeller = {
      from: process.env.GMAIL_USER,
      to: postByUser.email, 
      subject: "Rentify|Someone is interested",
      text: `
      Hope you are enjoying Rentify!
      Buyer Details:
      Name: ${userLoggedIn.fullname}
      Email: ${userLoggedIn.email}
      Contact No: ${userLoggedIn.contactNo}

      Property Details:
      Title: ${post.title}
      Place: ${post.place}
      Area: ${post.area} sqft
      Bedrooms: ${post.bedrooms}
      Bathrooms: ${post.bathrooms}
      Nearby Hospital: ${post.nearbyHospital} km
      Nearby Mall: ${post.nearbyMall} km
      Nearby College: ${post.nearbyCollege} km
      Rent: ₹${post.rent}/month
    `
    };

    // Send the email
    await transporter.sendMail(toBuyer);
    await transporter.sendMail(toSeller);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/deletePost/:postId', isLoggedIN, async (req, res) => {
  const deletedDoc = await postModel.findByIdAndDelete(req.params.postId);
  console.log('Deleted document:', deletedDoc);
  const posts = await postModel.find();
  const user = await userModel.findOne({
    username: req.session.passport.user
  });
  res.render('feeds',{posts, user});
})

router.get('/updatePost/:postId', isLoggedIN, async (req, res) =>{
  const post = await postModel.findById(req.params.postId);
  res.render('updatePost',{post});
})

router.post('/updatePost/:postId',upload.single('file'), isLoggedIN, async (req, res, next) =>{
  const post = await postModel.findById(req.params.postId);
  post.title = req.body.title;
  post.place = req.body.place;
  post.area = req.body.area;
  post.nearbyCollege = req.body.nearbyCollege;
  post.nearbyHospital = req.body.nearbyHospital;
  post.nearbyMall = req.body.nearbyMall;
  post.bedrooms = req.body.bedrooms;
  post.bathrooms = req.body.bathrooms;
  post.rent = req.body.rent;
  if(req.file.filename){
    post.image = req.file.filename;
  }
  await post.save();
  res.redirect('/profile');
})

router.get('/sortBy/:sortkey', isLoggedIN, async (req,res)=>{
  let posts = await postModel.find();
  const user = await userModel.findOne({
    username: req.session.passport.user
  });
  console.log('before sort');
  console.log(posts);
  const key = req.params.sortkey;
  console.log(`After sort by key ${key}`);
  posts = (posts.sort((a,b)=> a[key] - b[key]));
  console.log(posts);
  res.render('feeds',{posts, user});
})

function isLoggedIN(req, res, next) {
  if(req.isAuthenticated()) return next();
  res.redirect('/login');
}


module.exports = router;
