// when we want to create an err, we use throw new Error('err message')
// create class MyError that inherits Error
// constructor will automatically create an Object containing class properties when creating an instance of the class
// super() is to get all the properties of the parent class
// super(message) is to get an attribute named message of the parent class
class MyError extends Error {
  constructor(message, httpCode) {
    super(message);
    this.httpCode = httpCode;
  }
}

module.exports = MyError;
