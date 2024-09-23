var express = require('express');
var router = express.Router();
var mysql = require('../connect');

router.get('/category', function (req, res) {
    var sql = 'SELECT * FROM `categories`';

    mysql.query(sql, (err, categories) => {
        if (err) {
            res.send(err);
        } else {
            res.render('category', {
                loggedIn: req.session.loggedIn,
                AccountID: req.session.AccountID,
                AccountName: req.session.AccountName,
                AccountType: req.session.AccountType,
                title: 'Category',
                Categories: categories
            })
        }
    });
});

router.get('/category/:CategoryName', function (req, res, next) {
    // สร้างตัวแปรเพื่อเก็บชื่อ Category ที่ส่งมา
    var categoryName = req.params.CategoryName.toLocaleLowerCase();

    // Query เพื่อดึง Subcategories และ Description ของ Category
    var sql = `
        SELECT *, 
        (SELECT Description FROM categories WHERE CategoryName = ?) AS CategoryDescription
        FROM subcategories 
        WHERE CategoryID = (SELECT CategoryID FROM categories WHERE CategoryName = ?)
    `;

    mysql.query(sql, [categoryName, categoryName], (err, subcategories) => {
        if (err) {
            res.send(err);
        } else {
            // Query เพื่อดึงข้อมูล Products
            var sql2 = 'SELECT * FROM product WHERE CategoryID = (SELECT CategoryID FROM categories WHERE CategoryName = ?)';
            mysql.query(sql2, categoryName, (err, products) => {
                if (err) {
                    res.send(err);
                } else {
                    // เรนเดอร์หน้า subCategory พร้อมกับส่งข้อมูลที่ได้จากฐานข้อมูล
                    req.session.SubcategoryImage = subcategories[0].Image;
                    req.session.Title = subcategories[0].CategoryDescription;
                    req.session.CategoryName = categoryName;
                    req.session.Subcategories = subcategories;
                    res.render('subCategory', {
                        loggedIn: req.session.loggedIn,
                        AccountID: req.session.AccountID,
                        AccountName: req.session.AccountName,
                        SubcategoryImage: req.session.SubcategoryImage,
                        Title: req.session.Title,
                        Subcategories: req.session.Subcategories,
                        Products: products,
                        CategoryName: req.session.CategoryName,
                    });
                }
            });
        }
    });
});

router.get('/product/:SubCategoryID', function (req, res) {
    var sql = 'SELECT * FROM Product WHERE SubCategoryID = ?';
    mysql.query(sql, req.params.SubCategoryID, (err, products) => {
        if (err) {
            res.send(err);
        } else {
            res.render('product', {
                loggedIn: req.session.loggedIn,
                Products: products,
                AccountID: req.session.AccountID,
                AccountName: req.session.AccountName,
                SubcategoryImage: req.session.SubcategoryImage,
                Title: req.session.Title,
                Subcategories: req.session.Subcategories,
                CategoryName: req.session.CategoryName,
            });
        }
    });
});


module.exports = router;