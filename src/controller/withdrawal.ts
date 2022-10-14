import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { WithdrawalInstance } from '../models/withdrawal'
import { UserInstance } from '../models/userModel'
import { AccountInstance } from '../models/accounts'
import { withdrawalSchema } from '../utils/utils'
import { initTrans,getAllBanksNG } from './flutterRequest'

export async function withdrawal(req: Request|any, res: Response, next: NextFunction) {
    const withdrawalId = uuidv4()
    try {
        const userID = req.user

        const { amount, bankName, accountNumber } = req.body
        const validateInput = await withdrawalSchema.validate(req.body);
        if (validateInput.error) {
            return res.status(400).json(validateInput.error.details[0].message)
        }
        const customer = await UserInstance.findOne({ where: { id:userID } })
        if (!customer) {
            return res.status(401).json({message:' Sorry customer does not exist'})
        }
        // 
        const validateAccount = await AccountInstance.findOne({ where: { accountNumber } })
        if (!validateAccount) {
            return res.status(401).json({message:'Sorry this account is not registered'})
        }
        if (validateAccount.userId !== userID) {
            return res.status(401).json({message: ' Sorry this account is not registered by this customer!'})
        }
        let walletBalance = parseInt(customer.wallet);

        if (amount > walletBalance) {
            return res.status(401).json({message:'Insufficient fund!'})
        }
// fluterwave function here...
let allBanks = await getAllBanksNG()
const bankCode = allBanks.data.filter((item: Record<string, string>) =>item.name.toLowerCase() == bankName.toLowerCase())
let code = bankCode[0].code
        
const details = {
    // account_bank: '044',
    account_bank: code,
    // account_number:'0690000040',
    account_number:accountNumber,
    amount: amount,
    narration: 'Airtime for cash',
    currency: 'NGN',
    //reference: generateTransactionReference(),
    callback_url: 'https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d',
    debit_currency: 'NGN'
};
const flutta = await initTrans(details)


        if (flutta.status === 'success') {
            const newWalletBalance = (walletBalance - amount).toString()
const customerUpdatedRecord = await UserInstance.update({ wallet: newWalletBalance }, { where: { id: userID } })
            const withdrawalHistory = await WithdrawalInstance.create({
                id: withdrawalId,
                amount,
                bankName,
                accountNumber,
                userID,
                status:true
            })
            return res.status(201).json({ message: `successfully withdrawn N${amount} `,newWalletBalance })
        } else {
            const withdrawalHistory = await WithdrawalInstance.create({
                id: withdrawalId,
                amount,
                bankName,
                accountNumber,
                userID,
                status:false
            }) 
            return res.status(401).json({ message: 'Network error. fail to withdraw from your wallet', })
        }
        
    } catch (error) {
        console.log(error);
        
    }
    
}

export async function getAllWithdrawals(req: Request, res: Response, next: NextFunction) {
    try {
        const allWithdrawalHistory = await WithdrawalInstance.findAll()
        if (!allWithdrawalHistory) {
            return res.status(404).json({message:'Sorry there is currently no withdrawal history!'})
        }

        return res.status(200).json(allWithdrawalHistory)

    } catch (error) {
        return res.status(500).json({message:'failed to get all withdrawal history!'})
    }   
}
export async function getAllUserWithdrawals(req: Request, res: Response, next: NextFunction) {
    try {
        const userID = req.user
        
        const allWithdrawalHistory = await WithdrawalInstance.findAll({where:{userID}})
        if (!allWithdrawalHistory) {
            return res.status(404).json({message:'Sorry there is currently no withdrawal history!'})
        }

        return res.status(200).json(allWithdrawalHistory)

    } catch (error) {
        return res.status(500).json({message:'failed to get all withdrawal history!'})
    }   
}

