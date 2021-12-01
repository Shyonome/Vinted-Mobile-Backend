const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const cloudinary = require("cloudinary").v2;

const User = require('../../models/User.js');

const createAccount = async (request, response, next) => {
    try {
       const salt = uid2(16);
       const hash = SHA256(request.fields.password + salt).toString(encBase64);
       const token = uid2(16);
       let pictureToUpload = undefined;
       
       if (request.files.avatar) {
           pictureToUpload = request.files.avatar.path;
       }

       const newUser = new User({
           email: request.fields.email,
           account: {
             username: request.fields.username,
             phone: Number(request.fields.phone),
             avatar: pictureToUpload ? await cloudinary.uploader.upload(pictureToUpload) : undefined,
           },
           token: token,
           hash: hash,
           salt: salt
       });
        
       await newUser.save();
       
       return next();
   } catch (error) {
       return response.status(400).json({ message: { error: error.message } });
   }
};
  
module.exports = createAccount;