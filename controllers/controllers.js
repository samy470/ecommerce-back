const { userService, productService, orderService } = require('../services/services');

// User Controllers
const userController = {
  register: async (req, res) => {
    try {
      const result = await userService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await userService.getProfile(req.user.id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

// Product Controllers
const productController = {
  getProducts: async (req, res) => {
    try {
      const result = await productService.getProducts(req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProductById: async (req, res) => {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json(product);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  createProduct: async (req, res) => {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      await productService.deleteProduct(req.params.id);
      res.json({ message: 'Product deleted' });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
};

// Order Controllers
const orderController = {
  createOrder: async (req, res) => {
    try {
      const order = await orderService.createOrder(req.body, req.user.id);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getUserOrders: async (req, res) => {
    try {
      const orders = await orderService.getUserOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllOrders: async (req, res) => {
    try {
      const orders = await orderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
      res.json(order);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
};

module.exports = {
  userController,
  productController,
  orderController
};