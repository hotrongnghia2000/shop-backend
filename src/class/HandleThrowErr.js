// khi muốn tạo ra err, ta dùng throw new Error('err message')
// tạo class MyError kế thừa Error
// constructor sẽ tự động tạo ra Object chứa các thuộc tính của class khi tạo instance của class
// super() là lấy toàn bộ thuộc tính của parent class
// super(message) là lấy 1 thuộc tính tên message của parent class
class MyError extends Error {
  constructor(message, httpCode) {
    super(message);
    this.httpCode = httpCode;
  }
}

module.exports = MyError;
