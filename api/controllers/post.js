import { db } from '../db.js';
import jwt from 'jsonwebtoken';

export const getPosts = async (req, res) => {
  try {
    const q = req.query.cat
      ? 'SELECT * FROM posts WHERE cat=?'
      : 'SELECT * FROM posts';

    db.query(q, [req.query.cat], (error, data) => {
      if (error) return res.status(500).send(error);

      return res.status(200).json(data);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const q =
      'SELECT p.id, `username`, `title`, `content`, p.img, u.img AS userImg, `cat`,`date` FROM users u JOIN posts p ON u.id = p.uid WHERE p.id = ? ';

    db.query(q, [req.params.id], (error, data) => {
      if (error) return res.status(500).json(error);

      return res.status(200).json(data[0]);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};
export const deletePost = async (req, res) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userInfo = jwt.verify(token, process.env.TOKEN_SECRET);
    if (!userInfo) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const postId = req.params.id;
    const q = 'DELETE FROM `posts` WHERE `id` = ? AND `uid` = ?';
    const data = await db.query(q, [postId, userInfo.id]);
    if (!data) {
      res.status(403).json({ message: 'You can delete only your posts' });
    }
    return res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};
export const addPost = async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json('Not authenticated!');

  jwt.verify(token, process.env.TOKEN_SECRET, (error, userInfo) => {
    if (error) return res.status(403).json('Token is not valid!');

    const q =
      'INSERT INTO posts(`title`, `content`, `img`, `cat`, `date`,`uid`) VALUES (?)';

    const values = [
      req.body.title,
      req.body.content,
      req.body.img,
      req.body.cat,
      req.body.date,
      userInfo.id,
    ];

    db.query(q, [values], (error, data) => {
      if (error) return res.status(500).json(error);
      console.log(data);
      return res.json('Post has been created.');
    });
  });
};

export const updatePost = async (req, res) => {
  try {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json('Not authenticated!');

    jwt.verify(token, process.env.TOKEN_SECRET, (err, userInfo) => {
      if (err) return res.status(403).json('Token is not valid!');

      const postId = req.params.id;
      const q =
        'UPDATE posts SET `title`=?,`content`=?,`img`=?,`cat`=? WHERE `id` = ? AND `uid` = ?';

      const values = [
        req.body.title,
        req.body.content,
        req.body.img,
        req.body.cat,
      ];

      db.query(q, [...values, postId, userInfo.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json('Post has been updated.');
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};
