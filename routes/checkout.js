const express = require('express');
const router = express.Router();
const util = require('util');
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

         console.log(totalPrices);

     } catch (error) {
         console.error('Error fetching cart items:', error);
         res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้า');
     }
 }


});

module.exports = router;