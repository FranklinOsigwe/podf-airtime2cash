"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (options) => {
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });
    // define email options
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    };
    // actually send the mail
    await transporter.sendMail(mailOptions);
};
exports.default = sendEmail;
