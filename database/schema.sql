/* DT- 517 Create user account database scema*/
CREATE TABLE users
(
    user_id SERIAL PRIMARY KEY,                         /*unique id assigned to each user*/
    name VARCHAR(100) NOT NULL,                         /*Full name required*/
    email VARCHAR(100) NOT NULL,                        /*emial required*/
    phone VARCHAR(20),                                  /*phone number not required*/
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     /*date and time the accout was created*/
    last_login TIMESTAMP                                /*date and time the account last logged in*/
);
