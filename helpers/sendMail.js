const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const {KEY_SENDGRID} = process.env;

sgMail.setApiKey(KEY_SENDGRID);

const sendMail = async(data) => {
    try {
        const mail = {...data, from: "marina.ua93@gmail.com"}
        await sgMail.send(mail);
        return true;
    } catch (error) {
        throw error;
    }
}

module.exports = sendMail;