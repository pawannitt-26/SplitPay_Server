const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Kumar@pk1',
  database: 'SplitPay',
});

// Middleware to parse JSON requests
app.use(express.json());
app.use(bodyParser.json());

// Signup route
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  pool.query('INSERT INTO Users (username, password) VALUES (?, ?)', [username, password], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  pool.query('SELECT * FROM Users WHERE username = ? AND password = ?', [username, password], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.sendStatus(500);
      return;
    }

    if (results.length === 0) {
      res.sendStatus(401);
      return;
    }

    const user = results[0];
    res.json(user);
  });
});

// Home page route
app.get('/home/:userId', (req, res) => {
  const userId = req.params.userId;

  pool.query('SELECT * FROM Users WHERE id = ?', [userId], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.sendStatus(500);
      return;
    }

    if (results.length === 0) {
      res.sendStatus(404);
      return;
    }

    const user = results[0];
    res.json(user);
  });
});

// // Transaction page route
// app.get('/transactions', (req, res) => {
//   pool.query('SELECT * FROM Users', (error, results) => {
//     if (error) {
//       console.error('Error executing query:', error);
//       res.sendStatus(500);
//       return;
//     }

//     res.json(results);
//   });
// });

// Route to get the list of usernames of all users with their ids
app.get('/users', (req, res) => {
  pool.query('SELECT id, username FROM Users ORDER BY username ASC', (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.sendStatus(500);
      return;
    }

    const users = results.map((user) => ({ id: user.id, username: user.username }));
    res.json(users);
  });
});

// Route to store the split details in the Splits table
app.post('/splits', (req, res) => {
  const { Place_Name, Created_by, Total_Cost, Split_Amount } = req.body;

  pool.query(
    'INSERT INTO Splits (Place_Name, Created_by, Total_Cost, Split_Amount) VALUES (?, ?, ?, ?)',
    [Place_Name, Created_by, Total_Cost, Split_Amount],
    (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.sendStatus(500);
        return;
      }

      res.sendStatus(200);
    }
  );
  
});

// API endpoint to fetch all splits from the table
app.get('/splitshistory', (req, res) => { // <-- Added the forward slash here
  const sql = 'SELECT * FROM Splits';
  pool.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching splits: ', err);
      res.status(500).json({ error: 'Failed to fetch splits' });
    } else {
      res.json(result);
    }
  });
});

// Route to create a new transaction and insert receivers into TransactionReceivers table
app.post('/transactions', (req, res) => {
  const { amount, created_by, receivers } = req.body;

  pool.query('INSERT INTO Transactions (amount, created_by) VALUES (?, ?)', [amount, created_by], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.sendStatus(500);
      return;
    }

    const transactionId = results.insertId;

    const receiverValues = receivers.map(receiverId => [transactionId, receiverId]);

    pool.query('INSERT INTO TransactionReceivers (transaction_id, receiver_id) VALUES ?', [receiverValues], (error) => {
      if (error) {
        console.error('Error executing query:', error);
        res.sendStatus(500);
        return;
      }

      res.sendStatus(200);
    });
  });
});


app.get('/transactions/:userId', (req, res) => {
  const userId = req.params.userId;

  // Fetch all transactions where the user is either the creator (lent money)
  // or a receiver (owed money)
  const sql = `
    SELECT Transactions.id, amount, created_by, receiver_id
    FROM Transactions
    LEFT JOIN TransactionReceivers ON Transactions.id = TransactionReceivers.transaction_id
    WHERE created_by = ? OR receiver_id = ?`;

  pool.query(sql, [userId, userId], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.sendStatus(500);
      return;
    }

    // Group the transactions by transaction ID
    const transactionsMap = new Map();
    results.forEach((row) => {
      if (!transactionsMap.has(row.id)) {
        transactionsMap.set(row.id, {
          id: row.id,
          amount: row.amount,
          createdBy: row.created_by,
          receivers: [row.receiver_id],
        });
      } else {
        transactionsMap.get(row.id).receivers.push(row.receiver_id);
      }
    });

    const transactions = Array.from(transactionsMap.values());
    res.json(transactions);
  });
});




// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
