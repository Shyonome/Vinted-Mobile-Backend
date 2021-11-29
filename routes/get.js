const { Router } = require('express');
const express = require('express');
const router = express.Router();

router.get("/", async (request, response)=>{
    try {
        response.status(200).json("Welcome Home 😉")
    } catch (error) {
        response.status(400).json({ message: { error: error.message } });
        console.log("ERROR CATCHED =>", { message: { error: error.message } });
    }
});

module.exports = router;