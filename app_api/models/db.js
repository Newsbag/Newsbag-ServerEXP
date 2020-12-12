const mongoose = require('mongoose');

let apiUrl = 'mongodb+srv://Kinky:kinkilay50@cluster0newsbag.i2vlo.mongodb.net/Cluster0Newsbag?retryWrites=true&w=majority';

if (process.env.NODE_ENV === 'production') {
    apiUrl = process.env.DATABASE_URL;
}

mongoose.connect(apiUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Connection has been made to database");
})
.catch(err => {
    console.error("App starting error:", err.stack);
    process.exit(1);
});

require('./user');
require('./publisher');
require('./reader');
require('./publication');
require('./payment');
require("./payout");
require("./checkout");