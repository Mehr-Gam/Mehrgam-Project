import dotenv from 'dotenv';
import app from './app.js';
import { pool } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {

    // checking db
    await pool.query('SELECT NOW()');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database');
    console.error(error);
    process.exit(1);
  }
};

startServer();
