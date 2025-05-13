const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
// const ApiKey = require('../models/apiKeyModel');


function verifyToken(req, res, next) {
    // return res.status(200).json({ message: 'Admin access granted' });

  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  try {
  

    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);  
    var requestEmail =  req.query.email;
    if (!requestEmail){

        requestEmail = req.body.email;
    }
    console.log("requestEmail",requestEmail,"decoded.email",decoded.email);
    if (requestEmail!=decoded.email){
        console.log("email not matched");
        console.log(decoded.email,req.body.email);
        return res.status(401).json({ error: 'Invalid email' });
    }
    else{
        req.user = decoded;
        next();
    }
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {verifyToken};
// 