import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.ts';
import Product from '../models/Product.ts';
import Order from '../models/Order.ts';

// Users
export const register = async (req: Request, res: Response): Promise<void | Response> => {
  const { password, ...rest } = req.body;
  const existingUser = await User.findOne({ email: rest.email });
  if (existingUser) return res.status(401).json({ message: 'Email already exists' });

  const user = new User({ ...rest, password: await bcrypt.hash(password, 10) });
  await user.save();

  const id = user._id.toString();
  const token = jwt.sign({ id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.json({ user: { id, name: user.name, email: user.email }, token });
};

export const login = async (req: Request, res: Response): Promise<void | Response> => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const id = user._id.toString();
  const token = jwt.sign({ id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.json({ user: { id, name: user.name, email: user.email }, token });
};

export const getProfile = async (req: Request, res: Response): Promise<void | Response> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  let userId: string;
  try {
    userId = (jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string }).id;
  } catch {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  const user = await User.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  let userId: string;
  try {
    userId = (jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string }).id;
  } catch {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  const { password, ...rest } = req.body;
  const update = password ? { ...rest, password: await bcrypt.hash(password, 10) } : rest;
  const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).select('-password');
  res.json(user);
};

// Products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const { search, category, page = '1', limit = '10' } = req.query as Record<string, string>;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (category && category !== 'all') filter.category = category;

  const products = await Product.find(filter)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);
  const total = await Product.countDocuments(filter);

  res.json({ products, total, page: pageNum, pages: Math.ceil(total / limitNum) });
};

export const getProductById = async (req: Request, res: Response): Promise<void | Response> => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

export const createProduct = async (req: Request, res: Response): Promise<void | Response> => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
};

export const updateProduct = async (req: Request, res: Response): Promise<void | Response> => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response): Promise<void | Response> => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// Orders
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  let userId: string;
  try {
    userId = (jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string }).id;
  } catch {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  const { items, shippingAddress, paymentMethod } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: 'Your cart is empty' });
    return;
  }
  const verifiedItems = [];
  let subtotal = 0;
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      res.status(400).json({ message: 'Invalid quantity' });
      return;
    }
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    if (product.stock < item.quantity) {
      res.status(400).json({ message: `Not enough stock for ${product.name}` });
      return;
    }
    subtotal += product.price * item.quantity;
    verifiedItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    });
  }
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const order = new Order({
    items: verifiedItems,
    total,
    shippingAddress,
    paymentMethod,
    user: userId,
  });

  await order.save();

  for (const item of verifiedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  res.status(201).json(await order.populate('user', 'name email'));
};

export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  let userId: string;
  try {
    userId = (jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string }).id;
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }



  const orders = await Order.find({ user: userId }).sort('-createdAt').populate('items.product');
  res.json(orders);
};

export const getOrdersDetails = async (req: Request, res: Response): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  let userId: string;
  try {
    userId = (jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string }).id;
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  const order = await Order.findOne({_id: req.params.id,user: userId,}).populate('items.product');

  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  res.json(order);
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void | Response> => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};
