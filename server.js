const http = require('http');
const app = require('./app');


const Port = process.env.PORT || 3002;



const server = http.createServer(app);

//const  rediClient = redis.createClient(redis_Port)

server.listen(Port,()=>{
    console.log('listening to the server port : 3002');
});