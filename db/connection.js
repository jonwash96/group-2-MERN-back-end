const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', ()=>console.log("Connected to MongoDB"));
mongoose.connection.on('error', ()=>console.log("Error Connecting to MongoDB"));