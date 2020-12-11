const mongoose = require('mongoose');
const Reader = mongoose.model('Reader');

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}

module.exports.cartsList = function(req, res, next) {
    if (req.params && req.params.readerid) {
        Reader
            .findById(req.params.readerid)
            .populate({ 
                path: "cart.item",
                model: "Publication"
            })
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
                sendJsonResponse(res, 200, reader.cart);
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, readerid is required"
        });
    }
};

module.exports.addToCart = function(req, res, next) {
    let readerid = req.params.readerid;
    if (readerid && req.body) {
        Reader
            .findById(readerid)
            .select('cart')
            .exec(
                (err, reader) => {
                    if (err) {
                        sendJsonResponse(res, 400, err);
                        return;
                    } else if (!reader) {
                        sendJsonResponse(res, 404, {
                            "message": "readerid not found"
                        });
                        return;
                    }
                    reader.cart.push({
                        item: req.body.item,
                        subscription: req.body.subscription
                    });
                    reader.save((err, reader) => {
                        if (err) {
                            sendJsonResponse(res, 400, err);
                        } else {
                            sendJsonResponse(res, 201, reader.cart);
                        }
                    });
                }
            );
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, readerid and body required"
        });
    }
};

module.exports.removeFromCart = async function(req, res) {
    let readerid = req.params.readerid;
    let itemid = req.params.itemid;

    if (readerid && itemid) {
        try {
            let reader = await Reader.findById(readerid).select("cart");
            if (!reader) {
                sendJsonResponse(res, 404, {
                    "message": "readerid not found"
                });
                return;
            }
            const index = reader.cart.indexOf(itemid);
            if (index > -1) {
                reader.cart.splice(index, 1);
            }
            reader = await reader.save();
            sendJsonResponse(res, 200, reader.cart);
        } catch (error) {
            console.error(error);
            sendJsonResponse(res, 422, error);
        }
    } else {
        console.error("No readerid and itemid in request");
        sendJsonResponse(res, 400, {
            "message": "No readerid and itemid in request"
        });
    }
};

module.exports.emptyCart = async function(req, res) {
    let readerid = req.params.readerid;
    if (readerid) {
        try {
            let reader = await Reader.findById(readerid).select("cart");
            if (!reader) {
                sendJsonResponse(res, 404, {
                    "message": "readerid not found"
                });
                return;
            }
            
            reader.cart.splice(0, reader.cart.length);
            
            reader = await reader.save();
            sendJsonResponse(res, 200, reader.cart);
        } catch (error) {
            console.error(error);
            sendJsonResponse(res, 422, error);
        }
    } else {
        console.error("No readerid in request");
        sendJsonResponse(res, 400, {
            "message": "No readerid in request"
        });
    }
};
