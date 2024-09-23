var express = require('express');
var router = express.Router();
var connection = require('../connect');
const util = require('util');

// Promisify connection.query for easier async/await handling
const query = util.promisify(connection.query).bind(connection);

router.get('/order_all', async function (req, res, next) {
    // if (!req.session.loggedIn && req.session.AccountType != 'Admin') {
    //   res.redirect('/');
    // } else {
    try {
        const orders = await query('SELECT * FROM `orders`');
        res.render('admin/order_all', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'คำสั่งซื้อทั้งหมด',
            Orders: orders,
            Status: 'all',
        });
    } catch (error) {
        return error;
    }

    // }
});

router.get('/order_all/status', async function (req, res, next) {
    var { status } = req.query;  // ดึงค่า status จาก query string

    try {
        var orders;
        if (status == 'Payment Checking' || status == 'Payment Complete, Wait for Shipping' || status == 'Shipping' || status == 'Shipped') {
            orders = await query('SELECT * FROM `orders` WHERE OrderStatus = ?', [status]);
        } else if (status == 'all') {
            orders = await query('SELECT * FROM `orders`');
        } else {
            orders = await query('SELECT * FROM `orders`');
            status = 'all';
        }
        res.render('admin/order_all', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'คำสั่งซื้อทั้งหมด',
            Orders: orders,
            Status: status,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;