
CREATE DATABASE IF NOT EXISTS `blog`;

USE `blog`;

CREATE TABLE users(
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    img VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE posts(
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    img VARCHAR(255),
    cat VARCHAR(255),
    date DATETIME,
    uid INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (uid) REFERENCES users(id)
);
