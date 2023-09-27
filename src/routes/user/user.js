const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const jwt = require('jsonwebtoken');

const internalServerError = (res) => {
  res.status(500).json({ msg: "Internal server error" });
}

const notFound = (res) => {
  res.status(404).json({ msg: "Not found" });
}

const get_token_information = (req, res) => {
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
    return decoded_token;
  } catch (err) {
    return res.status(498).send({ msg: 'Token is not valid' });
  }
}

const getFormattedDate = (str) => {
  const date = new Date(str);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  return formattedDate;
}

const display_all_user_information = (req, res) => {
  const decoded_token = get_token_information(req, res);

  pool.query(`SELECT * FROM user WHERE id = ?`, decoded_token.id, (error, result) => {
    if (error) {
      internalServerError(res);
    } else {
      if (result < 1) {
        notFound(res);
      } else {
        result[0].created_at = getFormattedDate(result[0].created_at);
        res.status(200).json(result);
      }
    }
  });
}

const display_all_user_task = (req, res) => {

  const decoded_token = get_token_information(req, res);

  pool.query(`SELECT * FROM todo WHERE user_id = ?`, decoded_token.id, (error, result) => {
    if (error) {
      internalServerError(res);
    } else {
      if (result.length < 1) {
        notFound(res);
      } else {
        for (let index = 0; index < result.length; index++) {
          result[index].created_at = getFormattedDate(result[index].created_at);
          result[index].due_time = getFormattedDate(result[index].due_time);
        }
        res.status(200).json(result);
      }
    }
  });
}

/* GET users listing. */
router.get('/', display_all_user_information);
router.get('/todos', display_all_user_task);

module.exports = router;
