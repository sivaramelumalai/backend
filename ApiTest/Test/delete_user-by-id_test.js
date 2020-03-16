const expect = require('chai').expect
const chai  = require('chai')
chai.use(require('chai-json-schema'))

const page = require('../Page/delete_user-by-id_page')
const schema = require('../Schema/delete_user-by-id_schema.json')
const token  = require('../Token/loginToken.json')
const data = require('../Data/get_users-id_data.json')
const id = data.id
const user_token = token.token

describe("userOperations | createUser",  ()=> {
    
    it('Delete a user by their Id | positive testcase |',async() => {
        const response = await page.deleteUsersById(token.correct.token,data.exsisting.id)
        console.log(user_token+ ","+ id)
        expect(response.status).to.equal(200)
        expect(response.body).to.jsonSchema(schema)
    })

    it('Delete a user by their Id | negative testcase | invalid id',async() => {
        const response = await page.deleteUsersById(token.correct.token,data.invalid.id)
        console.log(user_token+ ","+ id)
        expect(response.status).to.equal(404)
        expect(response.body).to.jsonSchema(schema)
    })

    it('Delete a user by their Id | negative testcase | invalid auth token',async() => {
        const response = await page.deleteUsersById(token.fake.token,data.exsisting.id)
        console.log(user_token+ ","+ id)
        expect(response.status).to.equal(403)
        expect(response.body).to.jsonSchema(schema)
    })

})

