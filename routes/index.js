var express = require('express');
var router = express.Router();
var session = require('express-session');

/* GET home page. */

router.get('/', function (req, res) {
  res.render('index', { loggedIn: req.session.loggedIn, AccountID: req.session.AccountID, AccountName: req.session.AccountName, AccountType: req.session.AccountType, title: 'Express' });
});

// router.get('/category', function (req, res, next) {
//   res.render('category', { loggedIn: req.session.loggedIn, AccountID: req.session.AccountID, AccountName: req.session.AccountName, AccountType: req.session.AccountType, title: 'Category' });
// });

router.get('/promotion', function (req, res, next) {
  res.render('promotion', { loggedIn: req.session.loggedIn, AccountID: req.session.AccountID, AccountName: req.session.AccountName, AccountType: req.session.AccountType, title: 'Promotion' });
});

router.get('/article', function (req, res, next) {
  res.render('article', { loggedIn: req.session.loggedIn, AccountID: req.session.AccountID, AccountName: req.session.AccountName, AccountType: req.session.AccountType, title: 'Article' });
});

router.get('/location', function (req, res, next) {
  res.render('location', { loggedIn: req.session.loggedIn, AccountID: req.session.AccountID, AccountName: req.session.AccountName, AccountType: req.session.AccountType, title: 'Location' });
});

// router.get('/cart', function(req, res, next) {
//   if (!req.session.loggedIn) {
//     res.redirect('/login');
// } 
// });

// router.get('/checkout', function (req, res, next) {
//   res.render('checkout', { loggedIn: req.session.loggedIn, AccountID: req.session.AccountID, AccountName: req.session.AccountName, AccountType: req.session.AccountType, title: 'Checkout' });
// });

//---------------------account----------------------//

//login
router.get('/login', function (req, res, next) {
  res.render('account/login', { title: 'Login' });
});

router.get('/register', function (req, res, next) {
  res.render('account/register', { title: 'Register' });
});

// //see history orders for account is in session
// router.get('/myaccount', function (req, res, next) {
//   if (!req.session.loggedIn) {
//     res.redirect('/login');
//   } else {
//     res.render('account/myaccount', { loggedIn: req.session.loggedIn, AccountID: req.session.AccountID, AccountName: req.session.AccountName, AccountType: req.session.AccountType, title: 'MyAccount' });
//   }
// });

//---------------------admin----------------------//

//login
router.get('/overall', function (req, res, next) {
  if (!req.session.loggedIn && req.session.AccountType != 'Admin') {
    res.redirect('/');
  } else {
    res.render('admin/overall', { loggedIn: req.session.loggedIn, AccountID: req.session.AccountID, AccountName: req.session.AccountName, AccountType: req.session.AccountType, title: 'Location' });
  }
});

//login
router.get('/order_all', function (req, res, next) {
  if (!req.session.loggedIn && req.session.AccountType != 'Admin') {
    res.redirect('/');
  } else {
    res.render('admin/order_all', { loggedIn: req.session.loggedIn, AccountID: req.session.AccountID, AccountName: req.session.AccountName, AccountType: req.session.AccountType, title: 'Location' });
  }
});

router.get('/order_manage', function (req, res, next) {
  if (!req.session.loggedIn && req.session.AccountType != 'Admin') {
    res.redirect('/');
  } else {
    res.render('admin/order_manage', { loggedIn: req.session.loggedIn, AccountID: req.session.AccountID, AccountName: req.session.AccountName, AccountType: req.session.AccountType, title: 'Location' });
  }
});

module.exports = router;
