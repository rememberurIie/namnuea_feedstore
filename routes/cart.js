var express = require('express');
var router = express.Router();
var connection = require('../connect');

// เพิ่มสินค้าในตะกร้า
router.post('/cart/add', async (req, res) => {
    try {
        const { AccountID, ProductID, Quantity } = req.body;

        // ตรวจสอบว่าผู้ใช้นี้มีตะกร้าหรือยัง ถ้าไม่มีสร้างใหม่
        let cart = await new Promise((resolve, reject) => {
            connection.query('SELECT * FROM cart WHERE AccountID = ? AND Status = "pending"', [AccountID], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });

        if (cart.length === 0) {
            await new Promise((resolve, reject) => {
                connection.query('INSERT INTO cart (AccountID) VALUES (?)', [AccountID], (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                });
            });
            cart = await new Promise((resolve, reject) => {
                connection.query('SELECT * FROM cart WHERE AccountID = ? AND Status = "pending"', [AccountID], (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                });
            });
        }

        // ตรวจสอบสินค้าก่อนที่จะเพิ่มในตะกร้า
        const product = await new Promise((resolve, reject) => {
            connection.query('SELECT * FROM product WHERE ProductID = ?', [ProductID], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });

        if (product.length === 0 || product[0].Stock < Quantity) {
            return res.status(400).send('สินค้าไม่เพียงพอ');
        }

        // เพิ่มสินค้าในตะกร้า
        await new Promise((resolve, reject) => {
            connection.query('INSERT INTO cart_items (CartID, ProductID, Quantity, Price) VALUES (?, ?, ?, ?)',
                [cart[0].CartID, ProductID, Quantity, product[0].Price], (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                });
        });

        res.send('เพิ่มสินค้าในตะกร้าสำเร็จ');
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    }
});

// แสดงรายการในตะกร้า
router.get('/cart/:AccountID', async (req, res) => {
    try {
        const { AccountID } = req.params;
        const cartItems = await connection.query(`
          SELECT product.Image, product.ProductName, cart_items.Quantity, cart_items.Price 
          FROM cart_items 
          JOIN product ON cart_items.ProductID = product.ProductID
          JOIN cart ON cart_items.CartID = cart.CartID
          WHERE cart.AccountID = ? AND cart.Status = 'pending'
        `, [AccountID]);

        // res.json(cartItems);
        // console.log(res.json(cartItems));
        // console.log(cartItems);
        res.redirect('cart', {AccountID: req.session.AccountID, CartItems: cartItems});
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้า');
    }
});

// ลบสินค้าออกจากตะกร้า
router.post('/cart/remove', async (req, res) => {
    try {
        const { AccountID, ProductID } = req.body;

        // ลบรายการสินค้า
        await connection.query(`
          DELETE cart_items FROM cart_items
          USING cart_items 
          JOIN cart ON cart_items.CartID = cart.CartID 
          WHERE cart.AccountID = ? AND cart_items.ProductID = ? AND cart.Status = 'pending'
        `, [AccountID, ProductID]);

        res.send('ลบสินค้าออกจากตะกร้าสำเร็จ');
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).send('เกิดข้อผิดพลาดในการลบสินค้า');
    }
});


module.exports = router;
