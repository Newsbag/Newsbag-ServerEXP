const express = require('express');
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const passport = require("passport");
const router = express.Router();
const ctrlUser = require('../controllers/users');
const ctrlPublisher = require('../controllers/publishers');
const ctrlReader = require('../controllers/readers');
const ctrlCart = require('../controllers/carts');
const ctrlComment = require('../controllers/comments');
const ctrlPublications = require("../controllers/publications");
const ctrlLibraries = require("../controllers/libraries");
const ctrlPayments = require("../controllers/payments");
const ctrlPayouts = require("../controllers/payouts");
const ctrlOthers = require("../controllers/others");

let profilePhotoStorage = multer.diskStorage({
    destination: "./uploads/profile-photos",
    filename: function(req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        let name = crypto.randomBytes(10).toString('hex');
        cb(null, name + Date.now() + '.' + extension);
    }
});

let mediaStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/gif") {
            return cb(null, "./uploads/publication-covers");
        } else {
            cb(null, "./uploads/publication-files");
        }
    },
    filename: function(req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        let name = crypto.randomBytes(10).toString('hex');
        cb(null, name + Date.now() + '.' + extension);
    }
});

// Users
router.post('/users/register', multer({ storage: profilePhotoStorage }).single("photo"), ctrlUser.register);
router.post('/users/login', ctrlUser.login);
router.get('/users/verify/:userid/:secretcode', ctrlUser.verify);
router.post("/users/logout", ctrlUser.logout);

// Publishers
router.get('/publishers', passport.authenticate("jwt", { session: false }), ctrlPublisher.publishersList);
router.post('/publishers', passport.authenticate("jwt", { session: false }), ctrlPublisher.publishersCreate);
router.get('/publishers/:publisherid', passport.authenticate("jwt", { session: false }), ctrlPublisher.publishersReadOne);
router.put("/publishers/:publisherid", passport.authenticate("jwt", { session: false }), multer({ storage: profilePhotoStorage }).single("photo"), ctrlPublisher.publishersUpdateOne);

// Readers
router.get('/readers', passport.authenticate("jwt", { session: false }), ctrlReader.readersList);
router.post('/readers', passport.authenticate("jwt", { session: false }), ctrlReader.readersCreate);
router.get('/readers/:readerid', passport.authenticate("jwt", { session: false }), ctrlReader.readersReadOne);
router.put('/readers/:readerid', passport.authenticate("jwt", { session: false }), multer({ storage: profilePhotoStorage }).single("photo"), ctrlReader.readersUpdateOne);

// Library
router.get("/readers/:readerid/library", passport.authenticate("jwt", { session: false }), ctrlLibraries.librariesList);
router.post("/readers/:readerid/library", passport.authenticate("jwt", { session: false }), ctrlLibraries.addToLibrary);

// Cart
router.get('/readers/:readerid/cart', passport.authenticate("jwt", { session: false }), ctrlCart.cartsList);
router.post('/readers/:readerid/cart', passport.authenticate("jwt", { session: false }), ctrlCart.addToCart);
router.delete("/readers/:readerid/cart/:itemid", passport.authenticate("jwt", { session: false }), ctrlCart.removeFromCart);
router.delete("/readers/:readerid/cart", passport.authenticate("jwt", { session: false }), ctrlCart.emptyCart);

//Checkout
router.post("/readers/:readerid/checkout", passport.authenticate("jwt", { session: false }), ctrlCart.checkoutFromCart);
router.get("/readers/:readerid/checkout/:checkoutid", passport.authenticate("jwt", { session: false }), ctrlCart.verifycheckoutFromCart);


// Publications
router.get("/publications", passport.authenticate("jwt", { session: false }), ctrlPublications.publicationsList);
router.post("/publications", passport.authenticate("jwt", { session: false }), multer({ storage: mediaStorage }).fields([{ name: "media_cover", maxCount: 1 }, { name: "media_pdf", maxCount: 1 }]), ctrlPublications.publicationsCreate);
router.get("/publications/:publicationid", passport.authenticate("jwt", { session: false }), ctrlPublications.publicationsReadOne);
router.put("/publications/:publicationid", passport.authenticate("jwt", { session: false }), multer({ storage: mediaStorage }).fields([{ name: "media_cover", maxCount: 1 }, { name: "media_pdf", maxCount: 1 }]), ctrlPublications.publicationsUpdateOne);
router.delete("/publications/:publicationid", passport.authenticate("jwt", { session: false }), ctrlPublications.publicationsDeleteOne);
router.get("/publications/:publicationid/download", passport.authenticate("jwt", { session: false }), ctrlPublications.publicationsDownloadOne);

// Comments
router.get("/publications/:publicationid/comments/:commentid", passport.authenticate("jwt", { session: false }), ctrlComment.commentsReadOne);
router.post("/publications/:publicationid/comments/", passport.authenticate("jwt", { session: false }), ctrlComment.commentsCreate);

// Payments
router.get("/payments", passport.authenticate("jwt", { session: false }), ctrlPayments.paymentsList);
router.post("/payments", passport.authenticate("jwt", { session: false }), ctrlPayments.paymentsCreate);

// Payouts
router.get("/payouts", passport.authenticate("jwt", { session: false }), ctrlPayouts.payoutsList);
router.post("/payouts", passport.authenticate("jwt", { session: false }), ctrlPayouts.payoutsCreate);
router.get("/payouts/:payoutid", passport.authenticate("jwt", { session: false }), ctrlPayouts.payoutsReadOne);
router.put("/payouts/:payoutid", passport.authenticate("jwt", { session: false }), ctrlPayouts.payoutsUpdateOne);

// Others
router.post("/publications/:publicationid/favourite", passport.authenticate("jwt", { session: false }), ctrlOthers.favourite);
router.get("/readers/:readerid/wishlist", passport.authenticate("jwt", { session: false }), ctrlOthers.viewWishlist);
router.post("/readers/:readerid/wishlist", passport.authenticate("jwt", { session: false }), ctrlOthers.addToWishlist);
router.delete("/readers/:readerid/wishlist/:item", passport.authenticate("jwt", { session: false }), ctrlOthers.removeFromWishlist);

module.exports = router;