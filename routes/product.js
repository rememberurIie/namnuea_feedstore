var express = require('express');
var router = express.Router();
var mysql = require('../connect');

router.get('/category/:CategoryName', function (req, res, next) {
    // สร้างตัวแปรเพื่อเก็บชื่อ Category ที่ส่งมา
    var categoryName = req.params.CategoryName.toLocaleLowerCase();
    
    // Query เพื่อดึง Subcategories และ Description ของ Category
    var sql = `
        SELECT *, 
        (SELECT Description FROM categories WHERE CategoryName = ?) AS CategoryDescription  ,
        (SELECT Image FROM categories WHERE CategoryName = ?) AS CategoryImage
        FROM subcategories 
        WHERE CategoryID = (SELECT CategoryID FROM categories WHERE CategoryName = ?)
    `;
    
    mysql.query(sql, [categoryName, categoryName, categoryName], (err, subcategories) => {
        if (err) {
            res.send(err);
        } else {
            // Query เพื่อดึงข้อมูล Products
            var sql2 = 'SELECT * FROM product';
            mysql.query(sql2, (err, products) => {
                if (err) {
                    res.send(err);
                } else {
                    // เรนเดอร์หน้า subCategory พร้อมกับส่งข้อมูลที่ได้จากฐานข้อมูล
                    res.render('subCategory', {
                        AccountName: req.session.AccountName, // แสดงชื่อผู้ใช้ที่ล็อกอิน
                        title: subcategories[0].CategoryDescription,      // ชื่อ Category
                        image: subcategories[0].CategoryImage,
                        subcategories: subcategories,        // ข้อมูล Subcategories
                        products: products                   // ข้อมูล Products
                    });
                }
            });
        }
    });
});


module.exports = router;