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

router.get('/location', function(req, res, next) {
  res.render('location', { title: 'Location' });
});

////category/////

router.get('/category/dog', function(req, res, next) {
  res.render('category/dog', { title: 'Location' });
});

router.get('/category/cat', function(req, res, next) {
  res.render('category/cat', { title: 'Location' });
});

router.get('/category/fish', function(req, res, next) {
  res.render('category/fish', { title: 'Location' });
});

router.get('/category/chicken', function(req, res, next) {
  res.render('category/chicken', { title: 'Location' });
});

router.get('/category/pig', function(req, res, next) {
  res.render('category/pig', { title: 'Location' });
});

router.get('/category/cow', function(req, res, next) {
  res.render('category/cow', { title: 'Location' });
});

router.get('/category/bird', function(req, res, next) {
  res.render('category/bird', { title: 'Location' });
});

router.get('/category/accessory', function(req, res, next) {
  res.render('category/dog', { title: 'Location' });
});

router.get('/category/medicine', function(req, res, next) {
  res.render('category/medicine', { title: 'Location' });
});

module.exports = router;
