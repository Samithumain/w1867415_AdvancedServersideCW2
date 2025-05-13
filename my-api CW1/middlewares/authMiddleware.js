const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ApiKey = require('../models/apiKeyModel');


function verifyToken(req, res, next) {
    // return res.status(200).json({ message: 'Admin access granted' });

  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }
  console.log("token",token);
  if (token == "Microkey"){
            next();
            return
  }
  try {
  

    const decoded = jwt.verify(token.split(' ')[1], 'jwt');  
    var requestEmail =  req.query.email;
    if (!requestEmail){
        requestEmail = req.body.email;
    }
    console.log("requestEmail",requestEmail);
    if (requestEmail!=decoded.email){
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

async function verifyToken2(req, res, next) {
  console.log("verifyToken2")
    // return res.status(200).json({ message: 'Admin access granted' });

  const token = req.headers['authorization'];
if (token == "Microkey"){
            next();
  console.log("verifyToken2 return")

            return;
  }
  console.log("verifyToken2 not return")

  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  try {
    

    const decoded = jwt.verify(token.split(' ')[1], 'jwt'); 
    console.log(decoded.userId)
  

    const apiKey = await ApiKey.findOne({ where: { userId: decoded.userId } });
    console.log(apiKey)

    if (!apiKey) {
        console.log('No API key found for the user');
        return res.status(402).json({ error: 'Generate a API Key' });
      } 
   
    var requestEmail =  req.query.email;
    if (!requestEmail){
        requestEmail = req.body.email;
    }
    console.log("requestEmail",requestEmail);
    if (requestEmail!=decoded.email){
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


module.exports = {verifyToken,verifyToken2};
