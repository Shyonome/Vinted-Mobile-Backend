const cloudinary = require("cloudinary").v2;

const Offer = require('../../../models/Offer.js');

const publishOffer = async (request, response, next) => {
    try {
       
        let pictureToUpload = undefined;
       
        if (request.files.picture) {
            pictureToUpload = request.files.picture.path;
            request.pictureToUpload = await cloudinary.uploader.upload(pictureToUpload)
        }

        if (String(request.fields.title).length > 50) {
            return response.status(400).json({ message: { error: "Too many characters in your title" } });
        }

        if (String(request.fields.description).length > 500) {
            return response.status(400).json({ message: { error: "Too many characters in your description" } });
        }
        
        if (Number(request.fields.price) > 100000) {
            return response.status(400).json({ message: { error: "Price too high" } });
        }

        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        
        const newOffer = new Offer({
            product_name: request.fields.title,
            product_description: request.fields.description, 
            product_price: Number(request.fields.price),
            product_details: [
                { MARQUE: request.fields.brand },
                { TAILLE: request.fields.size },
                { ÉTAT: request.fields.condition },
                { COULEUR: request.fields.color },
                { EMPLACEMENT: request.fields.city },
            ],
            owner: request.userIdentity,
            product_image: pictureToUpload ? request.pictureToUpload : undefined,
            created: date,
        });

        await newOffer.save();
       
        return next();
   } catch (error) {
       return response.status(400).json({ message: { error: error.message } });
   }
};
  
module.exports = publishOffer;