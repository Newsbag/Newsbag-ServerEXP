//const mongoose = require("mongoose");
//const Schema = mongoose.Schema;
/*
const CheckoutSchema = new Schema({
    reader:{
        type: Schema.Types.ObjectId,
        ref: 'Reader'
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
    checkout_amount: {
        type: Number,
        min: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})
*/
//mongoose.model("Checkout", CheckoutSchema);