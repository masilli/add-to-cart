-- Run this in the Neon SQL console to create the shopping_list table
CREATE TABLE IF NOT EXISTS shopping_list (
  id SERIAL PRIMARY KEY,
  item TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
