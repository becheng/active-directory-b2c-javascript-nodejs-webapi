// Authors:
// Shane Oatman https://github.com/shoatman
// Sunil Bandla https://github.com/sunilbandla
// Daniel Dobalian https://github.com/danieldobalian

var express = require("express");
var morgan = require("morgan");
var passport = require("passport");
var BearerStrategy = require('passport-azure-ad').BearerStrategy;

// TODO: Update the first 3 variables
var tenantID = "wabbit1317b2c.onmicrosoft.com";
var clientID = "d4b83df5-0d9c-4ec9-9145-bf6cecdc5630";
var policyName = "B2C_1_SignUpnInV2";

var options = {
    //identityMetadata: "https://login.microsoftonline.com/" + tenantID + "/v2.0/.well-known/openid-configuration/",
    // IMPORTANT NOTE: the issuer authority must be the same for both the web app and the web api 
    // otherwise the issur will be "invalid".  The original issuer above 'login.microsoft.com' erred out.
    identityMetadata: "https://wabbit1317b2c.b2clogin.com/" + tenantID + "/v2.0/.well-known/openid-configuration/",
    clientID: clientID,
    policyName: policyName,
    isB2C: true,
    validateIssuer: true,
    loggingLevel: 'info',
    passReqToCallback: false,
    //loggingNoPII: false -- use this option to for more verbose logging
};

var bearerStrategy = new BearerStrategy(options,
    function (token, done) {
        // Send user info using the second argument
        done(null, {}, token);
    }
);

var app = express();
app.use(morgan('dev'));

app.use(passport.initialize());
passport.use(bearerStrategy);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/hello",
    passport.authenticate('oauth-bearer', {session: false}),
    function (req, res) {
        var claims = req.authInfo;
        console.log('User info: ', req.user);
        console.log('Validated claims: ', claims);
        
        if (claims['scp'].split(" ").indexOf("demo.read") >= 0) {
            // Service relies on the name claim.  
            res.status(200).json({'name': claims['name']});
        } else {
            console.log("Invalid Scope, 403");
            res.status(403).json({'error': 'insufficient_scope'}); 
        }
    }
);

var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Listening on port " + port);
});
