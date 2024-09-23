var express = require('express');
var router = express.Router();
var connection = require('../connect');
const util = require('util');

// Promisify connection.query for easier async/await handling
const query = util.promisify(connection.query).bind(connection);

router.get('/overall', function (req, res, next) {
    // if (!req.session.loggedIn && req.session.AccountType != 'Admin') {
    //   res.redirect('/');
    // } else {
      res.render('admin/overall', { 
        loggedIn: req.session.loggedIn, 
        AccountID: req.session.AccountID, 
        AccountName: req.session.AccountName, 
        AccountType: req.session.AccountType, 
        title: 'สรุปผล' });
    // }
  });

module.exports = router;