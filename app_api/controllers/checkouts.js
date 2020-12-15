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
    //console.log('log some data', readerid)
    if (req.params.readerid && req.body) {
        Reader
            .findById(readerid)
            .select('checkouts')
            .exec(
                (err, reader) => {
                    //console.log('log some data', req.body)
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
                        checkoutlist: req.body.checkoutlist,
                        reference: req.body.reference,
                        amount: req.body.amount
                    });
                    console.log('log some data', req.body)
                    reader.save((err, reader) => {
                        if (err) {
                            sendJsonResponse(res, 400, err);
                        } else {
                            sendJsonResponse(res, 201, reader.checkouts);
                        }
                    });
                    const https = require('https')
                    const params = JSON.stringify({
                    "email": `${reader.user.email}`,
                    "reference": `${checkoutid}`,
                    "callback_url": `/readers/${readerid}/checkout/${checkoutid}`,
                    "channels": ['card', 'mobile_money'],
                    "amount": `${reader.checkouts.amount}`
                    })
                    const options = {
                        hostname: 'api.paystack.co',
                        port: 443,
                        path: '/transaction/initialize',
                        method: 'POST',
                        headers: {
                          Authorization: process.env.SECRET_KEY,
                          'Content-Type': 'application/json'
                        }
                    }
                    const reqy = https.request(options, res => {
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

                    reqy.write(params)
                    reqy.end()
                }
            );
    } else {
        sendJsonResponse(res, 404, {
            "message": "No readerid or body in request"
        });
    }

};


module.exports.verifycheckoutFromCart = function(req, res, next) {
    if (req.params && req.params.readerid && req.params.checkoutid) {  
        Reader
        .findById(req.params.readerid && req.params.checkoutid)
        .select('cart checkouts')
        .exec((err, reader) => {
            if (err) {
                sendJsonResponse(res, 400, err);
                return;
            } else if (!reader) {
                sendJsonResponse(res, 404, {
                "message": "readerid not found"
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
            if (response.data.status = false) {
                reader.checkout.state = "failed"
                reader.save((err, reader) => {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else {
                        sendJsonResponse(res, 200, {
                        "message": "payment failed"
                        });
                    }
                });
            } else {
                reader.checkout.state = "success"
                reader.save((err, reader) => {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else {
                        sendJsonResponse(res, 200, {
                        "message": "payment success"
                        });
                   }   
                });
                reader.cart.forEach(item => {
                    // Find the publisher of the item and transfer funds to that account
                    paymentsCreate(publication)
                });
                emptyCart(reader)
                reader.save((err, reader) => {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else {
                        sendJsonResponse(res, 200, {
                        "message": "cart emptied"
                        });
                   }   
                });
            }
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, checkoutid and readerid are both required"
        });    
    }    
};