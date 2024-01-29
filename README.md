# Authenticated CRUD Application

This repository contains the source code for an authenticated CRUD (Create, Read, Update, Delete) application. The application provides functionalities for user authentication and authorization, allowing authenticated users to perform CRUD operations on a database.

## Features

- User Authentication: Users can register and login to access the application.
- CRUD Operations: Authenticated users can perform CRUD operations on specific resources.
- Database Integration: The application is integrated with a database to store and manage data.
- File Upload: Users can upload files as part of the CRUD operations.

## Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer

## Getting Started

To get started with the application, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/orientedasad/CRUD-Application-with-JWT-Authenctication
   ```

2. Install dependencies:

   ```bash
   cd CRUD-Application-with-JWT-Authenctication
   npm install
   ```

3. Configure the database settings in the backend configuration file.

4. Start the backend server:

   ```bash
   npm start
   ```

5. Start the frontend development server:

   ```bash
   cd client
   npm start
   ```

6. Access the application at `http://localhost:3000` in your web browser.

## Usage

- Register/Login: Users can register and login to access the application.
- CRUD Operations: Authenticated users can perform CRUD operations on the available resources.
- Picture Upload: Users can upload picture when adding or updating resources.

## Acknowledgments

- This project was just for practice CRUD operations and authentication.
