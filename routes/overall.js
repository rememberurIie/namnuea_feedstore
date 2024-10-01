var express = require('express');
var router = express.Router();
var connection = require('../connect');
const util = require('util');

// Promisify connection.query for easier async/await handling
const query = util.promisify(connection.query).bind(connection);

router.get('/overall', async function (req, res, next) {
  const date = new Date();
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth() + 1; // เดือนเริ่มต้นที่ 0

  // รับปีและเดือนจาก query parameters ถ้าไม่มีให้ใช้ปีและเดือนปัจจุบัน
  const selectedYear = req.query.year || currentYear;
  const selectedMonth = req.query.month || currentMonth;

  // SQL Queries สำหรับยอดขายรายวัน
  const dailySalesSql = "SELECT DAY(OrderDate) AS day, SUM(totalPrice) AS totalSales FROM `orders` WHERE MONTH(OrderDate) = ? AND YEAR(OrderDate) = ? GROUP BY DAY(OrderDate)";
  const dailySales = await query(dailySalesSql, [selectedMonth, selectedYear]);

  // สร้างข้อมูลสำหรับยอดขายรายวัน
  const dailySalesData = Array(31).fill(0); // เตรียม array สำหรับ 31 วัน
  dailySales.forEach(item => {
    dailySalesData[item.day - 1] = item.totalSales; // ตั้งค่าตามวัน
  });

  // SQL Queries สำหรับยอดขายตามเดือน
  const monthSalesSql = "SELECT MONTH(OrderDate) AS month, SUM(totalPrice) AS totalSales FROM `orders` WHERE YEAR(OrderDate) = ? GROUP BY MONTH(OrderDate)";
  const monthSales = await query(monthSalesSql, [selectedYear]);

  // สร้างข้อมูลสำหรับยอดขายตามเดือน
  const salesData = Array(12).fill(0); // เตรียม array สำหรับ 12 เดือน
  monthSales.forEach(item => {
    salesData[item.month - 1] = item.totalSales; // ตั้งค่าตามเดือน
  });

  // SQL Queries สำหรับยอดขายตามปี
  const yearSalesSql = "SELECT YEAR(OrderDate) AS year, SUM(totalPrice) AS totalSales FROM `orders` GROUP BY YEAR(OrderDate)";
  const yearSales = await query(yearSalesSql);

  res.render('admin/overall', {
    loggedIn: req.session.loggedIn,
    AccountID: req.session.AccountID,
    AccountName: req.session.AccountName,
    AccountType: req.session.AccountType,
    title: 'สรุปผล',
    currentYear: currentYear,
    selectedYear: selectedYear,
    selectedMonth: selectedMonth,
    salesData: salesData,
    dailySalesData: dailySalesData,
    yearSales: yearSales,
  });
});


module.exports = router;