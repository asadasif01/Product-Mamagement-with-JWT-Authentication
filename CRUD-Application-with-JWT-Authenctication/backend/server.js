var express = require("express");
var app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var multer = require('multer'),
bodyParser = require('body-parser'),
path = require('path');
  
const mysql = require('mysql')
var fs = require('fs');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'productDB',
  port: '3306' 
});

connection.connect(function(err) {
  if (err) throw err;
  console.log('Connected to MySQL database!');
});

var dir = './uploads';
var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      callback(null, './uploads');
    },
    filename: function (req, file, callback) { callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); }
  }),
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return callback(null, false);
    }
    callback(null, true);
  }
});

app.use(cors());
app.use(express.static('uploads'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", (req, res, next) => {
  try {
    if (req.path == "/login" || req.path == "/register" || req.path == "/") {
      next();
    } else {
      /* decode jwt token if authorized*/
      jwt.verify(req.headers.token, 'shhhhh11111', function (err, decoded) {
        if (decoded && decoded.user) {
          req.user = decoded;
          next();
        } else {
          return res.status(401).json({
            errorMessage: 'User unauthorized!',
            status: false
          });
        }
      })
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    title: 'Apis'
  });
});

/* login api */
app.post("/login", (req, res) => {
  try {
    if (req.body && req.body.username && req.body.password) {
      var query = "SELECT * FROM users WHERE username = ?";
      connection.query(query, [req.body.username], function (err, results) {
        if (err) throw err;
        
        console.log(req.body, results[0]);
        if (results.length > 0) {
          if (bcrypt.compareSync(req.body.password, results[0].password)) {
            checkUserAndGenerateToken(results[0], req, res);
          } else {
            res.status(400).json({
              errorMessage: 'Username or password is incorrect!',
              status: false
            });
          }
        } else {
          res.status(400).json({
            errorMessage: 'Username or password is incorrect!',
            status: false
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

/* register api */
app.post("/register", (req, res) => {
  try {
    if (req.body && req.body.username && req.body.password) {
      var query = "SELECT * FROM users WHERE username = ?";
      connection.query(query, [req.body.username], function (err, results) {
        if (err) throw err;

        if (results.length == 0) {
          var hashedPassword = bcrypt.hashSync(req.body.password, 10);
          var insertQuery = "INSERT INTO users (username, password) VALUES (?, ?)";
          connection.query(insertQuery, [req.body.username, hashedPassword], function (err, results) {
            if (err) {
              res.status(400).json({
                errorMessage: err,
                status: false
              });
            } else {
              res.status(200).json({
                status: true,
                title: 'Registered Successfully.'
              });
            }
          });
        } else {
          res.status(400).json({
            errorMessage: `UserName ${req.body.username} Already Exist!`,
            status: false
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

function checkUserAndGenerateToken(data, req, res) {
  jwt.sign({ user: data.username, id: data.id }, 'shhhhh11111', { expiresIn: '1d' }, (err, token) => {
    if (err) {
      res.status(400).json({
        status: false,
        errorMessage: err,
      });
    } else {
      res.json({
        message: 'Login Successfully.',
        token: token,
        status: true
      });
    }
  });
}

/* Api to add Product */
app.post("/add-product", upload.any(), (req, res) => {
  try {
    if (req.files && req.body && req.body.name && req.body.desc && req.body.price && req.body.discount) {
      var insertQuery = "INSERT INTO products (name, description, price, image, discount, user_id) VALUES (?, ?, ?, ?, ?, ?)";
      connection.query(insertQuery, [req.body.name, req.body.desc, req.body.price, req.files[0].filename, req.body.discount, req.user.id], function (err, results) {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'Product Added successfully.'
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

/* Api to update Product */
app.post("/update-product", upload.any(), (req, res) => {
  try {
    if (req.files && req.body && req.body.name && req.body.desc && req.body.price && req.body.id && req.body.discount) {
      var updateQuery = "UPDATE products SET name = ?, description = ?, price = ?, image = ?, discount = ? WHERE id = ?";
      connection.query(updateQuery, [req.body.name, req.body.desc, req.body.price, req.files[0].filename, req.body.discount, req.body.id], function (err, results) {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'Product updated.'
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

/* Api to delete Product */
app.post("/delete-product", (req, res) => {
  try {
    if (req.body && req.body.id) {
      var updateQuery = "UPDATE products SET is_delete = true WHERE id = ?";
      connection.query(updateQuery, [req.body.id], function (err, results) {
        if (results.affectedRows > 0) {
          res.status(200).json({
            status: true,
            title: 'Product deleted.'
          });
        } else {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

/*Api to get and search product with pagination and search by name*/
app.get("/get-product", (req, res) => {
  try {
    var query = "SELECT COUNT(*) AS count FROM products WHERE is_delete = false AND user_id = ?";
    var params = [req.user.id];
    if (req.query && req.query.search) {
      query += " AND name LIKE ?";
      params.push('%' + req.query.search + '%');
    }
    connection.query(query, params, function (err, countResult) {
      if (err) throw err;

      var perPage = 5;
      var page = req.query.page || 1;
      var totalPages = Math.ceil(countResult[0].count / perPage);
      var offset = (page - 1) * perPage;

      var selectQuery = "SELECT id, name, description, price, discount, image, date FROM products WHERE is_delete = false AND user_id = ?";
      var selectParams = [req.user.id];
      if (req.query && req.query.search) {
        selectQuery += " AND name LIKE ?";
        selectParams.push('%' + req.query.search + '%');
      }
      selectQuery += " ORDER BY date DESC LIMIT ?, ?";
      selectParams.push(offset, perPage);

      connection.query(selectQuery, selectParams, function (err, results) {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'Product retrived.',
            products: results,
            current_page: page,
            total: countResult[0].count,
            pages: totalPages,
          });
        }
      });
    });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

app.listen(2000, () => {
  console.log("Server is Runing On port 2000");
});
