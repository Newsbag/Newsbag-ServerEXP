const mongoose = require("mongoose");
const Publication = mongoose.model("Publication");
const Publisher = mongoose.model("Publisher");

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
};

/* function addEdition(res, pub) {
    if (pub.content_type !== "book") {
        Publication
            .find({ title: pub.title })
            .exec((err, publications) => {
                if (err) {
                    sendJsonResponse(res, 400, err);
                    return;
                } else {
                    console.debug("Publication", publications.length);
                    pub.edition = publications.length;
                }
                console.log("Edition added");
                pub.save((err, pub) => {
                    if (err) {
                        sendJsonResponse(res, 400, err);
                    } else {
                        sendJsonResponse(res, 201, pub);
                    }
                });
            });
    } else {
        sendJsonResponse(res, 201, pub);
    }
}; */

function findPublisher(req, res, cb) {
    Publisher
        .findById(req.body.publisher)
        .select("content_type frequency prices")
        .exec((err, publisher) => {
            if (err) {
                sendJsonResponse(res, 404, err);
                return;
            } else if (!publisher) {
                sendJsonResponse(res, 404, {
                    "message": "publisherid not found"
                });
                return;
            }
            if (publisher.content_type === `${req.body.type}s`) {
                cb(publisher);
            } else {
                console.debug(publisher);
                console.debug(publisher.content_type, `${req.body.type}s`);
                console.debug(publisher.frequency, req.body.frequency)
                sendJsonResponse(res, 401, {
                    "message": "Publisher cannot publish such content"
                });
            }
        });
};

module.exports.publicationsCreate = function(req, res, next) {
    if (req.body) {
        let imageArray = req.files["media_cover"][0] ? req.files["media_cover"][0].path.split("/") : [];
        let imagePath = req.files["media_cover"][0] ? imageArray[imageArray.length - 2] + "/" + imageArray[imageArray.length - 1] : "";
        let fileArray = req.files["media_pdf"][0] ? req.files["media_pdf"][0].path.split("/") : [];
        let filePath = req.files["media_pdf"][0] ? fileArray[fileArray.length - 2] + "/" + fileArray[fileArray.length - 1] : "";
        findPublisher(req, res, function(publisher) {
            let requestTags = req.body.tags.split(",");
            let tags = [];
            requestTags.forEach(tag => {
                tags.push(tag.toLowerCase().trim());
            });
            console.log(publisher);
            console.debug(req.body.timeavaliable);
            let prices = publisher.prices;
            if (req.body.price) {
                prices = [{
                    period: "one-time",
                    amount: req.body.price
                }];
            }
            Publication.create({
                title: req.body.title,
                image: req.files["media_cover"][0] ? imagePath : "",
                file: req.files["media_pdf"][0] ? filePath : "",
                summary: req.body.summary,
                publisher: req.body.publisher,
                prices: prices,
                author: publisher.content_type == "books" ? req.body.author : null,
                content_type: publisher.content_type,
                release_date: req.body.releasedate,
                time_available: req.body.timeavaliable,
                frequency: publisher.frequency,
                tags: tags,
                genre: req.body.genre,
                language: req.body.language,
                country: req.body.country,
                pages: req.body.pages,
                isbn: publisher.content_type == "books" ? req.body.isbn : null,
                edition: publisher.content_type == "newspapers" ? req.body.edition : null,
                issue: publisher.content_type == "magazines" ? req.body.issue : null
            },
            (err, publication) => {
                if (err) {
                    console.error(err);
                    sendJsonResponse(res, 401, err);
                } else {
                    // Add edition number
                    console.log("Publication created");
                    sendJsonResponse(res, 201, publication);
                }
            });
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No body in request"
        });
    }
};

module.exports.publicationsList = function(req, res, next) {
    let title = req.query.title;
    let publisherid = req.query.publisherid;
    let type = req.query.type;
    let tag = req.query.tag;
    let fromDate = req.query.fromdate;
    let query = {};
    if (title) query.title = title;
    if (publisherid) query.publisher = publisherid;
    if (type) query.content_type = type;
    Publication
        .find(query)
        // .populate('creator_id')
        .exec(
            (err, results) => {
                if (err) {
                    sendJsonResponse(res, 404, err);
                } else {
                    let publications = [];
                    results.forEach(doc => {
                        let docDate = new Date(doc.created_at);
                        let queryDate = new Date(fromDate);
                        if (queryDate <= docDate) {
                            if (tag) {
                                let index = doc.tags.indexOf(tag);
                                if (index) {
                                    publications.push({
                                        id: doc._id,
                                        title: doc.title,
                                        image: doc.image,
                                        file: doc.file,
                                        summary: doc.summary,
                                        publisher: doc.publisher,
                                        rating: doc.rating,
                                        downloads: doc.downloads,
                                        prices: doc.prices,
                                        author: doc.author,
                                        isbn: doc.isbn,
                                        edition: doc.edition,
                                        issue: doc.edition,
                                        content_type: doc.content_type,
                                        frequency: doc.frequency,
                                        sales: doc.sales,
                                        views: doc.views,
                                        likes: doc.likes,
                                        tags: doc.tags,
                                        genre: doc.genre,
                                        language: doc.language,
                                        country: doc.country,
                                        pages: doc.pages,
                                        comments: doc.comments,
                                        created_at: doc.created_at,
                                        release_date: doc.release_date,
                                        time_avaliable: doc.time_available
                                    });
                                }
                            } else {
                                publications.push({
                                    id: doc._id,
                                    title: doc.title,
                                    image: doc.image,
                                    file: doc.file,
                                    summary: doc.summary,
                                    publisher: doc.publisher,
                                    rating: doc.rating,
                                    downloads: doc.downloads,
                                    prices: doc.prices,
                                    author: doc.author,
                                    isbn: doc.isbn,
                                    edition: doc.edition,
                                    issue: doc.edition,
                                    content_type: doc.content_type,
                                    frequency: doc.frequency,
                                    sales: doc.sales,
                                    views: doc.views,
                                    likes: doc.likes,
                                    tags: doc.tags,
                                    genre: doc.genre,
                                    language: doc.language,
                                    country: doc.country,
                                    pages: doc.pages,
                                    comments: doc.comments,
                                    created_at: doc.created_at,
                                    release_date: doc.release_date,
                                    time_avaliable: doc.time_available
                                });
                            }
                        } else {
                            publications.push({
                                id: doc._id,
                                title: doc.title,
                                image: doc.image,
                                file: doc.file,
                                summary: doc.summary,
                                publisher: doc.publisher,
                                rating: doc.rating,
                                downloads: doc.downloads,
                                prices: doc.prices,
                                author: doc.author,
                                isbn: doc.isbn,
                                edition: doc.edition,
                                issue: doc.edition,
                                content_type: doc.content_type,
                                frequency: doc.frequency,
                                sales: doc.sales,
                                views: doc.views,
                                likes: doc.likes,
                                tags: doc.tags,
                                genre: doc.genre,
                                language: doc.language,
                                country: doc.country,
                                pages: doc.pages,
                                comments: doc.comments,
                                created_at: doc.created_at,
                                release_date: doc.release_date,
                                time_avaliable: doc.time_available
                            });
                        }
                    });
                    sendJsonResponse(res, 200, publications);
                }
            }
        );
};

module.exports.publicationsReadOne = function(req, res, next) {
    if (req.params && req.params.publicationid) {
        Publication
            .findById(req.params.publicationid)
            .exec(
                (err, publication) => {
                    if (!publication) {
                        console.warn("publicationid not found");
                        sendJsonResponse(res, 404, {
                            "message": "publicationid not found"
                        });
                        return;
                    } else if (err) {
                        console.error(err);
                        sendJsonResponse(res, 404, err);
                        return;
                    }
                    console.log("Publication found");
                    sendJsonResponse(res, 200, publication);
                }
            )
    } else {
        sendJsonResponse(res, 404, {
            "message": "No publicationid in request"
        });
    }
};

module.exports.publicationsDownloadOne = function(req, res, next) {
    if (req.params && req.params.publicationid) {
        Publication
            .findById(req.params.publicationid)
            .select("file title downloads")
            .exec((err, publication) => {
                if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                } else if (!publication) {
                    sendJsonResponse(res, 404, {
                        "message": "publicationid not found"
                    });
                    return;
                }
                res.download(publication.file, `${publication.title}.pdf`, function(err) {
                    if (err) {
                        console.log("Download failed")
                    } else {
                        publication.downloads++;
                        publication.save((err, publication) => {
                            if (err) {
                                console.error(err);
                            } else {
                                console.log("Downloads incremented");
                            }
                        });
                    }
                });
            });
    }
};

module.exports.publicationsUpdateOne = function(req, res, next) {
    if (!req.params.publicationid) {
        sendJsonResponse(res, 404, {
            "message": "Not found, publicationid is required"
        });
        return;
    }
    Publication
        .findById(req.params.publicationid)
        .select('title image summary tags prices author issue edition')
        .exec(
            (err, publication) => {
                if (!publication) {
                    sendJsonResponse(res, 404, {
                        "message": "publicationid not found"
                    });
                    return;
                } else if (err) {
                    sendJsonResponse(res, 400, err);
                    return;
                }
                publication.title = req.body.title ? req.body.title : publication.title;
                publication.image = req.files ? req.files[0].path : publication.image;
                publication.summary = req.body.summary ? req.body.summary : publication.summary;
                publication.tags = tags ? tags : publication.tags;
                publication.prices = prices ? prices : publication.prices;
                publication.author = req.body.author ? req.body.author : publication.author;
                publication.issue = req.body.issue ? req.body.issue : publication.issue;
                publication.edition = req.body.edition ? req.body.edition : publication.edition;
            
                publication.save((err, publication) => {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else {
                        sendJsonResponse(res, 200, publication);
                    }
                });
            }
        );
};

module.exports.publicationsDeleteOne = function(req, res, next) {
    let publicationid = req.params.publicationid;
    if (publicationid) {
        Publication
            .findByIdAndRemove(publicationid)
            .exec((err, publication) => {
                if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                sendJsonResponse(res, 204, null);
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No publicationid"
        });
    }
};
