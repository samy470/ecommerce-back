const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// User Services
const userService = {
  // Register
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new Error('Email already exists');
    
    const user = new User(userData);
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    return { user: { id: user._id, name: user.name, email: user.email }, token };
  },

  // Login
  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid credentials');
    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    return { user: { id: user._id, name: user.name, email: user.email }, token };
  },

  // Get Profile
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  },

  // Update Profile
  async updateProfile(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId, 
      { $set: updateData },
      { new: true }
    ).select('-password');
    return user;
  }
};

// Product Services
const productService = {
  // Get all products
  async getProducts(query = {}) {
    const { search, category, page = 1, limit = 10 } = query;
    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(filter);
    
    return {
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    };
  },

  // Get single product
  async getProductById(id) {
    const product = await Product.findById(id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  // Create product (admin)
  async createProduct(productData) {
    const product = new Product(productData);
    await product.save();
    return product;
  },

  // Update product (admin)
  async updateProduct(id, updateData) {
    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!product) throw new Error('Product not found');
    return product;
  },

  // Delete product (admin)
  async deleteProduct(id) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new Error('Product not found');
    return product;
  }
};

// Order Services
const orderService = {
  // Create order
  async createOrder(orderData, userId) {
    const order = new Order({
      ...orderData,
      user: userId
    });
    await order.save();
    
    // Update stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }
    
    return order.populate('user', 'name email');
  },

  // Get user orders
  async getUserOrders(userId) {
    return await Order.find({ user: userId })
      .sort('-createdAt')
      .populate('items.product');
  },

  // Get all orders (admin)
  async getAllOrders() {
    return await Order.find()
      .sort('-createdAt')
      .populate('user', 'name email');
  },

  // Update order status (admin)
  async updateOrderStatus(orderId, status) {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!order) throw new Error('Order not found');
    return order;
  }
};

module.exports = {
  userService,
  productService,
  orderService
};