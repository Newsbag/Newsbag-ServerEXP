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

module.exports.checkoutFromCart = function(req, res, next) {
    let readerid = req.params.readerid;
    if (readerid && req.body) {
        Reader
            .findById(readerid)
            .select('checkout')
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
                    reader.checkout.push({
                        state: req.body.state,
                        reference: req.body.reference,
                        checkoutlist: req.body.checkoutlist,
                        amount: req.body.amount
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

module.exports.verifycheckoutFromCart = function(req, res, next) {
    if (req.params && req.params.checkoutid && req.params.reference) {  
        Checkout
        .findById(req.params.checkoutid)
        .select('state checkoutlist')
        .exec((err, checkout) => {
            if (err) {
                sendJsonResponse(res, 400, err);
                return;
            } else if (!checkout) {
                sendJsonResponse(res, 404, {
                "message": "checkoutid not found"
                });
            return;
            }
            const https = require('https');
            const options = {
              hostname: 'api.paystack.co',
              port: 443,
              path: `/transaction/verify/${req.params.reference}`, //link to checkout.reference before execution
              method: 'GET',
              headers: {
                Authorization: process.env.SECRET_KEY //add secret key in .env
              }
            }
            https.request(options, res => {
              let data = ''
              resp.on('data', (chunk) => {
                data += chunk
              });
              resp.on('end', () => {
                console.log(JSON.parse(data))
              })
            }).on('error', error => {
              console.error(error)
            })
            if (response.data.status === false) {
                checkout.state = "failed"
                checkout.save((err, checkout) => {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else {
                        sendJsonResponse(res, 200, {
                        "message": "payment failed"
                        });
                    }
                });
            } else {
                checkout.state = "success"
                checkout.save((err, checkout) => {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else {
                        sendJsonResponse(res, 200, {
                        "message": "payment success"
                        });
                   }   
                });
                emptyCart(reader)
                checkout.checkoutlist.forEach(item => {
                    // Find the publisher of the item and transfer funds to that account
                    paymentsCreate(publication)
                });
            }
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, checkoutid and reference are both required"
        });    
    }    
};