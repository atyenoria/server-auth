// dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());



var session = require('express-session')
var MongoStore = require('connect-mongo')(session)
app.use(session({
    secret: 'secret',
    store: new MongoStore({
        url: 'mongodb://localhost/sample'
    }),
    cookie: {
        httpOnly: true,
        secure: true,
        maxAge: new Date(Date.now() + 60 * 60 * 1000)
    },
    resave: false,
    saveUninitialized: true
}));



app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


//app.use('/', routes);


var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })



// create api router
var api = createApiRouter()

// mount api before csrf is appended to the app stack
app.use('/api', api)

// now add csrf, after the "/api" was mounted
app.use(csrfProtection)


app.get('/', function (req, res) {
    res.render('pages/about', { csrfToken: req.csrfToken()});
});


// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());




app.post('/finish' , parseForm , function(req, res, next) {

    var jwt = require('jsonwebtoken');
    var jwtsecret = "test";
    var jwt_token;
    jwt_token = jwt.sign({
        user_sub: req.body.username,
        user: 'owner1',
        room: "room1"
    }, jwtsecret);

    Account.register(new Account({ username : req.body.username , jwt: jwt_token }), req.body.password, function(err, account) {
        console.log("test")
        if (err) {
            console.log("error")
        }

        passport.authenticate('local')(req, res, function () {
            req.session.save(function (err) {

                if (err) {
                    console.log("error")
                    return next(err);
                }
                console.log("ok")
                res.send('your jwt token is', jwt_token)
            });
        });

    });

});



function createApiRouter() {
    var router = new express.Router()

    router.get('/getProfile', function(req, res) {
        res.send('no csrf to get here')
    })

    return router
}




// mongoose
mongoose.connect('mongodb://localhost/passport_local_mongoose_express4');



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

