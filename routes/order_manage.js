var express = require('express');
var router = express.Router();
var connection = require('../connect');
const util = require('util');

// Promisify connection.query for easier async/await handling
const query = util.promisify(connection.query).bind(connection);

router.get('/admin/order_manage',async (req,res) => {
    
    // query()

    res.render('admin/order_manage', { loggedIn: req.session.loggedIn, AccountID: req.session.AccountID, AccountName: req.session.AccountName, AccountType: req.session.AccountType, title: 'Location' });

});

module.exports = router;