CREATE DATABASE IF NOT EXISTS provider_samarinda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE provider_samarinda;

CREATE TABLE IF NOT EXISTS survey_responses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  response_hash CHAR(64) NOT NULL,
  submitted_at DATETIME NULL,
  payload JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_response_hash (response_hash),
  KEY idx_submitted_at (submitted_at)
) ENGINE=InnoDB;