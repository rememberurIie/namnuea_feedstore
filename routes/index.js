var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/category', function(req, res, next) {
  res.render('category', { title: 'Category' });
});

router.get('/promotion', function(req, res, next) {
  res.render('promotion', { title: 'Promotion' });
});

router.get('/article', function(req, res, next) {
  res.render('article', { title: 'Article' });
});

router.get('/location', function(req, res, next) {
  res.render('location', { title: 'Location' });
});

module.exports = router;
