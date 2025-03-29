const dotenv = require("dotenv").config();
const express = require("express");
const { Sequelize } = require("sequelize");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const errorHandler = require("./middleWare/errorMiddleware");
const cookieParser = require("cookie-parser");
const db = require("./config/database"); // Import your Sequelize config

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes Middleware
app.use("/api/users", userRoute);

// Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});

// Error Middleware
app.use(errorHandler);

// Database Connection and Server Start
const startServer = async () => {
  try {
    // Test database connection
    await db.authenticate();
    console.log("Database connection established");
    
    // Sync models with database
    await db.sync({ alter: true }); // Use { force: true } only for development!
    console.log("Database synchronized");
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to database:", error);
    process.exit(1);
  }
};

startServer();