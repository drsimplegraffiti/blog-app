import { db } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const register = async (req, res) => {
  try {
    //CHECK EXISTING USER
    const q = 'SELECT * FROM users WHERE email = ? OR username = ?';

    // handle empty fields
    if (!req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all fields',
      });
    }

    db.query(q, [req.body.email, req.body.username], async (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length) return res.status(409).json('User already exists!');

      //Hash the password and create a user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const q = 'INSERT INTO users(`username`,`email`,`password`) VALUES (?)';
      const values = [req.body.username, req.body.email, hashedPassword];

      db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json('User has been created.');
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    //CHECK EXISTING USER
    const q = 'SELECT * FROM users WHERE email = ? OR username = ?';

    // handle empty fields
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all fields',
      });
    }

    db.query(q, [req.body.email, req.body.username], async (error, data) => {
      if (error) return res.status(500).json(error);
      if (!data.length) return res.status(404).json('User does not exist!');

      //Check if password is correct
      const validPassword = await bcrypt.compare(
        req.body.password,
        data[0].password
      );
      if (!validPassword) return res.status(400).json('Invalid password!');

      //Create and assign a token
      const token = jwt.sign({ id: data[0].id }, process.env.TOKEN_SECRET);
      const { password, ...other } = data[0];
      res.cookie('access_token', token, { httpOnly: true });
      return res.status(200).json(other);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie('access_token', {
      sameSite: 'none',
      secure: true,
    });
    return res.status(200).json('User logged out.');
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export { register, login, logout };
