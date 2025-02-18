# vj-servers
Code place for all Vignana Jyothi campus application servers (frontend &amp; backend)



# Folder Structure

Frontend (Workstation1)
  - fe1-server  : React application with Google/Github OAuth login
  - fe2-server  : Python application with EduPrime 

Backend  (Workstation2)
  - be1-server  : Express with Mongodb
  - be2-server  : Python (FastAPI) with MySQL
  - be3-server  : Python (Flask) with NoSQL

  - Databases
    - MongoDB
    - MySQL
    - SQLite

# Servers

## Google SSO Backend

## EduPrime SSO Backend
 Port 10.45.30.251:5001
 Speaks to  https://automation.vnrvjiet.ac.in/eduprime3sandbox/api/Auth/Validate
 APIs supported
 - post : /auth/eduprime 
    Request  {(username, password), (header: APIKey)} 
    Response {username, eduprimeToken}

## React & Express App
 Web Port : 3100

 Backend  : 5000
  post : /register

 Database : mongodb://10.45.30.252:27017

## Flutter Web App 
 Web port : 44183
 Speaks to backend: https://automation.vnrvjiet.ac.in/eduprime3sandbox/api/Auth/Validate

 ## HallBooking App
 Web port : 4000
 
 ## Minor SSO based Apps

 App1 : 3001  (frotend/frontend-python-flask/eduprime_sso_app1) 
 App2 : 3002  (frotend/frontend-python-flask/eduprime_sso_app2)

## Super App

Web port: 3003 (frontend/fe1)

# One time setup for every user on the server

Login to your user account. 
Run ssh-keygen to generate ssh-key
Save the ky in https://github.com/settings/keys 

### Git initialisation 

  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"


Merge remote changes & keep history	`git pull --no-rebase`
Rebase local commits on latest remote	`git pull --rebase`
Only update if no conflicts exist	`git pull --ff-only`
Discard local changes & force sync	`git reset --hard origin/main`

## Debugging

### NGINX
sudo systemctl status nginx
sudo systemctl start nginx

sudo journalctl -xe
sudo tail -f /var/log/nginx/error.log


### Tools

#### Start a server instantly. 

python -m http.server 3001


#### Useful git commands
git fetch origin
git pull --rebase origin main




BE-3:
one time: 
npm install express express-async-handler
to start : node server

FE-3:
one time :
npm install

to run : npm run dev

if any port is running on 3000 it fails as the backend allows only port 3000.
