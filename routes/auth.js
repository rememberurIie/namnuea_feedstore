;var connection = require('../connect');
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

// Authentication route
router.post('/auth', function (req, res) {
    var UserName = req.body.UserName;
    var Pwd = req.body.Pwd;

    if (UserName && Pwd) {
        connection.query('SELECT * FROM account WHERE UserName = ?', [UserName], function (error, results) {
            if (error) {
                console.error('Database query error:', error);
                res.status(500).send('Database query error.');
                return;
            }

            if (results.length > 0) {
                bcrypt.compare(Pwd, results[0].Pwd, function (err, result) {
                    if (err) {
                        console.error('Password comparison error:', err);
                        res.status(500).send('Password comparison error.');
                        return;
                    }

                    if (result) {
                        req.session.loggedin = true;
                        req.session.UserName = UserName; // เก็บ UserName ไว้ใน session
                        console.log('UserName from login:', UserName);
                        console.log('Session UserName:', req.session.UserName);

                        // เปลี่ยนเส้นทางตาม AccountType
                        if (results[0].AccountType === 'Admin' || results[0].AccountType === 'Employee') {
                            res.redirect('/'); // เปลี่ยนเส้นทางไปยังหน้า admin
                        } else if (results[0].AccountType === 'Customer') {
                            res.redirect('/'); // เปลี่ยนเส้นทางไปยังหน้า customer
                        } else {
                            res.redirect('/'); // Default redirect if AccountType is unknown
                        }
                    } else {
                        res.status(401).send('Incorrect Username and/or Password!');
                    }
                });
            } else {
                res.status(401).send('Incorrect Username and/or Password!');
            }
        });
    } else {
        res.status(400).send('Please enter Username and Password!');
    }
});


router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/'); // กลับไปที่หน้าแรกหลังจากออกจากระบบ
    });
});


router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});


module.exports = router;