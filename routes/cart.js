const express = require('express');
const router = express.Router();
const util = require('util');
const connection = require('../connect');

// Promisify connection.query for easier async/await handling
const query = util.promisify(connection.query).bind(connection);

router.post('/cart/add', async (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }

    try {
        const { AccountID, ProductID, Quantity } = req.body;

        // ตรวจสอบว่าผู้ใช้นี้มีตะกร้าหรือยัง ถ้าไม่มีสร้างใหม่
        let cart = await query('SELECT * FROM cart WHERE AccountID = ? AND Status = "pending"', [AccountID]);

        if (cart.length === 0) {
            await query('INSERT INTO cart (AccountID) VALUES (?)', [AccountID]);
            cart = await query('SELECT * FROM cart WHERE AccountID = ? AND Status = "pending"', [AccountID]);
        }

        const CartID = cart[0].CartID;

        // ตรวจสอบสินค้าก่อนที่จะเพิ่มในตะกร้า
        const product = await query('SELECT * FROM product WHERE ProductID = ?', [ProductID]);

        if (product.length === 0 || product[0].Stock < Quantity) {
            return res.status(400).send('สินค้าไม่เพียงพอ');
        }

        // ตรวจสอบว่ามีสินค้านี้ในตะกร้าอยู่แล้วหรือไม่
        let cartItem = await query('SELECT * FROM cart_items WHERE CartID = ? AND ProductID = ?', [CartID, ProductID]);

        if (cartItem.length > 0) {
            // ถ้ามีสินค้านี้ในตะกร้าอยู่แล้ว ให้เพิ่มจำนวน
            const newQuantity = cartItem[0].Quantity + 1;

            // ตรวจสอบว่าสินค้าในสต็อกเพียงพอหรือไม่
            if (newQuantity > product[0].Stock) {
                return res.status(400).send('สินค้าไม่เพียงพอ');
            }

            await query('UPDATE cart_items SET Quantity = ? WHERE CartID = ? AND ProductID = ?', [newQuantity, CartID, ProductID]);
        } else {
            // ถ้าไม่มีสินค้านี้ในตะกร้า ให้เพิ่มสินค้าใหม่
            await query('INSERT INTO cart_items (CartID, ProductID, Quantity, Price) VALUES (?, ?, ?, ?)', 
                [CartID, ProductID, Quantity, product[0].Price]);
        }

        res.send('เพิ่มสินค้าในตะกร้าสำเร็จ');
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    }
});


// แสดงรายการในตะกร้า
router.get('/cart/:AccountID', async (req, res) => {
    const { AccountID } = req.params;
    console.log('AccountID',AccountID);
    console.log('AccountID form session',req.session.AccountID);
    if (!req.session.loggedIn) {
        res.redirect('/login');
    } else {
        if (AccountID != req.session.AccountID) {
            res.redirect('/cart/' + req.session.AccountID);
        } else {
            try {
                const cartItems = await query(`
                  SELECT product.Image AS Image, product.ProductID, product.ProductName AS ProductName, cart_items.Quantity AS Quantity, product.Price AS Price
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
                    CartItems: cartItems,
                });
    
            } catch (error) {
                console.error('Error fetching cart items:', error);
                res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้า');
            }
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

            res.send('ลบสินค้าในตะกร้าสำเร็จ');
        } catch (error) {
            console.error('Error removing item from cart:', error);
            res.status(500).send('เกิดข้อผิดพลาดในการลบสินค้า');
        }
    }
});

// Update cart item quantity and price
router.post('/cart/update', async (req, res) => {
    if (!req.session.loggedIn) {
        res.redirect('/login');
    } else {
        try {
            const { AccountID, ProductID, Quantity, Price } = req.body;
    
            // Update cart item with new quantity and price
            await query(`
                UPDATE cart_items
                SET Quantity = ?, Price = ?
                WHERE CartID = (SELECT CartID FROM cart WHERE AccountID = ? AND Status = 'pending') 
                AND ProductID = ?;
            `, [Quantity, Price, AccountID, ProductID]);
    
            res.send('Cart updated successfully'); // Respond with a success message
    
        } catch (error) {
            console.error('Error updating cart item:', error);
            res.status(500).send('เกิดข้อผิดพลาดในการอัปเดตสินค้า');
        }
    }
});


module.exports = router;
