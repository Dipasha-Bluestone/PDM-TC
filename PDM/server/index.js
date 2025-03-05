const express = require("express");
const app = express();
const cors = require("cors")
//require('dotenv').config({ path: './TEST.env' });
const designRouter = require("./designRouter");
const categories = require("./categoriesRouter.js");
const user = require("./userRouter");

//middleware
app.use(cors({
    origin: "http://localhost:3000", // Allow only frontend origin
    credentials: true // Allow cookies and authentication headers
}));
app.use(express.json());// req.body

//Routes
app.use(user);
app.use(designRouter);
app.use(categories);

app.listen(5000, () => {
    console.log("server has started on port 5000")
})

