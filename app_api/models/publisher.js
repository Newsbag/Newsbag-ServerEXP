const mongoose = require('mongoose');
const crypto = require("crypto");
const Schema = mongoose.Schema;

const PublisherSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    private_key: {
        type: String,
        default: crypto.randomBytes(10).toString('hex')
    },
    content_type: {
        type: String,
        enum: ["newspapers", "books", "magazines"]
    },
    frequency: {
        type: String,
        enum: ["one-time", "daily", "biweekly", "weekly", "fortnightly", "monthly", "quarterly", "annually"]
    },
    prices: [{
        period: {
            type: String,
            enum: ["one-time", "1 month", "2 months", "3 months", "6 months", "1 year"]
        },
        amount: {
            type: Number,
            min: 0
        }
    }],
    website: {
        type: String
    },
    verified: {
        type: Boolean,
        default: false
    },
    payment_details: {
        bank: String,
        account_name: String,
        account_number: String
    }
});

mongoose.model('Publisher', PublisherSchema);