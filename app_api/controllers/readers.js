const mongoose = require('mongoose');
const Reader = mongoose.model('Reader');

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}

module.exports.readersList = function(req, res, next) {
    let userid = req.query.userid;
    let query = {};
    if (userid) query.user = userid;
    Reader
        .find(query, (err, result) => {
            if (err) {
                console.error(err);
                sendJsonResponse(res, 400, err);
                return;
            } else if (!result) {
                console.warn("No readers found");
                sendJsonResponse(res, 404, {
                    "message": "No readers found"
                });
                return;
            }
            let readers = [];
            result.forEach(doc => {
                readers.push({
                    id: doc._id,
                    library: doc.library,
                    cart: doc.cart,
                    user_id: doc.user
                });
            });
            console.log("Readers retrieved");
            sendJsonResponse(res, 200, readers);
        }).populate("user");
};

module.exports.readersCreate = function(req, res, next) {
    if (req.body) {
        Reader
            .create({
                user: req.body.userid
            }, (err, reader) => {
                if (err) {
                    console.error(err);
                    sendJsonResponse(res, 400, err);
                } else {
                    console.log("Reader added");
                    sendJsonResponse(res, 201, reader);
                }
            });
    } else {
        console.error("No body in request");
        sendJsonResponse(res, 404, {
            "message": "No body in request"
        });
    }
};

module.exports.readersReadOne = function(req, res, next) {
    if (req.params && req.params.readerid) {
        Reader
            .findById(req.params.readerid)
            .populate("wishlist")
            .populate("cart/item")
            .populate("library")
            .populate("user")
            .exec((err, reader) => {
                if (!reader) {
                    console.warn("readerid not found");
                    sendJsonResponse(res, 404, {
                        "message": "readerid not found"
                    });
                    return;
                } else if (err) {
                    console.error(err);
                    sendJsonResponse(res, 404, err);
                    return;
                }
                console.log("readerid found");
                sendJsonResponse(res, 200, reader);
            });
    } else {
        console.log("No readerid in request");
        sendJsonResponse(res, 404, {
            "message": "No readerid in request"
        });
    }
};

module.exports.readersUpdateOne = function(req, res, next) {
    if (!req.params.readerid) {
        sendJsonResponse(res, 404, {
            "message": "Not found, readerid is required"
        });
        return;
    }

    Reader
        .findById(req.params.readerid)
        .select("user")
        .populate("user", "username photo email phone")
        .exec((err, reader) => {
            if (!reader) {
                sendJsonResponse(res, 404, {
                    "message": "readerid not found"
                });
                return;
            } else if (err) {
                sendJsonResponse(res, 400, err);
                return;
            }
            reader.user.username = req.body.username ? req.body.username : reader.user.username;
            reader.user.photo = req.file ? req.file.path : reader.user.photo;
            reader.user.email = req.body.email ? req.body.email : reader.user.email;
            reader.user.phone = req.body.phone ? req.body.phone : reader.user.phone;
            reader.save((err, reader) => {
                if (err) {
                    sendJsonResponse(res, 400, err);
                } else {
                    sendJsonResponse(res, 200, reader)
                }
            });
        });
};

module.exports.readersDeleteOne = function(req, res, next) {};