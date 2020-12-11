const mongoose = require("mongoose");
const Payout = mongoose.model("Payout");

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}

module.exports.payoutsCreate = async function(req, res) {
    if (req.body) {
        try {
            let payout = await Payout.create({
                publisher: req.body.publisher,
                payments: req.body.payments,
                amount: parseFloat(req.body.amount)
            });
            sendJsonResponse(res, 201, payout);
        } catch (error) {
            console.error(error);
            sendJsonResponse(res, 422, error);
        }
    } else {
        sendJsonResponse(res, 400, {
            "message": "No body in request"
        });
    }
};

module.exports.payoutsList = async function(req, res) {
    try {
        let query = {};
        if (req.query.publisher) query.publisher = req.query.publisher;
        let results = await Payout.find(query);

        if (results.length === 0) {
            console.warn("No payouts found");
            sendJsonResponse(res, 404, results);
            return;
        }
        console.log("Payouts retrieved");
        let payouts = [];
        var date;
        if (req.query.month && req.query.year) {
            results.forEach(result => {
                date = new Date(result.created_at);
                if (date.getMonth() == req.query.month && date.getFullYear() == req.query.year) {
                    payouts.push(result);
                }
            });
        } else {
            results.forEach(result => {
                payouts.push(result);
            });
        }
        sendJsonResponse(res, 200, payouts);
    } catch (error) {
        console.error(error);
        sendJsonResponse(res, 422, error);
    }
};

module.exports.payoutsReadOne = async function(req, res) {
    if (req.params && req.params.payoutid) {
        try {
            let payout = await Payout.findById(req.params.payoutid);
            if (!payout) {
                console.error("payoutid not found");
                sendJsonResponse(res, 404, {
                    "message": "payoutid not found"
                });
                return;
            }
            console.log("Payout retrieved");
            sendJsonResponse(res, 200, payout);
        } catch (error) {
            console.error(error);
            sendJsonResponse(res, 422, error);
        }
    } else {
        sendJsonResponse(res, 400, {
            "message": "Not found, payoutid is required"
        });
    }
};

module.exports.payoutsUpdateOne = async function(req, res) {
    if (!req.params.payoutid) {
        sendJsonResponse(res, 400, {
            "message": "Not found, payoutid is required"
        });
        return;
    }
    try {
        let payout = await Payout.findById(req.params.payoutid).select("status");
        if (!payout) {
            sendJsonResponse(res, 404, {
                "message": "payoutid not found"
            });
            return;
        }
        payout.status = req.body.status;
        payout = await payout.save();
        sendJsonResponse(res, 200, payout);
    } catch (error) {
        console.error(error);
        sendJsonResponse(res, 422, error);
    }
};