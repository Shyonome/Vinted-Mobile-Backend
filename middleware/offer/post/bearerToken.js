const User = require('../../../models/User.js');
const Offer = require('../../../models/Offer.js');

const bearerToken = async (request, response, next) => {
    try {
        if (request.headers.authorization) {
            const bearerToken = request.headers.authorization.replace("Bearer ", "");

            if (bearerToken) {
                const userIdentity = await User.findOne({ token: bearerToken });
                userIdentity ? request.userIdentity = userIdentity :
                response.status(400).json({ message: { error: 'access denied' } });
            }
            return next();
        } else {
            response.status(400).json({ message: { error: 'access denied' } });
        }
       
   } catch (error) {
       return response.status(400).json({ message: { error: error.message } });
   }
};
  
module.exports = bearerToken;