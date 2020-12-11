const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PayoutSchema = new Schema({
    publisher: {
        type: Schema.Types.ObjectId,
        ref: "Publisher"
    },
    payments: [{
        type: Schema.Types.ObjectId,
        ref: "Payment"
    }],
    amount: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

mongoose.model("Payout", PayoutSchema);