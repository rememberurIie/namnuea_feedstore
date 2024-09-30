var express = require('express');
var router = express.Router();
var connection = require('../connect');
const util = require('util');

// Promisify connection.query for easier async/await handling
const query = util.promisify(connection.query).bind(connection);

router.get('/shippers_manage', async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        let shippers = await query('SELECT * FROM shippers');
        if (searchQuery) {
            shippers = shippers.filter(shippers =>
                shippers.ShipperName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        res.render('admin/manage/shippers_manage', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'shippers',
            Shippers: shippers,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving shippers_manage data");
    }
});

router.get('/edit-shipper/:shipperID', async (req, res) => {
    const shipperID = req.params.shipperID;

    try {
        const [shippers] = await query('SELECT * FROM shippers WHERE ShipperID = ?', [shipperID]);
        console.log(shippers);
        res.render('admin/manage/shipper_edit', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'shippers',
            Shippers: shippers,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching shipper_add");
    }
});

router.get('/add-shipper', async (req, res) => {
    try {
        res.render('admin/manage/shipper_add', {
            loggedIn: req.session.loggedIn,
            AccountID: req.session.AccountID,
            AccountName: req.session.AccountName,
            AccountType: req.session.AccountType,
            title: 'shippers',
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving data for add-shipper_add");
    }
});

router.post('/add-shipper', async (req, res) => {
    const { ShipperName, Phone } = req.body;

    try {
        await query('INSERT INTO shippers ( ShipperName, Phone) VALUES ( ?, ?)',
            [ShipperName, Phone]);
        res.redirect('/shippers_manage');  // Redirect to the product list or any other page
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding new shippers_manage");
    }
});

// Handle the form submission to update the product
router.post('/edit-shipper/:id', async (req, res) => {
    const shipperID = req.params.id;
    const { ShipperName, Phone } = req.body;
    console.log(ShipperName, Phone);
    try {
        await query('UPDATE shippers SET ShipperName = ?, Phone = ? WHERE ShipperID = ?',
            [ShipperName, Phone, shipperID]);
        res.redirect('/shippers_manage');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating edit-supplier");
    }
});

module.exports = router;