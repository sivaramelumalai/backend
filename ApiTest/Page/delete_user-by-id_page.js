
const supertest = require('supertest')
const api = supertest(require("../../app"))

const deleteUsersById = (data,id) => api.delete('/users/'+ id)
.set('Authorization','bearer ' + data)

module.exports = { deleteUsersById }