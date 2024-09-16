var express = require('express');
var router = express.Router();
var mysql = require('../connect');

const bcrypt = require('bcrypt');
const saltRounds = 10;  // จำนวนรอบของการสร้าง salt

router.post('/register', (req, res) => {
    // รับข้อมูลจากฟอร์ม
    var data = {
        UserName: req.body.UserName,
        AccountName: req.body.AccountName,
        Phone: req.body.Phone,
        Province: req.body.Province,
        District: req.body.District,
        SubDistrict: req.body.SubDistrict,
        PostalCode: req.body.PostalCode,
        AccountType: 'Customer'  // กำหนดค่า AccountType เอง
    };

    // เข้ารหัสรหัสผ่านก่อนเก็บลงฐานข้อมูล
    bcrypt.hash(req.body.Pwd, saltRounds, (err, hash) => {
        if (err) {
            res.send(err);
        } else {
            // เก็บค่า hash ที่ได้จากการเข้ารหัสลงใน `Pwd`
            data.Pwd = hash;

            // SQL Query สำหรับแทรกข้อมูล
            var sql = 'INSERT INTO account SET ?';

            // ทำการแทรกข้อมูลลงในฐานข้อมูล
            mysql.query(sql, data, (err, result) => {
                if (err) {
                    res.send(err); // หากเกิดข้อผิดพลาด ให้ส่งข้อผิดพลาดกลับไป
                } else {
                    res.redirect('/?register=success'); // สำเร็จให้ redirect กลับไปที่หน้าแรก
                }
            });
        }
    });
});



module.exports = router;