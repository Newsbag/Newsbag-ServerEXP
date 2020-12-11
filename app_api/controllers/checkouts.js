const mongoose = require('mongoose');
const Checkout = mongoose.model('Checkout');

const https = require('https');




module.exports.checkoutFromCart = function(req, res, next) {     
   if (req.body) {
        Checkout
            .create({
                reference: req.body.reference,
                reader: req.body.readerid,
                checkoutlist: req.body.checkoutlist,
                state: req.body.state,
                amount: parseFloat(req.body.amount)
            }, (err, checkout) => {
                if (err) {
                    console.error(err);
                    sendJsonResponse(res, 400, err);
                } else {
                    console.log("Checkout added");
                    sendJsonResponse(res, 201, checkout);
                }    
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No body in request"
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
                emptyCart()
                checkout.checkoutlist.forEach(item => {
                    // Find the publisher of the item and transfer funds to that account
                    paymentsCreate()
                });
            }
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, checkoutid and reference are both required"
        });    
    }    
};