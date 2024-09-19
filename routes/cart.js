const express = require('express');
const router = express.Router();
const util = require('util');
const connection = require('../connect');

// Promisify connection.query for easier async/await handling
const query = util.promisify(connection.query).bind(connection);

// เพิ่มสินค้าในตะกร้า
router.post('/cart/add', async (req, res) => {
    if (!req.session.loggedIn) {
        res.redirect('/login');
    } else {
        try {
            const { AccountID, ProductID, Quantity } = req.body;

            // ตรวจสอบว่าผู้ใช้นี้มีตะกร้าหรือยัง ถ้าไม่มีสร้างใหม่
            let cart = await query('SELECT * FROM cart WHERE AccountID = ? AND Status = "pending"', [AccountID]);

            if (cart.length === 0) {
                await query('INSERT INTO cart (AccountID) VALUES (?)', [AccountID]);
                cart = await query('SELECT * FROM cart WHERE AccountID = ? AND Status = "pending"', [AccountID]);
            }

            // ตรวจสอบสินค้าก่อนที่จะเพิ่มในตะกร้า
            const product = await query('SELECT * FROM product WHERE ProductID = ?', [ProductID]);

            if (product.length === 0 || product[0].Stock < Quantity) {
                return res.status(400).send('สินค้าไม่เพียงพอ');
            }

            // เพิ่มสินค้าในตะกร้า
            await query('INSERT INTO cart_items (CartID, ProductID, Quantity, Price) VALUES (?, ?, ?, ?)',
                [cart[0].CartID, ProductID, Quantity, product[0].Price]);

            res.send('เพิ่มสินค้าในตะกร้าสำเร็จ');
        } catch (error) {
            console.error('Error adding item to cart:', error);
            res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
        }
    }
});

// แสดงรายการในตะกร้า
router.get('/cart/:AccountID', async (req, res) => {
    if (!req.session.loggedIn) {
        res.redirect('/login');
    } else {
        try {
            const { AccountID } = req.params;
            const cartItems = await query(`
              SELECT product.Image AS Image, product.ProductID, product.ProductName AS ProductName, cart_items.Quantity AS Quantity, cart_items.Price AS Price
              FROM cart_items 
              JOIN product ON cart_items.ProductID = product.ProductID
              JOIN cart ON cart_items.CartID = cart.CartID
              WHERE cart.AccountID = ? AND cart.Status = 'pending'
            `, [AccountID]);

            res.render('cart', {
                loggedIn: req.session.loggedIn,
                AccountID: req.session.AccountID,
                Title: req.session.Title,
                AccountName: req.session.AccountName,
                CartItems: cartItems
            });
        } catch (error) {
            console.error('Error fetching cart items:', error);
            res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้า');
        }
    }


});

// ลบสินค้าออกจากตะกร้า
router.post('/cart/remove', async (req, res) => {
    if (!req.session.loggedIn) {
        res.redirect('/login');
    } else {
        try {
            const { AccountID, ProductID } = req.body;

            // ลบรายการสินค้า
            await query(`
          DELETE cart_items
          FROM cart_items
          INNER JOIN cart ON cart_items.CartID = cart.CartID
          WHERE cart.AccountID = ? AND cart_items.ProductID = ? AND cart.Status = 'pending';
        `, [AccountID, ProductID]);

            res.send('รลบสินค้าในตะกร้าสำเร็จ');
        } catch (error) {
            console.error('Error removing item from cart:', error);
            res.status(500).send('เกิดข้อผิดพลาดในการลบสินค้า');
        }
    }
});

module.exports = router;
