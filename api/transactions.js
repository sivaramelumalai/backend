//const express = require('express')
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
const mail = require('../mail')
const speakeasy = require('speakeasy')
require('dotenv').config()
const jwt  = require('jsonwebtoken')
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'bankuser',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 2000
});

const creditMoney = async (request, response) => {
    console.log("here 1")
    jwt.verify(request.token, 'privatekey', async(err, authorizedData) => {
        if(err){
          console.log('ERROR: Could not connect to the protected route');
          response.sendStatus(403);
        }else{
            console.log("here 2")
            const type = request.params.type
            const { f_acc_no,T_acc_no,amount,otp} = request.body
            var f_flag = 0
            var t_flag = 0
            const { rows } = await pool.query('SELECT account_no FROM accounts WHERE user_id = $1',[authorizedData.user.user_id])
            const secret = await pool.query('SELECT auth_secret FROM users WHERE id = $1',[authorizedData.user.user_id])
            const valid = speakeasy.totp.verify({secret: secret.rows[0].auth_secret,encoding: "base32",token:otp,window: 0 })
            console.log(rows)
            console.log(valid)
            if((f_acc_no == rows[0].account_no || f_acc_no == rows[1].account_no) && (amount>0)){
                if (type === 'imps'&& valid){
                    console.log("here 3")
                    pool.query('UPDATE accounts SET amount = amount + $2 WHERE account_no = $1', [T_acc_no,amount], (error, results) => {
                        if (error) {
                        throw error
                        }
                    })
                    console.log("here 4")
                    pool.query('UPDATE accounts SET amount = amount - $2 WHERE account_no = $1', [f_acc_no,amount], (error, results) => {
                        if (error) {
                            throw error
                        }
                    })
                    let cons = await pool.query('SELECT user_id FROM accounts WHERE account_no =$1',[T_acc_no])
                    console.log(cons.rows[0].user_id)
                    let recip_id = cons.rows[0].user_id
                    let t_type = "" 
                    if (authorizedData.user.user_id == recip_id){
                        t_type = "self"
                    
                    }else if(authorizedData.user.user_id != recip_id){
                        t_type = "debit"
                    }else{
                        t_type = "credit"  
                    }
                    pool.query('INSERT INTO transactions (transaction_type,account_no, from_acc_no,to_acc_no,date,amount,user_id,recipient_id,type) VALUES ($4,$1, $1,$2,now()::date,$3,$5,$6,$7)',[f_acc_no,T_acc_no,amount,type,authorizedData.user.user_id,recip_id,t_type],(error,res) =>{
                        if(error){
                            console.log(error)
                            // mail                  
                            throw error
                        }
                        response.status(200).send('imps transaction done')
                    })
                    
                }else if (type === 'neft'  || type === 'rtgs' ){
                    var time = moment()
                    
                    var startTime = moment('10:34:00', 'hh:mm:ss'), endTime = moment('22:00:00', 'hh:mm:ss');
            
                    if (time.isBetween(startTime,endTime)){
                        pool.query('UPDATE accounts SET amount = amount + $2 WHERE account_no = $1', [T_acc_no,amount], (error, results) => {
                            if (error) {
                                mail
                            
                                throw error
                            }
                            // response.status(201).send(`amount sent to ${T_acc_no}`)
                            f_flag = 1
                        })
                        pool.query('UPDATE accounts SET amount = amount - $2 WHERE account_no = $1', [f_acc_no,amount], (error, results) => {
                            if (error) {
                                
                                throw error
                            }
                            t_flag = 1
                        })
                        pool.query('INSERT INTO transactions (transaction_type,account_no, from_acc_no,to_acc_no,date,amount,user_id) VALUES ($4,$1, $1,$2,now()::date,$3,$5)',[f_acc_no,T_acc_no,amount,type,authorizedData.user.user_id],(error,res) =>{
                            if(error){
                                console.log('mailing')
                                throw error
                                
                            }
                            response.status(200).send({"message":'Transaction successful'})
                        })
                    }else{
                        response.status(201).json({"message":'not available in this time'})
                    }  
                }else{
                    response.status(400).json({"message":'Please enter the valid input'})
                }
            }else{
                response.status(400).send({"message":'Please enter the valid input'})
            }
        }
    })  
} 

const withdrawal= async (request,response)=>{
    jwt.verify(request.token, 'privatekey', async(err, authorizedData) => {
        if(err){
          console.log('ERROR: Could not connect to the protected route');
          response.sendStatus(403);
        }else{
            const {acc_no, amount} = request.body
            const { rows } = await pool.query('SELECT account_no FROM accounts WHERE user_id = $1',[request.signedCookies.user_id])

            if((rows[0].accounts_no == acc_no) && ( amount > 0)){
                pool.query('UPDATE accounts SET amount = amount - $2 WHERE account_no = $1', [acc_no, amount], (error, results) => {
                    if (error) {
                        console.log(mail)
                        mail
                        throw error
                    }
                    response.status(201).send(`Amount ${amount} detected from your acc no:${acc_no} `)
                })
                pool.query('INSERT INTO transactions (transaction_type, from_acc,to_acc,date,amount) VALUES ($4, $1,$2,CURRENT_DATE,$3)',['self',acc_no,amount, 'withdrawal'],(error,res)=>{
                })
            } 
        }
    })
  
}

const deposit= async (request,response,next)=>{
    jwt.verify(request.token, 'privatekey', async(err, authorizedData) => {
        if(err){
          console.log('ERROR: Could not connect to the protected route');
          response.sendStatus(403);
        }else{
            const type = request.params.type
            const {rows} = await pool.query('SELECT role FROM users WHERE id = $1',[request.signedCookies.user_id])
            const {acc_no,amount,} = request.body
            if(rows[0].role == "banker"){
                if((type === 'cheque' || 'cash') && (amount > 0) ){
                    
                    pool.query('UPDATE accounts SET amount = amount + $2 WHERE account_no = $1', [acc_no, amount], (error, results) => {
                        if (error) {
                            throw error
                        }
                        response.status(201).send(`Amount Rs.${amount} added from your acc no:${acc_no} `)
                    })
                    pool.query('INSERT INTO transactions (transaction_type, from_acc,to_acc,date,amount) VALUES ($4, $1,$2,now(),$3)',['self',acc_no,amount, type],(error,res)=>{})
                }else{
                    response.status(400).send("Bad request...!!!")
                }
            }else{
                response.status(400).send('pls contact the bank')
            }
        }
    })
}

const allTransactions = async (request,response) =>{
    jwt.verify(request.token, 'privatekey', async(err, authorizedData) => {
        if(err){
          console.log('ERROR: Could not connect to the protected route');
          response.sendStatus(403);
        }else{
            const {rows} = await pool.query('SELECT role FROM users WHERE id = $1 LIMIT 20',[authorizedData.user.user_id])
            if(rows[0].role == "banker"){
                pool.query('SELECT * FROM transactions ',(error,results)=>{
                    if(error){
                        throw error
                    }
                    response.status(200).json(results.rows)
                })
            }else{
                response.status(400).send('Unauthorised user')
            }
        }
    })
}

const allTransactionsByAccountNo = async (request,response) =>{
    jwt.verify(request.token, 'privatekey', async(err, authorizedData) => {
        if(err){
          console.log('ERROR: Could not connect to the protected route');
          response.sendStatus(403);
        }else{
            acc_no = request.params.num
            const {rows} = await pool.query('SELECT role ,account_no FROM users INNER JOIN accounts ON user_id = accounts.user_id WHERE accounts.user_id = $1 AND users.id = $1 ',[authorizedData.user.user_id])
            console.log(authorizedData.user.user_id)
            console.log(rows)
            if(rows[0].role == "banker" || acc_no == authorizedData.user.user_id){
                pool.query('SELECT * FROM transactions WHERE user_id= $1 ORDER BY transaction_id DESC LIMIT 20',[acc_no], (error, results)=>{
                    if(error){
                        throw(error)
                    }//OR to_acc_no = $1
                    response.status(200).json(results.rows)
                })
            }
        }
    })
}

const allPayments = async(request,response)=>{
    jwt.verify(request.token, 'privatekey', async(err, authorizedData) => {
        if(err){
            console.log('ERROR: Could not connect to the protected route');
            response.sendStatus(403);

        }else{
            const {id} = request.params
            const d = 'debit'
            const {rows} = await pool.query('SELECT role FROM users WHERE id = $1',[authorizedData.user.user_id])
            if(rows[0].role == "banker" || id == authorizedData.user.user_id){
                pool.query('SELECT * FROM transactions WHERE user_id= $1 AND type = $2 ORDER BY transaction_id DESC LIMIT 20',[id,d], (error, results)=>{
                    if(error){
                        throw(error)
                    }//OR to_acc_no = $1
                    response.status(200).json(results.rows)
                })
            }

        }
    })


}
module.exports = {creditMoney,withdrawal,deposit,allTransactions,allTransactionsByAccountNo,allPayments};
