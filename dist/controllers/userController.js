"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = void 0;
const userModel_1 = require("../models/userModel");
const validation_1 = require("../utils/validation");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailVerification_1 = require("../email/emailVerification");
const sendMail_1 = __importDefault(require("../email/sendMail"));
const fromUser = process.env.FROM;
const subject = process.env.SUBJECT;
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        const user = (await userModel_1.UserInstance.findOne({
            where: {
                email: email,
            },
        }));
        if (!user) {
            return res.status(404).json({
                message: 'email not found',
            });
        }
        const { id } = user;
        const html = (0, emailVerification_1.forgotPasswordVerification)(id);
        await sendMail_1.default.sendEmail(fromUser, req.body.email, subject, html);
        res.status(200).json({
            message: 'Kindly check your email for verification',
        });
    }
    catch (error) {
        res.status(500);
        throw new Error(`${error}`);
    }
}
exports.forgotPassword = forgotPassword;
async function resetPassword(req, res) {
    try {
        const { id } = req.params;
        const validationResult = validation_1.resetPasswordSchema.validate(req.body, validation_1.options);
        if (validationResult.error) {
            return res.status(400).json({
                error: validationResult.error.details[0].message,
            });
        }
        const user = await userModel_1.UserInstance.findOne({
            where: {
                id: id,
            },
        });
        if (!user) {
            return res.status(403).json({
                message: 'user does not exist',
            });
        }
        const passwordHash = await bcryptjs_1.default.hash(req.body.password, 8);
        await user?.update({
            password: passwordHash,
        });
        return res.status(200).json({
            message: 'Password Successfully Changed',
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error',
        });
        throw new Error(`${error}`);
    }
}
exports.resetPassword = resetPassword;
