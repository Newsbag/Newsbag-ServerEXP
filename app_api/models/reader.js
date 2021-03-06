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

const CheckoutSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        unique: true
    },
    checkoutlist: [{
        item: {
            type: Schema.Types.ObjectId,
            ref: 'Publication'
        },
        subscription: {
            type: String,
            enum: ["one-time", "1 month", "2 months", "3 months", "6 months", "1 year"]
            
        }
    }],
    state: {
        type: String,
        enum: ["failed", "initiated", "success"],
        default: "initiated"
    },
    amount: {
        type: Number,
        min: 0
    },
    created_at: {
        type: Date,
        default: Date.now
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
    checkouts: [CheckoutSchema],
    library: [{
        type: Schema.Types.ObjectId,
        ref: "Publication"
    }]
});

mongoose.model("Reader", ReaderSchema);
