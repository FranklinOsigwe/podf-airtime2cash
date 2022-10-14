"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUserWithdrawals = exports.getAllWithdrawals = exports.withdrawal = void 0;
const uuid_1 = require("uuid");
const withdrawal_1 = require("../models/withdrawal");
const userModel_1 = require("../models/userModel");
const accounts_1 = require("../models/accounts");
const utils_1 = require("../utils/utils");
const flutterRequest_1 = require("./flutterRequest");
async function withdrawal(req, res, next) {
    const withdrawalId = (0, uuid_1.v4)();
    try {
        const userID = req.user;
        const { amount, bankName, accountNumber } = req.body;
        const validateInput = await utils_1.withdrawalSchema.validate(req.body);
        if (validateInput.error) {
            return res.status(400).json(validateInput.error.details[0].message);
        }
        const customer = await userModel_1.UserInstance.findOne({ where: { id: userID } });
        if (!customer) {
            return res.status(401).json({ message: ' Sorry customer does not exist' });
        }
        // 
        const validateAccount = await accounts_1.AccountInstance.findOne({ where: { accountNumber } });
        if (!validateAccount) {
            return res.status(401).json({ message: 'Sorry this account is not registered' });
        }
        if (validateAccount.userId !== userID) {
            return res.status(401).json({ message: ' Sorry this account is not registered by this customer!' });
        }
        let walletBalance = parseInt(customer.wallet);
        if (amount > walletBalance) {
            return res.status(401).json({ message: 'Insufficient fund!' });
        }
        // fluterwave function here...
        let allBanks = await (0, flutterRequest_1.getAllBanksNG)();
        const bankCode = allBanks.data.filter((item) => item.name.toLowerCase() == bankName.toLowerCase());
        let code = bankCode[0].code;
        const details = {
            // account_bank: '044',
            account_bank: code,
            // account_number:'0690000040',
            account_number: accountNumber,
            amount: amount,
            narration: 'Airtime for cash',
            currency: 'NGN',
            //reference: generateTransactionReference(),
            callback_url: 'https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d',
            debit_currency: 'NGN'
        };
        const flutta = await (0, flutterRequest_1.initTrans)(details);
        if (flutta.status === 'success') {
            const newWalletBalance = (walletBalance - amount).toString();
            const customerUpdatedRecord = await userModel_1.UserInstance.update({ wallet: newWalletBalance }, { where: { id: userID } });
            const withdrawalHistory = await withdrawal_1.WithdrawalInstance.create({
                id: withdrawalId,
                amount,
                bankName,
                accountNumber,
                userID,
                status: true
            });
            return res.status(201).json({ message: `successfully withdrawn N${amount} `, newWalletBalance });
        }
        else {
            const withdrawalHistory = await withdrawal_1.WithdrawalInstance.create({
                id: withdrawalId,
                amount,
                bankName,
                accountNumber,
                userID,
                status: false
            });
            return res.status(401).json({ message: 'Network error. fail to withdraw from your wallet', });
        }
    }
    catch (error) {
        console.log(error);
    }
}
exports.withdrawal = withdrawal;
async function getAllWithdrawals(req, res, next) {
    try {
        const allWithdrawalHistory = await withdrawal_1.WithdrawalInstance.findAll();
        if (!allWithdrawalHistory) {
            return res.status(404).json({ message: 'Sorry there is currently no withdrawal history!' });
        }
        return res.status(200).json(allWithdrawalHistory);
    }
    catch (error) {
        return res.status(500).json({ message: 'failed to get all withdrawal history!' });
    }
}
exports.getAllWithdrawals = getAllWithdrawals;
async function getAllUserWithdrawals(req, res, next) {
    try {
        const userID = req.user;
        const allWithdrawalHistory = await withdrawal_1.WithdrawalInstance.findAll({ where: { userID } });
        if (!allWithdrawalHistory) {
            return res.status(404).json({ message: 'Sorry there is currently no withdrawal history!' });
        }
        return res.status(200).json(allWithdrawalHistory);
    }
    catch (error) {
        return res.status(500).json({ message: 'failed to get all withdrawal history!' });
    }
}
exports.getAllUserWithdrawals = getAllUserWithdrawals;
