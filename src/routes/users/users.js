const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const bcrypt = require('bcryptjs');

const internalServerError = (res) => {
  res.status(500).json({ msg: "Internal server error" });
}

const notFound = (res) => {
  res.status(404).json({ msg: "Not found" });
}

const display_id_email = (req, res) => {
  const id = req.params.id;
  const id_number = parseInt(id);
  if (Number.isNaN(id_number)) {
    pool.query(`SELECT * FROM user WHERE email = ?`, [id], (error, result) => {
      if (error) {
        internalServerError(res);
      } else {
        if (result < 1) {
          notFound(res);
        } else {
          res.status(200).json(result);
        }
      }
    })
  } else {
    pool.query(`SELECT * FROM user WHERE id = ?`, [id], (error, result) => {
      if (error) {
        internalServerError(res);
      } else {
        if (result < 1) {
          notFound(res);
        } else {
          res.status(200).json(result);
        }
      }
    })
  }
};

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

const update_id_user = (req, res) => {
  const id = req.params.id;
  const { email, password, firstname, name } = req.body;
  if (!email || !password || !firstname || !name) {
    return res.status(400).json({ msg: 'Bad parameter'});
  }
  bcrypt.genSalt(10, (error, salt) => {
    if (error) {
      internalServerError(res);
    } else {
      bcrypt.hash(password, salt, (error, hash) => {
        if (error) {
          internalServerError(res);
        } else {
          pool.query(`UPDATE user SET email = ?, password = ?, firstname = ?, name = ? WHERE id = ?`, [email, hash, firstname, name, id], (error, result) => {
            if (error) {
              internalServerError(res);
            } else {
              pool.query(`SELECT * FROM user WHERE id = ?`, [id], (error, result) => {
                if (error) {
                  internalServerError(res);
                } else {
                  if (result[0] == null) {
                    return notFound(res);
                  }
                  result[0].created_at = getFormattedDate(result[0].created_at);
                  res.status(200).json(result);
                }
              })
            }
          })
        }
      });
    }
  });
}

const delete_id_user = (req, res) => {
  const id = req.params.id;
  pool.query(`SELECT * FROM user WHERE id = ?;`, [id], (error, result) => {
    if (error) {
      internalServerError(res);
    } else {
      if (result < 1) {
        notFound(res);
      } else {
        pool.query(`DELETE FROM user WHERE id = ?;`, [id], (error, result) => {
          if (error) {
            internalServerError(res);
          } else {
            if (result < 1) {
              notFound(res);
            } else {
              res.status(200).json({ msg: `Successfully deleted record number : ${id}` });
            }
          }
        })
      }
    }
  })
}

router.get('/:id', display_id_email);
router.put('/:id', update_id_user);
router.delete('/:id', delete_id_user);

module.exports = router;
