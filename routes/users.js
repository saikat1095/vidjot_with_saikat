const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport')

// load user model
const User = require('./../models/User');

// User login Route
router.get('/login',(req, res)=>{
    // res.send('login');
    res.render('users/login')
})

// User Register Route
router.get('/register',(req, res)=>{
    // res.send('register');
    res.render('users/register')
})

// Login form post
router.post('/login',(req, res, next)=>{
    passport.authenticate('local',{
        successRedirect : '/ideas',
        failureRedirect : '/users/login',
        failureFlash : true
    })(req,res,next);
})


// Register form POST
router.post('/register',(req, res)=>{
    let errors = [];
    if(req.body.password != req.body.password2){
        errors.push({text : 'Password do not match'})
    }
    if(req.body.password.length < 4){
        errors.push({text : 'Password must be at least 4 characters'})
    }
    if(errors.length > 0){
        res.render('users/register',{
            errors : errors,
            name : req.body.name,
            email : req.body.email,
            password : req.body.password,
            password2 : req.body.password2
        })
    }else{
        User.findOne({email : req.body.email}).then(user =>{
            if(user){
                req.flash('error_msg',"Email already registerd");
                res.redirect('/users/register')
            }else{
                const newUser = new User({
                    name : req.body.name,
                    email : req.body.email,
                    password : req.body.password
                }); 
        
                // bcrypt the password using salt and hash,
                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                        .then(user => {
                            req.flash('success_msg', "You are now registered and can log in");
                            res.redirect('/users/login')
                        }).catch(err =>{
                            console.log(err);
                            return;
                        })
                    })
                })
            }
        })
    }
})

module.exports = router;