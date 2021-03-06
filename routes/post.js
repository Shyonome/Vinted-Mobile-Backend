const { response, request } = require('express');
const express = require('express');
const router = express.Router();

const cloudinary = require("cloudinary").v2;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require('../models/User.js');
const Offer = require('../models/Offer.js');
const Transaction = require('../models/Transaction.js');

const isRegistered = require('../middleware/signup/isRegistered.js');
const createAccount = require('../middleware/signup/createAccount.js');
const bearerToken = require('../middleware/offer/post/bearerToken.js');
const publishOffer = require('../middleware/offer/post/publishOffer.js');

router.post('/user/signup', isRegistered, createAccount, async (request, response) => {
    try {
        const displayAccount = await User.findOne({ email: request.fields.email });
        response.status(200).json({
            message: "Account Succesfully Created !",
            _id: displayAccount._id,
            token: displayAccount.token,
            account: displayAccount.account,
        });
    } catch (error) {
        response.status(400).json({ message: { error:  error.message } });
    }
});

router.post('/user/login', async (request, response) => {
    try {
        if (request.fields.email && request.fields.password) {
            const seekAccount = await User.findOne({ email: request.fields.email });
            if (seekAccount) {
                const findHash = SHA256(request.fields.password + seekAccount.salt).toString(encBase64);
                findHash === seekAccount.hash ? response.status(200).json(seekAccount) :
                response.status(401).json({ message: { error: "Unauthorized" } });
            } else {
                response.status(400).json({ message: { error: "No account was found" } });
            }
        } else {
            response.status(400).json({ message: { error: "Missing email and/or password" } });
        }
    } catch (error) {
        response.status(400).json({ message: { error:  error.message } });
    }
});

router.post('/offer/publish', bearerToken, publishOffer,  async (request, response) => {
    try {

        const seekOffer = await Offer.findOne({
            product_name: request.fields.title,
            product_description: request.fields.description,
            product_price: request.fields.price,
            product_details: [
                { MARQUE: request.fields.brand },
                { TAILLE: request.fields.size },
                { ??TAT: request.fields.condition },
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

        response.status(200).json({
            message: "offer published !",
            _id: seekOffer && seekOffer._id,
            product_name: request.fields.title,
            product_description: request.fields.description,
            product_price: request.fields.price,
            product_details: [
                { MARQUE: request.fields.brand },
                { TAILLE: request.fields.size },
                { ??TAT: request.fields.condition },
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
            created: "seekOffer.created && seekOffer.created"
        });
    } catch (error) {
        response.status(400).json({ message: { error:  error.message } });
    }
});

router.post('/update', async (request, response) => {

    try {

        const toUpdate = await User.findOne({token: request.headers.authorization.replace("Bearer ", "")});

        console.log(toUpdate);

        if (toUpdate.email) {
            toUpdate.email = request.fields.email;
        }
        
        if (toUpdate.username) {
            toUpdate.username = request.fields.username;
        }
        
        if (toUpdate.password) {
            toUpdate.password = request.fields.password;
        }

        if (request.files.picture) {
            const pictureToUpload = request.files.picture.path;
            request.pictureToUpload = await cloudinary.uploader.upload(pictureToUpload)
            toUpdate.account.avatar = request.pictureToUpload;
        }

        if (toUpdate.email || toUpdate.username || toUpdate.password || toUpdate.picture) {
            await toUpdate.save();
        } else {
            response.status(200).json({message: "Nothing saved"});
        }

        response.status(200).json({message: "task successfully updated"});

    } catch (error) {

        response.status(400).json({ message: error.message });

      }

});

router.post('/profile', async (request, response) => {

    try {

        const toGet = await User.findOne({token: request.headers.authorization.replace("Bearer ", "")});

        response.status(200).json(toGet);

    } catch (error) {

        response.status(400).json({ message: error.message });

      }

});

router.post("/payment", async (request, response) => {
    try {
        const stripeResponse = await stripe.charges.create({
            amount: request.fields.amount * 100,
            description: request.fields.description,
            currency: "eur",
            source: request.fields.token,
        });
        
        if (stripeResponse.status === "succeeded") {
            response.status(200).json({ message: "Paiement valid??" });
        } else {
            response.status(400).json({ message: "An error occured" });
        }

        const newTransaction = new Transaction({
            annonce: "6193d609d77fbfe9b986948a",
            owner: request.fields.ownerId,
        });

        newTransaction.save();
    } catch (error) {
        response.status(400).json({ message: { error:  error.message } });
    }
});

module.exports = router;