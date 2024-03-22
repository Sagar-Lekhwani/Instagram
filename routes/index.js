var express = require('express');
var router = express.Router();
var userModel = require('./users');
var postModel = require('./post');
var storyModel = require('./story');
var passport = require('passport');
var localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mime = require('mime-types');
const messageModel = require('./message')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueSuffix)
  }
})

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/posts')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueSuffix)
  }
})

const storage3 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/stories')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

const upload2 = multer({ storage: storage2 })

const upload3 = multer({ storage: storage3 })

// creating middle ware functions here 
function IsLoggedIn (req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  else{
    console.warn("username or password is incorrect")
    res.redirect('/login');
  }
}



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

// get login page 
router.get('/login', function(req, res, next) {
  res.render('login');
});
router.get('/login2', function(req, res, next) {
  res.render('login2');
});
router.get('/signup', function(req, res, next) {
  res.render('signup');
});

// get logged in 
router.post('/login',passport.authenticate('local' , {
  failureRedirect:'/login',
  successRedirect:'/home',
}), function(req, res, next) {});

// create account 
router.post('/register' , function(req,res,next) {
  var newUser = new userModel ({
    username:req.body.username,
    Fullname:req.body.fullname,
    email:req.body.email,

  })
  userModel.register(newUser,req.body.password)
  .then(function (user) {
    passport.authenticate('local') (req , res, function () {
      res.redirect('/home');
    })
  })
  .catch(function (err) {
    res.send(err);
  })
});

// logout 
router.get('/logout', function(req,res,next) {
  if(req.isAuthenticated()) req.logout(function (err) {
    if(err) res.send(err);
    else res.redirect('/login');
  });
  else res.redirect('/login');
})

// get profile page 
router.get('/user/:username', IsLoggedIn, function (req,res,next) {

if(req.params.username === req.session.passport.user)
{
  userModel.findOne({username:req.session.passport.user})
  .populate("posts")
  .then(function (founduser) {
    res.render('profile2', {founduser, mime});
  });
}
else{
   userModel.findOne({username:req.params.username})
  // .populate("following")
  .populate("posts")
  .then(function (founduser) {
    userModel.findOne({username:req.session.passport.user})
    .then(function (currentuser) {
      res.render('userprofile', {founduser , currentuser ,mime});
    })
  });
}
});

// router.get('/profile2', IsLoggedIn, function (req,res,next) {
//   userModel.findOne({username:req.session.passport.user})
//   .populate("posts")
//   .then(function (founduser) {
//     res.render('profile2', {founduser, mime});
//   });
// });

router.get('/feed', IsLoggedIn , function (req, res, next) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      postModel
        .find()
        .populate("userid")
        .then(function (allpost) {
          res.render("feed", { allpost, user });
        });
    })
});

router.post('/post', IsLoggedIn ,function (req,res,next) {
 userModel.findOne({
  username:req.session.passport.user
 })
 .then(function (user) {
  postModel.create({
    userid:user._id,
    data:req.body.post,
  })
  .then(function (post) {
    user.posts.push(post._id);
    user.save()
    .then(function () {
      res.redirect('back');
    });
  });
 });
});

router.get('/follow/:username', IsLoggedIn, function (req, res, next) {
  userModel
  .findOne({username: req.session.passport.user})
  .then(function(currentuser)
   {    
      userModel.findOne({username : req.params.username})
      .then(function (founduser) 
       {
        if(founduser.followers.indexOf(currentuser._id) === -1){
          founduser.followers.push(currentuser._id);
        }
        else{
          founduser.followers.splice(founduser.followers.indexOf(currentuser._id), 1);
        }
        if(currentuser.following.indexOf(founduser._id) === -1){
            currentuser.following.push(founduser._id);
          }
          else{
            currentuser.following.splice(currentuser.following.indexOf(founduser._id), 1);
          }
        currentuser.save();
        founduser.save()
        .then(function(){
          res.redirect("back");
        })
      })
  })
});

router.post('/like/:postid', IsLoggedIn, async function (req, res, next) {
  await userModel.findOne({ username: req.session.passport.user })
    .then(async function (user) {
     await postModel
        .findOne({ _id: req.params.postid })
        .then(async function (post) {
          if (post.likes.indexOf(user._id) === -1) {
            post.likes.push(user._id);
          } else {
            post.likes.splice(post.likes.indexOf(user._id), 1);
          }
         await post.save()
            .then(function () {
              res.json({ success: true, message: 'Like action successful',likes:post.likes });
            })
            .catch(function (error) {
              res.json({ success: false, message: 'Error saving post', error: error });
            });
        })
        .catch(function (error) {
          res.json({ success: false, message: 'Error finding post', error: error });
        });
    })
    .catch(function (error) {
      res.json({ success: false, message: 'Error finding user', error: error });
    });
});

router.post('/comment/:postid' , IsLoggedIn , function (req,res,next) {
  userModel.findOne({username:req.session.passport.user}).then(function (user) {
    const comment = {
      text:req.body.texted,
      postby:user._id
    }
    console.log(req.body)
    postModel.findOne({_id:req.params.postid}).then(function (post){
      // console.log(comment.text)
      post.comments.push(comment)
      // console.log(post);
      post.save()
      .then(function() {
        console.log(comment)
        res.json({ success: true, message: 'Like action successful',comments:post.comments })
      })
    })
  })
})

router.post('/upload', IsLoggedIn, upload.single("image"), function (req, res, next) {
  // upload ho chuki hai data req.file mein hai
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (founduser) {
      if (founduser.image !== 'def.png') {
        fs.unlinkSync(`./public/images/uploads/${founduser.image}`);
      }
      founduser.image = req.file.filename;
      founduser.save().then(function () {
        res.redirect("back");
      })
    });
});

router.post('/uploadpost', IsLoggedIn, upload2.single("mediaFile"), function (req, res, next) {
  userModel.findOne({
    username:req.session.passport.user
   })
   .then(function (user) {
    postModel.create({
      userid:user._id,
      data:req.body.post,
      media:req.file.filename
    })
    .then(function (post) {
      user.posts.push(post._id);
      user.save()
      .then(function () {
        res.redirect('back');
      });
    });
   });
});

router.get('/uploadstory', IsLoggedIn, upload3.single("mediaFile"), function (req, res, next) {
  res.render('storyup');
});
router.post('/uploadstory', IsLoggedIn, upload3.single("mediaFile"), function (req, res, next) {
  userModel.findOne({
    username:req.session.passport.user
   })
   .then(function (user) {
    storyModel.create({
      userid:user._id,
      media:req.file.filename
    })
    .then(function (story) {
      user.stories.push(story._id);
      user.save()
      .then(function () {
        // Schedule the deletion after 2 minutes
        // setTimeout(function() {
        // //   // Delete the pic field from the founduser
        //   user.stories.splice(user.stories.indexOf(story._id), 1)
        //   user.save()
        //     .then(function() {
        //       console.log('story deleted');
        //     });
        // }, 1 * 60 * 1000); 
          res.redirect('back');
  });
    });
   });
});

router.get('/home',IsLoggedIn, function(req,res,next) {
  userModel.findOne({ username: req.session.passport.user })
  .populate('following')
    .then(function (user) {
      postModel
        .find()
        .populate("userid")
        .then(function (allpost) {
          userModel.find({username : {$nin:[user.username]}})
          .populate('stories')
          .then(function(users){
            // var count = 1
            res.render("home", { allpost, user,users, mime });
          })
        });
    })
})

router.get('/story',IsLoggedIn, function(req,res,next) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      storyModel
        .find()
        .populate("userid")
        .then(function (stories) {
          res.render("story", { stories, user, mime });
        });
    })
})


router.get('/reels',IsLoggedIn, function(req,res,next) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      postModel
        .find()
        .populate("userid")
        .then(function (allpost) {
          res.render("reels", { allpost, user, mime });
        });
    })
})

router.get('/explore',IsLoggedIn, function(req,res,next) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      postModel
        .find()
        .populate("userid")
        .then(function (allpost) {
          res.render("explore", { allpost, user, mime });
        });
    })
})


router.get('/p/:id',IsLoggedIn, function (req,res,next) {
  userModel.findOne({ username: req.session.passport.user })
  .then(function (user) {
    postModel
    .findById(req.params.id)
    .populate('userid')
    .then(function (post) {
      console.log(req.params.id)

      res.render('comment', {user,post,mime});
    })
})
})


router.get('/m',IsLoggedIn, function(req,res,next){
  userModel.findOne({username : req.session.passport.user})
  .populate('following')
  .then(async function (user) {
   await userModel.find({username : {$nin:[user.username]}}).then(function (allusers) {
      console.log(user.id)
      res.render('message', {user, allusers});
    })
  })
})



router.get('/chat/:id', IsLoggedIn, function (req,res,next) {
  userModel.findOne({username : req.session.passport.user})
  .populate('following')
  .then(async function (user) {
   await userModel.find({username : {$nin:[user.username]}}).then(async function (allusers) {
    await userModel.findOne({_id:req.params.id}).then(function (chatuser) {

      console.log(user.id)
      res.render('chat', {user, allusers,chatuser});
    })  
    })
  })
})

router.post('/chat', IsLoggedIn, async function(req,res) {
    try{
      var message = new messageModel({
        senderId:req.body.senderId,
        recieverId:req.body.recieverId,
        msg:req.body.msg,
      });

      var newmessage = await message.save();
      res.status(200).send({success:true,data:newmessage});
    }
    catch(err) {
      res.status(400).send({success:false});

    }
})

module.exports = router;
