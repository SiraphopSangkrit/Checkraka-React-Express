// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const path = require('path');
const port = process.env.PORT || 3000;

// Initialize MongoDB connection
const db = require('./Configs/mongodb');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(morgan("tiny"));
// Routes

const categoryRoutes = require('./Routes/CategoryRoute');
app.use('/api/categories', categoryRoutes);
const brandRoutes = require('./Routes/BrandRoute');
app.use('/api/brands', brandRoutes);

// Handle MongoDB connection events
db.on('connected', () => {
  console.log('MongoDB connected successfully');
});

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});