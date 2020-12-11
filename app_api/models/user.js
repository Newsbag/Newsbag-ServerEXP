const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');

const key = require('./key.json'); 

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    photo: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        unique: true,
        required: true
    },
    token: String,
    account_type: {
        type: String,
        enum: ["publisher", "reader"],
        required: true
    },
    secretcode: String,
    verified: {
        type: Schema.Types.Boolean,
        default: false
    }
});

UserSchema.methods.setPassword = function(password) {
    const salt = bcryptjs.genSaltSync(10);
    this.password = bcryptjs.hashSync(password, salt);
};

UserSchema.methods.validPassword = function(password) {
    return bcryptjs.compareSync(password, this.password);
};

UserSchema.methods.sendEmail = function(content) {
    return nodemailer.createTestAccount()
    .then(testAccount => {
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: 'donotreply@newsbag.xyz',
                serviceClient: key.client_id,
                privateKey: key.private_key,
            }
        });
    })
    .then(transporter => {
        return transporter.sendMail({
            from: '"Newsbag" <donoteply@newsbag.xyz',
            to: content.email,
            subject: content.subject,
            text: content.text,
            html: content.html
        });
    })
    .then(info => {
        console.log('Email sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    })
    .catch(error => {
        console.error(error);
    });
};

mongoose.model('User', UserSchema);