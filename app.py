from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

DATABASE = "database.db"


# ==========================================
# DATABASE
# ==========================================

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():

    conn = get_db()
    cursor = conn.cursor()

    # Service requests
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            service TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'Pending',
            rating INTEGER DEFAULT 0
        )
    """)

    # Workers
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            service TEXT NOT NULL,
            location TEXT NOT NULL,
            charge INTEGER NOT NULL
        )
    """)

    # Contact requests
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contact_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            worker_id INTEGER NOT NULL,
            customer_name TEXT NOT NULL,
            message TEXT DEFAULT 'Customer wants to contact you',
            status TEXT DEFAULT 'New'
        )
    """)

    conn.commit()
    conn.close()


# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():

    conn = get_db()

    requests_data = conn.execute(
        "SELECT * FROM requests ORDER BY id DESC"
    ).fetchall()

    workers_data = conn.execute(
        "SELECT * FROM workers ORDER BY id DESC"
    ).fetchall()

    contact_data = conn.execute("""
        SELECT contact_requests.*, workers.name AS worker_name
        FROM contact_requests
        JOIN workers
        ON contact_requests.worker_id = workers.id
        ORDER BY contact_requests.id DESC
    """).fetchall()

    conn.close()

    return render_template(
        "index.html",
        requests=requests_data,
        workers=workers_data,
        contacts=contact_data
    )


# ==========================================
# SUBMIT SERVICE REQUEST
# ==========================================

@app.route("/submit_request", methods=["POST"])
def submit_request():

    data = request.json

    if not data:
        return jsonify({
            "success": False
        }), 400

    conn = get_db()

    conn.execute("""
        INSERT INTO requests
        (name, service, location, description, status, rating)
        VALUES (?, ?, ?, ?, 'Pending', 0)
    """, (
        data.get("name"),
        data.get("service"),
        data.get("location"),
        data.get("description")
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True
    })


# ==========================================
# UPDATE SERVICE STATUS
# ==========================================

@app.route("/update_status/<int:request_id>", methods=["POST"])
def update_status(request_id):

    data = request.json

    if not data:
        return jsonify({
            "success": False
        }), 400

    status = data.get("status")

    if status not in ["Accepted", "Completed"]:
        return jsonify({
            "success": False
        }), 400

    conn = get_db()

    conn.execute("""
        UPDATE requests
        SET status = ?
        WHERE id = ?
    """, (status, request_id))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True
    })


# ==========================================
# RATE WORKER
# ==========================================

@app.route("/rate_request/<int:request_id>", methods=["POST"])
def rate_request(request_id):

    data = request.json

    try:
        rating = int(data.get("rating"))
    except:
        return jsonify({
            "success": False
        }), 400

    if rating < 1 or rating > 5:
        return jsonify({
            "success": False
        }), 400

    conn = get_db()

    conn.execute("""
        UPDATE requests
        SET rating = ?,
            status = 'Completed & Rated'
        WHERE id = ?
    """, (rating, request_id))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True
    })


# ==========================================
# REGISTER WORKER
# ==========================================

@app.route("/register_worker", methods=["POST"])
def register_worker():

    data = request.json

    if not data:
        return jsonify({
            "success": False
        }), 400

    conn = get_db()

    conn.execute("""
        INSERT INTO workers
        (name, service, location, charge)
        VALUES (?, ?, ?, ?)
    """, (
        data.get("name"),
        data.get("service"),
        data.get("location"),
        data.get("charge")
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True
    })


# ==========================================
# CONTACT WORKER
# ==========================================

@app.route("/contact_worker", methods=["POST"])
def contact_worker():

    data = request.json

    if not data:
        return jsonify({
            "success": False
        }), 400

    worker_id = data.get("worker_id")
    customer_name = data.get("customer_name")

    conn = get_db()

    conn.execute("""
        INSERT INTO contact_requests
        (worker_id, customer_name, message, status)
        VALUES (?, ?, ?, 'New')
    """, (
        worker_id,
        customer_name,
        "Customer wants to contact you"
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Contact request sent to worker"
    })


# ==========================================
# ACCEPT CONTACT REQUEST
# ==========================================

@app.route("/accept_contact/<int:contact_id>", methods=["POST"])
def accept_contact(contact_id):

    conn = get_db()

    conn.execute("""
        UPDATE contact_requests
        SET status = 'Accepted'
        WHERE id = ?
    """, (contact_id,))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True
    })


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":

    init_db()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )