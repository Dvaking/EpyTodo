const express = require('express');
const router = express.Router();
const pool = require('../../config/db');

const notFound = (res) => {
  res.status(404).json({ msg: 'Not found' });
}

const internalServerError = (res) => {
  res.status(500).json({ msg: "Internal server error" });
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

const insertValueToDatabase = (res, title, description, due_time, user_id, status) => {
  pool.query(`INSERT INTO todo (title, description, due_time, user_id, status) VALUES (?, ?, ?, ?, ?)`, [title, description, due_time, user_id, status], (error, result) => {
    if (error) {
      internalServerError(res);
    } else {
      pool.query(`SELECT * FROM todo WHERE id = ?`, [result.insertId], (error, result) => {
        if (error) {
          internalServerError(res);
        } else {
          if (result.length < 1) {
            notFound(res);
          } else {
            result[0].created_at = getFormattedDate(result[0].created_at);
            result[0].due_time = getFormattedDate(result[0].due_time);
            res.status(200).json(result);
          }
        }
      });
    }
  });
}

// Get all todos
const display_all_todos = (req, res) => {
  pool.query(`SELECT * FROM todo`, (error, result) => {
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
        res.json(result);
      }
    }
  });
}

// Get id todos
const display_id_todos = (req, res) => {
  const id = req.params.id;
  if (!id) {
    error
  }
  pool.query(`SELECT * FROM todo WHERE id =?`, [id], (error, result) => {
    if (error || result.length < 1) {
      notFound(res);
    } else {
      result[0].created_at = getFormattedDate(result[0].created_at);
      result[0].due_time = getFormattedDate(result[0].due_time);
      res.json(result);
    }
  });
}

// POST todos
const create_todos = (req, res) => {
  const { title, description, due_time, user_id, status } = req.body;
  if (!title || !description || !user_id || !due_time || !status) {
    return res.status(400).json({ msg: 'Bad parameter' });
  }
  insertValueToDatabase(res, title, description, due_time, user_id, status)
}

// PUT todos
const update_todos_id = (req, res) => {
  const id = req.params.id;
  const { title, description, due_time, user_id, status } = req.body;
  if (!title || !description || !due_time || !user_id || !status) {
    return res.status(400).json({ msg: 'Bad parameter' });
  }
  pool.query(`SELECT * FROM todo WHERE id = ?`, id, (error, result) => {
    if (error) {
      internalServerError(res);
    } else {
      if (result.length < 1) {
        notFound(res);
      } else {
        pool.query(`UPDATE todo SET title = ?, description = ?, due_time = ?, user_id = ? , status = ? WHERE id = ?`, [title, description, due_time, user_id, status, id], (error, result) => {
          if (error) {
            internalServerError(res);
          } else {
            const display_value_change = {
              title: title,
              description: description,
              due_time: getFormattedDate(due_time),
              user_id: user_id,
              status: status
            }
            res.status(200).json(display_value_change);
          }
        })
      }
    }
  });
}


// DELET todos
const delete_id_todos = (req, res) => {
  const id = req.params.id;
  pool.query(`SELECT * FROM todo WHERE id = ?`, id, (error, result) => {
    if (error) {
      internalServerError(res);
    } else {
      if (result.length < 1) {
        notFound(res);
      } else {
        pool.query(`DELETE FROM todo WHERE id = ?;`, id, (error, result) => {
          if (error) {
            internalServerError(res);
          } else {
            if (result < 1) {
              notFound(res, error);
            } else {
              res.status(200).json({ msg: `Successfully deleted record number: ${id}` });
            }
          }
        })
      }
    }
  });
}

router.get(`/`, display_all_todos);
router.get(`/:id`, display_id_todos);
router.post(`/`, create_todos);
router.put(`/:id`, update_todos_id);
router.delete(`/:id`, delete_id_todos);

module.exports = router;