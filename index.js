const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const config = require('config-lite')(__dirname);
const routes = require('./routes');
const pkg = require('./package');
const winston = require('winston');
const expressWinston = require('express-winston');

const app = express();

// 设置模板目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎为ejs
app.set('view engine', 'ejs');

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
// session 中间件
app.use(session({
  // 设置cookie中保存session id的字段名称
  name: config.session.key,
  // 通过设置secret来计算hash值并存放在cookie中，使产生的signedCookie防篡改
  secret: config.session.secret,
  // 强制更新session
  resave: true,
  // 强制创建一个session，即使用户未登录
  saveUninitialized: false,
  cookie: {
    // 过期时间，过期后cookie中的session id 自动删除
    maxAge: config.session.maxAge
  },
  // 将session存储到mongodb
  store: new MongoStore({
    // mongodb地址
    url: config.mongodb
  })
}));

// flash中间件，用来展示通知
app.use(flash());

// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
  // 上传文件目录
  uploadDir: path.join(__dirname, 'public/img'),
  // 保留后缀
  keepExtensions: true
}));

// 设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
};

// 添加模板必须得三个变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  next();
});

// 正常请求的日志
app.use(expressWinston.logger({
  transports: [
    new(winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}));

// 路由
routes(app);

// 错误请求的日志
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}));

// 错误页面
app.use(function (err, req, res, next) {
  console.error(err);
  req.flash('error', err.message);
  res.redirect('/posts');
});

if (module.parent) {
  // 被require，则导出app
  module.exports = app;
} else {
  // 监听端口，启动程序
  app.listen(config.port, function () {
    console.log(`${pkg.name} listening on port ${config.port}`);
  });
}