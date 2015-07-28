#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var mongojs = require('mongojs');

var app = express();

//var mongodbConnectionString = process.env.OPENSHIFT_MONGODB_DB_URL + "cs5610";
var mongodbConnectionString = process.env.OPENSHIFT_MONGODB_DB_URL;

if (typeof mongodbConnectionString == "undefined")
{
    mongodbConnectionString = "cs5610";
}

var db = mongojs(mongodbConnectionString, ["serviceData"]);


app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());


//----------------------------------------------------
//********************SOCIAL lOgin start***************


var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;
  var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

  //app.use(express.static('public'));
  //app.use(express.cookieParser());
  //app.use(express.bodyParser());
  //app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  //app.use(passport.session());
  //app.use(app.router);

//////////GOOGLE******************
passport.use(new GoogleStrategy({
    clientID:     '724699266914-vo6f70jquh2kr9eef0eq8hfgithu0r27.apps.googleusercontent.com',
    clientSecret: 'uvJjU0hVhjNmq4SwOBwZPerb',
    callbackURL: "http://localhost:8080/auth/google/callback/",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    //console.log(accessToken)
   //console.log(refreshToken)  
   console.log(profile.provider);
   console.log(profile.id)
//  console.log(profile.displayname.value)
   console.log(profile.name);
   console.log(profile.email)
   console.log(profile.photos[0].value)
   return done(null,profile)

  }
));
app.get('/auth/google',
  passport.authenticate('google', { scope: 
    [ 'https://www.googleapis.com/auth/plus.login',
    , 'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
));


app.get( '/auth/google/callback', 
    passport.authenticate( 'google', { 
        successRedirect: '/submit.html',
        failureRedirect: '/index.html'
}));
//app.get('/auth/google', passport.authenticate('google'));
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});



//////////FaceBook*************
passport.use(new FacebookStrategy({
    clientID: '1593285864278038',
    clientSecret: 'a231d50802f4290c76ff4904946aeda5',
    callbackURL: "http://localhost:8080/auth/facebook/callback/"
   // profileFields: ['id', 'displayName', 'link', 'about_me', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
  //console.log(accessToken)
   //console.log(refreshToken)  
   console.log(profile)
   console.log(profile.provider);
   console.log(profile.id)
//  console.log(profile.displayname.value)
   console.log(profile.name);
   console.log(profile.emails)
   console.log(profile.photos)
    return done(null,profile)
//User.findOrCreate(function(err, user) {
//console.log(profile.provider)
//console.log(err)
      //if (err) { return done(err); }
      //done(null, user);
    //});
  }
));


//app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook',
  passport.authenticate('facebook', {  scope: ['read_stream', 'publish_actions']  })
);

app.get('/auth/facebook/callback/',
  passport.authenticate('facebook', {  
  		    successRedirect: '/submit.html#/',
     		 failureRedirect: '/index.html'
                                  }));



app.get( '/auth/google/callback', 
    passport.authenticate( 'google', { 
        successRedirect: '/submit.html',
        failureRedirect: '/index.html'
}));


//*********************SOCIAL LOGIN ENDS*************

app.get("/serviceClients", function (req, res) {

    // var svc1 = {
    //     name : "LinkedIn"
    // };

    // var svc2 = {
    //     name : "IMDB"
    // };

    // var svc3 = {
    //     name : "Google"
    // };

    // var service_Clients = [svc1, svc2, svc3];

   // res.json(service_Clients);
   // res.json([]);
   db.serviceData.find(function (err, docs) {
        res.json(docs);
    });
});

// because it is a post the request is encoded in the body of the http request
//.. and we need to extract it from the body 
app.post("/serviceClients", function (req, res) {

    var svc = req.body;
    // angular doesnot know how to parse the request from the body,   into json.

    // We can use Express to parse the body, and extract the JSON out of the body 
    console.log(svc);

    db.serviceData.insert(req.body, function (err, doc) {
        res.json(doc);
    });

}); 

app.get("/serviceClients/:id", function (req, res) {
     var anID = req.params.id;
    //console.log(anID);
    db.serviceData.findOne({_id : mongojs.ObjectId(anID)}, 
        function (err, doc ) { 
            res.json(doc );
        });

});



app.put("/serviceClients/:id", function (req, res) {

    //console.log(req.body);

    //----------------
    var aName = req.body.name;

        db.serviceData.findAndModify(
        {   // Find the object by ID
            query:
            {
                 _id : mongojs.ObjectId(req.params.id)
            },
            update:
            {   // new vals are in req.body, update it's name
                $set:{name: aName}
            },
            // single one
            new: true
        }, 
        function(err, doc, lastErrorObject)
        {   // respond with new document
            
             res.json(doc);
        
        });
    //----------------

});

app.delete("/serviceClients/:id", function (req, res) {
    var anID = req.params.id;
    //console.log(anID.str);
    db.serviceData.remove({_id : mongojs.ObjectId(anID)},
      function (err, doc){
             res.json(doc);
      });
});
//----------------------------------------------------

app.get('/env',function(req, res){

    res.json(process.env);
});


     var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
     var port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.listen(port, ipaddress);
