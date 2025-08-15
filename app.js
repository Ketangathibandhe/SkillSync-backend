const express = require("express");
const { connectDB } = require("./config/database");
const authRouter = require('./routes/auth')
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use('/',authRouter);
app.use(cookieParser());

connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(3000, () => {
      console.log("Listening on port 3000...");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!");
  });
