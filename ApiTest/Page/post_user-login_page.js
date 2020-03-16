const supertest = require('supertest')
const api = supertest(require("../../app"))

const userLogin = async (data) => api.post('/users/login')
.send(data)
module.exports = { userLogin}