const express = require("express");
const app = express();
const cors = require("cors")
//require('dotenv').config({ path: './TEST.env' });
const designRouter = require("C:/Users/sw3/source/repos/PDM/server/designRouter");
const user = require("C:/Users/sw3/source/repos/PDM/server/userRouter");

//middleware
app.use(cors({
    origin: "http://localhost:3000", // Allow only frontend origin
    credentials: true // Allow cookies and authentication headers
}));
app.use(express.json());// req.body

//Routes
app.use(user);
app.use(designRouter);

app.listen(5000, () => {
    console.log("server has started on port 5000")
})

