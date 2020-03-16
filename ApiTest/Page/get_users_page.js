
const supertest = require('supertest')
const api = supertest(require("../../app"))

const users = (data) => api.get('/users')
.set('Authorization','bearer ' + data)

module.exports = { users }