const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  { name: 'Laptop', price: 999.99, description: 'High performance laptop', category: 'electronics', stock: 10, image: 'https://via.placeholder.com/200', rating: 4.5, reviews: 25 },
  { name: 'T-Shirt', price: 19.99, description: 'Cotton t-shirt', category: 'clothing', stock: 50, image: 'https://via.placeholder.com/200', rating: 4, reviews: 15 },
  { name: 'Book', price: 14.99, description: 'Bestseller novel', category: 'books', stock: 100, image: 'https://via.placeholder.com/200', rating: 5, reviews: 30 }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
  .then(async () => {
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log('Database seeded');
    process.exit();
  });