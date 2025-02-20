from flask import Flask, request, jsonify, send_file
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
from flask_cors import CORS
import os
from dotenv import load_dotenv
from flask_mongoengine import MongoEngine
import logging
from bson import ObjectId
from datetime import datetime
import requests
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
from flask_bcrypt import Bcrypt
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import subprocess
import json
import tempfile

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Allow requests from both localhost and the public domain
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3106", "http://activity.vnrzone.site"]}})
bcrypt = Bcrypt(app)  # Initialize Flask-Bcrypt

# MongoDB Configuration
app.config['MONGODB_SETTINGS'] = {
    'host': os.getenv('MONGODB_URI'),
    'db': 'activity_tracker'
}

# Initialize MongoDB
db = MongoEngine(app)

# Initialize Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-pro')

class Activity(db.EmbeddedDocument):
    title = db.StringField(required=True)
    activity_type = db.StringField(required=True)  # For compatibility with existing code
    type = db.StringField(choices=['project', 'certification', 'job', 'education'])  # For new features
    description = db.StringField()
    date = db.DateTimeField(default=datetime.utcnow)
    status = db.StringField(default='ongoing')
    source = db.StringField(choices=['manual', 'github', 'leetcode'])
    leetcode_rating = db.IntField()
    skills = db.ListField(db.StringField())
    metadata = db.DictField()
    url = db.StringField()

class Education(db.EmbeddedDocument):
    school = db.StringField(required=True)
    degree = db.StringField(required=True)
    field = db.StringField(required=True)
    start_year = db.StringField(required=True)
    end_year = db.StringField()
    current = db.BooleanField(default=False)
    description = db.StringField()

class Experience(db.EmbeddedDocument):
    company = db.StringField(required=True)
    position = db.StringField(required=True)
    start_date = db.StringField(required=True)
    end_date = db.StringField()
    current = db.BooleanField(default=False)
    description = db.StringField()

class User(db.Document):
    meta = {
        'collection': 'users',
        'indexes': [
            {'fields': ['email'], 'unique': True},
            {'fields': ['username'], 'unique': True}
        ]
    }
    
    # Basic Info
    email = db.EmailField(required=True, unique=True)
    username = db.StringField(required=True, unique=True)
    password = db.StringField(required=True)  # Store hashed password
    name = db.StringField(required=True)
    
    # Profile Info
    bio = db.StringField(default='')
    location = db.StringField(default='')
    github = db.StringField(default='')
    linkedin = db.StringField(default='')
    skills = db.ListField(db.StringField(), default=list)
    education = db.ListField(db.EmbeddedDocumentField(Education), default=list)
    experience = db.ListField(db.EmbeddedDocumentField(Experience), default=list)
    
    # Activities and Integrations
    activities = db.ListField(db.EmbeddedDocumentField(Activity), default=list)
    github_token = db.StringField()
    leetcode_username = db.StringField()

class Resume(db.Document):
    user = db.ReferenceField(User, required=True)
    template_id = db.IntField(required=True)
    type = db.StringField(required=True)  # 'general' or 'specific'
    job_title = db.StringField()
    created_at = db.DateTimeField(default=datetime.utcnow)
    pdf_url = db.StringField()
    generated_content = db.StringField()

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
jwt = JWTManager(app)

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'username', 'name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Check existing users
        if User.objects(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        if User.objects(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400

        # Hash password using flask-bcrypt
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

        # Create user with hashed password
        user = User(
            email=data['email'],
            password=hashed_password,
            username=data['username'],
            name=data['name']
        )
        user.save()

        # Generate token
        token = create_access_token(identity=str(user.id))

        return jsonify({
            'token': token,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'username': user.username,
                'name': user.name
            }
        }), 201

    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Missing email or password'}), 400

        user = User.objects(email=data['email']).first()
        
        if user and bcrypt.check_password_hash(user.password, data['password']):
            token = create_access_token(identity=str(user.id))
            return jsonify({
                'token': token,
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'username': user.username,
                    'name': user.name
                }
            }), 200
        
        return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/add_activity', methods=['POST'])
@jwt_required() # Use jwt_required from flask_jwt_extended
def add_activity():
    try:
        data = request.get_json()
        user_id = get_jwt_identity() # Get user ID from JWT token

        # Validate required fields
        required_fields = ['title', 'activity_type', 'description'] # Updated field names
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Create new Activity document using MongoEngine model
        new_activity = Activity(
            title=data['title'],
            activity_type=data['activity_type'], # Updated field name
            description=data['description'],
            date=datetime.utcnow(), # Default to current time, or get from request if needed
            status=data.get('status', 'ongoing'),
            leetcode_rating=data.get('leetcode_rating'), # Get LeetCode rating from request
            skills=data.get('skills', [])  # Add skills with empty list as default
        )

        # Find the user and append the new activity
        user = User.objects(id=user_id).first() # Find user by ID from JWT
        if not user:
            return jsonify({'error': 'User not found'}), 404

        user.activities.append(new_activity) # Append the MongoEngine Activity object
        user.save() # Save the updated user document

        return jsonify({
            'message': 'Activity added successfully',
            'activity': {
                'title': new_activity.title,
                'activity_type': new_activity.activity_type,
                'description': new_activity.description,
                'status': new_activity.status,
                'skills': new_activity.skills,  # Include skills in response
                'date': new_activity.date
            }
        }), 201

    except Exception as e:
        logger.error(f"Error adding activity: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

# Get user's activities
@app.route('/api/activities', methods=['GET'])
@jwt_required() # Protect this route as well
def get_user_activities():
    try:
        user_id = get_jwt_identity() # Get user ID from JWT token
        user = User.objects(id=user_id).first() # Find user by ID from JWT
        if not user:
            return jsonify({'error': 'User not found'}), 404
   
        # Convert activities to JSON with skills included
        activities_list = [{
            'title': activity.title,
            'activity_type': activity.activity_type,
            'description': activity.description,
            'status': activity.status,
            'date': activity.date,
            'leetcode_rating': activity.leetcode_rating,
            'skills': activity.skills  # Include skills in response
        } for activity in user.activities]
        
        return jsonify(activities_list), 200

    except Exception as e:
        logger.error(f"Error getting activities: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

@app.route('/api/update_leetcode_data', methods=['POST'])
@jwt_required()
def update_leetcode_data():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        leetcode_username = user.leetcode_username
        if not leetcode_username:
            return jsonify({'error': 'LeetCode username not set'}), 400

        # GraphQL Setup with fetch_schema_from_transport=False as suggested
        transport = RequestsHTTPTransport(
            url='https://leetcode.com/graphql',
            verify=True,
            retries=3,
        )
        client = Client(
            transport=transport,
            fetch_schema_from_transport=False
        )

        # Updated GraphQL Query that works with current LeetCode API
        query = gql("""
            query getUserProfile($username: String!) {
                allQuestionsCount {
                    difficulty
                    count
                }
                matchedUser(username: $username) {
                    username
                    submitStats: submitStatsGlobal {
                        acSubmissionNum {
                            difficulty
                            count
                        }
                    }
                    profile {
                        ranking
                        reputation
                        starRating
                    }
                }
            }
        """)

        # Execute GraphQL query
        variables = {"username": leetcode_username}
        result = client.execute(query, variable_values=variables)

        if not result or 'matchedUser' not in result:
            return jsonify({'error': 'User not found on LeetCode'}), 404

        # Extract data
        matched_user = result['matchedUser']
        if not matched_user:
            return jsonify({'error': 'Unable to fetch LeetCode data'}), 400

        # Get solved problems count
        solved_problems = 0
        if matched_user.get('submitStats', {}).get('acSubmissionNum'):
            for submission in matched_user['submitStats']['acSubmissionNum']:
                if submission.get('count'):
                    solved_problems += submission['count']

        # Create new activity for LeetCode update
        new_activity = Activity(
            title=f"LeetCode Update for {leetcode_username}",
            activity_type='LeetCode Update',
            description=f"Solved Problems: {solved_problems}",
            date=datetime.utcnow(),
            status='completed',
            leetcode_rating=matched_user.get('profile', {}).get('ranking', 0),
            skills=[]  # Clear skills for new update
        )

        user.activities.append(new_activity)
        user.save()

        return jsonify({
            'message': 'LeetCode data updated successfully',
            'leetcode_rating': matched_user.get('profile', {}).get('ranking', 0),
            'solved_problems': solved_problems,
            'profile': matched_user.get('profile', {})
        }), 200

    except Exception as e:
        logger.error(f"Error updating LeetCode data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/set_leetcode_username', methods=['POST'])
@jwt_required()
def set_leetcode_username():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if 'leetcode_username' not in data:
            return jsonify({'error': 'LeetCode username is required'}), 400
            
        leetcode_username = data['leetcode_username']
        
        # Update user's LeetCode username
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        user.leetcode_username = leetcode_username
        user.save()
        
        return jsonify({
            'message': 'LeetCode username set successfully',
            'leetcode_username': leetcode_username
        }), 200
        
    except Exception as e:
        logger.error(f"Error setting LeetCode username: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

@app.route('/api/user/leetcode_status/<username>', methods=['GET'])
@jwt_required()
def get_leetcode_status(username):
    try:
        # Find user by username
        user = User.objects(username=username).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Check if user has LeetCode username set
        if not user.leetcode_username:
            return jsonify({
                'has_leetcode': False,
                'message': 'LeetCode username not set'
            }), 200

        return jsonify({
            'has_leetcode': True,
            'leetcode_username': user.leetcode_username
        }), 200

    except Exception as e:
        logger.error(f"Error checking LeetCode status: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/user/<username>/leetcode_history', methods=['GET'])
@jwt_required()
def get_leetcode_history(username):
    try:
        # Find user by username
        user = User.objects(username=username).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Check if user has LeetCode username set
        if not user.leetcode_username:
            return jsonify({
                'error': 'LeetCode username not set',
                'needs_setup': True
            }), 400

        # GraphQL Setup
        transport = RequestsHTTPTransport(
            url='https://leetcode.com/graphql',
            verify=True,
            retries=3,
        )
        client = Client(
            transport=transport,
            fetch_schema_from_transport=False
        )

        # Get user profile and submission stats
        profile_query = gql("""
            query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    submitStats: submitStatsGlobal {
                        acSubmissionNum {
                            difficulty
                            count
                        }
                    }
                }
            }
        """)

        # Get contest history - simplified
        contest_query = gql("""
            query getUserContestInfo($username: String!) {
                userContestRankingHistory(username: $username) {
                    attended
                    rating
                    ranking
                    contest {
                        title
                        startTime
                    }
                }
            }
        """)

        # Execute both queries
        profile_result = client.execute(profile_query, variable_values={"username": user.leetcode_username})
        contest_result = client.execute(contest_query, variable_values={"username": user.leetcode_username})

        if not profile_result.get('matchedUser'):
            return jsonify({'error': 'LeetCode user not found'}), 404

        # Process submission statistics
        submission_stats = profile_result['matchedUser']['submitStats']['acSubmissionNum']
        difficulty_stats = {stat['difficulty']: stat['count'] for stat in submission_stats}
        
        # Process contest data
        contest_history = []
        if contest_result.get('userContestRankingHistory'):
            for contest in contest_result['userContestRankingHistory']:
                if contest['attended']:
                    contest_history.append({
                        'contest_name': contest['contest']['title'],
                        'date': contest['contest']['startTime'],
                        'rating': contest['rating'],
                        'ranking': contest['ranking']
                    })

        # Prepare response data
        response_data = {
            'leetcode_username': user.leetcode_username,
            'submission_stats': {
                'total': difficulty_stats.get('All', 0),
                'easy': difficulty_stats.get('Easy', 0),
                'medium': difficulty_stats.get('Medium', 0),
                'hard': difficulty_stats.get('Hard', 0)
            },
            'contest_history': contest_history
        }

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Error fetching LeetCode history: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<username>/set_leetcode_username', methods=['POST'])
@jwt_required()
def set_user_leetcode_username(username):
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(username=username).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Verify the requesting user is the same as the target user
        if str(user.id) != current_user_id:
            return jsonify({'error': 'Unauthorized to modify this user'}), 403

        data = request.get_json()
        if 'leetcode_username' not in data:
            return jsonify({'error': 'LeetCode username is required'}), 400
            
        leetcode_username = data['leetcode_username']

        # Verify the LeetCode username exists by making a test query
        transport = RequestsHTTPTransport(
            url='https://leetcode.com/graphql',
            verify=True,
            retries=3,
        )
        client = Client(
            transport=transport,
            fetch_schema_from_transport=False
        )

        test_query = gql("""
            query testUser($username: String!) {
                matchedUser(username: $username) {
                    username
                }
            }
        """)

        try:
            result = client.execute(test_query, variable_values={"username": leetcode_username})
            if not result or not result.get('matchedUser'):
                return jsonify({'error': 'Invalid LeetCode username'}), 400
        except Exception as e:
            return jsonify({'error': 'Could not verify LeetCode username'}), 400
            
        user.leetcode_username = leetcode_username
        user.save()
        
        return jsonify({
            'message': 'LeetCode username set successfully',
            'leetcode_username': leetcode_username
        }), 200
        
    except Exception as e:
        logger.error(f"Error setting LeetCode username: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        profile_data = {
            'name': user.name,
            'bio': user.bio,
            'location': user.location,
            'github': user.github,
            'linkedin': user.linkedin,
            'skills': user.skills,
            'education': [{
                'school': edu.school,
                'degree': edu.degree,
                'field': edu.field,
                'start_year': edu.start_year,
                'end_year': edu.end_year,
                'current': edu.current,
                'description': edu.description
            } for edu in user.education],
            'experience': [{
                'company': exp.company,
                'position': exp.position,
                'start_date': exp.start_date,
                'end_date': exp.end_date,
                'current': exp.current,
                'description': exp.description
            } for exp in user.experience]
        }
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/user/profile', methods=['POST'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        
        # Update basic info
        user.name = data.get('name', user.name)
        user.bio = data.get('bio', user.bio)
        user.location = data.get('location', user.location)
        user.github = data.get('github', user.github)
        user.linkedin = data.get('linkedin', user.linkedin)
        user.skills = data.get('skills', user.skills)

        # Update education
        if 'education' in data:
            user.education = []
            for edu_data in data['education']:
                # Validate required fields
                required_fields = ['school', 'degree', 'field', 'start_year']
                if not all(field in edu_data for field in required_fields):
                    return jsonify({
                        'error': f'Missing required education fields. Required fields are: {", ".join(required_fields)}'
                    }), 400
                
                education = Education(
                    school=edu_data.get('school'),
                    degree=edu_data.get('degree'),
                    field=edu_data.get('field'),
                    start_year=edu_data.get('start_year'),
                    end_year=edu_data.get('end_year', ''),
                    current=edu_data.get('current', False),
                    description=edu_data.get('description', '')
                )
                user.education.append(education)

        # Update experience
        if 'experience' in data:
            user.experience = []
            for exp_data in data['experience']:
                # Validate required fields
                required_fields = ['company', 'position', 'start_date']
                if not all(field in exp_data for field in required_fields):
                    return jsonify({
                        'error': f'Missing required experience fields. Required fields are: {", ".join(required_fields)}'
                    }), 400
                
                experience = Experience(
                    company=exp_data.get('company'),
                    position=exp_data.get('position'),
                    start_date=exp_data.get('start_date'),
                    end_date=exp_data.get('end_date', ''),
                    current=exp_data.get('current', False),
                    description=exp_data.get('description', '')
                )
                user.experience.append(experience)

        user.save()
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

def generate_resume_content(resume_data):
    # Format education entries
    education_entries = []
    for edu in resume_data['education']:
        period = f"{edu['start_year']} - {'Present' if edu['current'] else edu['end_year']}"
        entry = {
            "degree": edu['degree'],
            "field": edu['field'],
            "school": edu['school'],
            "period": period,
            "description": edu.get('description', '')
        }
        education_entries.append(entry)

    # Format experience entries
    experience_entries = []
    for exp in resume_data['experience']:
        period = f"{exp['start_date']} - {'Present' if exp['current'] else exp['end_date']}"
        entry = {
            "position": exp['position'],
            "company": exp['company'],
            "period": period,
            "description": exp.get('description', '')
        }
        experience_entries.append(entry)

    # Format activities
    activity_entries = []
    for act in resume_data['activities']:
        entry = {
            "title": act['title'],
            "description": act.get('description', ''),
            "skills": act.get('skills', [])
        }
        activity_entries.append(entry)

    prompt = f"""Create a professional resume in JSON format with precise formatting and accurate content representation. The output must be valid JSON:

{{
    "basics": {{
        "name": "{resume_data['user_info']['name']}",
        "email": "{resume_data['user_info']['email']}",
        "location": "{resume_data['user_info']['location']}",
        "profiles": {{
            "linkedin": "{resume_data['user_info']['linkedin']}",
            "github": "{resume_data['user_info']['github']}"
        }},
        "summary": "{resume_data['user_info']['bio']}"
    }},
    "education": {education_entries},
    "experience": {experience_entries},
    "skills": {resume_data['skills']},
    "projects": {activity_entries}
}}

Strict Guidelines:
1. Maintain exact data structure as shown above
2. Keep all original information intact - no omissions or additions
3. For text fields (descriptions, summaries):
   - Preserve all technical terms, numbers, and metrics exactly as provided
   - Maintain the same level of technical detail
   - Only rephrase for clarity while keeping the exact same meaning
   - Do not add or remove any achievements or skills
4. For dates and periods:
   - Use consistent format: YYYY-MM for all dates
   - For ongoing items, use 'Present' consistently
5. For skills and technical information:
   - Keep all technical terms exactly as provided
   - Maintain the exact same skill levels and expertise claims
6. For projects and activities:
   - Preserve all technical details and metrics
   - Keep the same project scope and achievements
   - Maintain all technology mentions and tool references
7. Ensure proper JSON escaping for special characters
8. Validate the final JSON structure

The response must contain only the JSON object - no additional text or explanations.
"""

    # Generate content
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
    )

    # Clean up the response - remove markdown code block markers
    content = response.text
    content = content.replace('```json', '').replace('```', '').strip()
    
    # Validate the cleaned JSON
    try:
        json.loads(content)  # Just to validate
        return content
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON generated: {str(e)}")
        raise Exception("Generated content is not valid JSON")

def process_resume_with_cli(resume_json, resume_id):
    try:
        # Create a temporary directory for resume files
        temp_dir = tempfile.mkdtemp()
        json_path = os.path.join(temp_dir, f'resume_{resume_id}.json')
        pdf_path = os.path.join(temp_dir, f'resume_{resume_id}.pdf')

        # Parse and format the JSON to ensure it's valid
        try:
            resume_data = json.loads(resume_json)
            # Save JSON to temporary file with proper formatting
            with open(json_path, 'w') as f:
                json.dump(resume_data, f, indent=2)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON data: {str(e)}")
            raise Exception("Invalid JSON format")

        # First validate the JSON using resume-cli
        validate_cmd = ['resume', 'validate', json_path]
        subprocess.run(validate_cmd, check=True, capture_output=True)

        # Then export to PDF using the modern theme
        export_cmd = [
            'resume', 'export',
            pdf_path,
            '--resume', json_path,
            '--format', 'pdf',
            '--theme', 'modern'
        ]
        
        # Run the export command
        result = subprocess.run(export_cmd, check=True, capture_output=True)
        
        # Check if PDF was created successfully
        if not os.path.exists(pdf_path):
            raise Exception("PDF file was not created")

        return pdf_path
    except subprocess.CalledProcessError as e:
        logger.error(f"Resume CLI error: {e.stderr.decode() if e.stderr else str(e)}")
        raise Exception(f"Failed to generate PDF: {e.stderr.decode() if e.stderr else str(e)}")
    except Exception as e:
        logger.error(f"Error in process_resume_with_cli: {str(e)}")
        raise

@app.route('/api/resume/generate', methods=['POST'])
@jwt_required()
def generate_resume():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        required_fields = ['template', 'type']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Create new resume document
        resume = Resume(
            user=user,
            template_id=data['template'],
            type=data['type'],
            job_title=data.get('job_title', ''),
            created_at=datetime.utcnow()
        )
        resume.save()

        # Prepare resume data
        resume_data = {
            'user_info': {
                'name': user.name,
                'email': user.email,
                'location': user.location,
                'bio': user.bio,
                'github': user.github,
                'linkedin': user.linkedin
            },
            'education': [{
                'school': edu.school,
                'degree': edu.degree,
                'field': edu.field,
                'start_year': edu.start_year,
                'end_year': edu.end_year,
                'current': edu.current,
                'description': edu.description
            } for edu in user.education],
            'experience': [{
                'company': exp.company,
                'position': exp.position,
                'start_date': exp.start_date,
                'end_date': exp.end_date,
                'current': exp.current,
                'description': exp.description
            } for exp in user.experience],
            'skills': user.skills,
            'activities': [{
                'title': act.title,
                'type': act.type,
                'description': act.description,
                'date': act.date.isoformat() if act.date else None,
                'skills': act.skills
            } for act in user.activities if act.title in data.get('selected_activities', [])]
        }

        # Generate resume content using Gemini
        generated_resume = generate_resume_content(resume_data)

        # Update resume with generated content
        resume.generated_content = generated_resume
        resume.save()

        try:
            # Generate PDF using resume-cli
            pdf_path = process_resume_with_cli(generated_resume, str(resume.id))
            resume.pdf_url = f'/api/resume/{str(resume.id)}/download'
            resume.save()
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            # Continue without PDF generation - can be generated later

        return jsonify({
            'message': 'Resume generated successfully',
            'resume_id': str(resume.id),
            'resume_data': resume_data,
            'generated_content': generated_resume,
            'pdf_url': resume.pdf_url if resume.pdf_url else None
        }), 201

    except Exception as e:
        logger.error(f"Error generating resume: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

@app.route('/api/resumes', methods=['GET'])
@jwt_required()
def get_user_resumes():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        resumes = Resume.objects(user=user).order_by('-created_at')
        resume_list = [{
            'id': str(resume.id),
            'template_id': resume.template_id,
            'type': resume.type,
            'job_title': resume.job_title,
            'created_at': resume.created_at.isoformat(),
            'pdf_url': resume.pdf_url
        } for resume in resumes]

        return jsonify(resume_list), 200

    except Exception as e:
        logger.error(f"Error fetching resumes: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

@app.route('/api/resume/<resume_id>/download', methods=['GET'])
@jwt_required()
def download_resume(resume_id):
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        resume = Resume.objects(id=resume_id, user=user).first()
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404

        # Generate PDF using resume-cli
        pdf_path = process_resume_with_cli(resume.generated_content, resume_id)
        
        # Send the file
        return send_file(
            pdf_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'resume_{resume_id}.pdf'
        )

    except Exception as e:
        logger.error(f"Error downloading resume: {str(e)}")
        return jsonify({'error': 'Failed to generate PDF resume'}), 500
@app.after_request
def add_cors_headers(response):
    allowed_origins = ['http://localhost:3106', 'http://activity.vnrzone.site']
    
    print (request.headers.get('Origin'))
    if request.headers.get('Origin') in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin')

    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6030, debug=True) 