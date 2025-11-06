CREATE DATABASE IF NOT EXISTS person_registry;
USE person_registry;

CREATE TABLE pr_person (
  tax_code VARCHAR(16) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL
);

CREATE TABLE pr_address (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  person_tax_code VARCHAR(16) NOT NULL UNIQUE,
  street VARCHAR(200) NOT NULL,
  street_no VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  province CHAR(2) NOT NULL,
  country VARCHAR(100) NOT NULL,
  FOREIGN KEY (person_tax_code) REFERENCES pr_person(tax_code) ON DELETE CASCADE
);
