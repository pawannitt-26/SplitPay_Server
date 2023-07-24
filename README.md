# Split Pay Server

Split Pay Server is the backend server for the Split Pay app. It handles user authentication, expense splits, and transaction details.

## Getting Started

To get started with the Split Pay Server, follow these steps:

1. Clone the repository to your local machine:


2. Install the required dependencies:


3. Set up the MySQL database:

- Create a new MySQL database named 'SplitPay'.

CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) 

CREATE TABLE `Splits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Place_Name` varchar(45) NOT NULL,
  `Created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Created_by` varchar(45) NOT NULL,
  `Total_Cost` decimal(10,2) NOT NULL,
  `Split_Amount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) 


CREATE TABLE `TransactionReceivers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  PRIMARY KEY (`id`)
)


CREATE TABLE `Transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `Transactions_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `Users` (`id`)
) 

4. Run the server:


The server will run on port 3000 by default.

## API Endpoints

- **POST /signup**: Create a new user account.
- **POST /login**: Authenticate a user.
- **GET /home/:userId**: Get user details by user ID.
- **GET /users**: Get the list of usernames and user IDs.
- **POST /splits**: Store the split details in the 'Splits' table.
- **GET /splitshistory**: Fetch all splits from the 'Splits' table.
- **POST /transactions**: Create a new transaction and insert receivers into the 'TransactionReceivers' table.
- **GET /transactions/:userId**: Fetch all transactions where the user is either the creator or a receiver.

## Dependencies

- Express: Web framework for Node.js.
- MySQL: MySQL database driver for Node.js.
- Body-parser: Middleware to parse JSON requests.

## Contributing

Contributions are welcome! If you find any issues or want to add new features, please create a pull request.
