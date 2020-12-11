const mongoose = require("mongoose");
const Reader = mongoose.model("Reader");

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}

module.exports.librariesList = function(req, res, next) {
    if (req.params && req.params.readerid) {
        Reader
            .findById(req.params.readerid)
            .populate('library')
            .select('library')
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
                console.log("Reader found");
                sendJsonResponse(res, 200, reader.library);
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No readerid in request"
        });
    }
};

module.exports.addToLibrary = function(req, res, next) {
    if (req.params && req.params.readerid && req.body.items) {
        Reader
            .findById(req.params.readerid)
            .select('library')
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
                let items = req.body.items;
                items.forEach(item => reader.library.push(item));
                reader.save((err, reader) => {
                    if (err) {
                        sendJsonResponse(res, 400, err);
                    } else {
                        sendJsonResponse(res, 201, reader.library);
                    }
                });
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, no readerid or body in request"
        });
    }
};