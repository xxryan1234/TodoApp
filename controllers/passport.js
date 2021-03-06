// local authentication
var LocalStrategy	= require('passport-local').Strategy;
var schema			= require('../models/schema');

module.exports = function(passport) {

    // Maintaining persistent login sessions
    // serialized  authenticated user to the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // deserialized when subsequent requests are made
    passport.deserializeUser(function(id, done) {
        schema.User.findById(id, function(err, user) {
            done(err, user);
        });
    });

     passport.use('login', new LocalStrategy({
        usernameField : 'email',
        passReqToCallback : true
    },
    function(req, email, password, done) {
       process.nextTick(function() {
                schema.User.findOne({ 'email' :  email }, function(err, user) {

                if (err){ return done(err);}
                if (!user)
                    return done(null, false, req.flash('error', 'User does not exist.'));

                if (!user.verifyPassword(password))
                    return done(null, false, req.flash('error', 'Enter correct password'));
               else
                    return done(null, user);
            });
        });

    }));

     passport.use('signup', new LocalStrategy({
        usernameField : 'email',
        passReqToCallback : true
    },
    function(req, email, password, done) {

        process.nextTick(function() {

            if (!req.user) {
                schema.User.findOne({ 'email' :  email }, function(err, user) {
            	    if (err){ return done(err);}
                    if (user) {
                        return done(null, false, req.flash('signuperror', 'User already exists'));
                    } else {
                        var newUser				= new schema.User();
						newUser.username		= req.body.username;
                        newUser.email			= email;
                        newUser.password		= newUser.generateHash(password);
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }

                });
            } else {
				var user				= req.user;
				user.user.username		= req.body.username;
				user.user.email			= email;
				user.user.password		= user.generateHash(password);
				user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }

        });


    }));

};
