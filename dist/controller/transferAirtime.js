"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferAirtime = void 0;
const uuid_1 = require("uuid");
const transferAirtime_1 = require("../models/transferAirtime");
const utils_1 = require("../utils/utils");
const userModel_1 = require("../models/userModel");
// import jwt from 'jsonwebtoken';
const adminNumber = ['09033333333', '09055555555', '09099999999', '09088888888'];
const selectedNetwork = ['MTN', 'GLO', '9MOBILE', 'AIRTEL  '];
async function transferAirtime(req, res) {
    try {
        // generate an id for the transaction
        const id = (0, uuid_1.v4)();
        //identify who want to sell airtime
        const userId = req.user;
        const { network, phoneNumber, amountToSell, sharePin } = req.body;
        const validateInput = await utils_1.transferAirtimeSchema.validate(req.body, utils_1.options);
        if (validateInput.error) {
            return res.status(400).json(validateInput.error.details[0].message);
        }
        const validatedUser = await userModel_1.UserInstance.findOne({ where: { id: userId } });
        if (!validatedUser) {
            return res.status(401).json({ message: 'Sorry user does not exist!' });
        }
        let destinationPhoneNumber;
        let USSD;
        const amountToRecieve = 0.7 * amountToSell;
        switch (network) {
            case 'MTN':
                destinationPhoneNumber = adminNumber[0];
                USSD = `*600*${destinationPhoneNumber}*${amountToSell}*${sharePin}#`;
                break;
            case 'GLO':
                destinationPhoneNumber = adminNumber[1];
                USSD = `*131*${destinationPhoneNumber}*${amountToSell}*${sharePin}#`;
                break;
            case '9MOBILE':
                destinationPhoneNumber = adminNumber[2];
                USSD = `*223*${sharePin}*${amountToSell}*${destinationPhoneNumber}#`;
                break;
            case 'AIRTEL':
                destinationPhoneNumber = adminNumber[3];
                USSD = `*432*${destinationPhoneNumber}*${amountToSell}*${sharePin}#`;
                break;
            default:
                res.status(400).json({ message: 'Please select a network' });
                break;
        }
        // res
        //   .status(201)
        //   .json({ network, phoneNumber, amountToSell, sharePin, destinationPhoneNumber, USSD, amountToRecieve });
        const transaction = await transferAirtime_1.TransferAirtimeInstance.create({
            id: id,
            network,
            phoneNumber,
            amountToSell,
            userId,
        });
        if (!transaction) {
            return res.status(404).json({ message: 'Sorry, transaction was not successful!' });
        }
        return res.status(201).json(transaction);
    }
    catch (err) {
        console.log(err);
    }
}
exports.transferAirtime = transferAirtime;
