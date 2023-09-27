const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { result } = require('lodash');

dotenv.config();

const TokenVerifying = (req, res, next) => {
  const simple_token = req.headers.authorization;
  if (simple_token == null) {
    return res.status(401).send({ msg: 'No token, authorization denied' });
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send({ msg: 'No token, authorization denied' });
  }
  try {
    const decoded_token = jwt.verify(token, process.env.SECRET);
    req.userPassword = decoded_token;
    next();
  } catch (err) {
    return res.status(498).send({ msg: 'Token is not valid' });
  }
}

module.exports = { TokenVerifying };