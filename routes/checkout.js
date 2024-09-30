const express = require('express');
const router = express.Router();
const util = require('util');
const multer = require('multer');
const path = require('path');
const connection = require('../connect');

// Promisify connection.query for easier async/await handling
const query = util.promisify(connection.query).bind(connection);

// แสดงรายการในตะกร้า
router.get('/checkout/:AccountID', async (req, res) => {
   if (!req.session.loggedIn) {
      res.redirect('/login');
   } else {
      try {
         const { AccountID } = req.params;
         const cartItems = await query(`
            SELECT product.Image AS Image, product.ProductID, product.ProductName AS ProductName, cart_items.Quantity AS Quantity, product.Price AS Price
            FROM cart_items 
            JOIN product ON cart_items.ProductID = product.ProductID
            JOIN cart ON cart_items.CartID = cart.CartID
            WHERE cart.AccountID = ? AND cart.Status = 'pending'
            `, [AccountID]);

         const totalPrices = await query(`
               SELECT SUM(cart_items.Price) AS Price
               FROM cart_items 
               WHERE CartID = (SELECT CartID FROM cart WHERE AccountID = ? AND Status = 'pending');
            `, [AccountID]);

         //render to checkout
         res.render('checkout', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            Title: req.session.Title,
            AccountName: req.session.AccountName,
            CartItems: cartItems,
            TotalPrices: totalPrices
         })
            ;

      } catch (error) {
         console.error('Error fetching cart items:', error);
         res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้า');
      }
   }
});

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      // Save the file in the 'public/image/receipt' directory
      cb(null, 'public/image/receipt');
   },
   filename: (req, file, cb) => {
      // Use current timestamp as filename
      cb(null, Date.now() + path.extname(file.originalname));
   }
});

const upload = multer({ storage });

// File upload route
router.post('/upload/receipt', upload.single('filename'), (req, res) => {
   if (!req.file) {
      return res.status(400).send('No file uploaded.');
   }

   // Save path for database (excluding 'public' folder)
   const customerReceipt = path.join('image', 'receipt', req.file.filename).replace(/\\/g, '/');

   // Return the path that will be saved in the database
   res.json({ CustomerReceipt: customerReceipt });
});

//ordermaking
router.post('/checkout/processing', async (req, res) => {
   if (!req.session.loggedIn) {
      return res.redirect('/login');
   }
   try {
      const { AccountID, CustomerReceipt } = req.body;

      // Make orders
      const orderQuery = await query(`
           INSERT INTO orders (AccountID, CustomerReceipt, OrderStatus) 
           VALUES (?, ?, "Payment Checking");
       `, [AccountID, CustomerReceipt]);

      // Get orderID
      const orderID = orderQuery.insertId;

      // Query products to add to OrderDetails
      const cartItems = await query(`
         SELECT product.ProductID, cart_items.Quantity, product.Price
         FROM cart_items 
         JOIN product ON cart_items.ProductID = product.ProductID
         JOIN cart ON cart_items.CartID = cart.CartID
         WHERE cart.AccountID = ? AND cart.Status = 'pending'
         `, [AccountID]);

      var totalPrice = 0;
      console.log('total price',totalPrice)
      // Insert into OrderDetails and update stock
      for (const item of cartItems) {
         await query(`
             INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price)
             VALUES (?, ?, ?, ?);
         `, [orderID, item.ProductID, item.Quantity, item.Price]);

         await query(`
            UPDATE product SET Stock = Stock - ? 
            WHERE ProductID = ?;
        `, [item.Quantity, item.ProductID]);

         totalPrice += item.Price * item.Quantity;  // Calculate total based on quantity and price
      }

      // Update total price in orders table
      console.log('final total price',totalPrice)
      await query(`UPDATE orders SET totalPrice = ? WHERE OrderID = ?`, [totalPrice, orderID]);

      // Update cart status to confirmed
      await query(`
         UPDATE cart
         SET Status ='confirmed'
         WHERE CartID = (SELECT CartID FROM cart WHERE AccountID = ? AND Status = 'pending');
     `, [AccountID]);

      res.send('Orders Completed'); // Respond with a success message

   } catch (error) {
      console.error('Error processing order:', error);
      res.status(500).send('เกิดข้อผิดพลาดในการสั่งซื้อ');
   }
});




module.exports = router;