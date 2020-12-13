const mongoose = require('mongoose');
const Reader = mongoose.model('Reader');
//const Checkout = mongoose.model("Checkout");

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}
/*
function findReader(req, res, cb) {
    Reader
        .findById(req.body.reader)
        .select("cart")
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
            if (reader.cart === `${req.body.checkoutlist}`) {
                cb(reader);
            } else {
                console.debug(reader);
                console.debug(reader.cart, `${req.body.type}s`)
                sendJsonResponse(res, 401, {
                    "message": "Cart contents dont match"
                });
            }
        });
};

module.exports.checkoutFromCart = function(req, res, next) {
    if (req.body) {
        findReader(req, res, function(reader) {
            console.log(reader);
            Checkout.create({
                state: req.body.state,
                checkoutlist: req.body.checkoutlist,
                reader: req.body.reader,
                pesewas: req.body.pesewas
            },
            (err, checkout) => {
                if (err) {
                    console.error(err);
                    sendJsonResponse(res, 401, err);
                } else {
                    console.log("Checkout created");
                    sendJsonResponse(res, 201, checkout);
                }
            });
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No body in request"
        });
    }

};
*/

module.exports.checkoutFromCart = function(req, res, next) {
    let readerid = req.params.readerid;
    if (req.params.readerid && req.body) {
        Reader
            .findById(readerid)
            .select('checkouts')
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
                    reader.checkouts.push({
                        state: req.body.state,
                        checkoutlist: req.body.checkoutlist
                        //reader: req.body.reader,
                        //checkout_amount: req.body.checkout_amount
                    });
                    reader.save((err, reader) => {
                        if (err) {
                            sendJsonResponse(res, 400, err);
                        } else {
                            sendJsonResponse(res, 201, reader.checkouts);
                        }
                    });
                }
            );
    } else {
        sendJsonResponse(res, 404, {
            "message": "No readerid or body in request"
        });
    }

};


module.exports.verifycheckoutFromCart = function(req, res, next) {
    if (req.params && req.params.checkoutid) {  
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
              path: `/transaction/verify/${req.params.checkoutid}`, //link to checkout.reference before execution
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