import eventlet
eventlet.monkey_patch()  # Must be the first line before importing anything else
import geopy
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import math
from geopy.distance import geodesic
from datetime import datetime
import sqlite3

app = Flask(__name__)
# Allow all origins (you can adjust this in production)
CORS(app, origins=["http://10.45.8.186:4000"])  # Allow requests from frontend
  # Allow frontend to communicate with backend
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")  # Ensure WebSockets

# Dictionary to store route IDs and WebSocket session IDs (or None if no WebSocket connected)
route_websocket_map = {
    'Route-1': None, 'Route-2': None, 'Route-3': None, 'Route-4A': None,
    'Route-4B': None, 'Route-5': None, 'Route-6': None, 'Route-7': None,
    'Route-8': None, 'Route-9': None, 'Route-10': None, 'Route-S-1': None,
    'Route-S-2': None, 'Route-S-3': None, 'Route-S-41': None, 'Route-S-42': None,
    'Route-S-43': None, 'Route-S-44': None, 'Route-S-5': None, 'Route-S-6': None,
    'Route-S-7': None, 'Route-S-8': None
}

latest_location = {}
connected_routes = {}  # Store route IDs with their socket session ID
tracking_status = {}  # Store tracking status per session ID
connected_clients = {}  # { websocket: subscribed_route }
route_subscriptions = {}  # { route_id: [websockets] }

@app.route("/receive_location", methods=["POST"])
def receive_location():
    """ Receive location from a route and broadcast it """
    global latest_location
    data = request.json
    if "route_id" in data and "latitude" in data and "longitude" in data:
        latest_location[data["route_id"]] = {"latitude": data["latitude"], "longitude": data["longitude"]}
        print(f"✅ Received from {data['route_id']}: {latest_location[data['route_id']]}")
        socketio.emit("location_update", {"route_id": data["route_id"], **latest_location[data["route_id"]]})  # Broadcast location
        return jsonify({"message": "Location received"}), 200
    return jsonify({"message": "Invalid data"}), 400

@app.route("/get_location/<route_id>", methods=["GET"])
def get_location(route_id):
    """ Fetch last known location of a route """
    if route_id in latest_location:
        return jsonify(latest_location[route_id])
    return jsonify({"message": "No location found"}), 404

@socketio.on("connect")
def handle_connect():
    """ Handle new client connection """
    request_args = request.args
    route_id = request_args.get("route_id", "Unknown")  # Get route ID if provided

    # Store connection and update the route_websocket_map
    if route_id in route_websocket_map:
        route_websocket_map[route_id] = request.sid  # Update WebSocket session ID

    # Store connection in connected_routes
    connected_routes[request.sid] = route_id
    tracking_status[request.sid] = "started"

    # Add the client to the subscription list
    if route_id not in route_subscriptions:
        route_subscriptions[route_id] = []
    route_subscriptions[route_id].append(request.sid)

    print(f"✅ Device Connected: {route_id} (Session ID: {request.sid})")
    socketio.emit("server_message", {"message": f"route {route_id} connected!"})

@socketio.on("disconnect")
def handle_disconnect():
    """ Handle client disconnection """
    session_id = request.sid

    # Find which route this session was connected to and update the route_websocket_map
    for route_id, websocket_id in route_websocket_map.items():
        if websocket_id == session_id:
            # Set the value of that route to None since it's disconnected
            route_websocket_map[route_id] = None
            print(f"❌ Device Disconnected: {route_id} (Session ID: {session_id})")
            socketio.emit("server_message", {"message": f"route {route_id} disconnected!"})
            break

    if session_id in connected_routes:
        route_id = connected_routes[session_id]
        # Remove from subscriptions
        if route_id in route_subscriptions and session_id in route_subscriptions[route_id]:
            route_subscriptions[route_id].remove(session_id)
        
        # Cleanup
        del connected_routes[session_id]
        del tracking_status[session_id]

@app.route('/get-bus-list', methods=['GET'])
def get_data():
    data=[]
    for key,value in route_websocket_map.items():
        if value==None:
            data.append(key)
    return jsonify(data)

@socketio.on("tracking_status")
def handle_tracking_status(data):
    """ Handle tracking status updates """
    session_id = request.sid
    status = data.get("status", "")

    if session_id in tracking_status:
        tracking_status[session_id] = status
        route_id = connected_routes.get(session_id, "Unknown")

        print(f"📡 Tracking status for Session {session_id}: {status}")

        if status == "stopped" and route_id in latest_location:
            socketio.emit("tracking_status", {
                "route_id": route_id,
                "status": "stopped",
                "latitude": latest_location[route_id]["latitude"],
                "longitude": latest_location[route_id]["longitude"]
            })
        else:
            socketio.emit("tracking_status", {"route_id": route_id, "status": status})

def is_in_college(lon, lat):
    COLLEGE = (17.5500823, 78.3948765)
    bus_location = (lat, lon)
    distance = geodesic(COLLEGE, bus_location).meters
    if distance <= 100:
        return True
    else:
        return False

def log_data(route_id):
    try:
        conn = sqlite3.connect("database.db", check_same_thread=False)
        cursor = conn.cursor()
        check_query = "select * from logs where route_id=? and log_date=?"
        res = cursor.execute(check_query, (route_id, datetime.now().strftime("%Y-%m-%d"))).fetchall()
        if len(res) <= 0:
            insert_query = "INSERT into logs values(?,?,?)"
            cursor.execute(insert_query, (route_id, datetime.now().strftime("%Y-%m-%d"), datetime.now().strftime("%H:%M:%S")))
            print("Data logged")
            conn.commit()
            conn.close()
    except sqlite3.Error as e:
        print(f"Error logging data of {e}")

@socketio.on("location_update")
def handle_location_update(data):
    """ Handle location updates from a device """
    route_id = data.get("route_id", "Unknown")
    print(f"📢 Location Update - route: {route_id}, Data: {data}")
    print(connected_routes)
    socketio.emit("location_update", data)
    if is_in_college(data["longitude"], data["latitude"]):
        log_data(data["route_id"])

    return {"status": "received"}

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=3110, debug=True)  # Use port 3110
