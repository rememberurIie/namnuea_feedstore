const express = require('express');
const router = express.Router();
const util = require('util');
const connection = require('../connect');

// Promisify connection.query for easier async/await handling
const query = util.promisify(connection.query).bind(connection);

// Route to display account page with order history
router.get('/myaccount', async (req, res) => {
	if (!req.session.loggedIn) {
		res.redirect('/login');
  } else {
		try {

			const AccountID = req.session.AccountID;

			// Step 1: Fetch orders for the user
			const orders = await query(`
					SELECT * 
					FROM orders 
					WHERE AccountID = ?`, [AccountID]);

			// Step 2: Fetch order details for each order
			const orderDetailsPromises = orders.map(async (order) => {
					const orderDetails = await query(`
						SELECT od.OrderDetailID, od.OrderID, p.ProductName, p.Image, p.Price, od.Quantity
						FROM orderdetails od
						JOIN product p ON od.ProductID = p.ProductID
						WHERE od.OrderID = ?`, 
						[order.OrderID]
					);
					// Attach the items (product in the order) to the order
					order.items = orderDetails;
					return order;
			});

			// Wait for all promises to resolve and get populated orders
			const populatedOrders = await Promise.all(orderDetailsPromises);

			// Step 3: Render the 'myaccount.ejs' view, passing the populated orders
			res.render('account/myaccount', 
				{ 
					orders: populatedOrders ,
					loggedIn: req.session.loggedIn,
                AccountID: req.session.AccountID,
                Title: req.session.Title,
                AccountName: req.session.AccountName,
				}
			);

		} catch (error) {
			console.error('Error fetching order history:', error);
			res.status(500).send('Internal Server Error');
		}
	}
});

module.exports = router;
