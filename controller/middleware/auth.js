const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    console.log("this is runnin")
    // console.log(req)
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        // const error = new Error('Invalid authorization header');
        // error.statusCode = 401;
        // throw error;
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    console.log(token);
    try {
        decodedToken = jwt.verify(token, 'abhishek');
    } catch (error) {
        // console.log(error);
        // error.statusCode = 500;
        // throw error;
        req.isAuth = false;
        return next();
    }
    if (!decodedToken) {
        // const error = new Error('Not Authenticated');
        // error.statusCode = 401;
        // throw error;
        req.isAuth = false;
        return next();
    }
    console.log("this is token  ", decodedToken);
    req.userId = decodedToken._id;
    req.isAuth = true;
    console.log(req.isAuth);
    next();
}