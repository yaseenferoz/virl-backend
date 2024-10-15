// app.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON data
app.use(express.json());

// Import and use routes (we'll define these soon)
// app.use('/api/auth', require('./routes/auth'));  // Authentication route
// app.js
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
// app.js
app.use('/api/test',(req,res)=>{
    return res.status(200).json({
        message:"Server is Up and running"
    })
});
const vendorRoutes = require('./routes/vendorRoutes');
app.use('/api/vendor', vendorRoutes);
// app.js
const sharedRoutes = require('./routes/sharedRoutes');
app.use('/api/shared', sharedRoutes);
// app.js
const customerRoutes = require('./routes/customerRoutes');
app.use('/api/customer', customerRoutes);
// app.js
const collectorRoutes = require('./routes/collectorRoutes');
app.use('/api/collector', collectorRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
