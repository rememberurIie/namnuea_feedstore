var express = require('express');
var router = express.Router();
var connection = require('../connect');
const util = require('util');

// Promisify connection.query for easier async/await handling
const query = util.promisify(connection.query).bind(connection);

router.get('/product_manage', async function (req, res, next) {
    // if (!req.session.loggedIn && req.session.AccountType != 'Admin') {
    //   res.redirect('/');
    // } else {
    try {
        var productSql = `SELECT ProductID, ProductName ,suppliers.SupplierName, categories.Description, Price, Stock, Exp, MFG, product.Image FROM product
INNER JOIN suppliers ON suppliers.SupplierID = product.SupplierID
INNER JOIN categories ON categories.CategoryID = product.CategoryID`;
        const products = await query(productSql);
        res.render('admin/manage/product_manage', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            Products: products,
            title: 'จัดการสินค้า'
        });
    } catch (error) {
        console.error('Error: /product_manage ', error);
        res.status(500).send('Internal Server Error /product_manage');
    }
    // }
});

router.get('/add-product', async (req, res) => {
    try {
        const suppliers = await query('SELECT SupplierID, SupplierName FROM Suppliers');
        const categories = await query('SELECT CategoryID, CategoryName FROM Categories');

        res.render('admin/manage/product_add', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'จัดการสินค้า',
            suppliers,
            categories
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving data for adding a product");
    }
});

// Get the product edit page
router.get('/edit-product/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const [product] = await query('SELECT * FROM product WHERE ProductID = ?', [productId]);
        const suppliers = await query('SELECT SupplierID, SupplierName FROM Suppliers');
        const categories = await query('SELECT CategoryID, Description AS CategoryName FROM Categories');
        console.log(product);
        res.render('admin/manage/product_by_id', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'จัดการสินค้า',
            product: product,
            suppliers,
            categories
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving product data");
    }
});

// Get subcategories by CategoryID (AJAX)
router.get('/get-subcategories/:categoryID', async (req, res) => {
    const categoryID = req.params.categoryID;

    try {
        const subcategories = await query('SELECT SubCategoryID, Description AS SubCategoryName FROM SubCategories WHERE CategoryID = ?', [categoryID]);
        res.json(subcategories);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching subcategories");
    }
});

router.post('/add-product', async (req, res) => {
    const { ProductName, SupplierID, CategoryID, SubCategoryID, Price, Stock, Exp, MFG, Image } = req.body;

    try {
        await query('INSERT INTO product (ProductName, SupplierID, CategoryID, SubCategoryID, Price, Stock, Exp, MFG, Image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [ProductName, SupplierID, CategoryID, SubCategoryID, Price, Stock, Exp, MFG, Image]);
        res.redirect('/product_manage');  // Redirect to the product list or any other page
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding new product");
    }
});

// Handle the form submission to update the product
router.post('/edit-product/:id', async (req, res) => {
    const productId = req.params.id;
    const { ProductName, SupplierID, CategoryID, SubCategoryID, Price, Stock, Exp, MFG, Image, ProductStatus } = req.body;

    try {
        await query('UPDATE Product SET ProductName = ?, SupplierID = ?, CategoryID = ?, SubCategoryID = ?, Price = ?, Stock = ?, Exp = ?, MFG = ?, Image = ?, ProductStatus = ? WHERE ProductID = ?',
            [ProductName, SupplierID, CategoryID, SubCategoryID, Price, Stock, Exp, MFG, Image, ProductStatus, productId]);
        res.redirect('/product_manage');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating product");
    }
});

router.post('/delete-product', async (req, res) => {
    const { productID } = req.body;  // Change here to match AJAX request
    try {
        await query('DELETE FROM `product` WHERE ProductID = ?', [productID]);
        res.redirect('/product_manage');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting product");
    }
});

module.exports = router;