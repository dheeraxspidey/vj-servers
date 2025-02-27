from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import bcrypt
import re
import json
import pandas as pd
from functools import wraps
import secrets
import smtplib
from email.message import EmailMessage
from datetime import datetime, timedelta, timezone
from threading import Thread
from collections import Counter
from sentence_transformers import SentenceTransformer, util
app = Flask(__name__)

# Configure CORS to allow all origins (for development only)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for testing; adjust for production
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
@app.route('/')
def home():
    return "Hello, Flask server is working!"

DATABASE = '/home/campus/vj-servers/backend/be2-dpd/DB/dpd.db'
file_path = '/home/campus/vj-servers/backend/be2-dpd/projects.json'
with open(file_path, 'r') as file:
    data = json.load(file)


import jwt

df = pd.DataFrame(data)
#df['CombinedText'] = df['ProjectTitle'].apply(clean_text)
# vectorizer = TfidfVectorizer().fit(df['CombinedText'])
passages = df['ProjectTitle'].tolist()

# Secret key for encoding and decoding JWT
SECRET_KEY = 'kiran'


name=''
roll_id=''
department=''
role=''
hashed_password=''
email=''
server = smtplib.SMTP('smtp.gmail.com', 587,timeout=10)  # Replace with your SMTP server
server.starttls()  # Secure the connection
server.login('tarakakiranmayi@gmail.com', 'ncqrrutuvrhchjfu')  # Replace with your email credentials
def create_token(user_id):
    # Define token expiration time
    expiration = datetime.now(timezone.utc) + timedelta(hours=48)
    
    # Create the token
    token = jwt.encode({'user_id': user_id, 'exp': expiration}, SECRET_KEY, algorithm='HS256')
    return token


def verify_token(token):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return decoded
    except jwt.ExpiredSignatureError:
        return {"error": "Token has expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}

def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = request.headers.get('Authorization')
        # #(request)
        # #(token)
        if token:
            token = token.replace('Bearer ', '')
            decoded = verify_token(token)
            # #(decoded)
            if isinstance(decoded, dict) and "error" in decoded:
                # print("here error")
                return jsonify(decoded), 401
            return f(*args, **kwargs)
        else:
            
            return jsonify({"error": "Token is missing"}), 401
    return decorator
def connect_to_db():
    # print("called")
    try:
        conn = sqlite3.connect(DATABASE)
        print("connected to db")
        return conn
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e} lets look ")
        return None

def create_tables():
    conn = connect_to_db()
    # if conn:
    #     try:
    #         cursor = conn.cursor()
    #         # Create users table
    #         cursor.execute('''
    #             CREATE TABLE users_new (        
    #                 roll_id TEXT PRIMARY KEY,         
    #                 name TEXT NOT NULL,
    #                 password TEXT NOT NULL,
    #                 role TEXT NOT NULL,
    #                 department TEXT NOT NULL,
    #                 email TEXT NOT NULL
    #             );


                
    #          ''')
#             CREATE TABLE ProjectReview (
#                         project_id INTEGER ,
#                         department TEXT,
#                         review_id TEXT,
#                         reviews TEXT NOT NULL,
#                         rating INTEGER,
#                         faculty_name TEXT NOT NULL,
#                         PRIMARY KEY (project_id, department, review_id),
#                         FOREIGN KEY (project_id) REFERENCES project_new(project_id),
#                         FOREIGN KEY (department) REFERENCES PRC(department)
# )
            # cursor.execute('''
#             CREATE TABLE project_new (
#     project_id INTEGER NOT NULL,
#     roll_id INTEGER NOT NULL,
#     title TEXT,
#     abstract TEXT,
#     staff_name TEXT,
#     requirements TEXT,
#     domain TEXT,
#     department TEXT,
#     done_review BOOLEAN DEFAULT FALSE,
#     status BOOLEAN DEFAULT TRUE,
#     PRIMARY KEY (project_id, roll_id),
#     FOREIGN KEY (roll_id) REFERENCES users_new(roll_id)
# );

                


            #  # Create students table
            # cursor.execute('''
            #     CREATE TABLE IF NOT EXISTS students (
            #         id INTEGER PRIMARY KEY AUTOINCREMENT,
            #         project_id INTEGER NOT NULL,
            #         student_id INTEGER NOT NULL,
            #         name TEXT NOT NULL,
            #         email TEXT NOT NULL,
            #         FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
            #     )
            # ''')
            # cursor.execute('''
                    # CREATE TABLE ProjectReview (
                    #     project_id INTEGER,
                    #     department TEXT,
                    #     review_id INTEGER,
                    #     reviews TEXT NOT NULL,
                    #     rating INTEGER,
                    #     faculty_name TEXT NOT NULL,
                    #     PRIMARY KEY (project_id, department, review_id),
                    #     FOREIGN KEY (project_id) REFERENCES project_new(project_id),
                    #     FOREIGN KEY (department) REFERENCES PRC(department)
                    # );

                           
            # ''')

            # CREATE TABLE PRC(Dep_ID INTEGER primary key, Department TEXT not null unique,password TEXT not null);

        #     conn.commit()
        # except sqlite3.Error as e:
        #     print(f"Error creating tables: {e}")
        # finally:
    
        #     conn.close()
def generate_otp(length=6):
    otp = ''.join(secrets.choice('0123456789') for _ in range(length))
    return otp

# Function to send OTP via email
def send_email(content, to_email,subject):
    msg = EmailMessage()
    msg.set_content(content)
    msg['Subject'] = subject
    msg['From'] = 'webx008@gmail.com'  # Replace with your email address
    msg['To'] = to_email

    # Set up the server
    
    server.send_message(msg)

def async_send_email(content, to_email,subject):
    thread = Thread(target=send_email, args=(content, to_email,subject))
    thread.start()




def validate_password(password):
    if len(password) < 8 or len(password) > 16:
        return False
    if not re.search(r'[A-Za-z]', password):
        return False
    if not re.search(r'[0-9]', password):
        return False
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    return True

def email_checking(email):
    return email.endswith('@vnrvjiet.in')

def faculty_email_checking(email):
    return not any(char.isdigit() for char in email)

def department_check(email,department):
    list_of_department={'01':'CE','02':'EEE','03':'ME','04':'ECE','05':
                        'CSE','10':'EIE','12':'IT','24':'AE','32':'CSBS','66':'CS-AIML','67':
                        'CS-DS','69':'CS-IOT','62':'CS-CYS','72':'AI-DS'}
    return list_of_department.get(email[6:8]) == department

def is_otp_expired(generated_time, validity_duration):
    return datetime.now() > (generated_time + validity_duration)
@app.route('/searchForProject', methods=['POST'])
def searchForProject():
    if request.method == 'POST':
        request_data = request.get_json()
        query = request_data.get('query', '')
        print(query)
        #query=clean_text(query)
        # query_vec = vectorizer.transform([query])
        # project_vecs = vectorizer.transform(df['CombinedText'])
        
        # scores = cosine_similarity(query_vec, project_vecs).flatten()
        # results = [{'project': project, 'score': score} for project, score in zip(data, scores)]
        # sorted_results = sorted(results, key=lambda x: x['score'], reverse=True)
        

# Encode the query and passages
        query_embedding = model.encode(query, convert_to_tensor=True)
        passage_embeddings = model.encode(passages, convert_to_tensor=True)

        # Compute cosine similarity between the query and passages
        similarity_scores = util.pytorch_cos_sim(query_embedding, passage_embeddings)

        # Convert similarity scores to a numpy array
        similarity_scores = similarity_scores.cpu().numpy().flatten()
        similarity_scores = similarity_scores.astype(float)
        # Prepare the results
        results = [{'passage': passage, 'score': score} for passage, score in zip(data, similarity_scores)]
        sorted_results = sorted(results, key=lambda x: x['score'], reverse=True)
        # Print results
        
        filtered_results = [result for result in sorted_results if result['score'] > 0.2]
        final_results = [{"passage": dict(result["passage"]), "score": float(result["score"])} for result in filtered_results]

        return jsonify({"Results": final_results})  # Ensure JSON format

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    print(data)
    password = data.get('password')
    role = data.get('role')
    department = data.get('department')
    roll_id = data.get('id').lower()
    email = data.get('email').lower()
    list_of_department = ['01', '02', '03', '04', '05', '10', '12', '24', '32', '66', '67', '69', '62', '72']
    
    if role == 'student':
        id_match = roll_id == email[:10]
        dept_match = department_check(email, department)
        valid_id = id_match and dept_match and email_checking(email)
        if not valid_id or not (roll_id[2:5] in ['071', '075'] and roll_id[5] == 'a' and roll_id[6:8] in list_of_department):
            return jsonify({"error": "given roll id is incorrect, please provide correct roll id. Email must end with @vnrvjiet.in"})
    # else:
    #     if not (email_checking(email) and faculty_email_checking(email)):
    #         return jsonify({"error": "given email is incorrect, please provide correct email"})

    if not validate_password(password):
        return jsonify({"error": "Password must be between 8 and 16 characters long and include at least one letter, one number, and one symbol."})

    otp = generate_otp()
    otp_generated_time = datetime.now()
    OTP_VALIDITY_DURATION = timedelta(minutes=5)
    subject='OTP'
    content="Your OTP"+otp+"Will be valid for 5 minutes"
    # Send the OTP asynchronously
    async_send_email(content, email,subject)

    if is_otp_expired(otp_generated_time, OTP_VALIDITY_DURATION):
        return jsonify({"error": "The OTP has expired."})
    else:
        return jsonify({
            "message": 'otp required and is valid for 5 minutes',
            "time": str(OTP_VALIDITY_DURATION),
            "otp_generated": otp_generated_time,
            "otp": otp
        })
@app.route('/search', methods=['GET', 'POST'])
def search():
    if request.method == 'POST':
        # Get the search query from the form
        query = request.form['query']

        # Insert the query into the database
        conn = connect_to_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO search_queries (query) VALUES (?)", (query,))
        conn.commit()
        conn.close()
    return 
@app.route('/frequent_searches')
def frequent_searches():
    # Connect to the database
    conn = connect_to_db()
    cursor = conn.cursor()

    # Get all search queries from the database
    cursor.execute("SELECT query FROM search_queries")
    queries = cursor.fetchall()

    # Count the frequency of each search query
    query_list = [query['query'] for query in queries]
    query_counts = Counter(query_list)

    # Sort queries by frequency (descending)
    most_frequent = query_counts.most_common()
    conn.close()
    return jsonify({"Frequent Search":most_frequent})

    
@app.route('/generate_otp_again',methods=['GET'])
def generate_otp_again():
    otp = generate_otp()
    otp_generated_time = datetime.now()
    OTP_VALIDITY_DURATION = timedelta(minutes=5)
        # Email recipient
    recipient_email = email  # Replace with the recipient's email

        # Send the OTP
    send_email(otp, recipient_email)

    print(f'OTP {otp} sent to {recipient_email}')
        
    if is_otp_expired(otp_generated_time, OTP_VALIDITY_DURATION):
        print("The OTP has expired.")
    else:
        print("The OTP is still valid.")
        return jsonify({"message":'otp required and is valid'})

@app.route('/register_check', methods=['POST'])
def register_check():
    data = request.json
    
    otp_check = data.get('otp')
    data=data.get('data')
    data1=data[0]
    data2=data[1]
    
    # username = data.get('username')
    name = data2.get('name')
    password = data2.get('password')
    role = data2.get('role')
    department = data2.get('department')
    roll_id=data2.get('id')
    roll_id=roll_id.lower()
   
    email=data2.get('email').lower()
    
    
    
    # otp=data.get('otp_actual')
    # otp_generated_time=data.get('otp_generated_time')
    # OTP_VALIDITY_DURATION=data.get('OTP_VALIDITY_DURATION')
    # print(otp_check,"here")
    # if is_otp_expired(otp_generated_time, OTP_VALIDITY_DURATION):
    #         return jsonify({'message':'otp exipred'})
    # if otp_check!=otp:
    #     return jsonify({'message':"please enter correct otp"})
    # otp = generate_otp()

        # # Email recipient
        # recipient_email = email  # Replace with the recipient's email

        # # Send the OTP
        # send_email(otp, recipient_email)

        # print(f'OTP {otp} sent to {recipient_email}')
        
    # if not validate_password(password):
    #     return jsonify({"error": "Password must be between 8 and 16 characters long and include at least one letter, one number, and one symbol."})

    # hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
  
    
    otp_actual = data1.get('otp')
    otp_generated_str = data1.get('otp_generated')
    otp_validity_duration_str = data1.get('time')
   
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    # Print for debugging
  

    try:
        # Convert the OTP generated time from string to datetime
        otp_generated_time = datetime.strptime(otp_generated_str, '%a, %d %b %Y %H:%M:%S GMT')
        
        # Convert validity duration from string to timedelta
        hours, minutes, seconds = map(int, otp_validity_duration_str.split(':'))
        OTP_VALIDITY_DURATION = timedelta(hours=hours, minutes=minutes, seconds=seconds)
    
    except ValueError as e:
        return jsonify({'message': 'Invalid data format', 'error': str(e)}), 400

    # Check if the OTP has expired
    if is_otp_expired(otp_generated_time, OTP_VALIDITY_DURATION):
        pass
    else:
        # Validate OTP
        if otp_check == otp_actual:
            pass
        else:
            return jsonify({'message': 'Invalid OTP'}), 400
    conn = connect_to_db()
    print(conn)
    if role == 'student':
        print("yes...")
        if conn:
            try:
                cursor = conn.cursor()
                print("well...")
                print(f"Inserting: {roll_id}, {name}, {email}, {hashed_password}, {role}, {department}")
                cursor.execute('INSERT INTO students_users(id, name, email, password, role, department) VALUES (?, ?, ?, ?, ?, ?)', 
                            (roll_id, name, email, hashed_password, role, department))
                conn.commit()
                print("registered....")
                return jsonify({"message": "User registered successfully!"}), 201
            except sqlite3.IntegrityError as e:
                return jsonify({"error": "Already registered"}), 409  # Conflict status code
            except sqlite3.Error as e:
                return jsonify({"error": str(e)}), 500
            finally:
                conn.close()

    else:
        if conn:
            try:

                cursor = conn.cursor()
                cursor.execute('INSERT INTO users_new (roll_id, name, password, role, department,email) VALUES (?, ?,?, ?, ?,?)', 
                            (roll_id, name, hashed_password, role, department,email))
                conn.commit()
                print("registere")
                return jsonify({"message": "User registered successfully!"}), 201
            except sqlite3.IntegrityError:
                return jsonify({"error": f"already registered"})
            except sqlite3.Error as e:
                return jsonify({"error": str(e)}), 500
            finally:
                conn.close()
        return jsonify({"error": "Failed to connect to the database."}), 500




@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided."}), 400

    roll_id = data.get('ID')
    roll_id = roll_id.lower()
    password = data.get('password')
    
    
    if not roll_id or not password:
        return jsonify({"error": "ID and password are required."}), 400

    password_bytes = password.encode('utf-8')
    conn = connect_to_db()
    
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT password, email, role, roll_id, department, name FROM users_new WHERE roll_id = ?', (roll_id,))
            user = cursor.fetchone()
            
            if not user:  # If not found, check in students_users
                cursor.execute('SELECT password, email, role, id, department, name FROM students_users WHERE id = ?', (roll_id,))
                user = cursor.fetchone()
            
            if user:
                # user[0] is the hashed password from the database
                hashed_password = user[0]
                
                # Compare the provided password with the hashed password
                if bcrypt.checkpw(password_bytes, hashed_password):
                    token = create_token(user[3])  # Use roll_id or id for token creation
                    return jsonify({"message": "Login successful!", "user": {
                        "role": user[2],
                        "email": user[1],
                        "id": user[3],
                        "department": user[4],
                        "name": user[5]
                    }, "token": token}), 200
                else:
                    print("ia m here...")
                    return jsonify({"error": "Invalid ID or password."})
            else:
                return jsonify({"error": "Invalid ID or password."})

        except sqlite3.Error as e:
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            conn.close()
    
    return jsonify({"error": "Failed to connect to the database."}), 500

@app.route('/add_project', methods=['POST'])
@token_required
def add_project():
    print("called",request.json)
    data = request.json
    title = data.get('title', '')
    abstract = data.get('abstract', '')
    requirements = data.get('requirements', '')
    
    staff_name = data.get('staffname', '')
    domain=data.get('domain','')
    print(requirements,domain ,"whynmcducjd")
    department=data.get('department','')
    roll_id=data.get('roll_id','')
    
    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO project_new (title, abstract, requirements, staff_name,domain,department,roll_id)
                VALUES (?, ?, ?, ?,?,?,?)
            ''', (title, abstract, requirements, staff_name,domain,department,roll_id))
            
            conn.commit()
            return jsonify({"message": "Project added successfully!"}), 201
        except sqlite3.IntegrityError:
            return jsonify({"error": f"The title '{title}' already exists."}), 400
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    return jsonify({"error": "Failed to connect to the database."}), 500
#deleting of projects
@app.route('/delete_project/<id>', methods=['DELETE'])
@token_required
def delete_project(id):
    
    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM project_new WHERE project_id = ?', (id,))
            conn.commit()
            if cursor.rowcount > 0:
                return jsonify({"message": f"Project deleted successfully!"}), 200
            else:
                return jsonify({"error": f"No project found with title '{id}'."}), 404
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}),500
        finally:
            conn.close()
    return jsonify({"error": "Failed to connect to the database."}), 500
#upadting the project
@app.route('/update_project', methods=['PUT'])
@token_required
def update_project():
    data1 = request.json
    print(data1)
    data=data1[0]
    da=data1[1]
    print("ddv",da)
    project_id = data.get('Project_id')
    title = data.get('title')
    abstract = data.get('abstract')
    requirements = data.get('requirements')
    staff_name = data.get('staff_name')
    domain = data.get('domain')
    department = data.get('department')
    done_review = data.get('done_review')
    under_review = data.get('under_review')
    status = data.get('status')
    roll_id=da.get('id')
    
    if not project_id:
        return jsonify({"error": "Project ID is required."}), 400

    # Create the SQL update query
    update_query = '''
        UPDATE project_new
        SET title = COALESCE(?, title),
            abstract = COALESCE(?, abstract),
            requirements = COALESCE(?, requirements),
            staff_name = COALESCE(?, staff_name),
            domain = COALESCE(?, domain),
            department = COALESCE(?, department),
            done_review = COALESCE(?, done_review),
            under_review = COALESCE(?, under_review),
            status = COALESCE(?, status)
        WHERE project_id = ? and roll_id= ? 
    '''
    
    # Prepare the data to be updated
    update_values = (title, abstract, requirements, staff_name, domain, department, done_review,under_review, status, project_id,roll_id)
    
    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute(update_query, update_values)
            conn.commit()

            if cursor.rowcount > 0:
                return jsonify({"message": f"Project '{project_id}' updated successfully!"}), 200
            else:
                return jsonify({"error": f"No project found with ID '{project_id}'."}), 404
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    return jsonify({"error": "Failed to connect to the database."}), 500

#general list of all projects
@app.route('/page_visite',methods=['POST'])
def page_visite():
    page_name = "Home Page"
    
    # Connect to the database
    conn = connect_to_db()
    cursor = conn.cursor()

    # Check if the page exists, if not, insert it
    cursor.execute("SELECT * FROM page_views WHERE page_name = ?", (page_name,))
    page = cursor.fetchone()

    if page:
        # If the page exists, increment the view count
        cursor.execute("UPDATE page_views SET view_count = view_count + 1, last_viewed = ? WHERE page_name = ?", 
                       (datetime.now(), page_name))
    else:
        # If the page does not exist, insert it with a count of 1
        cursor.execute("INSERT INTO page_views (page_name, view_count) VALUES (?, ?)", 
                       (page_name, 1))

    # Commit the transaction and close the connection
    conn.commit()
    conn.close()

@app.route('/page_views',methods=['GET'])
def page_views():
    # Connect to the database and fetch all page views
    conn = connect_to_db()
    cursor = conn.cursor()
    cursor.execute("SELECT page_name, view_count, last_viewed FROM page_views ORDER BY view_count DESC")
    pages = cursor.fetchall()
    conn.close()
    return jsonify({"message":"Total :"+pages+""})
@app.route('/list_projects', methods=['GET'])
@token_required
def list_projects():
    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM project where status=TRUE')
            projects = cursor.fetchall()
            return jsonify(projects), 200
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    return jsonify({"error": "Failed to connect to the database."}), 500

#this for published project for students
@app.route('/projects_published', methods=['POST'])
@token_required
def projects_published():
    data = request.json
    print(data[1])
    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM project_new where status=? and done_review=? and publish=? and department=?',(1,'TRUE','TRUE',data[0],))
            projects = cursor.fetchall()
            cursor.execute('Select * from faculty_projects where roll_id=?',(data[1],))
            student_project=cursor.fetchall()
            if student_project:
                
                cursor.execute('Select * from project_new where project_id=?',(student_project[0][1],))
                student_project=cursor.fetchall()
            else:
                student_project=[[]]
            return jsonify(projects,student_project[0]), 200
        except sqlite3.Error as e:
            print(str(e))
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    return jsonify({"error": "Failed to connect to the database."}), 500
#data for faculty getting the data of projects he added
@app.route('/project/<roll_id>', methods=['GET'])
@token_required
def project(roll_id):
    print(roll_id)
    conn = connect_to_db()
    
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM project_new WHERE roll_id = ?', (roll_id,))
            projects = cursor.fetchall()
            cursor.execute('SELECT * FROM faculty_projects where faculty_id=?',(roll_id,))
            students=cursor.fetchall()
            print(students)

            # Create a dictionary to hold student details by Project_id
            student_dict = {}

            # Extract student IDs from students list
            student_ids = [student[2] for student in students]  # student_id is at index 3
            print(student_ids)
            # Fetch student details from students_new table
            if student_ids:
                print("Student IDs:", student_ids)  # Debugging
                
                placeholders = ",".join(["?"] * len(student_ids))  # Correct placeholders
                query = f"SELECT id, name, email FROM students_users WHERE role=? AND id IN ({placeholders})"
                
                print("Generated SQL Query:", query)  # Debugging
                print("Query Parameters:", ("student", *student_ids))  # Debugging
                
                cursor.execute(query, ("student", *student_ids))  # Execute query
                
                rows = cursor.fetchall()  # Store fetched results in a variable
                print(rows)
                for row in rows:  # Iterate over the fetched results
                    print("Each row:", row)

                student_details = {row[0]: {"name": row[1], "email": row[2]} for row in rows}  # Use stored rows

                print("Final Student Details:", student_details)

            # Debug if users_new table has data
            cursor.execute("SELECT * FROM users_new LIMIT 5")
            print("Sample users_new Data:", cursor.fetchall())

            # Populate student_dict with project-wise student details
            for student in students:
                project_id = student[1]  # Project_id is at index 2
                student_id = student[2]  # student_id is at index 3
                
                if student_id in student_details:
                    student_info = {
                        "student_id": student_id,
                        "name": student_details[student_id]["name"],
                        "email": student_details[student_id]["email"]
                    }
                    if project_id in student_dict:
                        student_dict[project_id].append(student_info)
                    else:
                        student_dict[project_id] = [student_info]

            # Convert projects list into list of dictionaries
            result = [
                {
                    "Project_id": project[0],
                    "title": project[2],
                    "abstract": project[3],
                    "requirements": project[5],
                    "domain": project[6],
                    "department": project[7],
                    "done_review": project[8],
                    "status": project[9],
                    "publish": project[10],
                    "under_review": project[11],
                    "students": student_dict.get(project[0], [])  # Attach students if available
                }
                for project in projects
            ]

            # Close DB connection
            

            # print("i want this",result)

            # if projects:
            #     # Convert list of tuples to list of dictionaries
            #     print("issue",projects)
            #     result = [
            #         {
            #             "Project_id": project[0],
            #             "title": project[2],
            #             "abstract": project[3],
            #             "requirements": project[5],
                        
            #             "domain":project[6],
            #             "department":project[7],
            #             "done_review":project[8],

            #             "status":project[9],
            #             "publish":project[10],
            #             "under_review":project[11]
            #         }
            #         for project in projects
            #     ]
            return jsonify(result), 200

            
            return jsonify({"error": "Project not found."}), 404
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    # return jsonify({"error": "Failed to connect to the database."}), 500
# @app.route('/filter', methods=['POST'])
# def get_data():
#     request_data = request.get_json()
#     query = request_data.get('query', {})
#     Type = query.get('Type', None)
#     Department = query.get('Department', None)
#     Year = query.get('Year', None)
#     print(query)
#     print(type(Year))
#     # if len(Year)>0:
#     #     Year = int(Year)

#     # data1 = df.copy()  # Use a copy to avoid modifying the original DataFrame
    
#     # # Apply filters
#     # if len(Year)>0:
#     #     Year = int(Year)
#     #     data1 = [project for project in data if project.get('Year') == Year]
#     #     if len(Department)>0:
#     #         data1 = [project for project in data1 if project.get('Department') == Department]
#     #         if len(Type)>0:
#     #             data1 = [project for project in data1 if project.get('Project_Type') == Type]
        

#     # return jsonify(data1)
#     query = request_data.get('query', {})
#     Type = query.get('Type', None)
#     Department = query.get('Department', None)
#     Year = query.get('Year', None)
    
#     # Print Year for debugging
#     print("Received Year:", Year)

#     # Initialize data1 with a copy of df
#     data1 = df.copy()  # Use a copy to avoid modifying the original DataFrame

#     # Apply filters
#     if Year:
#         try:
#             Year = int(Year)  # Convert Year to integer if it's not None or empty
#             data1 = data1[data1['Year'] == Year]
#             print(data1)
#         except ValueError:
#             return jsonify({"error": "Invalid Year format"}), 400

#     if Department:
#         data1 = data1[data1['Department'] == Department]

#     if Type:
#         data1 = data1[data1['Project_Type'] == Type]
#     print(data1)
#     # Convert the filtered DataFrame to a list of dictionaries for JSON response
#     result = data1.to_dict(orient='records')
#     print(result)

#     return jsonify(result)
@app.route('/filter',methods=['POST'])
def get_data():
    if request.method == 'POST':
        request_data = request.get_json()
        query = request_data.get('query', '')
        print(query)
        Type = query.get('Type', None)
        Department = query.get('Department', None)
        Year = query.get('Year', None)     
        # Print the parameters for debugging
        print("Year:", Year)
        print("Department:", Department)
        print("Type:", Type)

        # Start filtering
        data1 = df.copy()  # Use a copy to avoid modifying the original DataFrame
        print(data1)

        # Filter by Year if provided
        if Year:
            try:
                Year = int(Year)  # Convert Year to integer if it's not None or empty
                data1 = data1[data1['Year'] == Year]
            except ValueError:
                return jsonify({"error": "Invalid Year format"}), 400

        if Department:
            data1 = data1[data1['Department'] == Department]

        if Type:
            data1 = data1[data1['Project_Type'] == Type]

    # Convert the filtered DataFrame to a list of dictionaries for JSON response
        result = data1.to_dict(orient='records')

        return jsonify(result)


#mail for prc team for altering them on new projects that must be reviewed
@app.route('/under_review',methods=['POST'])
@token_required
def under_review():
    print("fbdfhrdh")
    data1=request.json
    data=data1.get('project')
    print(request.json)
    title=data.get('title')
    data=data1.get('currentUser')
    roll_id=data.get('id')
    name=data.get('name')
    dep=data.get('department')
    print(dep)
    subject = "New Project Submission to be Reviewed"
    content = f"Dear {dep} PRC,\n\n" \
              f"A new project titled '{title}' has been submitted by {name} " \
              f"(Roll ID: {roll_id}).\n\n" \
              "Please review the project at your earliest convenience.\n\n" \
              "Thank you."
    # async_send_email(content, dep+'PRC',subject)
    async_send_email(content,'tarakakiranmayi@gmail.com',subject)
    return jsonify({'message':'sent email wait for review!'})
#data for under_review project for PRC
@app.route('/under_review_projects_department/<department>',methods=['GET'])
@token_required
def under_review_projects_department(department):
    print(department)
    try:
        # Connect to the SQLite database
        conn = connect_to_db()
        cursor = conn.cursor()
        
        # Execute the SQL query to fetch projects where done_review is False (0 in SQLite)
        cursor.execute('SELECT project_id, title,  roll_id, department, done_review,staff_name,under_review,publish FROM project_new WHERE  department=? ',(department,))
        projects = cursor.fetchall()
        
        # Convert the result into a list of dictionaries
        projects_data = []
        for project in projects:
            projects_data.append({
                'id': project[0],
                'title': project[1],
               
                'roll_id': project[2],
                'department': project[3],
                'done_review': project[4],
                'staff_name':project[5],
                "under_review":project[6],
                 "publish":project[7]
            })
        
        # Close the database connection
        conn.close()
        # print(projects_data)
        # Return the data as a JSON response (assuming you're using Flask)
        return jsonify(projects_data)
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Unable to fetch projects under review"}), 500

# @app.route('/under_review_projects',methods=['GET'])
# @token_required
# def under_review_projects():
#     try:
#         # Connect to the SQLite database
#         conn = sqlite3.connect('your_database.db')
#         cursor = conn.cursor()
        
#         # Execute the SQL query to fetch projects where done_review is False (0 in SQLite)
#         cursor.execute("SELECT id, title, name, roll_id, department, done_review,staff_name FROM project_new WHERE done_review = 1 AND WHERE department='?",(department,))
#         projects = cursor.fetchall()
        
#         # Convert the result into a list of dictionaries
#         projects_data = []
#         for project in projects:
#             projects_data.append({
#                 'id': project[0],
#                 'title': project[1],
#                 'name': project[2],
#                 'roll_id': project[3],
#                 'department': project[4],
#                 'done_review': project[5],
#                 'staff_name':project[6]
#             })
        
#         # Close the database connection
#         conn.close()
        
#         # Return the data as a JSON response (assuming you're using Flask)
#         return jsonify(projects_data)
#     except Exception as e:
#         print(f"An error occurred: {e}")
#         return jsonify({"error": "Unable to fetch projects under review"}), 500

#getting the data for PRC HAVING PUBLISHED DATA
@app.route('/published_projects/<department>',methods=['GET'])
@token_required
def published_projects(department):
    try:
        # Connect to the SQLite database
        conn = connect_to_db()
        cursor = conn.cursor()
        print(department)
        # Execute the SQL query to fetch projects where done_review is False (0 in SQLite)
        cursor.execute("SELECT project_id, title,  roll_id, department, done_review,staff_name,under_review,publish FROM project_new WHERE department=? AND publish=?",(department,'TRUE',))
        projects = cursor.fetchall()
        
        # Convert the result into a list of dictionaries
        projects_data = []
        for project in projects:
            projects_data.append({
                'id': project[0],
                'title': project[1],
                'name': project[2],
                'roll_id': project[3],
                'department': project[4],
                'done_review': project[5],
                'staff_name':project[6],
                'publish':project[7]
            })
        
        # Close the database connection
        conn.close()
        
        # Return the data as a JSON response (assuming you're using Flask)
        return jsonify(projects_data)
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Unable to fetch projects under review"}), 500
    
#separate login for PRC
@app.route('/login_PRC',methods=['POST'])
def login_PRC():
    data = request.json
    print(data)
    if not data:
        return jsonify({"error": "No JSON data provided."}), 400

    roll_id = data.get('ID')
    

# Check if roll_id is a string and if it contains only digits
    if roll_id and roll_id.isdigit():
        roll_id = int(roll_id)
        
    else:
        # Handle the case where roll_id is not valid
        raise ValueError("Invalid roll ID: must be a numeric string.")

    password = data.get('password')
    
    if not roll_id or not password:
        return jsonify({"error": "ID and password are required."})

    password_bytes = password.encode('utf-8')
    conn = connect_to_db()
    # print(conn)
    print(type(roll_id))
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT password,Dep_ID,Department FROM PRC WHERE Dep_ID = ?', (roll_id,))
            user = cursor.fetchone()
            print(user)
            if user:
                # user[1] is the hashed password from the database
                hashed_password = user[0]
                
                # if bcrypt.checkpw(password_bytes, hashed_password):
                #     token = create_token(user[1])
                #     print(token)
                #     return jsonify({"message": "Login successful!", "user": {"id":user[1],"department":user[2]},"token":token}), 200
                # else:
                #     return jsonify({"error": "Invalid username or password."})
                token = create_token(user[1])
                print(token)
                return jsonify({"message": "Login successful!", "user": {"id":user[1],"department":user[2]},"token":token}), 200
            
            else:
                return jsonify({"error": "Invalid username or password."})

        except sqlite3.Error as e:
            return jsonify({"error": f"Database error: {str(e)}"})
        finally:
            conn.close()
    return jsonify({"error": "Failed to connect to the database."})
#this review section contains edit,delete,add    
@app.route('/add_review',methods=['POST'])
@token_required
def add_review():
    data = request.get_json()
    # print(data)
    project_id = data.get('project_id')
    department = data.get('department')
    review_id = data.get('review_id')
    reviews = data.get('review')
    rating = data.get('rating')
    faculty_name = data.get('faculty_name')
    # print(project_id,department,review_id,reviews,rating,faculty_name)
    conn = connect_to_db()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO ProjectReview (project_id, department, review_id, reviews, rating, faculty_name)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (project_id, department, review_id, reviews, rating, faculty_name))
        conn.commit()
        return jsonify({"message": "Review added successfully!",'newReview':[project_id,department,review_id,reviews,rating,faculty_name]}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Integrity error, possibly due to duplicate primary key or foreign key constraint."}), 400
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/delete_review', methods=['DELETE'])
@token_required
def delete_review():
    data = request.get_json()
    
    project_id = request.args.get('project_id')
    department = request.args.get('department')
    review_id = request.args.get('review_id')
    print(review_id)
    conn = connect_to_db()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            DELETE FROM ProjectReview
            WHERE project_id = ? AND department = ? AND review_id = ?
        ''', (project_id, department, review_id))
        if cursor.rowcount == 0:
            return jsonify({"error": "Review not found."}), 404
        conn.commit()
        return jsonify({"message": "Review deleted successfully!"}), 200
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/edit_review', methods=['PUT'])
@token_required
def edit_review():
    data = request.get_json()
    print(data)
    project_id = data.get('project_id')
    # data=data1.get('editReview')
    department = data.get('department')
    # print(data)
    
    review_id = data.get('review_id')
    reviews = data.get('review')
    rating = data.get('rating')
    faculty_name = data.get('faculty_name')
    # print(reviews)
    # print(project_id,department,review_id,reviews,rating,faculty_name)

    conn = connect_to_db()
    try:
        cursor = conn.cursor()
        update_values = []
        update_query = 'UPDATE ProjectReview SET '

        if reviews is not None:
            update_query += 'reviews = ?, '
            update_values.append(reviews)
        if rating is not None:
            update_query += 'rating = ?, '
            update_values.append(rating)
        if faculty_name is not None:
            update_query += 'faculty_name = ? '
            update_values.append(faculty_name)
        # print(update_values)
        update_query += 'WHERE project_id = ? AND department = ? AND review_id = ?'
        update_values.extend([project_id, department, review_id])
        # print(update_query)
        print(update_values)
        cursor.execute(update_query, update_values)
        if cursor.rowcount == 0:
            return jsonify({"error": "Review not found."}), 404
        conn.commit()
        return jsonify({"message": "Review updated successfully!"}), 200
    except sqlite3.Error as e:
        # print(e)
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
#mail to the faculty whose project is done review and published
@app.route('/publish_project/<project_id>',methods=['GET'])
@token_required
def publish_project(project_id):
    # print(project_id)
    if not project_id:
        return jsonify({"error": "Project ID is required."}), 400

    # SQL query to update the fields
    update_query = '''
        UPDATE project_new
        SET publish = ?,
        done_review = ?,
        under_review=?
        WHERE project_id = ?
    '''

    # SQL query to get the faculty email
    get_email_query = '''
        SELECT u.email, p.title, u.name
        FROM project_new p
        JOIN users_new u ON p.roll_id = u.roll_id
        WHERE p.project_id = ?
    '''

    conn = connect_to_db()
    
    if conn:
        try:
            cursor = conn.cursor()
            print(update_query)
            # Update the project status
            cursor.execute(update_query, ('TRUE','TRUE','false',project_id,))
            conn.commit()
            print("here...")

            if cursor.rowcount > 0:
                print("here..")
                # Fetch the faculty details
                cursor.execute(get_email_query, (project_id,))
                result = cursor.fetchone()
                if result:
                    
                    faculty_email = result[0]
                    title = result[1]
                    faculty_name = result[2]
                    subject = "Project Successfully Reviewed and Published"
                    content = f"Dear {faculty_name},\n\n" \
                              f"Your project titled '{title}' has been successfully reviewed and is now published.\n\n" \
                              "Thank you for your submission and efforts.\n\n" \
                              "Best regards,\nYour Team"

                    # Send email to the faculty
                    async_send_email(content, faculty_email, subject)
                    
                    return jsonify({"message": f"Project '{project_id}' updated successfully and published!"}), 200
                else:
                    return jsonify({"error": "Faculty details not found for the given project."}), 404
            else:
                return jsonify({"error": f"No project found with ID '{project_id}'."}), 404
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    return jsonify({"error": "Failed to connect to the database."}), 500
#mail to the faculty whose project is done review and unpublished
@app.route('/unpublish_done_project_review/<project_id>',methods=['GET'])
@token_required
def unpublish_done_project_review(project_id):
    if not project_id:
        return jsonify({"error": "Project ID is required."}), 400

    # SQL query to update the fields
    update_query = '''
        UPDATE project_new
        SET done_review = TRUE,
            publish = FALSE
        WHERE project_id = ?
    '''

    # SQL query to get the faculty email
    get_email_query = '''
        SELECT u.email, p.title, u.name
        FROM project_new p
        JOIN users_new u ON p.roll_id = u.roll_id
        WHERE p.project_id = ?
    '''

    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor()
            # Update the project status
            cursor.execute(update_query, (project_id,))
            conn.commit()

            if cursor.rowcount > 0:
                # Fetch the faculty details
                cursor.execute(get_email_query, (project_id,))
                result = cursor.fetchone()
                if result:
                    faculty_email = result['email']
                    title = result['title']
                    faculty_name = result['name']
                    subject = "Project Review Completed - Publication Status"
                    content = f"Dear {faculty_name},\n\n" \
                              f"The review for your project titled '{title}' has been completed.\n\n" \
                              "However, the project will not be published at this time.\n\n" \
                              "You can check the review details on the website.\n\n" \
                              "Thank you for your submission and efforts.\n\n" \
                              "Best regards,\nYour Team"

                    # Send email to the faculty
                    async_send_email(content,'tarakakiranmayi@gmail.com', subject)
                    
                    return jsonify({"message": f"Review for project '{project_id}' completed and faculty notified!"}), 200
                else:
                    return jsonify({"error": "Faculty details not found for the given project."}), 404
            else:
                return jsonify({"error": f"No project found with ID '{project_id}'."}), 404
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    return jsonify({"error": "Failed to connect to the database."}), 500

#getting the data which is under_review
@app.route('/get_project/<Project_id>',methods=['GET'])
@token_required
def get_project(Project_id):
    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM project_new where  project_id=?",(Project_id,))
            projects = cursor.fetchall()
            return jsonify(projects), 200
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    return jsonify({"error": "Failed to connect to the database."}), 500
    

#getting the data in which review is done and published
@app.route('/published_projects_faculty/<roll_id>',methods=['GET'])
@token_required
def published_projects_faculty(roll_id):
    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM project_new where status=TRUE and done_review=1 and publish=1 and roll_id',(roll_id,))
            projects = cursor.fetchall()
            return jsonify(projects), 200
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    return jsonify({"error": "Failed to connect to the database."}), 500
    
#getting the data in which review is done but it is unpublished
@app.route('/done_review_unpublish/<roll_id>',methods=['GET'])
@token_required
def done_review_unpublish(roll_id):
    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM project_new where status=TRUE and done_review=1 and publish=0 and roll_id',(roll_id,))
            projects = cursor.fetchall()
            return jsonify(projects), 200
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    return jsonify({"error": "Failed to connect to the database."}), 500
    
@app.route('/registerPrc', methods=['POST'])
def registerPrc():
    data = request.json
    print(data)
    dept_id = data.get('id')
    print(type(dept_id))
    password = data.get('password')
    department = data.get('department')
    print(dept_id)
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    conn = connect_to_db()
    #(conn)
    if conn:
        try:

            cursor = conn.cursor()
            cursor.execute('INSERT INTO PRC (DEP_ID,Department,password) VALUES (?, ?,?)', 
                           (dept_id, department, hashed_password))
            conn.commit()
            #("registere")
            return jsonify({"message": "User registered successfully!"}), 201
        except sqlite3.IntegrityError:
            return jsonify({"error": f"already registered"})
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
    return jsonify({"error": "Failed to connect to the database."}), 500

#getting the review for particular project
@app.route('/get_review/<project_id>',methods=['GET'])
@token_required
def get_review(project_id):
    # SQL query to get project and its reviews
    print(project_id,"why not coming......")
    project_query = '''
        SELECT *
        FROM project_new
        WHERE project_id = ?
    '''
    
    reviews_query = '''
        SELECT *
        FROM ProjectReview
        WHERE project_id = ?
    '''
    
    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor()
            
            # Fetch project details
            cursor.execute(project_query, (project_id,))
            project = cursor.fetchone()
            
            if project:
    # Get column names
                column_names = [desc[0] for desc in cursor.description]

                # Convert the fetched project tuple to a dictionary
                project_data = [dict(zip(column_names, project))]
                print(project_data)
                # Fetch reviews for the project
                cursor.execute(reviews_query, (project_id,))
                reviews = cursor.fetchall()

                # Convert the fetched reviews tuples to a list of dictionaries
                reviews_data = [ review for review in reviews]
                
                # Return project and reviews
                return jsonify({
                    "project": project_data,
                    "reviews": reviews_data
                }), 200
            else:
                return jsonify({"error": f"No project found with ID '{project_id}'."}), 404
        
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
        
        finally:
            conn.close()
    
    return jsonify({"error": "Failed to connect to the database."}), 500
@app.route('/add_student_to_project', methods=['POST'])
def add_student_to_project():
    data = request.json
    print(data)
    if not data:
        return jsonify({"error": "No JSON data provided."}), 400
    
    faculty_id = data.get('facultyId')
    project_id = data.get('projectId')
    student_id = data.get('studentId')
    
    if not faculty_id or not project_id or not student_id:
        return jsonify({"error": "faculty_id, project_id, and student_id are required."}), 400
    
    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor()
            
            # Count the current number of students for the project
            cursor.execute('SELECT COUNT(*) FROM faculty_projects WHERE roll_id = ?', (student_id,))
            student_count = cursor.fetchone()[0]
            
            
            print(student_count)
            if student_count>=1:
                return jsonify({"error": "You ALready Have Project"}), 203
            if student_count >= 5:
                return jsonify({"error": "Maximum of 5 students allowed for this project."}), 400
            print(type(student_id))
            # Insert into faculty_projects
            cursor.execute('INSERT INTO faculty_projects (faculty_id, project_id,roll_id) VALUES (?, ?, ?)',
                           (faculty_id, project_id, student_id))
            conn.commit()
            return jsonify({"message": "Student added to project successfully!"}), 201
            
        except sqlite3.Error as e:
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            conn.close()
    
    return jsonify({"error": "Failed to connect to the database."}), 500

@app.route('/faculty/<faculty_id>/project/<project_id>/students', methods=['GET'])
def get_students_for_project(faculty_id, project_id):
    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT s.id, s.name, s.email, s.department
                FROM faculty_projects fp
                JOIN students_new s ON fp.student_id = s.id
                WHERE fp.faculty_id = ? AND fp.project_id = ?;
            ''', (faculty_id, project_id))
            
            students = cursor.fetchall()
            student_list = [{"id": student[0], "name": student[1], "email": student[2], "department": student[3]} for student in students]
            
            return jsonify({"students": student_list}), 200

        except sqlite3.Error as e:
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            conn.close()

    return jsonify({"error": "Failed to connect to the database."}), 500
@app.route('/faculty/<faculty_id>/project/<project_id>/student/<student_id>', methods=['DELETE'])
def delete_student_from_project(faculty_id, project_id, student_id):
    conn = connect_to_db()
    print(faculty_id, project_id, student_id)
    if conn:
        try:
            cursor = conn.cursor()
            
            # Check if the student is associated with the project before deleting
            cursor.execute('''
                SELECT * FROM faculty_projects
                WHERE faculty_id = ? AND project_id = ? AND roll_id = ?;
            ''', (faculty_id, project_id, student_id))
            record = cursor.fetchone()
            
            if record:
                # Proceed to delete the student from the project
                cursor.execute('''
                    DELETE FROM faculty_projects
                    WHERE faculty_id = ? AND project_id = ? AND roll_id = ?;
                ''', (faculty_id, project_id, student_id))
                conn.commit()
                
                return jsonify({"message": "Student removed from project successfully!"}), 200
            else:
                return jsonify({"error": "Student not found in this project."}), 404

        except sqlite3.Error as e:
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            conn.close()

    return jsonify({"error": "Failed to connect to the database."}), 500

@app.route('/start', methods=['GET'])
def start():
    print("this is working")
    return jsonify({"error": "Password must be between 8 and 16 characters long and include at least one letter, one number, and one symbol."})

if __name__ == '__main__':
    create_tables()  # Ensure the tables exist
    app.run(host='0.0.0.0', port=6102, debug=True)
    
# CREATE TABLE faculty_projects (
#     faculty_id TEXT,
#     project_id INTEGER,
#     roll_id TEXT,
#     PRIMARY KEY (faculty_id, project_id, roll_id)
# );

# CREATE TABLE students (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     project_id INTEGER NOT NULL,
#     student_id INTEGER NOT NULL,
#     name TEXT NOT NULL,
#     email TEXT NOT NULL,
#     FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
# );
# CREATE TABLE users_new (        
#                     roll_id TEXT PRIMARY KEY,         
#                     name TEXT NOT NULL,
#                     password TEXT NOT NULL,
#                     role TEXT NOT NULL,
#                     department TEXT NOT NULL,
#                     email TEXT NOT NULL
#                 );
# CREATE TABLE PRC(Dep_ID INTEGER primary key, Department TEXT not null unique,password TEXT not null);
# CREATE TABLE project_new (
#     project_id INTEGER PRIMARY KEY AUTOINCREMENT,
#     roll_id text NOT NULL,
#     title TEXT,
#     abstract TEXT,
#     staff_name TEXT,
#     requirements TEXT,
#     domain TEXT,
#     department TEXT,
#     done_review BOOLEAN DEFAULT FALSE,
#     status BOOLEAN DEFAULT TRUE,
#     publish BOOLEAN DEFAULT FALSE, under_review BOOLEAN default false,
#     FOREIGN KEY (roll_id) REFERENCES users_new(roll_id)
# );
# CREATE TABLE ProjectReview (
#                         project_id INTEGER ,
#                         department TEXT,
#                         review_id TEXT,
#                         reviews TEXT NOT NULL,
#                         rating INTEGER,
#                         faculty_name TEXT NOT NULL,
#                         PRIMARY KEY (project_id, department, review_id),
#                         FOREIGN KEY (project_id) REFERENCES project_new(project_id),
#                         FOREIGN KEY (department) REFERENCES PRC(department)
# );
# CREATE TABLE students_users (
#     id TEXT PRIMARY KEY,
#     name TEXT NOT NULL,
#     email TEXT NOT NULL UNIQUE,
#     password TEXT NOT NULL,
#     role TEXT NOT NULL,
#     department TEXT
# );
# CREATE TABLE page_views (
#     page_name TEXT PRIMARY KEY,    -- Name of the page
#     view_count INTEGER DEFAULT 0,  -- Number of views for the page
#     last_viewed DATETIME DEFAULT CURRENT_TIMESTAMP  -- Timestamp of the last recorded view
# );

