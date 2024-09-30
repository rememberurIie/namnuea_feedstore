var express = require('express');
var router = express.Router();
var connection = require('../connect');
const util = require('util');

// Promisify connection.query for easier async/await handling
const query = util.promisify(connection.query).bind(connection);

router.get('/suppliers_manage', async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        let suppliers = await query('SELECT * FROM suppliers');
        if (searchQuery) {
            suppliers = suppliers.filter(suppliers =>
                suppliers.SupplierName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        res.render('admin/manage/suppliers_manage', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'suppliers',
            Suppliers: suppliers,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving suppliers_manage data");
    }
});

router.get('/edit-supplier/:supplierID', async (req, res) => {
    const supplierID = req.params.supplierID;

    try {
        const [supplier] = await query('SELECT * FROM suppliers WHERE SupplierID = ?', [supplierID]);
        res.render('admin/manage/supplier_edit', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'suppliers',
            Supplier: supplier,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching supplier");
    }
});

router.get('/add-supplier', async (req, res) => {
    try {
        res.render('admin/manage/supplier_add', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'suppliers',
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving data for add-supplier");
    }
});

router.post('/add-supplier', async (req, res) => {
    const { SupplierName, ContactName, Phone } = req.body;

    try {
        await query('INSERT INTO suppliers ( SupplierName, ContactName, Phone) VALUES ( ?, ?, ?)',
            [SupplierName, ContactName, Phone]);
        res.redirect('/suppliers_manage');  // Redirect to the product list or any other page
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding new supplier");
    }
});

// Handle the form submission to update the product
router.post('/edit-supplier/:id', async (req, res) => {
    const supplierID = req.params.id;
    const { SupplierName, ContactName, Phone } = req.body;

    try {
        await query('UPDATE suppliers SET SupplierName = ?, ContactName = ?, Phone = ? WHERE SupplierID = ?',
            [SupplierName, ContactName, Phone, supplierID]);
        res.redirect('/suppliers_manage');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating edit-supplier");
    }
});

module.exports = router;