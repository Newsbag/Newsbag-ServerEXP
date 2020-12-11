const mongoose = require("mongoose");
const Schema =  mongoose.Schema;

const PaymentSchema = new Schema({
    publication: {
        type: Schema.Types.ObjectId,
        ref: "Publication",
        required: true
    },
    publisher: {
        type: Schema.Types.ObjectId,
        ref: "Publisher",
        required: true
    },
    reader: {
        type: Schema.Types.ObjectId,
        ref: "Reader",
        required: true
    },
    subscription: {
        type: String,
        enum: ["one-time", "1 month", "2 months", "3 months", "6 months", "1 year"]
    },
    amount_paid: {
        type: Number,
        min: 0,
        required: true
    },
    publisher_share: {
        type: Number,
        min: 0
    },
    newsbag_share: {
        type: Number,
        min: 0
    },
    earnings_total: {
        type: Number,
        min: 0
    },
    payout_total: {
        type: Number,
        min: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

mongoose.model("Payment", PaymentSchema);