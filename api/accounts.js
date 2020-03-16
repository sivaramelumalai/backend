const express = require('express')
const router = express.Router();
const jwt  = require('jsonwebtoken')


const Pool = require('pg').Pool
const pool = new Pool({
    user: 'bankuser',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
});

const accountsToBeCreated = async (request,response)=>{
    jwt.verify(request.token, 'privatekey', async(err, authorizedData) => {
        if(err){
            console.log('ERROR: Could not connect to the protected route');
            response.sendStatus(403);
        }else{
            const {rows} = await pool.query('SELECT role FROM users WHERE id = $1',[authorizedData.user.user_id])
            if(rows[0].role == "banker"){
                let status = "true"
                pool.query('SELECT * FROM users WHERE acc_created IS NULL ',(error, results) => {
                    if (error) {
                        throw error
                    }
                    response.status(200).json(results.rows)
                    console.log(results.rows)
                })
            }else{
                response.status(403).send('Unauthorised user')
            }
        }

    })
}


const createAccount = async (request, response,next) => {

    jwt.verify(request.token, 'privatekey', async(err, authorizedData) => {
        if(err){
          console.log('ERROR: Could not connect to the protected route');
          response.sendStatus(403);
        }else{
            
            const { id,acc_no,type,roi,amount } = request.body
            const {rows} = await pool.query('SELECT role FROM users WHERE id = $1',[authorizedData.user.user_id])
            console.log(rows[0].role)
            console.log(request.body)
            if(rows[0].role == "banker"){
                console.log("here 1")
                pool.query('INSERT INTO accounts ( account_no, acc_type,user_id, rate_of_interest,amount) VALUES ($1, $2,$3,$4,$5)', [acc_no,type, id, roi,amount], (error, results) => {
                    if (error) {
                    throw error
                    }
                    
                })
                pool.query('UPDATE users SET acc_created =  $2 WHERE id = $1', [id, 'true'], (error, results) => {
                    if (error) {
                        throw error
                    }
                    response.status(200).send(`account created with ID: ${id}`)
                })
            }else{
                response.status(401).send('Unauthorised user')
            }  
        }
    })

};

const getAccounts = async (request, response) => {
    jwt.verify(request.token, 'privatekey', async(err, authorizedData) => {
        if(err){
          console.log('ERROR: Could not connect to the protected route');
          response.sendStatus(403);
        }else{
            const {rows} = await pool.query('SELECT role FROM users WHERE id = $1',[authorizedData.user.user_id])
            if(rows[0].role == "banker"){
                pool.query('SELECT * FROM accounts ORDER BY account_no ASC', (error, results) => {
                    if (error) {
                    throw error
                    }
                    response.status(200).json(results.rows)
                    console.log(results.rows)
                })
            }else{
                response.status(401).send('Unauthorised user')
            } 
        }
    })
};

const getAccountsByType = async (request, response) => {
    const {type} = request.params
    jwt.verify(request.token, 'privatekey', async(err, authorizedData) => {
        if(err){
          console.log('ERROR: Could not connect to the protected route');
          response.sendStatus(403);
        }else{
            const {rows} = await pool.query('SELECT role FROM users WHERE id = $1',[authorizedData.user.user_id])
            if(rows[0].role == "banker"){
                pool.query('SELECT * FROM accounts INNER JOIN users ON users.id = accounts.user_id  WHERE accounts.acc_type = $1',[type], (error, results) => {
                    if (error) {
                    throw error
                    }
                    response.status(200).json(results.rows)
                    console.log(results.rows)
                })
            }else{
                response.status(401).send('Unauthorised user')
            } 
        }
    })
};

const getAccountByAccountNo = async (request, response ) => {
    jwt.verify(request.token, 'privatekey', async(err, authorizedData) => {
        if(err){
          console.log('ERROR: Could not connect to the protected route');
          response.sendStatus(403);
        }else{
            const acc_no = parseInt(request.params.acc_no)
            const {rows} = await pool.query('SELECT role FROM users WHERE id = $1',[authorizedData.user.user_id])
            if(rows[0].role == "banker"){
                pool.query('SELECT * FROM accounts WHERE account_no =$1 ',[acc_no],(error, results) => {
                    if (error){
                        throw error
                    }
                    response.status(200).json(results.rows);
                });

            }else{
                response.status(401).send('Unauthorised user')
            } 
        }
    })

}

const getAccountByUserId = async (request, response ) => {
    jwt.verify(request.token, 'privatekey', async(err, authorizedData) => {
        if(err){
          console.log('ERROR: Could not connect to the protected route');
          response.sendStatus(403);
        }else{
            const id = parseInt(request.params.id)
            const {rows} = await pool.query('SELECT role FROM users WHERE id = $1',[authorizedData.user.user_id])
            if(rows[0].role == "banker" || id == authorizedData.user.user_id){
                pool.query(' SELECT * FROM accounts INNER JOIN users ON users.id = accounts.user_id  WHERE accounts.user_id = $1 ',[id],(error, results) => {
                    if (error){
                        throw error
                    }
                
                    response.status(200).json(results.rows);
                })
            }else{
                response.status(401).send('Unauthorised user')
            }
        }
    })
    
}

const getAccountBalance = async  (request, response ) => {
    jwt.verify(request.token, 'privatekey', async(err, authorizedData) => {
        if(err){
          console.log('ERROR: Could not connect to the protected route');
          response.sendStatus(403);
        }else{
            const acc_no = parseInt(request.params.acc_no)
            const {rows} = await pool.query('SELECT role FROM users WHERE id = $1',[authorizedData.user.user_id])

            if(rows[0].role == "banker" || id == request.signedCookies.user_id){
                pool.query('SELECT amount FROM accounts WHERE account_no =$1 ',[acc_no],(error, results) => {
                    if (error){
                        throw error
                    }
                    response.status(200).json(results.rows);
                })
            }else{
                response.status(401).send('Unauthorised user')
            } 
        }
    })
    
}

const deleteAccountByAccountNo = async (request, response ) => {
    jwt.verify(request.token, 'privatekey', async(err, authorizedData) => {
        if(err){
          console.log('ERROR: Could not connect to the protected route');
          response.sendStatus(403);
        }else{
            const acc_no = parseInt(request.params.acc_no)
            const {rows} = await pool.query('SELECT role FROM users WHERE id = $1',[authorizedData.user.user_id])

            if(rows[0].role == "banker"){
                pool.query('DELETE FROM accounts WHERE account_no =$1 ',[acc_no],(error, results) => {
                    if (error){
                        throw error
                    }
                    response.status(200).send('deleted wow');  
                });
            }else{
                response.status(401).send('Please contact the bank officials ')
            }
        }
    })

};

// const getDateAndTransaction

module.exports ={createAccount,getAccounts,getAccountByAccountNo,getAccountsByType,
                     deleteAccountByAccountNo,getAccountBalance,getAccountByUserId,accountsToBeCreated}
 
