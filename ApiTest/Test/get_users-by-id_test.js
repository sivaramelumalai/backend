const expect = require('chai').expect
const chai  = require('chai')
chai.use(require('chai-json-schema'))

const page = require('../Page/get_user-by_id_page')
const schema = require('../Schema/get_users-by-id_schema.json')
const token  = require('../Token/loginToken.json')
const data = require('../Data/get_users-id_data.json')
const id = data.id
const user_token = token.token
describe("userOperations | createUser",  ()=> {
    
    it('Get a user by their Id | positive testcase',async() => {
        const response = await page.usersById(token.correct.token,56)
        console.log(user_token+ ","+ id)
        expect(response.status).to.equal(200)
        expect(response.body).to.jsonSchema(schema.positive)
    })

    it('Get a user by their Id | negative test case | wrong user id ',async() => {
        const response = await page.usersById(token.correct.token,data.invalid.id)
        console.log(user_token+ ","+ id)
        expect(response.status).to.equal(404)
        expect(response.body).to.jsonSchema(schema.negative)
    })

    it('Get a user by their Id | negative test case | wrong auth token',async() => {
        const response = await page.usersById(token.fake.token,data.exsisting.id)
        console.log(user_token+ ","+ id)
        expect(response.status).to.equal(403)
        expect(response.body).to.jsonSchema(schema.negative)
    })

})

