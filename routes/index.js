var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();



var bodyParser = require('body-parser')
var parseForm = bodyParser.urlencoded({ extended: false })

//
//router.get('/', function (req, res) {
//    res.render('pages/about', { title : "sample", sample : "test",  csrfToken: req.csrfToken() });
//});



router.post('/' , parseForm , function(req, res, next) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        console.log("test")
        if (err) {
            console.log("error")
            return res.render('pages/about', {info: "Sorry. That username already exists. Try again."});
        }

        passport.authenticate('local')(req, res, function () {
            req.session.save(function (err) {

                if (err) {
                    console.log("error")
                    res.redirect('/');
                    return next(err);
                }
                console.log("ok")
                res.redirect('/');
            });
        });

    });

});

//
//
//router.get('/login', function(req, res) {
//    res.render('login', { user : req.user });
//});
//
//router.post('/login', passport.authenticate('local'), function(req, res, next) {
//    req.session.save(function (err) {
//        if (err) {
//            return next(err);
//        }
//        res.redirect('/');
//    });
//});
//
//router.get('/logout', function(req, res, next) {
//    req.logout();
//    req.session.save(function (err) {
//        if (err) {
//            return next(err);
//        }
//        res.redirect('/');
//    });
//});
//
//router.get('/ping', function(req, res){
//    res.status(200).send("pong!");
//});
//
//
//
//// about page
//router.get('/about', function(req, res) {
//    res.render('pages/about');
//});


module.exports = router;
