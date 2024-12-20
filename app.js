var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var adminRouter = require('./routes/admin');
var productRouter = require('./routes/product');
var cartRouter = require('./routes/cart');
var checkoutRouter = require('./routes/checkout');
var myaccountRouter = require('./routes/myaccount')
var orderAll = require('./routes/order_all');
var orderManage = require('./routes/order_manage');
var overAll = require('./routes/overall');
var productManage = require('./routes/product_manage');
var categoriesManage = require('./routes/categories_manage');
var supplierManage = require('./routes/suppliers_manage');
var shipperManage = require('./routes/shippers_manage');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'test',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', authRouter);
app.use('/', adminRouter);
app.use('/', productRouter);
app.use('/',cartRouter);
app.use('/', checkoutRouter);
app.use('/', myaccountRouter);
app.use('/',orderAll);
app.use('/',orderManage);
app.use('/',overAll);
app.use('/',productManage);
app.use('/',categoriesManage);
app.use('/',supplierManage);
app.use('/',shipperManage);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
