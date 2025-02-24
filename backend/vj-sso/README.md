## One time setup 

cd
python3 -m venv vj_sso
source ~/vj_sso/bin/activate
pip install flask flask_cors flask_login

## How to start the server
source ~/vj_sso/bin/activate
cd ~/vj-servers/backend/vj-sso


## How This Flask backend works

Checks login status (/api/check-login)
Handles login (/api/login)
Stores redirect URL after login
Handles logout (/api/logout)
