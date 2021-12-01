const { Router, request, response } = require('express');
const express = require('express');
const router = express.Router();

const Offer = require('../models/Offer.js');

router.get("/", async (request, response)=>{
    try {
        response.status(200).json("Welcome Home 😉")
    } catch (error) {
        response.status(400).json({ message: { error: error.message } });
    }
});

router.get('/offers', async (request, response) => {
    try {
        let filters = {};

        if (request.query.title) {
          filters.product_name = new RegExp(request.query.title, "i");
        }

        if (request.query.priceMin) {
          filters.product_price = {
            $gte: request.query.priceMin,
          };
        }

        if (request.query.priceMax) {
          if (filters.product_price) {
            filters.product_price.$lte = request.query.priceMax;
          } else {
            filters.product_price = {
              $lte: request.query.priceMax,
            };
          }
        }

        let sort = {};

        if (request.query.sort === "price-desc") {
          sort = { product_price: -1 };
        } else if (request.query.sort === "price-asc") {
          sort = { product_price: 1 };
        }

        let page;
        if (Number(request.query.page) < 1) {
          page = 1;
        } else {
          page = Number(request.query.page);
        }

        let limit = Number(request.query.limit);

        const offers = await Offer.find(filters)
          .populate({
            path: "owner",
            select: "account",
          })
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit);

        const count = await Offer.countDocuments(filters);

        response.status(200).json({
          count: count,
          offers: offers,
        });
    } catch (error) {
        response.status(400).json({ message: { error: error.message } });
    }
});

router.get('/offer/:id', async (request, response) => {
    try {
        const storedOffer = await Offer.findById(request.params.id).populate("owner");
        response.status(200).json(storedOffer);
    } catch (error) {
        response.status(400).json({ message: { error: error.message } });
    }
});

module.exports = router;