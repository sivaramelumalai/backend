const expect = require('chai').expect
const chai  = require('chai')
chai.use(require('chai-json-schema'))

const page = require('../Page/get_users_page')
const schema = require('../Schema/get_users_schema.json')
const token  = require('../Token/loginToken.json')
const user_token = token.token
describe("userOperations | createUser",  ()=> {
    
    it('Get all users | positive testcase',async() => {
        const response = await page.users(token.correct.token)
        console.log(user_token)
        expect(response.status).to.equal(200)
        expect(response.body).to.jsonSchema(schema.positive)
    })

    it('Get all users | negative testcase | wrong auth token',async() => {
        const response = await page.users(token.fake.token)
        console.log(user_token)
        expect(response.status).to.equal(403)
        expect(response.body).to.jsonSchema(schema.negative)
    })

})

