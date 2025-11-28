const express = require('express')
const app = express()
require("dotenv").config()
let port = process.env.PORT;

app.get("/", (req, res) => {
    res.status(200).json({"message": "Hello World!"})
})
app.listen(port, () => {
    console.log(`Server Running on ${port}`)
})