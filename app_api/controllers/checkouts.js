const mongoose = require('mongoose');
const Checkout = mongoose.model('Checkout');
//const Reader = mongoose.model("Reader");

const https = require('https');




module.exports.checkoutFromCart = function(req, res, next) {     
    if (req.body) {
        Checkout
            .create({
                reference: req.body.reference,
                reader: req.body.readerid,
                checkoutlist: req.body.checkoutlist,
                //state: req.body.state,
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
            let options = {
              hostname: 'api.paystack.co',
              port: 443,
              path: '/transaction/verify/:reference', //link to checkout.reference befor execution
              method: 'GET',
              headers: {
                Authorization: 'Bearer SECRET_KEY' //add secret key in .env
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
            //let checkoutid = req.params.checkoutid;
            //.findById(req.params.checkoutid)    
            .select('checkoutlist state')
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
                if (response.data.status = false) {
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
                          reader.emptyCart()
                          checkout.checkoutlist.forEach(item => {
                            // Find the publisher of the item and transfer funds to that account
                            publisher.paymentsCreate()
                            });
                      }
                    });
                }
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No body in request"
        });
    }
};