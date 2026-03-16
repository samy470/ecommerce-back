const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const { userController, productController, orderController } = require('./controllers/controllers');
const { authMiddleware } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Auth routes
app.post('/api/auth/register', userController.register);
app.post('/api/auth/login', userController.login);

// User routes
app.get('/api/user/profile', authMiddleware, userController.getProfile);
app.put('/api/user/profile', authMiddleware, userController.updateProfile);

// Product routes
app.get('/api/products', productController.getProducts);
app.get('/api/products/:id', productController.getProductById);
app.post('/api/products', authMiddleware, productController.createProduct);
app.put('/api/products/:id', authMiddleware, productController.updateProduct);
app.delete('/api/products/:id', authMiddleware, productController.deleteProduct);

// Order routes
app.post('/api/orders', authMiddleware, orderController.createOrder);
app.get('/api/orders/myorders', authMiddleware, orderController.getUserOrders);
app.get('/api/orders', authMiddleware, orderController.getAllOrders);
app.put('/api/orders/:id', authMiddleware, orderController.updateOrderStatus);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));