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

# Demo Examples


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
