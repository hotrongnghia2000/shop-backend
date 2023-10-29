// toàn bộ code sẽ đổ về file server này
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

//
require('dotenv').config();
// với middleware sync, express tự động catch error
// với middleware async, phải dùng next(err) để mang theo err và chuyển qua middleware kế tiếp
// nếu err mà express không thể handler, server sẽ crashed hoặc bị treo, đây chính là exception
// express-async-error sẽ tự động catch exception và gọi next để chuyển đến middleware tiếp theo
// sau đó chỉ cần tạo thêm middleware để hứng exception và thông báo err phù hợp
// exception thường gặp là db
// khi gặp lỗi với db, code trong middleware hiện tại sẽ dừng hoạt động, và được next tới mdw tiếp theo
require('express-async-errors');

// connect DB
const connectDB = require('./src/configs/connectDB');
// tạo middleware thông qua express.Router()
const initRouters = require('./src/routers');
// xử lý err và exception
const handleError = require('./src/middlewares/handleError');

const app = express();

// middleware là function có khả năng truy cập req, res, next
// req là dữ liệu từ req gửi lên server
// res là dữ liệu trả về client
// next là chuyển đến middleware kế tiếp
// app.use(middleware) ==> middleware sẽ thực thi vs mọi request
// app.use(path1, middleware) ===> middleware sẽ thực thi vs request match với mọi path bắt đầu với path1
// app.methods(path2, middleware), với methods có thể là get, post, put, delete,... chỉ thực thi với path match với path2
// app.use nên dùng với middleware chung
// app.methods nên dùng với middleware riêng

// KHAI BÁO MIDDLEWARE CHUNG

// CORS
// cần biết, SOP ==> browser quy định data của 1 domain chỉ được đọc và chỉnh sửa bởi chính nó
// vì vậy mà client http://localhost:8888 của vite không thể gọi api đến server http://localhost:8888
// cors là middleware kích hoạt cors cho mọi request được gửi lên
// có thể tùy biến đa dạng, đây là cơ bản
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE', 'GET'],
    credentials: true,
  })
);

app.use(cookieParser());

// yêu cầu server chấp nhận json
app.use(express.json());
// yêu cầu server chấp nhận data từ form html như string, array
app.use(express.urlencoded({ extended: true }));

// ROUTER
// route sẽ được tạo thông qua use.methods
// viết một hàm tạo router ở folder và require vào đây dùng cho gọn
initRouters(app);

// HANDLE ERROR
app.use(handleError);

// CONNECT DB
connectDB();

// liên kết với máy chủ tại cổng được chỉ định, ở đây là 8888 ==> Url server:http://localhost:8888
app.listen(process.env.SERVER_PORT, () => {
  console.log('Server running...');
});
