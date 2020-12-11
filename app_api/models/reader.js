const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        ref: "Publication"
    },
    subscription: {
        type: String,
        enum: ["one-time", "1 month", "2 months", "3 months", "6 months", "1 year"]
    }
})

const ReaderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: "Publication"
    }],
    cart: [CartSchema],
    library: [{
        type: Schema.Types.ObjectId,
        ref: "Publication"
    }]
});

mongoose.model("Reader", ReaderSchema);