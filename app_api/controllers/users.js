const mongoose = require('mongoose');
const User = mongoose.model('User');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const request = require('request');

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}

function generateToken(email) {
    let expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);
    let token = jwt.sign({
        email: email,
        exp: parseInt(expiry.getTime() / 1000)
    }, process.env.JWT_SECRET);
    return token;
}

module.exports.register = function(req, res, next) {
    if (req.body.password && req.body.email) {
        let fileArray = req.file ? req.file.path.split("/") : [];
        let filePath = req.file ? fileArray[fileArray.length - 2] + "/" + fileArray[fileArray.length - 1] : "";
        console.debug("Creating new user");
        let user = new User();
        user.username = req.body.username;
        user.photo = req.file ? filePath : "";
        user.email = req.body.email;
        user.phone = req.body.phone;
        user.setPassword(req.body.password);
        user.token = generateToken(req.body.email);
        user.secretcode = req.body.secretcode;
        user.account_type = req.body.accountType;
        user.save((err, user) => {
            if (err) {
                console.error(err);
                sendJsonResponse(res, 401, err);
            } else {
                console.debug("Saved new user");
                let content = {
                    email: req.body.email,
                    subject: 'Newsbag Account Verification',
                    text: 'Thank you for registerign with Newsbag',
                    html: `<p>Please Enter ${user.secretcode} in app to verify your email address`
                };
                user.sendEmail(content)
                .then(() => {
                    const payload = {
                        "id": user._id,
                        "username": user.username,
                        "iat": Date.now()
                    };
                    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
                    let postdata = {
                        userid: user._id
                    };
                    console.debug("Creating new account");
                    let path = `http://localhost:8080/api/${req.body.accountType + "s"}`;
                    let requestOptions = {
                        url: path,
                        method: "POST",
                        json: postdata,
                        auth: {
                            "bearer": `${token}`
                        }
                    };
                    request(
                        requestOptions,
                        (err, response, body) => {
                            if (response.statusCode === 201) {
                                console.log("Created new account");
                                sendJsonResponse(res, 201, {
                                    "user": user,
                                    "token": token,
                                    "account": body
                                });
                            } else if (err) {
                                sendJsonResponse(res, 400, err);
                            }
                        }
                    );
                })
                .catch((err) => {
                    sendJsonResponse(res, 401, {
                        "message": "Email transport error"
                    });
                }); 
            }
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "All fields are required"
        });
    }
};

module.exports.login = function(req, res, next) {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            console.debug("Error");
            console.error(info ? info.message : "Login failed");
            sendJsonResponse(res, 400, err);
            return;
        } else if (!user) {
            console.debug("No user");
            console.error(info ? info.message : "Login failed");
            sendJsonResponse(res, 404, {
                "message": info ? info.message : "Login failed"
            });
            return;
        }
        req.login(user, { session: false }, (err) => {
            if (err) {
                console.error(err);
                sendJsonResponse(res, 401, err);
                return;
            }
            const payload = {
                "id": user._id,
                "username": user.username,
                "iat": Date.now()
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET/* , { expiresIn: '1d' } */);
            console.log('User login successful');
            let requestOptions = {
                url: `http://localhost:8080/api/${user.account_type + "s"}?userid=${user._id}`,
                method: "GET",
                auth: {
                    "bearer": `${token}`
                }
            }
            request(requestOptions, (err, response, body) => {
                if (err) {
                    console.error(err);
                    sendJsonResponse(res, 400, err);
                } else if (response.statusCode === 200) {
                    let data = JSON.parse(body);
                    console.log(data);
                    sendJsonResponse(res, 201, {
                        "user": user,
                        "token": token,
                        "account": {
                            "_id": data[0].id,
                            "user": data[0].user_id,
                            "verified": data[0].verified
                        }
                    });
                    // sendJsonResponse(res, 201, token);
                } else {
                    sendJsonResponse(res, 404, {
                        "message": response.statusMessage
                    });
                }
                return;
            })
        });
    })(req, res);
};

module.exports.verify = function(req, res, next) {
    let { userid, secretcode } = req.params;
    User
        .findById(userid, (err, user) => {
            if (err) {
                console.error(err);
                sendJsonResponse(res, 400, err);
            } else if (!user) {
                console.error('userid not found');
                sendJsonResponse(res, 404, {
                    "message": "userid not found"
                });
                return;
            }
            if (user.secretcode === secretcode && !user.verified) {
                user.verified = true;
                user.save((err, user) => {
                    if (err) {
                        console.error(err);
                        sendJsonResponse(res, 400, err);
                    } else {
                        console.log('User verification successful');
                        sendJsonResponse(res, 200, {
                            "message": "User verification successful"
                        });
                    }
                });
            } else {
                console.error("Invalid code or user is already verified");
                sendJsonResponse(res, 400, {
                    "message": "Invalid code or user is already verified"
                });
            }
        });
};

module.exports.logout = function(req, res, next) {};