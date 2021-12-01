const Offer = require('../../../models/Offer.js');

const seekOffer = async (request, response, next) => {
    try {
       
        const seekOffer = await Offer.findOne({
            product_name: request.fields.title,
            product_description: request.fields.description,
            product_price: request.fields.price,
            product_details: [
                { MARQUE: request.fields.brand },
                { TAILLE: request.fields.size },
                { ÉTAT: request.fields.condition },
                { COULEUR: request.fields.color },
                { EMPLACEMENT: request.fields.city },
            ],
            owner: {
                account: {
                    username: request.userIdentity.account.username,
                    phone: request.userIdentity.account.phone,
                    avatar: request.userIdentity.account.avatar
                },
                _id: request.userIdentity._id,
            },
            product_image: request.pictureToUpload,
        });

        if (seekOffer) {
            return next();
        } else {
            return response.status(400).json({ message: { error: "No corresponding offer was found because of a missing key" } });
        }
   } catch (error) {
       return response.status(400).json({ message: { error: error.message } });
   }
};
  
module.exports = seekOffer;