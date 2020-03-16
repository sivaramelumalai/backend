const expect = require('chai').expect
const chai  = require('chai')
chai.use(require('chai-json-schema'))

const page = require('../Page/post_user-login_page')
const schema = require('../Schema/post_user-login_schema.json')
const data = require('../Data/post_user-login_data.json')

describe("userOperations | userlogin ",  ()=> {
    
    it('user login | positive test case',async() => {
        const response = await page.userLogin(data.correct)
        expect(response.status).to.equal(200)
        expect(response.body).to.jsonSchema(schema.positive)
    })

    it('user login | negative test case | wrong password',async() => {
        const response = await page.userLogin(data.wrong_password)
        expect(response.status).to.equal(400)
        expect(response.body).to.jsonSchema(schema.negative)
    })

    it('user login | negative test case | wrong email',async() => {
        const response = await page.userLogin(data.wrong_email)
        expect(response.status).to.equal(404)
        expect(response.body).to.jsonSchema(schema.negative)
    })

    it('user login | negative test case | empty email field',async() => {
        const response = await page.userLogin(data.empty_email)
        expect(response.status).to.equal(400)
        expect(response.body).to.jsonSchema(schema.negative)
    })

})
