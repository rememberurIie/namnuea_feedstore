var express = require('express');
var router = express.Router();
var session = require('express-session');

/* GET home page. */

router.get('/', function(req, res) {
  res.render('index', { AccountName: req.session.AccountName , title: 'Express' });
});

router.get('/category', function(req, res, next) {
  res.render('category', {AccountName: req.session.AccountName , title: 'Category' });
});

router.get('/promotion', function(req, res, next) {
  res.render('promotion', {AccountName: req.session.AccountName , title: 'Promotion' });
});

router.get('/article', function(req, res, next) {
  res.render('article', {AccountName: req.session.AccountName , title: 'Article' });
});

router.get('/location', function(req, res, next) {
  res.render('location', {AccountName: req.session.AccountName , title: 'Location' });
});

//---------------------account----------------------//

//login
router.get('/login', function(req, res, next) {
  res.render('account/login', { title: 'Location' });
});

router.get('/register', function(req, res, next) {
  res.render('account/register', { title: 'Location' });
});

//---------------------category----------------------//

// router.get('/category', function(req, res, next) {
//   res.render('subCategories', {AccountName: req.session.AccountName, title: 'Product' });
// });


//---------------------category----------------------//

////dog/////

//if click dog, then go to this path
// router.get('/category/big_dog', function(req, res, next) {
//   res.render('category/dog/big_dog', { title: 'Location' });
// });

// router.get('/category/small_dog', function(req, res, next) {
//   res.render('category/dog/small_dog', { title: 'Location' });
// });

// router.get('/category/canned_dog_food', function(req, res, next) {
//   res.render('category/dog/canned_dog_food', { title: 'Location' });
// });

// ////cat/////

// //if click cat, then go to this path
// router.get('/category/big_cat', function(req, res, next) {
//   res.render('category/cat/big_cat', { title: 'Location' });
// });

// router.get('/category/small_cat', function(req, res, next) {
//   res.render('category/cat/small_cat', { title: 'Location' });
// });

// router.get('/category/wet_cat', function(req, res, next) {
//   res.render('category/cat/wet_cat', { title: 'Location' });
// });

// router.get('/category/lick_cat_food', function(req, res, next) {
//   res.render('category/cat/lick_cat_food', { title: 'Location' });
// });

// router.get('/category/canned_cat_food', function(req, res, next) {
//   res.render('category/cat/canned_cat_food', { title: 'Location' });
// });

// ////fish/////

// //if click fish, then go to this path
// router.get('/category/catfish', function(req, res, next) {
//   res.render('category/fish/catfish', { title: 'Location' });
// });

// router.get('/category/herbivorous_fish', function(req, res, next) {
//   res.render('category/fish/herbivorous_fish', { title: 'Location' });
// });

// router.get('/category/beautiful_fish', function(req, res, next) {
//   res.render('category/fish/beautiful_fish', { title: 'Location' });
// });

// router.get('/category/koi_fish', function(req, res, next) {
//   res.render('category/fish/koi_fish', { title: 'Location' });
// });

// ////chicken/////

// //if click chicken, then go to this path
// router.get('/category/native_chicken', function(req, res, next) {
//   res.render('category/chicken/native_chicken', { title: 'Location' });
// });

// router.get('/category/broiler', function(req, res, next) {
//   res.render('category/chicken/broiler', { title: 'Location' });
// });

// router.get('/category/chicken_eggs', function(req, res, next) {
//   res.render('category/chicken/chicken_eggs', { title: 'Location' });
// });

// router.get('/category/cockfighting', function(req, res, next) {
//   res.render('category/chicken/cockfighting', { title: 'Location' });
// });

// router.get('/category/chicken_rice', function(req, res, next) {
//   res.render('category/chicken/chicken_rice', { title: 'Location' });
// });

// ////pig/////

// //if click pig, then go to this path
// router.get('/category/milk_pig', function(req, res, next) {
//   res.render('category/pig/milk_pig', { title: 'Location' });
// });

// router.get('/category/small_pig', function(req, res, next) {
//   res.render('category/pig/small_pig', { title: 'Location' });
// });

// router.get('/category/big_pig', function(req, res, next) {
//   res.render('category/pig/big_pig', { title: 'Location' });
// });

// ////cow/////

// //if click cow, then go to this path
// router.get('/category/small_cow', function(req, res, next) {
//   res.render('category/cow/small_cow', { title: 'Location' });
// });

// router.get('/category/weaning_cow', function(req, res, next) {
//   res.render('category/cow/weaning_cow', { title: 'Location' });
// });

// router.get('/category/big_cow', function(req, res, next) {
//   res.render('category/cow/big_cow', { title: 'Location' });
// });

// ////bird/////

// //if click bird, then go to this path
// router.get('/category/dove', function(req, res, next) {
//   res.render('category/bird/dove', { title: 'Location' });
// });

// router.get('/category/parrot', function(req, res, next) {
//   res.render('category/bird/parrot', { title: 'Location' });
// });

// ////medicine/////

// //if click medicine, then go to this path
// router.get('/category/cockfighting_medicine', function(req, res, next) {
//   res.render('category/medicine/cockfighting_medicine', { title: 'Location' });
// });

// router.get('/category/birth_control_pills', function(req, res, next) {
//   res.render('category/medicine/birth_control_pills', { title: 'Location' });
// });

// router.get('/category/tonic', function(req, res, next) {
//   res.render('category/medicine/tonic', { title: 'Location' });
// });

// router.get('/category/deworming_medicine', function(req, res, next) {
//   res.render('category/medicine/deworming_medicine', { title: 'Location' });
// });

// ////accessory/////

// //if click accessory, then go to this path
// router.get('/category/chicken_equipment', function(req, res, next) {
//   res.render('category/accessory/chicken_equipment', { title: 'Location' });
// });

// router.get('/category/dog&cat_equipment', function(req, res, next) {
//   res.render('category/accessory/dog&cat_equipment', { title: 'Location' });
// });

















module.exports = router;
