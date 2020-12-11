const mongoose = require("mongoose");
const Publication = mongoose.model("Publication");

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}

function doSetAverageRating(publication) {
    var i, commentCount, ratingAverage, ratingTotal;
    if (publication.comments && publication.comments.length > 0) {
        commentCount = publication.comments.length;
        ratingTotal = 0;
        for (i = 0; i < commentCount; i++) {
            ratingTotal += publication.comments[i].rating;
        }
        ratingAverage = parseFloat(ratingTotal / commentCount, 10);
        publication.rating = ratingAverage;
        publication.save(err => {
            if (err) {
                console.error(err);
            } else {
                console.log("Average rating updated to", ratingAverage);
            }
        });
    }
}

function updateAverageRating(publicationid) {
    Publication
        .findById(publicationid)
        .select('rating comments')
        .exec(
            (err, publication) => {
                if (!err) {
                    doSetAverageRating(publication);
                }
            }
        );
}

function doAddComment(req, res, publication) {
    if (!publication) {
        sendJsonResponse(res, 404, {
            "message": "publicationid not found"
        });
    } else {
        publication.comments.push({
            author: req.body.author,
            rating: parseInt(req.body.rating),
            comment: req.body.comment
        });
        publication.save((err, publication) => {
            var thisComment;
            if (err) {
                sendJsonResponse(res, 400, err);
            } else {
                updateAverageRating(publication._id);
                thisComment = publication.comments[publication.comments.length - 1];
                sendJsonResponse(res, 201, thisComment);
            }
        });
    }
}

module.exports.commentsReadOne = function(req, res, next) {
    if (req.params && req.params.publicationid && req.params.commentid) {
        Publication
            .findById(req.params.publicationid)
            .select("title comments")
            .exec(
                (err, publication) => {
                    var response, comment;
                    if (!publication) {
                        sendJsonResponse(res, 404, {
                            "message": "publicationid not found"
                        });
                        return;
                    } else if (err) {
                        sendJsonResponse(res, 400, err);
                        return;
                    }
                    if (publication.comments && publication.comments.length > 0) {
                        comment = publication.comments.id(req.params.commentid);
                        if (!comment) {
                            sendJsonResponse(res, 404, {
                                "message": "commentid not found"
                            });
                        } else {
                            response = {
                                publication: {
                                    title: publication.title,
                                    id: req.params.publicationid
                                }, 
                                comment: comment
                            };
                            sendJsonResponse(res, 200, response);
                        }
                    } else {
                        sendJsonResponse(res, 404, {
                            "message": "No comments found"
                        });
                    }
                }
            );
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, publicationid and commentid are both required"
        });
    }
};

module.exports.commentsCreate = function(req, res, next) {
    let publicationid = req.params.publicationid;
    if (publicationid && req.body) {
        Publication
            .findById(publicationid)
            .select('comments')
            .exec(
                (err, publication) => {
                    if (err) {
                        sendJsonResponse(res, 400, err);
                    } else {
                        doAddComment(req, res, publication);
                    }
                }
            );
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, publicationid and body required"
        });
    }
};

module.exports.commentsUpdateOne = function(req, res, next) {};

module.exports.commentsDeleteOne = function(req, res, next) {};