const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({origin: 'http://localhost:5173'}));


app.use('/api/auth', require('./routes/auth'));
app.use('/api/logs', require('./routes/logs'));


app.listen(process.env.PORT || 3000, () => {
    connectDB();
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});