const expect = require('chai').expect
const chai  = require('chai')
chai.use(require('chai-json-schema'))
const randomstring = require("randomstring");

const page = require('../Page/post_create-user_page')
const schema = require('../Schema/post_create-user_schema.json')
const data = require('../Data/post_create-user_data')
const email = randomstring.generate({
    length: 12,
    charset: 'alphabetic'
  });

  const name = randomstring.generate({
    length: 12,
    charset: 'alphabetic'
  });
  
  var new_user = {"name":name,
                    "email":email+"@gmail.com",
                    "password":"1234567890"
                }

describe("userOperations | createUser ",  ()=> {
    
    it('Create new user | positive testCase ',async() => {
        const response = await page.createUser(new_user)
        console.log(response.body)
        expect(response.status).to.equal(200)
        expect(response.body).to.jsonSchema(schema)
    })

    it('Create new user | negative test case ',async() => {
        const response = await page.createUser(data.negative)
        console.log(response.status)
        expect(response.status).to.equal(400)
        expect(response.body).to.jsonSchema(schema)
    })

})

