const User = require('../../models/User.js');

const isRegistered = async (request, response, next) => {
    try {
        if (request.fields.username && request.fields.email && request.fields.phone && request.fields.password) {
            const checkEmailAccount = await User.findOne({ email: request.fields.email });
        if (!checkEmailAccount) {
            return next();
        } else {
            return response.status(400).json({ message: { error: 'email already exists or username is invalid' } });
        }
      } else {
        return response.status(400).json({ message: { error: 'Not all user informations are provided' } });
      }
   } catch (error) {
       return response.status(400).json({ message: { error: error.message } });
   }
};
  
module.exports = isRegistered;