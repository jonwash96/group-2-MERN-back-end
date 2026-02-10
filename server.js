//* MNT
require('dotenv').config();
require('./db/connection.js');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const testAuthRoutes = require('./controllers/test-jwt')
const authRoutes = require('./controllers/auth')
const userRoutes = require('./controllers/user');
const expenseRoutes = require("./controllers/expenses.js");
const verifyToken = require('./middleware/verify-token');

//* VAR
const PORT = process.env.PORT || 3009;

//* APP
const app = express();

//* MID
app.use(cors());
app.use(express.json());
app.use(logger('dev'));

//* ROUTE
app.get("/", (req, res) => {
  res.status(201).json({
    message: "This is the home route",
  });
});

app.use('/test-jwt', testAuthRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use("/expenses", expenseRoutes);

// AUTHENTICATED ROUTES
app.use(verifyToken);


//* LISTEN
app.listen(PORT, () => console.log(`Server Running on Port ${PORT}. Access at`, [`http://localhost:${PORT}`]));