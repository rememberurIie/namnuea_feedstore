var express = require('express');
var router = express.Router();
var connection = require('../connect');
const util = require('util');

// Promisify connection.query for easier async/await handling
const query = util.promisify(connection.query).bind(connection);

router.get('/categories_manage', async function (req, res, next) {
    try {
        // Get the search query from the URL parameters
        const searchQuery = req.query.search || '';

        // SQL query to fetch products, joined with suppliers and categories
        let categoriestSql = `SELECT * FROM categories`;

        // Execute the query to get all products
        let categories = await query(categoriestSql);

        // If there's a search query, filter the products by ProductName
        if (searchQuery) {
            categories = categories.filter(categories =>
                categories.CategoryName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Render the page, passing the filtered products and session data
        res.render('admin/manage/categories_manage', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            Categories: categories,
            title: 'จัดการหมวดหมู่หลัก'
        });

    } catch (error) {
        console.error('Error: /product_manage ', error);
        res.status(500).send('Internal Server Error /product_manage');
    }
});

router.get('/add-category', async (req, res) => {
    try {
        res.render('admin/manage/category_add', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'จัดการหมวดหมู่หลัก',
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving data for acategory");
    }
});

router.post('/add-category', async (req, res) => {
    const { CategoryName, Description, Image } = req.body;
    console.log('name :', CategoryName, 'des', Description, 'Image', Image);
    try {
        await query('INSERT INTO categories (CategoryName, Description, Image) VALUES (?,?,?)',
            [CategoryName, Description, Image]);
        res.redirect('/categories_manage');  // Redirect to the product list or any other page
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding new category");
    }
});

router.get('/edit-category/:id', async (req, res) => {
    const categoryID = req.params.id;

    try {
        const [category] = await query('SELECT * FROM Categories WHERE CategoryID = ?', [categoryID]);
        console.log(category);
        res.render('admin/manage/category_edit', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'จัดการหมวดหมู่หลัก',
            Category: category,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving product data");
    }
});

router.post('/edit-category/:id', async (req, res) => {
    const categoryID = req.params.id;
    const { CategoryName, Description, Image, CategoryStatus } = req.body;

    try {
        await query('UPDATE categories SET CategoryName = ?, Description = ?, Image = ?, CategoryStatus = ?   WHERE CategoryID = ?',
            [CategoryName, Description, Image, CategoryStatus, categoryID]);
        res.redirect('/categories_manage');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating product");
    }
});

router.get('/sub_categories_manage', async function (req, res, next) {
    try {
        // Get the search query from the URL parameters
        const searchQuery = req.query.search || '';

        // SQL query to fetch products, joined with suppliers and categories
        let subCtegoriestSql = `SELECT *,(SELECT CategoryName FROM categories WHERE CategoryID = subcategories.CategoryID) AS CategoryName FROM subcategories`;

        // Execute the query to get all products
        let subCategories = await query(subCtegoriestSql);
        // If there's a search query, filter the products by ProductName
        if (searchQuery) {
            subCategories = subCategories.filter(subCategories =>
                subCategories.SubCategoryName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Render the page, passing the filtered products and session data
        res.render('admin/manage/sub_categories_manage', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            SubCategories: subCategories,
            title: 'จัดการหมวดหมู่ย่อย'
        });

    } catch (error) {
        console.error('Error: /sub_categories_manage ', error);
        res.status(500).send('Internal Server Error /sub_categories_manage');
    }
});

router.get('/add-sub_category', async (req, res) => {
    let categoriestSql = `SELECT * FROM categories`;
    let categories = await query(categoriestSql);
    try {
        res.render('admin/manage/sub_categories_add', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'จัดการหมวดหมู่ย่อย',
            Categories: categories,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving data for acategory");
    }
});

router.post('/add-sub_category', async (req, res) => {
    const { SubCategoryName, Description, Image, CategoryID } = req.body;
    console.log('name :', SubCategoryName, 'des', Description, 'Image', Image);
    try {
        await query('INSERT INTO subcategories (SubCategoryName, Description, Image, CategoryID) VALUES (?,?,?,?)',
            [SubCategoryName, Description, Image, CategoryID]);
        res.redirect('/sub_categories_manage');  // Redirect to the product list or any other page
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding new category");
    }
});

router.get('/edit-sub_category/:id', async (req, res) => {
    const subCategoryID = req.params.id;

    try {
        let categoriestSql = `SELECT * FROM categories`;
        let categories = await query(categoriestSql);
        const [subCategory] = await query('SELECT * FROM subcategories WHERE SubCategoryID = ?', [subCategoryID]);
        res.render('admin/manage/sub_categories_edit', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'จัดการหมวดหมู่ย่อย',
            SubCategory: subCategory,
            Categories: categories,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving sub_category data");
    }
});

router.post('/edit-sub_category/:id', async (req, res) => {
    const subCategoryID = req.params.id;
    const { SubCategoryName, Description, Image, CategoryID } = req.body;

    try {
        await query('UPDATE subcategories SET SubCategoryName = ?, Description = ?, Image = ?, CategoryID = ? WHERE SubCategoryID = ?;',
            [SubCategoryName, Description, Image, CategoryID, subCategoryID]);
        res.redirect('/sub_categories_manage');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating subCategory");
    }
});

module.exports = router;