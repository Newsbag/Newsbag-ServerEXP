const mongoose = require("mongoose");
const Publication = mongoose.model("Publication");
const Reader = mongoose.model("Reader");

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}

module.exports.favourite = function(req, res, next) {
    if (req.params && req.params.publicationid) {
        Publication
            .findById(req.params.publicationid)
            .exec((err, publication) => {
                if (!publication) {
                    console.error("publicationid not found");
                    sendJsonResponse(res, 404, {
                        "message": "publicationid not found"
                    });
                    return;
                } else if (err) {
                    console.error(err);
                    sendJsonResponse(res, 404, err);
                    return;
                }
                publication.likes.push(req.body.reader);
                publication.save((err, publication) => {
                    if (err) {
                        console.error(err);
                        sendJsonResponse(res, 400, err);
                    } else {
                        console.log("Like recorded for publication");
                        sendJsonResponse(res, 201, publication);
                    }
                });
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No publicationid in request"
        });
    }
};

module.exports.addToWishlist = function(req, res, next) {
    if (req.params && req.params.readerid) {
        Reader
            .findById(req.params.readerid)
            .select("wishlist")
            .exec((err, reader) => {
                if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                } else if (!reader) {
                    sendJsonResponse(res, 404, {
                        "message": "readerid not found"
                    });
                    return;
                }
                reader.wishlist.push(req.body.item);
                reader.save((err, reader) => {
                    if (err) {
                        sendJsonResponse(res, 400, err);
                    } else {
                        sendJsonResponse(res, 201, reader.wishlist);
                    }
                });
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No readerid in request"
        });
    }
};

module.exports.viewWishlist = function(req, res, next) {
    if (req.params && req.params.readerid) {
        Reader
            .findById(req.params.readerid)
            .select("wishlist")
            .populate("wishlist")
            .exec((err, reader) => {
                if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                } else if (!reader) {
                    sendJsonResponse(res, 404, {
                        "message": "readerid not found"
                    });
                    return;
                }
                sendJsonResponse(res, 200, reader.wishlist);
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No readerid in request"
        });
    }
};

module.exports.removeFromWishlist = function(req, res, next) {
    if (req.params && req.params.readerid && req.params.item) {
        Reader
            .findById(req.params.readerid)
            .select("wishlist")
            .exec((err, reader) => {
                if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                } else if (!reader) {
                    sendJsonResponse(res, 404, {
                        "message": "readerid not found"
                    });
                    return;
                }
                
                const updateWishList = reader.wishlist.filter(listItem => {
                    return listItem.toString() !== req.params.item.toString();
                });
                reader.wishlist = updateWishList;
                reader.save((err, reader) => {
                    if (err) {
                        sendJsonResponse(res, 400, err);
                    } else {
                        sendJsonResponse(res, 201, reader.wishlist);
                    }
                });
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No readerid in request"
        });
    }
};