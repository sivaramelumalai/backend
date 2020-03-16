const express = require('express');
const app = express();
const userroutes = require('./api/users');
const accountroutes = require('./api/accounts')
const transactionroutes = require('./api/transactions')
const logincheck = require('./middlewares/loginMdiddleware')
const morgan = require('morgan');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const redis = require('redis')
const cors   = require('cors')

const redis_Port = process.env.redis_Port || 6379;
const redisClient = redis.createClient(redis_Port);

app.use(morgan('dev'));
app.use(cors())
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-control-Allow-Headers','*');
    if(req.method === 'OPTIONS'){
        req.header('Access-Control-Allow-Origin','*');
        return res.status(200).json({message:'got'});
    }else{
        return next();
    } 
});
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));
app.use(cookieParser(process.env.COOKIE_SECRET))
app.get('/', (request, response) => {
    response.json({ info: ' Bank application using Node.js, Express, and Postgres API' })
  });

function cache(req, res, next) {
    const { id } = req.params;
    redisClient.get(id, (error, cachedData) => {
        if (error) throw error;
        if (cachedData != null) {
            res.json(JSON.parse(cachedData));
        } else {
        next();
        }
    });
}
app.use('*', (req, res, next) => {
    console.log('NJNJNJN',req.path, req.params)
    next()
})
// user actions
app.post('/users/create/:role',userroutes.createUser);
app.post('/users/create-pin/:id',userroutes.createUserPin);
app.post('/users/login',userroutes.userLogin);
// app.post('/secret',userroutes.createSecret);
app.post('/otp-gen/:id',userroutes.optGeneration);
app.post('/opt-verification/:id', userroutes.optVerification)
app.get('/users/role',logincheck,userroutes.getUserrole);
app.get('/users',logincheck,userroutes.getUsers);
app.get('/users/:id',logincheck,cache,userroutes.getUserById);
app.get('/users/accounts/:id',logincheck,accountroutes.getAccountByUserId)
app.delete('/users/:id',logincheck,userroutes.deleteUserById)
// account actions
app.post('/accounts/create',logincheck,accountroutes.createAccount)
app.get( '/accounts/pending',logincheck,accountroutes.accountsToBeCreated)
app.get('/accounts',logincheck,accountroutes.getAccounts)
app.get('/accounts/:type',logincheck,accountroutes.getAccountsByType)
app.get('/accounts/:acc_no',logincheck,accountroutes.getAccountByAccountNo)
app.get('/accounts/balance/:acc_no',logincheck,accountroutes.getAccountBalance)
// transactions debit and credit
app.put('/transaction/credit/:type',logincheck,transactionroutes.creditMoney)
app.put('/transaction/withdrawal',logincheck,transactionroutes.withdrawal)
app.put('/transaction/deposit/:type',transactionroutes.deposit)
app.get('/transaction',logincheck,transactionroutes.allTransactions)
app.get('/transaction/payments/:id',logincheck,transactionroutes.allPayments)
app.get('/transaction/:num',logincheck,transactionroutes.allTransactionsByAccountNo)


app.use((req,res, next) => {
    const error = new Error('not found');
    error.status = 404;
    next(error);
});
app.use((error,req,res,next) => {
    res.status(500).json({error: JSON.stringify(error)});
});
module.exports = app;
