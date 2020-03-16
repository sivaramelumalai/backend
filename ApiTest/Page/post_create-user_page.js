const supertest = require('supertest')
const api = supertest(require("../../app"))

const createUser = async (data) => api.post('/users/create/customer')
.send(data)
module.exports = { createUser}