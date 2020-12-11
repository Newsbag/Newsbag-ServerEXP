const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CheckoutlistSchema = new Schema({
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
    reader: {
        type: Schema.Types.ObjectId,
        ref: "Reader",
        required: true
    },
    reference: {
        type: String,
        unique: true,
        require: true
    },
    checkoutlist: [CheckoutlistSchema],
    amount: Number,
    state: {
        type: String,
        enum: ["failed", "success"]
    }
})

mongoose.model('Checkout', CheckoutSchema);