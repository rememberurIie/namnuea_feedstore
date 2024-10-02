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
						SELECT od.OrderDetailID, od.OrderID, p.ProductName, p.Image, od.Price, od.Quantity
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

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const thaiFontPath = 'fonts/NotoSansThai.ttf'; // Ensure this path is correct

router.get('/myaccount/receipt', async (req, res, next) => {

	const { OrderID } = req.query; // Accessing OrderID from query parameters

	// Check if user is logged in
	if (!req.session.loggedIn) {
		return res.redirect('/login');
	}
	try {
		// Query the database using OrderID
		const orders_table = await query(`
				SELECT 
					(SELECT AccountName FROM account WHERE orders.AccountID = account.AccountID) AS AccountName,
					(SELECT CONCAT('ตำบล', SubDistrict, ' อำเภอ', District, ' จังหวัด', Province, ' ', PostalCode) FROM account WHERE orders.AccountID = account.AccountID) AS Address,
					(SELECT Phone FROM account WHERE orders.AccountID = account.AccountID) AS Phone,
					OrderDate, 
					totalPrice 
				FROM orders 
				WHERE OrderID = ?`, [OrderID]);

		const orderdetails_table = await query(`
				SELECT (SELECT ProductName FROM product WHERE orderdetails.ProductID = product.ProductID) AS ProductName, Quantity, Price 
				FROM orderdetails 
				WHERE OrderID = ?`, [OrderID]);

		const doc = new PDFDocument({
				font: thaiFontPath,
				size: 'A4',
				margin: 50,
		});

		const fileName = `Receipt_${OrderID}_${Date.now()}.pdf`;
		const filePath = path.join('C:\\Receipt', fileName);

		// Ensure the directory exists
		if (!fs.existsSync('C:\\Receipt')) {
				fs.mkdirSync('C:\\Receipt', { recursive: true });
		}

		doc.pipe(fs.createWriteStream(filePath));

		// Fetch the logo image
		const logoUrl = 'https://img2.pic.in.th/pic/360_F_253083014_MH4h16llY6063TBkG8h7SDBuSyaOV2vi.jpg';
		
		// Get the image as a buffer
		const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
		const logoBuffer = Buffer.from(response.data, 'binary');

		doc.image(logoBuffer, 32, 30, { width: 100 }); // Adjust width as needed

		// Shop name
		doc.fontSize(20).text('NAMNUEA PETSTORE', 130, 33,{ align: 'left' });
		doc.fontSize(10).text('Receipt', 130, 40,{ align: 'right' });
		doc.moveDown();

		// Receipt title
		doc.fontSize(13).text(`Order ID: #${OrderID}`, 50, 90, {align: 'left' });
		doc.moveDown();

		// Customer details
		doc.fontSize(10).text(`Customer`, 50, null, { underline:true, align: 'left' });
		doc.fontSize(10).text(`${orders_table[0].AccountName}`, 50, null, { align: 'left' });
		doc.fontSize(10).text(`${orders_table[0].Address}`, 50, null, { align: 'left' });
		doc.fontSize(10).text(`Tel: ${orders_table[0].Phone}`, 50, null, { align: 'left' });
		doc.moveDown();

		// Add a horizontal line before the product list
		doc.moveDown();
		doc.lineCap('round')
			.moveTo(50, doc.y)
			.lineTo(550, doc.y)
			.stroke();

		// Product list header
		doc.fontSize(10).text('No.', 50, 235, { width: 50, align: 'center' });
		doc.text('Product Name', 100, 235, { width: 250, align: 'left' });
		doc.text('Quantity', 400, 235, { width: 80, align: 'center' });
		doc.text('Price (฿)', 450, 235, { width: 100, align: 'right' });
		doc.moveDown();

		// Add a horizontal line after the header
		doc.lineCap('round')
			.moveTo(50, doc.y)
			.lineTo(550, doc.y)
			.stroke();

		// Add a table-like structure for product list
		orderdetails_table.forEach((item, index) => {
			const y = 275 + index * 30; // Get current y position for each row
			const productNumber = index + 1; // Start numbering from 1

			// Fill the row with product data
			doc.fontSize(10).text(`${productNumber}.`, 50, y, { width: 50, align: 'center' });
			doc.text(item.ProductName, 100, y, { width: 250, align: 'left' });
			doc.text(item.Quantity.toString(), 400, y, { width: 80, align: 'center' });
			doc.text(item.Price.toFixed(2), 450, y, { width: 100, align: 'right' });
			doc.moveDown(); // Move down for the next row
		});

		// Add a horizontal line for separation
		doc.lineCap('round')
			.moveTo(50, doc.y)
			.lineTo(550, doc.y)
			.stroke();

		// Total price display
		doc.moveDown();
		doc.fontSize(10).text(`Total Price: ${orders_table[0].totalPrice.toFixed(2)} ฿`, 450, null, { width: 100, align: 'right' });


		// Add a horizontal line for separation
		doc.moveDown();
		doc.lineCap('round')
				.moveTo(50, doc.y)
				.lineTo(550, doc.y)
				.stroke();

		doc.end();
		res.send('Completed issuance of receipt.');

	} catch (error) {
		console.error('Error fetching order history:', error);
		res.status(500).send('Internal Server Error');
	}
});

module.exports = router;

