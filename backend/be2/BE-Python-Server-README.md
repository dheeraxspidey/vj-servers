# One Time Commands

### Create Python virtual environment 
sudo apt install python3-venv -y
python3 -m venv fastapi_env


### SQLite
pip install sqlalchemy


### MySQL

sudo apt install mysql-server -y
pip install cryptography

sudo systemctl restart mysql

#### Databased changes

mysql -u root -p
CREATE DATABASE vj_users;
CREATE USER 'campus_server_user'@'localhost' IDENTIFIED BY 'Campus123#';
GRANT ALL PRIVILEGES ON vj_users.* TO 'campus_server_user'@'localhost';
FLUSH PRIVILEGES;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);


### For every backend server
sudo ufw allow 5000

### Backend Server Port Access to the frontends
source fastapi_env/bin/activate
pip install fastapi uvicorn
pip install flask-cors

# How to Run the server

### Activate Python Environment
```
source ~/fastapi_env/bin/activate
```

### Start the Server with SQLite
```
cd ~/code/vj-servers/backend/be2
python server.py
```

### Start the Server with MySQL
```
cd ~/code/vj-servers/backend/be2
uvicorn server2:app --host 0.0.0.0 --port 5000
```

After critical changes to the DB
```
sudo systemctl restart mysql
```
