import express from 'express'
import type { Router } from 'express'
import { register, login, getProfile, updateProfile, getProducts, getProductById, createProduct, updateProduct, deleteProduct, createOrder, getUserOrders, getOrdersDetails, updateOrderStatus } from '../controller/Controller.ts'

export const router: Router = express.Router()

// auth
router.post('/register', register)
router.post('/login', login)

// profile
router.get('/getprofile', getProfile)
router.put('/updateprofile', updateProfile)

// product
router.get('/getproducts', getProducts)
router.get('/getproducts/:id', getProductById)
router.post('/createproduct', createProduct)
router.put('/updateproduct', updateProduct)
router.delete('/deleteproduct', deleteProduct)

// orders
router.get('/getuserorders', getUserOrders)
router.get('/getorderdetails/:id', getOrdersDetails)
router.post('/createorder', createOrder)
router.put('/updateorderstatus', updateOrderStatus)

