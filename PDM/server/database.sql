CREATE DATABASE pdm;

CREATE TABLE designs(
	design_number SERIAL PRIMARY KEY,
	design_image BYTEA,
	category VARCHAR(255),
	product_type VARCHAR(255),
	diamond_cartage FLOAT(5),
	price FLOAT(5),
	description VARCHAR(255)	
);