# One Time Commands

### Create Python virtual environment 
sudo apt install python3-venv -y
python3 -m venv fastapi_env


### SQLite
pip install sqlalchemy


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

### Start the Server
```
cd ~/code/vj-servers/backend/be2
python server.py
```
