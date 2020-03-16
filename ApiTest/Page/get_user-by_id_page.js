
const supertest = require('supertest')
const api = supertest(require("../../app"))

const usersById = (data,id) => api.get('/users/'+ id)
.set('Authorization','bearer ' + data)

module.exports = { usersById }