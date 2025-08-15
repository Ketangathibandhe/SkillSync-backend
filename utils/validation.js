const validator = require('validator')
const validateSignUpData = (req)=>{
    const {firstName ,lastName , emailId, password} =req.body;
    if(!firstName||!lastName){
        throw new Error("Enter valid user Name!");
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("Plz Enter A Valid emali Id!")
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Enter a strong password")
    }
}


module.exports={validateSignUpData}