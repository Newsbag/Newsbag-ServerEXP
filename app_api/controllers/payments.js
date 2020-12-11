const mongoose = require("mongoose");
const Publication = mongoose.model("Publication");
const Reader = mongoose.model("Reader");
const Payment = mongoose.model("Payment");
const Payout = mongoose.model("Payout");
const PUBLISHER_SHARE = 0.8;

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}

function calculatePublisherShare(amount) {
    return amount * PUBLISHER_SHARE;
}

module.exports.paymentsCreate = function(req, res) {
    if (req.body) {
        // Check if the amount is up to
        let amount = parseFloat(req.body.amount_paid);
        var earningsTotal, payoutTotal;
        Publication
            .findById(req.body.publication)
            .exec((err, publication) => {
                if (err) {
                    console.error(err);
                    sendJsonResponse(res, 422, err);
                    return;
                } else if (!publication) {
                    console.error(err);
                    sendJsonResponse(res, 404, {
                        "message": "publication not found"
                    });
                    return;
                }
                if (publication.content_type === "book" && req.body.subscription !== "one-time") {
                    console.error("Only one-time subscription available for this publication");
                    sendJsonResponse(res, 400, {
                        "message": "Only one-time subscription available for this publication"
                    });
                    return;
                }
                let error = false;
                publication.prices.forEach(price => {
                    if (price.period === req.body.subscription && price.amount != amount) {
                        error = true;
                    }
                });
                if (error) {
                    console.error("Incorrect price");
                    sendJsonResponse(res, 400, {
                        "message": "Incorrect price"
                    });
                    return;
                }
                // Find the last payment and get amounts
                Payment
                    .find({ publication: req.body.publication})
                    .exec((err, payments) => {
                        if (err) {
                            sendJsonResponse(res, 422, err);
                            return;
                        }
                        if (payments.length === 0) {
                            earningsTotal = amount;
                            payoutTotal = calculatePublisherShare(amount);
                        } else {
                            earningsTotal = amount + payments[payments.length - 1].earnings_total;
                            payoutTotal = calculatePublisherShare(amount) + payments[payments.length - 1].payout_total;
                        }
                        Payment
                            .create({
                                publication: req.body.publication,
                                publisher: publication.publisher,
                                reader: req.body.reader,
                                subscription: req.body.subscription,
                                amount_paid: amount,
                                publisher_share: calculatePublisherShare(amount),
                                newsbag_share: amount - calculatePublisherShare(amount),
                                earnings_total: earningsTotal,
                                payout_total: payoutTotal
                            },
                            (err, payment) => {
                                if (err) {
                                    console.error(err);
                                    sendJsonResponse(res, 422, err);
                                } else {
                                    console.log("Payment created");
                                    // Update publication details
                                    publication.sales += amount;
                                    publication.save((err, publication) => {
                                        if (err) {
                                            console.error(err);
                                            sendJsonResponse(res, 422, err);
                                        } else {
                                            console.log("Checking payout");
                                            // Create Payout
                                            let currentDate = new Date(Date.now());
                                            console.debug("1");
                                            Payout
                                                .find()
                                                .exec((err, payouts) => {
                                                    if (err) {
                                                        console.error(err);
                                                        sendJsonResponse(res, 422, err);
                                                        return;
                                                    }
                                                    console.debug("2");
                                                    if (payouts.length === 0) {
                                                        console.log("Creating new payout");
                                                        Payout
                                                            .create({
                                                                publisher: payment.publisher,
                                                                payments: [ payment._id ],
                                                                amount: amount
                                                            },
                                                            (err, payout) => {
                                                                if (err) {
                                                                    console.error(err);
                                                                    sendJsonResponse(res, 422, err);
                                                                } else {
                                                                    sendJsonResponse(res, 201, payment);
                                                                }
                                                            });
                                                    }
                                                    payouts.forEach(payout => {
                                                        let payoutDate = new Date(payout.created_at);
                                                        console.debug("3");
                                                        if (payoutDate.getMonth() === currentDate.getMonth() && payoutDate.getFullYear() === currentDate.getFullYear()) {
                                                            console.log("Using existing payout");
                                                            payout.payments.push(payment);
                                                            payout.amount = payoutTotal;
                                                            payout.save((err, payout) => {
                                                                if (err) {
                                                                    console.error(err);
                                                                    sendJsonResponse(res, 422, err);
                                                                } else {
                                                                    Reader
                                                                        .findById(req.body.reader)
                                                                        .exec((err, reader) => {
                                                                            if (err) {
                                                                                console.error(err);
                                                                                sendJsonResponse(res, 422, err);
                                                                                return;
                                                                            } else if (!reader) {
                                                                                console.error("reader not found");
                                                                                sendJsonResponse(res, 404, {
                                                                                    "message": "reader not found"
                                                                                });
                                                                                return;
                                                                            }
                                                                            reader.library.push(req.body.publication);
                                                                            reader.save((err, reader) => {
                                                                                if (err) {
                                                                                    sendJsonResponse(res, 422, err);
                                                                                } else {
                                                                                    sendJsonResponse(res, 201, payment);
                                                                                }
                                                                            });
                                                                        });
                                                                }
                                                            });
                                                        } else {
                                                            console.log("Creating new payout");
                                                            Payout
                                                                .create({
                                                                    publisher: payment.publisher,
                                                                    payments: [ payment._id ],
                                                                    amount: amount
                                                                },
                                                                (err, payout) => {
                                                                    if (err) {
                                                                        console.error(err);
                                                                        sendJsonResponse(res, 422, err);
                                                                    } else {
                                                                        // TODO: Add publication to library
                                                                        Reader
                                                                            .findById(req.body.reader)
                                                                            .exec((err, reader) => {
                                                                                if (err) {
                                                                                    console.error(err);
                                                                                    sendJsonResponse(res, 422, err);
                                                                                    return;
                                                                                } else if (!reader) {
                                                                                    console.error("reader not found");
                                                                                    sendJsonResponse(res, 404, {
                                                                                        "message": "reader not found"
                                                                                    });
                                                                                    return;
                                                                                }
                                                                                reader.library.push(req.body.publication);
                                                                                reader.save((err, reader) => {
                                                                                    if (err) {
                                                                                        sendJsonResponse(res, 422, err);
                                                                                    } else {
                                                                                        sendJsonResponse(res, 201, payment);
                                                                                    }
                                                                                });
                                                                            });
                                                                    }
                                                                });
                                                        }
                                                    });
                                                });
                                        }
                                    });
                                }
                            });
                    });
            });
    }
};

module.exports.paymentsList = function(req, res) {
    let query = {};
    if (req.query.publisher) query.publisher = req.query.publisher;
    Payment
        .find(query)
        .populate("publication")
        .exec((err, results) => {
            if (err) {
                console.error(err);
                sendJsonResponse(res, 422, err);
                return;
            }
            // Filter by date
            let payments = [];
            if (req.query.month && req.query.year) {
                results.forEach(result => {
                    let pubDate = new Date(result.created_at);
                    if (pubDate.getMonth() == req.query.month && pubDate.getFullYear() == req.query.year) {
                        payments.push(result);
                    }
                });
            } else {
                results.forEach(result => {
                    payments.push(result);
                });
            }
            sendJsonResponse(res, 200, payments);
        });
};