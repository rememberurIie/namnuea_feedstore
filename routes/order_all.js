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
        const orders = await query('SELECT *, (SELECT AccountName FROM account WHERE AccountID = orders.AccountID) AS AccountName FROM `orders`');
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
            orders = await query('SELECT *, (SELECT AccountName FROM account WHERE AccountID = orders.AccountID) AS AccountName FROM `orders` WHERE OrderStatus = ?', [status]);
        } else if (status == 'all') {
            orders = await query('SELECT *, (SELECT AccountName FROM account WHERE AccountID = orders.AccountID) AS AccountName FROM `orders`');
        } else {
            orders = await query('SELECT *, (SELECT AccountName FROM account WHERE AccountID = orders.AccountID) AS AccountName FROM `orders`');
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

router.get('/order_all/getOrderByOrderID', async function (req, res) {
    const OrderID = parseInt(req.query.OrderID);
    try {
        var sqlOrder = 'SELECT *, (SELECT AccountName FROM account WHERE AccountID = orders.AccountID) AS AccountName FROM `orders` WHERE OrderID = ?';
        var sqlOrderByOrderID = 'SELECT *, (SELECT ProductName FROM product WHERE ProductID = orderdetails.ProductID) AS ProductName, (SELECT Image FROM product WHERE ProductID = orderdetails.ProductID) AS Image FROM `orderdetails` WHERE OrderID = ?';
        console.log("OrderID", OrderID);
        const order = await query(sqlOrder, [OrderID]);
        const orderByOrderID = await query(sqlOrderByOrderID, [OrderID]);
        res.json({
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            Order: order,
            OrderDetails: orderByOrderID
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/order_all/orderByOrderID', function(req, res) {
    try {
        const order = JSON.parse(decodeURIComponent(req.query.Order));
        const orderDetails = JSON.parse(decodeURIComponent(req.query.OrderDetails));

        console.log(order);
        console.log(orderDetails);

        res.render('admin/order/order_by_orderID', {
            Order: [order], // เนื่องจาก Order ควรเป็น array
            OrderDetails: [orderDetails],
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'คำสั่งซื้อทั้งหมด'
        });
    } catch (error) {
        console.error('Error parsing Order or OrderDetails:', error);
        res.status(400).send('Bad Request');
    }
});

router.post('/order_all/orderByOrderID/changeStatus', async function (req, res) {
    const {OrderID, OrderStatus} = req.query;
    try {
        var sql = 'UPDATE `orders` SET OrderStatus = ? WHERE OrderID = ?';
        await query(sql, [OrderStatus, OrderID]);
    } catch (error) {
        console.error('Error update status', error);
        res.status(400).send('Bad Request');
    }
});



module.exports = router;