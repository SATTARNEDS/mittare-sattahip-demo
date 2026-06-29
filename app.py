from __future__ import annotations

import json
import os
import secrets
import sqlite3
import urllib.error
import urllib.request
import base64
import hashlib
import hmac
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from flask import (
    Flask,
    abort,
    jsonify,
    request,
    send_from_directory,
    session,
)
from werkzeug.exceptions import BadRequest, HTTPException
from werkzeug.security import safe_join
from werkzeug.utils import secure_filename


BASE_DIR = Path(__file__).resolve().parent
INSTANCE_DIR = Path(os.environ.get("APP_INSTANCE_DIR", BASE_DIR / "instance"))
UPLOAD_DIR = INSTANCE_DIR / "uploads"
PRODUCT_MEDIA_DIR = INSTANCE_DIR / "product-media"
PRODUCT_MEDIA_CONFIG_PATH = INSTANCE_DIR / "product_media.json"
DATABASE_PATH = INSTANCE_DIR / "mittare.sqlite3"
ALLOWED_UPLOAD_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "pdf", "doc", "docx", "xls", "xlsx"}
ALLOWED_PRODUCT_MEDIA_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "pdf"}
MAX_UPLOAD_BYTES = 8 * 1024 * 1024
DEFAULT_ADMIN_LINE_USER_ID = "Ueaebf5b870fcdd317383855ff445e460"

DEFAULT_PRODUCT_MEDIA = {
    "motor-1": {"folder": "รถยนต์ประเภท1", "images": 6, "cover": "assets/insurance-motor.png"},
    "motor-3": {"folder": "รถยนต์ประเภท3", "images": 7, "cover": "assets/insurance-motor.png"},
    "motor-2plus": {"folder": "รถยนต์ประเภท2+", "image_names": ["0.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg"], "cover": "assets/insurance-motor.png"},
    "motor-3plus": {"folder": "รถยนต์ประเภท3+", "pdf": "ป3+  ใหม่.pdf", "images": 5, "cover": "assets/insurance-motor.png"},
    "motor-one": {"folder": "มิตรแท้หนึ่งเดียว", "images": 10, "cover": "assets/insurance-motor.png"},
    "motor-permpoon": {"folder": "มิตรแท้เพิ่มพูน2+", "pdf": "เพิ่มพูน 2+.pdf", "images": 6, "cover": "assets/insurance-motor.png"},
    "motor-taweekoon": {"folder": "มิตรแท้ทวีคูณ", "images": 5, "cover": "assets/insurance-motor.png"},
    "motor-permpoon3": {"folder": "มิตรแท้เพิ่มพูน3+", "images": 5, "cover": "assets/insurance-motor.png"},
    "residential-fire": {"folder": "อัคคีภัย", "images": 2, "cover": "assets/insurance-property.png"},
    "pa1": {"folder": "อุบัติเหตุส่วนบุคคล อบ.1", "images": 2, "cover": "assets/insurance-personal.png"},
    "income-hospital": {"folder": "ชดเชยรายได้กรณีเข้ารักษาจากอุบัติเหตุ", "images": 4, "cover": "assets/insurance-personal.png"},
    "golf": {"folder": "ประกันภัยสำหรับผู้เล่นกอล์ฟ", "images": 4, "cover": "assets/insurance-personal.png"},
    "drone": {"folder": "ประกันภัยอากาศยานซึ่งไม่มีนักบิน", "images": 3, "cover": "assets/insurance-specialty.png"},
    "fuel-station": {"folder": "ประกันภัยสถานีบริการเชื้อเพลิง", "images": 3, "cover": "assets/insurance-specialty.png"},
}

SALES_STATUS_LABELS = {
    "new": "ลูกค้าใหม่",
    "quoted": "ส่งใบเสนอราคาแล้ว",
    "waiting": "รอตัดสินใจ",
    "documents": "รอเอกสาร",
    "payment": "นัดชำระ",
    "renewed": "ต่ออายุแล้ว",
    "claim-followup": "ติดตามหลังเคลม",
    "lost": "ปิดงานไม่สำเร็จ",
}


def create_app() -> Flask:
    app = Flask(__name__, static_folder=None)
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-before-production")
    app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES
    app.config["ADMIN_PASSWORD"] = os.environ.get("ADMIN_PASSWORD", "admin123")
    app.config["LINE_CHANNEL_ACCESS_TOKEN"] = os.environ.get("LINE_CHANNEL_ACCESS_TOKEN", "")
    app.config["LINE_CHANNEL_SECRET"] = os.environ.get("LINE_CHANNEL_SECRET", "")
    app.config["ADMIN_LINE_USER_ID"] = os.environ.get("ADMIN_LINE_USER_ID", DEFAULT_ADMIN_LINE_USER_ID)

    INSTANCE_DIR.mkdir(exist_ok=True)
    UPLOAD_DIR.mkdir(exist_ok=True)
    PRODUCT_MEDIA_DIR.mkdir(exist_ok=True)
    initialize_database()

    @app.errorhandler(HTTPException)
    def handle_http_error(error: HTTPException):
        return jsonify({"error": error.description}), error.code

    @app.get("/")
    def home():
        return send_from_directory(BASE_DIR, "index.html")

    @app.get("/<path:filename>")
    def static_files(filename: str):
        allowed_roots = ("assets/", "document/")
        allowed_files = {
            "index.html",
            "insurance.html",
            "agent-dashboard.html",
            "customer-status.html",
            "styles.css",
            "script.js",
            "agent-dashboard.js",
            "customer-status.js",
        }
        if filename in allowed_files or filename.startswith(allowed_roots):
            return send_from_directory(BASE_DIR, filename)
        abort(404)

    @app.get("/product-media/<path:filename>")
    def product_media_file(filename: str):
        safe_path = safe_join(str(PRODUCT_MEDIA_DIR), filename)
        if not safe_path:
            abort(404)
        return send_from_directory(PRODUCT_MEDIA_DIR, filename)

    @app.get("/api/session")
    def get_session():
        return jsonify({
            "authenticated": is_authenticated(),
            "linePushConfigured": bool(app.config["LINE_CHANNEL_ACCESS_TOKEN"]),
            "lineWebhookConfigured": bool(app.config["LINE_CHANNEL_SECRET"]),
        })

    @app.post("/api/session")
    def login():
        data = request.get_json(silent=True) or {}
        password = str(data.get("password", ""))
        if not secrets.compare_digest(password, app.config["ADMIN_PASSWORD"]):
            return jsonify({"error": "รหัสผ่านไม่ถูกต้อง"}), 401
        session["admin_authenticated"] = True
        return jsonify({"authenticated": True})

    @app.delete("/api/session")
    def logout():
        session.clear()
        return jsonify({"authenticated": False})

    @app.get("/api/settings")
    @require_admin
    def get_settings():
        admin_line_user_id = get_admin_line_user_id(app)
        return jsonify({
            "adminLineRecipientConfigured": bool(admin_line_user_id),
            "adminLineUserIdMasked": mask_line_user_id(admin_line_user_id),
        })

    @app.get("/api/policies")
    @require_admin
    def list_policies():
        with get_db() as db:
            rows = db.execute("SELECT * FROM policies ORDER BY end_date ASC, updated_at DESC").fetchall()
            return jsonify([policy_to_dict(db, row, include_private=True) for row in rows])

    @app.delete("/api/policies")
    @require_admin
    def delete_all_policies():
        with get_db() as db:
            attachments = db.execute("SELECT stored_filename FROM attachments").fetchall()
            db.execute("DELETE FROM policies")
        for attachment in attachments:
            delete_upload_file(attachment["stored_filename"])
        return jsonify({"ok": True})

    @app.post("/api/policies")
    @require_admin
    def create_policy():
        payload = policy_payload_from_request()
        now = utc_now()
        public_ref = create_public_reference()
        with get_db() as db:
            cursor = db.execute(
                """
                INSERT INTO policies (
                  public_ref, customer_name, customer_phone, line_name, line_user_id, assigned_agent,
                  insurance_category, product_name, policy_number, insurer_name,
                  start_date, end_date, premium_amount, sales_status, next_follow_up,
                  customer_notes, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    public_ref,
                    payload["customer_name"],
                    payload["customer_phone"],
                    payload["line_name"],
                    payload["line_user_id"],
                    payload["assigned_agent"],
                    payload["insurance_category"],
                    payload["product_name"],
                    payload["policy_number"],
                    payload["insurer_name"],
                    payload["start_date"],
                    payload["end_date"],
                    payload["premium_amount"],
                    payload["sales_status"],
                    payload["next_follow_up"],
                    payload["customer_notes"],
                    now,
                    now,
                ),
            )
            policy_id = cursor.lastrowid
            save_uploaded_files(db, policy_id)
            row = db.execute("SELECT * FROM policies WHERE id = ?", (policy_id,)).fetchone()
            return jsonify(policy_to_dict(db, row, include_private=True)), 201

    @app.put("/api/policies/<int:policy_id>")
    @require_admin
    def update_policy(policy_id: int):
        payload = policy_payload_from_request()
        with get_db() as db:
            existing = db.execute("SELECT id FROM policies WHERE id = ?", (policy_id,)).fetchone()
            if not existing:
                return jsonify({"error": "ไม่พบกรมธรรม์"}), 404
            db.execute(
                """
                UPDATE policies
                SET customer_name = ?, customer_phone = ?, line_name = ?, line_user_id = ?, assigned_agent = ?,
                    insurance_category = ?, product_name = ?, policy_number = ?, insurer_name = ?,
                    start_date = ?, end_date = ?, premium_amount = ?, sales_status = ?,
                    next_follow_up = ?, customer_notes = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    payload["customer_name"],
                    payload["customer_phone"],
                    payload["line_name"],
                    payload["line_user_id"],
                    payload["assigned_agent"],
                    payload["insurance_category"],
                    payload["product_name"],
                    payload["policy_number"],
                    payload["insurer_name"],
                    payload["start_date"],
                    payload["end_date"],
                    payload["premium_amount"],
                    payload["sales_status"],
                    payload["next_follow_up"],
                    payload["customer_notes"],
                    utc_now(),
                    policy_id,
                ),
            )
            save_uploaded_files(db, policy_id)
            row = db.execute("SELECT * FROM policies WHERE id = ?", (policy_id,)).fetchone()
            return jsonify(policy_to_dict(db, row, include_private=True))

    @app.delete("/api/policies/<int:policy_id>")
    @require_admin
    def delete_policy(policy_id: int):
        with get_db() as db:
            attachments = db.execute("SELECT stored_filename FROM attachments WHERE policy_id = ?", (policy_id,)).fetchall()
            db.execute("DELETE FROM policies WHERE id = ?", (policy_id,))
        for attachment in attachments:
            delete_upload_file(attachment["stored_filename"])
        return jsonify({"ok": True})

    @app.delete("/api/attachments/<int:attachment_id>")
    @require_admin
    def delete_attachment(attachment_id: int):
        with get_db() as db:
            attachment = db.execute("SELECT stored_filename FROM attachments WHERE id = ?", (attachment_id,)).fetchone()
            if not attachment:
                return jsonify({"error": "ไม่พบไฟล์แนบ"}), 404
            db.execute("DELETE FROM attachments WHERE id = ?", (attachment_id,))
        delete_upload_file(attachment["stored_filename"])
        return jsonify({"ok": True})

    @app.post("/api/line/webhook")
    def line_webhook():
        channel_secret = app.config["LINE_CHANNEL_SECRET"]
        body = request.get_data()
        signature = request.headers.get("x-line-signature", "")
        if channel_secret and not verify_line_signature(channel_secret, body, signature):
            return jsonify({"error": "Invalid LINE signature"}), 400

        payload = request.get_json(silent=True) or {}
        events = payload.get("events", [])
        with get_db() as db:
            for event in events:
                save_line_webhook_event(db, event)
        return jsonify({"ok": True})

    @app.get("/api/line/contacts")
    @require_admin
    def list_line_contacts():
        with get_db() as db:
            rows = db.execute(
                "SELECT * FROM line_contacts ORDER BY updated_at DESC LIMIT 100"
            ).fetchall()
        return jsonify([line_contact_to_dict(row) for row in rows])

    @app.post("/api/admin/line-alerts")
    @require_admin
    def push_admin_line_alert():
        token = app.config["LINE_CHANNEL_ACCESS_TOKEN"]
        if not token:
            return jsonify({"error": "ยังไม่ได้ตั้งค่า LINE_CHANNEL_ACCESS_TOKEN บนเซิร์ฟเวอร์"}), 400

        data = request.get_json(silent=True) or {}
        custom_message = str(data.get("message", "")).strip()
        with get_db() as db:
            admin_line_user_id = get_admin_line_user_id(app)
            if not admin_line_user_id:
                return jsonify({"error": "ยังไม่ได้ตั้งค่า ADMIN_LINE_USER_ID บนเซิร์ฟเวอร์"}), 400
            message = custom_message or build_admin_alert_message(db)
            try:
                response_payload = send_line_push_message(token, admin_line_user_id, message)
                status = "sent"
                error_message = ""
            except Exception as error:
                response_payload = {}
                status = "failed"
                error_message = str(error)
            db.execute(
                """
                INSERT INTO line_admin_message_logs (
                  recipient_line_user_id, message, status, error_message, created_at
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                (admin_line_user_id, message, status, error_message, utc_now()),
            )

        if status == "failed":
            return jsonify({"error": f"ส่งแจ้งเตือนผู้ดูแลไม่สำเร็จ: {error_message}"}), 502
        return jsonify({"ok": True, "lineResponse": response_payload})

    @app.post("/api/policies/<int:policy_id>/line-push")
    @require_admin
    def push_line_policy_message(policy_id: int):
        token = app.config["LINE_CHANNEL_ACCESS_TOKEN"]
        if not token:
            return jsonify({"error": "ยังไม่ได้ตั้งค่า LINE_CHANNEL_ACCESS_TOKEN บนเซิร์ฟเวอร์"}), 400

        data = request.get_json(silent=True) or {}
        message = str(data.get("message", "")).strip()
        if not message:
            raise BadRequest("กรุณาสร้างข้อความก่อนส่ง LINE Push")

        with get_db() as db:
            policy = db.execute("SELECT * FROM policies WHERE id = ?", (policy_id,)).fetchone()
            if not policy:
                return jsonify({"error": "ไม่พบกรมธรรม์"}), 404
            line_user_id = get_admin_line_user_id(app)
            if not line_user_id:
                return jsonify({"error": "ยังไม่ได้ตั้งค่า ADMIN_LINE_USER_ID บนเซิร์ฟเวอร์"}), 400

            try:
                response_payload = send_line_push_message(token, line_user_id, message)
                status = "sent"
                error_message = ""
            except BadRequest:
                raise
            except Exception as error:
                response_payload = {}
                status = "failed"
                error_message = str(error)

            db.execute(
                """
                INSERT INTO line_message_logs (
                  policy_id, line_user_id, message, status, error_message, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (policy_id, line_user_id, message, status, error_message, utc_now()),
            )

        if status == "failed":
            return jsonify({"error": f"ส่ง LINE Push ไม่สำเร็จ: {error_message}"}), 502
        return jsonify({"ok": True, "lineResponse": response_payload})

    @app.get("/api/public/product-media")
    def public_product_media():
        return jsonify(public_product_media_payload())

    @app.get("/api/product-media")
    @require_admin
    def list_product_media():
        return jsonify(admin_product_media_payload())

    @app.post("/api/product-media/<plan_id>")
    @require_admin
    def upload_product_media(plan_id: str):
        safe_plan_id = normalize_plan_id(plan_id)
        if not safe_plan_id:
            raise BadRequest("รหัสแผนไม่ถูกต้อง")

        media_type = request.form.get("mediaType", "documents").strip()
        if media_type not in {"cover", "documents"}:
            raise BadRequest("ประเภทสื่อไม่ถูกต้อง")

        files = request.files.getlist("productMediaFiles")
        if not files:
            raise BadRequest("กรุณาเลือกไฟล์ที่ต้องการอัปโหลด")

        with get_db() as db:
            for file in files:
                if not file or not file.filename:
                    continue
                extension = get_extension(file.filename)
                if extension not in ALLOWED_PRODUCT_MEDIA_EXTENSIONS:
                    raise BadRequest(f"ชนิดไฟล์ {file.filename} ยังไม่รองรับ")

                is_image = extension in {"jpg", "jpeg", "png", "webp"}
                if media_type == "cover" and not is_image:
                    raise BadRequest("รูปประกอบต้องเป็นไฟล์รูปภาพเท่านั้น")

                media_kind = "cover" if media_type == "cover" else "pdf" if extension == "pdf" else "image"
                stored_filename = f"{safe_plan_id}-{secrets.token_hex(8)}.{extension}"
                file.save(PRODUCT_MEDIA_DIR / stored_filename)
                saved_path = PRODUCT_MEDIA_DIR / stored_filename

                if media_kind in {"cover", "pdf"}:
                    old_rows = db.execute(
                        "SELECT stored_filename FROM product_media WHERE plan_id = ? AND media_kind = ?",
                        (safe_plan_id, media_kind),
                    ).fetchall()
                    db.execute(
                        "DELETE FROM product_media WHERE plan_id = ? AND media_kind = ?",
                        (safe_plan_id, media_kind),
                    )
                    for row in old_rows:
                        delete_product_media_file(row["stored_filename"])

                sort_order = next_product_media_sort_order(db, safe_plan_id) if media_kind == "image" else 0
                db.execute(
                    """
                    INSERT INTO product_media (
                      plan_id, media_kind, stored_filename, original_filename,
                      mime_type, size_bytes, sort_order, public_url, source, created_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        safe_plan_id,
                        media_kind,
                        stored_filename,
                        file.filename,
                        file.mimetype,
                        saved_path.stat().st_size,
                        sort_order,
                        "",
                        "upload",
                        utc_now(),
                    ),
                )

        return jsonify(admin_product_media_payload().get(safe_plan_id, empty_product_media()))

    @app.delete("/api/product-media/<plan_id>/files/<filename>")
    @require_admin
    def delete_product_media(plan_id: str, filename: str):
        safe_plan_id = normalize_plan_id(plan_id)
        safe_filename = Path(filename).name
        with get_db() as db:
            row = db.execute(
                "SELECT stored_filename FROM product_media WHERE plan_id = ? AND stored_filename = ?",
                (safe_plan_id, safe_filename),
            ).fetchone()
            if not row:
                return jsonify({"error": "ไม่พบไฟล์นี้ในแผนที่เลือก"}), 404
            db.execute(
                "DELETE FROM product_media WHERE plan_id = ? AND stored_filename = ?",
                (safe_plan_id, safe_filename),
            )

        delete_product_media_file(safe_filename)
        return jsonify(admin_product_media_payload().get(safe_plan_id, empty_product_media()))

    @app.get("/api/attachments/<int:attachment_id>")
    @require_admin
    def download_attachment(attachment_id: int):
        with get_db() as db:
            attachment = db.execute("SELECT * FROM attachments WHERE id = ?", (attachment_id,)).fetchone()
            if not attachment:
                abort(404)
        safe_path = safe_join(str(UPLOAD_DIR), attachment["stored_filename"])
        if not safe_path:
            abort(404)
        return send_from_directory(
            UPLOAD_DIR,
            attachment["stored_filename"],
            as_attachment=request.args.get("download") == "1",
            download_name=attachment["original_filename"],
        )

    @app.get("/api/export")
    @require_admin
    def export_policies():
        with get_db() as db:
            rows = db.execute("SELECT * FROM policies ORDER BY updated_at DESC").fetchall()
            return jsonify({
                "exportedAt": utc_now(),
                "version": 2,
                "policies": [policy_to_dict(db, row, include_private=True) for row in rows],
            })

    @app.post("/api/demo/seed")
    @require_admin
    def seed_demo_data():
        with get_db() as db:
            seed_demo_rows(db)
            seed_line_test_rows(db, "")
            rows = db.execute("SELECT * FROM policies ORDER BY end_date ASC").fetchall()
            return jsonify([policy_to_dict(db, row, include_private=True) for row in rows])

    @app.post("/api/customer/policies")
    def customer_policy_lookup():
        data = request.get_json(silent=True) or {}
        phone = normalize_phone(data.get("phone", ""))
        reference = str(data.get("reference", "")).strip()
        if not phone and not reference:
            return jsonify({"error": "กรุณากรอกเบอร์โทร หรือเลขอ้างอิง/เลขกรมธรรม์ อย่างน้อยหนึ่งช่อง"}), 400
        if phone and len(phone) < 6:
            return jsonify({"error": "กรุณากรอกเบอร์โทรอย่างน้อย 6 หลักเพื่อความปลอดภัย"}), 400

        filters = []
        params: list[str] = []
        if phone:
            filters.append("REPLACE(REPLACE(REPLACE(customer_phone, '-', ''), ' ', ''), '+66', '0') LIKE ?")
            params.append(f"%{phone[-6:]}")
        if reference:
            filters.append("(public_ref COLLATE NOCASE = ? OR policy_number COLLATE NOCASE = ?)")
            params.extend([reference, reference])

        with get_db() as db:
            rows = db.execute(
                f"""
                SELECT * FROM policies
                WHERE {" OR ".join(filters)}
                ORDER BY end_date DESC
                LIMIT 20
                """,
                params,
            ).fetchall()
            return jsonify([policy_to_dict(db, row, include_private=False) for row in rows])

    return app


def require_admin(view):
    def wrapped(*args, **kwargs):
        if not is_authenticated():
            return jsonify({"error": "กรุณาเข้าสู่ระบบหลังบ้าน"}), 401
        return view(*args, **kwargs)

    wrapped.__name__ = view.__name__
    return wrapped


def is_authenticated() -> bool:
    return bool(session.get("admin_authenticated"))


def get_db() -> sqlite3.Connection:
    db = sqlite3.connect(DATABASE_PATH)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    return db


def initialize_database() -> None:
    with get_db() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS policies (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              public_ref TEXT NOT NULL UNIQUE,
              customer_name TEXT NOT NULL,
              customer_phone TEXT NOT NULL,
              line_name TEXT DEFAULT '',
              line_user_id TEXT DEFAULT '',
              assigned_agent TEXT DEFAULT '',
              insurance_category TEXT NOT NULL,
              product_name TEXT DEFAULT '',
              policy_number TEXT DEFAULT '',
              insurer_name TEXT DEFAULT '',
              start_date TEXT DEFAULT '',
              end_date TEXT NOT NULL,
              premium_amount REAL DEFAULT 0,
              sales_status TEXT NOT NULL DEFAULT 'new',
              next_follow_up TEXT DEFAULT '',
              customer_notes TEXT DEFAULT '',
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS attachments (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              policy_id INTEGER NOT NULL,
              stored_filename TEXT NOT NULL,
              original_filename TEXT NOT NULL,
              mime_type TEXT DEFAULT '',
              size_bytes INTEGER DEFAULT 0,
              created_at TEXT NOT NULL,
              FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS product_media (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              plan_id TEXT NOT NULL,
              media_kind TEXT NOT NULL CHECK (media_kind IN ('cover', 'image', 'pdf')),
              stored_filename TEXT NOT NULL UNIQUE,
              original_filename TEXT NOT NULL,
              mime_type TEXT DEFAULT '',
              size_bytes INTEGER DEFAULT 0,
              sort_order INTEGER DEFAULT 0,
              public_url TEXT DEFAULT '',
              source TEXT NOT NULL DEFAULT 'upload',
              created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS line_message_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              policy_id INTEGER NOT NULL,
              line_user_id TEXT NOT NULL,
              message TEXT NOT NULL,
              status TEXT NOT NULL,
              error_message TEXT DEFAULT '',
              created_at TEXT NOT NULL,
              FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS line_contacts (
              line_user_id TEXT PRIMARY KEY,
              display_name TEXT DEFAULT '',
              latest_message TEXT DEFAULT '',
              latest_event_type TEXT DEFAULT '',
              first_seen_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS line_webhook_events (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              line_user_id TEXT DEFAULT '',
              event_type TEXT NOT NULL,
              message_type TEXT DEFAULT '',
              message_text TEXT DEFAULT '',
              raw_event TEXT NOT NULL,
              created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS app_settings (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL DEFAULT '',
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS line_admin_message_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              recipient_line_user_id TEXT NOT NULL,
              message TEXT NOT NULL,
              status TEXT NOT NULL,
              error_message TEXT DEFAULT '',
              created_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_policies_end_date ON policies(end_date);
            CREATE INDEX IF NOT EXISTS idx_policies_phone ON policies(customer_phone);
            CREATE INDEX IF NOT EXISTS idx_attachments_policy ON attachments(policy_id);
            CREATE INDEX IF NOT EXISTS idx_product_media_plan ON product_media(plan_id);
            CREATE INDEX IF NOT EXISTS idx_line_message_logs_policy ON line_message_logs(policy_id);
            CREATE INDEX IF NOT EXISTS idx_line_webhook_events_user ON line_webhook_events(line_user_id);
            CREATE INDEX IF NOT EXISTS idx_line_admin_message_logs_created ON line_admin_message_logs(created_at);
            """
        )
        ensure_column(db, "policies", "line_user_id", "TEXT DEFAULT ''")
        ensure_column(db, "product_media", "public_url", "TEXT DEFAULT ''")
        ensure_column(db, "product_media", "source", "TEXT NOT NULL DEFAULT 'upload'")
    migrate_product_media_json_to_database()
    seed_default_product_media()


def ensure_column(db: sqlite3.Connection, table_name: str, column_name: str, column_definition: str) -> None:
    columns = db.execute(f"PRAGMA table_info({table_name})").fetchall()
    if any(column["name"] == column_name for column in columns):
        return
    db.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_definition}")


def get_setting(db: sqlite3.Connection, key: str) -> str:
    row = db.execute("SELECT value FROM app_settings WHERE key = ?", (key,)).fetchone()
    return str(row["value"]) if row else ""


def set_setting(db: sqlite3.Connection, key: str, value: str) -> None:
    db.execute(
        """
        INSERT INTO app_settings (key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
        """,
        (key, value, utc_now()),
    )


def build_admin_alert_message(db: sqlite3.Connection) -> str:
    rows = db.execute(
        """
        SELECT * FROM policies
        WHERE sales_status NOT IN ('renewed', 'lost')
        ORDER BY end_date ASC, next_follow_up ASC
        """
    ).fetchall()
    today = datetime.now(timezone.utc).date()
    alert_rows = []
    for row in rows:
        end_date = parse_iso_date(row["end_date"])
        next_follow_up = parse_iso_date(row["next_follow_up"])
        is_overdue = bool(end_date and end_date < today)
        is_due_30 = bool(end_date and 0 <= (end_date - today).days <= 30)
        is_followup_due = bool(next_follow_up and next_follow_up <= today)
        if is_overdue or is_due_30 or is_followup_due:
            alert_rows.append((row, end_date, next_follow_up, is_overdue, is_due_30, is_followup_due))

    if not alert_rows:
        return "แจ้งเตือนผู้ดูแล Mittare Sattahip\n\nวันนี้ยังไม่มีกรมธรรม์ที่หมดอายุ ใกล้หมดอายุใน 30 วัน หรือนัดติดตามที่เลยกำหนด"

    lines = [
        "แจ้งเตือนผู้ดูแล Mittare Sattahip",
        f"รายการที่ควรติดตาม: {len(alert_rows)} รายการ",
        "",
    ]
    for row, end_date, next_follow_up, is_overdue, is_due_30, is_followup_due in alert_rows[:12]:
        reasons = []
        if is_overdue and end_date:
            reasons.append(f"หมดอายุแล้ว {abs((end_date - today).days)} วัน")
        elif is_due_30 and end_date:
            reasons.append(f"หมดอายุใน {(end_date - today).days} วัน")
        if is_followup_due:
            reasons.append("ถึงนัดติดตาม")
        lines.extend([
            f"- {row['customer_name']} | {row['policy_number'] or row['public_ref']}",
            f"  {row['insurance_category']} {row['product_name'] or ''}".strip(),
            f"  สถานะ: {SALES_STATUS_LABELS.get(row['sales_status'], row['sales_status'])} | {', '.join(reasons)}",
        ])
        if row["assigned_agent"]:
            lines.append(f"  ผู้ดูแล: {row['assigned_agent']}")
        if row["customer_phone"]:
            lines.append(f"  โทร: {row['customer_phone']}")
    if len(alert_rows) > 12:
        lines.append(f"\nและอีก {len(alert_rows) - 12} รายการ กรุณาเปิดหลังบ้านเพื่อตรวจสอบทั้งหมด")
    return "\n".join(lines)


def parse_iso_date(value: str | None):
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


def policy_payload_from_request() -> dict[str, Any]:
    form = request.form
    customer_name = form.get("customerName", "").strip()
    customer_phone = form.get("customerPhone", "").strip()
    insurance_category = form.get("insuranceCategory", "").strip()
    end_date = form.get("endDate", "").strip()
    if not customer_name or not customer_phone or not insurance_category or not end_date:
        raise BadRequest("กรุณากรอกชื่อลูกค้า เบอร์โทร ประเภทประกัน และวันหมดอายุ")
    return {
        "customer_name": customer_name,
        "customer_phone": customer_phone,
        "line_name": form.get("lineName", "").strip(),
        "line_user_id": form.get("lineUserId", "").strip(),
        "assigned_agent": form.get("assignedAgent", "").strip(),
        "insurance_category": insurance_category,
        "product_name": form.get("productName", "").strip(),
        "policy_number": form.get("policyNumber", "").strip(),
        "insurer_name": form.get("insurerName", "").strip(),
        "start_date": form.get("startDate", "").strip(),
        "end_date": end_date,
        "premium_amount": parse_float(form.get("premiumAmount")),
        "sales_status": form.get("salesStatus", "new").strip(),
        "next_follow_up": form.get("nextFollowUp", "").strip(),
        "customer_notes": form.get("customerNotes", "").strip(),
    }


def parse_float(value: Any) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0


def create_public_reference() -> str:
    return f"MT4-{datetime.now().strftime('%y%m%d')}-{secrets.token_hex(3).upper()}"


def save_uploaded_files(db: sqlite3.Connection, policy_id: int) -> None:
    for file in request.files.getlist("policyFiles"):
        if not file or not file.filename:
            continue
        original_filename = secure_filename(file.filename)
        if not is_allowed_upload(original_filename):
            raise BadRequest(f"ชนิดไฟล์ {file.filename} ยังไม่รองรับ")
        stored_filename = f"{policy_id}-{secrets.token_hex(10)}-{original_filename}"
        file.save(UPLOAD_DIR / stored_filename)
        db.execute(
            """
            INSERT INTO attachments (policy_id, stored_filename, original_filename, mime_type, size_bytes, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                policy_id,
                stored_filename,
                file.filename,
                file.mimetype,
                (UPLOAD_DIR / stored_filename).stat().st_size,
                utc_now(),
            ),
        )


def is_allowed_upload(filename: str) -> bool:
    return get_extension(filename) in ALLOWED_UPLOAD_EXTENSIONS


def get_extension(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def delete_upload_file(stored_filename: str) -> None:
    target = UPLOAD_DIR / stored_filename
    if target.exists() and target.is_file():
        target.unlink()


def normalize_plan_id(plan_id: str) -> str:
    return "".join(character for character in str(plan_id) if character.isalnum() or character in {"-", "_"})


def empty_product_media() -> dict[str, Any]:
    return {"cover": None, "images": [], "pdf": None}


def next_product_media_sort_order(db: sqlite3.Connection, plan_id: str) -> int:
    row = db.execute(
        "SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM product_media WHERE plan_id = ? AND media_kind = 'image'",
        (plan_id,),
    ).fetchone()
    return int(row["next_order"] if row else 1)


def load_product_media_config() -> dict[str, Any]:
    if not PRODUCT_MEDIA_CONFIG_PATH.exists():
        return {}
    try:
        with PRODUCT_MEDIA_CONFIG_PATH.open("r", encoding="utf-8") as file:
            payload = json.load(file)
    except (OSError, json.JSONDecodeError):
        return {}
    return payload if isinstance(payload, dict) else {}


def save_product_media_config(config: dict[str, Any]) -> None:
    with PRODUCT_MEDIA_CONFIG_PATH.open("w", encoding="utf-8") as file:
        json.dump(config, file, ensure_ascii=False, indent=2)


def product_media_url(filename: str | None) -> str:
    if not filename:
        return ""
    return f"/product-media/{filename}"


def product_media_file_payload(file_info: dict[str, Any] | None) -> dict[str, Any] | None:
    if not file_info:
        return None
    return {
        **file_info,
        "url": product_media_url(file_info.get("filename")),
    }


def admin_product_media_payload() -> dict[str, Any]:
    with get_db() as db:
        rows = db.execute(
            """
            SELECT * FROM product_media
            ORDER BY plan_id ASC,
              CASE media_kind WHEN 'cover' THEN 0 WHEN 'image' THEN 1 ELSE 2 END,
              CASE source WHEN 'default' THEN 0 ELSE 1 END,
              sort_order ASC,
              created_at ASC
            """
        ).fetchall()
    payload: dict[str, Any] = {}
    for row in rows:
        plan_media = payload.setdefault(row["plan_id"], empty_product_media())
        file_payload = product_media_row_payload(row)
        if row["media_kind"] == "cover":
            plan_media["cover"] = file_payload
        elif row["media_kind"] == "pdf":
            plan_media["pdf"] = file_payload
        else:
            plan_media["images"].append(file_payload)
    return payload


def public_product_media_payload() -> dict[str, Any]:
    config = admin_product_media_payload()
    payload = {}
    for plan_id, media in config.items():
        cover = media.get("cover")
        images = media.get("images", [])
        pdf = media.get("pdf")
        payload[plan_id] = {
            "coverImageUrl": cover["url"] if cover else "",
            "imageUrls": [image["url"] for image in images if image],
            "pdfUrl": pdf["url"] if pdf else "",
        }
    return payload


def product_media_row_payload(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "filename": row["stored_filename"],
        "originalName": row["original_filename"],
        "size": row["size_bytes"],
        "type": row["mime_type"],
        "createdAt": row["created_at"],
        "source": row["source"],
        "url": row["public_url"] or product_media_url(row["stored_filename"]),
    }


def migrate_product_media_json_to_database() -> None:
    if not PRODUCT_MEDIA_CONFIG_PATH.exists():
        return
    config = load_product_media_config()
    if not config:
        return
    with get_db() as db:
        existing_count = db.execute("SELECT COUNT(*) AS total FROM product_media").fetchone()["total"]
        if existing_count:
            return
        for plan_id, media in config.items():
            safe_plan_id = normalize_plan_id(plan_id)
            if not safe_plan_id or not isinstance(media, dict):
                continue
            for media_kind, file_info in (("cover", media.get("cover")), ("pdf", media.get("pdf"))):
                insert_legacy_product_media_row(db, safe_plan_id, media_kind, file_info, 0)
            for index, file_info in enumerate(media.get("images", []), start=1):
                insert_legacy_product_media_row(db, safe_plan_id, "image", file_info, index)


def insert_legacy_product_media_row(
    db: sqlite3.Connection,
    plan_id: str,
    media_kind: str,
    file_info: dict[str, Any] | None,
    sort_order: int,
) -> None:
    if not file_info or not file_info.get("filename"):
        return
    db.execute(
        """
        INSERT OR IGNORE INTO product_media (
          plan_id, media_kind, stored_filename, original_filename,
          mime_type, size_bytes, sort_order, public_url, source, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            plan_id,
            media_kind,
            Path(file_info["filename"]).name,
            file_info.get("originalName") or file_info["filename"],
            file_info.get("type", ""),
            int(file_info.get("size") or 0),
            sort_order,
            file_info.get("url", ""),
            "upload",
            file_info.get("createdAt") or utc_now(),
        ),
    )


def seed_default_product_media() -> None:
    with get_db() as db:
        existing_default_count = db.execute(
            "SELECT COUNT(*) AS total FROM product_media WHERE source = 'default'"
        ).fetchone()["total"]
        if existing_default_count:
            return
        for plan_id, media in DEFAULT_PRODUCT_MEDIA.items():
            cover_url = media.get("cover", "")
            if cover_url:
                insert_default_product_media_row(
                    db,
                    plan_id,
                    "cover",
                    f"default:{plan_id}:cover",
                    Path(cover_url).name,
                    cover_url,
                    0,
                )

            folder = media.get("folder", "")
            image_names = media.get("image_names") or [
                f"{index + 1}.jpg" for index in range(int(media.get("images", 0)))
            ]
            for index, image_name in enumerate(image_names, start=1):
                public_url = encode_public_document_path(folder, image_name)
                insert_default_product_media_row(
                    db,
                    plan_id,
                    "image",
                    f"default:{plan_id}:image:{index}:{image_name}",
                    image_name,
                    public_url,
                    index,
                )

            pdf_name = media.get("pdf")
            if pdf_name:
                insert_default_product_media_row(
                    db,
                    plan_id,
                    "pdf",
                    f"default:{plan_id}:pdf:{pdf_name}",
                    pdf_name,
                    encode_public_document_path(folder, pdf_name),
                    0,
                )


def insert_default_product_media_row(
    db: sqlite3.Connection,
    plan_id: str,
    media_kind: str,
    stored_filename: str,
    original_filename: str,
    public_url: str,
    sort_order: int,
) -> None:
    if not public_url:
        return
    db.execute(
        """
        INSERT OR IGNORE INTO product_media (
          plan_id, media_kind, stored_filename, original_filename,
          mime_type, size_bytes, sort_order, public_url, source, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            plan_id,
            media_kind,
            stored_filename,
            original_filename,
            guess_mime_type(original_filename),
            0,
            sort_order,
            public_url,
            "default",
            utc_now(),
        ),
    )


def encode_public_document_path(folder: str, file_name: str) -> str:
    if not folder or not file_name:
        return ""
    from urllib.parse import quote

    return "/".join(["document", quote(folder), quote(file_name)])


def guess_mime_type(file_name: str) -> str:
    extension = get_extension(file_name)
    if extension == "pdf":
        return "application/pdf"
    if extension == "png":
        return "image/png"
    if extension == "webp":
        return "image/webp"
    return "image/jpeg"


def delete_product_media_file(stored_filename: str | None) -> None:
    if not stored_filename:
        return
    target = PRODUCT_MEDIA_DIR / Path(stored_filename).name
    if target.exists() and target.is_file():
        target.unlink()


def get_admin_line_user_id(app: Flask) -> str:
    return str(app.config.get("ADMIN_LINE_USER_ID", "")).strip()


def mask_line_user_id(line_user_id: str) -> str:
    if not line_user_id:
        return ""
    if len(line_user_id) <= 12:
        return "ตั้งค่าบนเซิร์ฟเวอร์แล้ว"
    return f"{line_user_id[:6]}...{line_user_id[-6:]}"


def send_line_push_message(token: str, line_user_id: str, message: str) -> dict[str, Any]:
    payload = json.dumps({
        "to": line_user_id,
        "messages": [{"type": "text", "text": message[:5000]}],
    }).encode("utf-8")
    line_request = urllib.request.Request(
        "https://api.line.me/v2/bot/message/push",
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(line_request, timeout=12) as response:
            content = response.read().decode("utf-8")
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as error:
        details = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(details or error.reason) from error
    except urllib.error.URLError as error:
        raise RuntimeError(str(error.reason)) from error


def verify_line_signature(channel_secret: str, body: bytes, signature: str) -> bool:
    if not signature:
        return False
    digest = hmac.new(channel_secret.encode("utf-8"), body, hashlib.sha256).digest()
    expected_signature = base64.b64encode(digest).decode("utf-8")
    return hmac.compare_digest(expected_signature, signature)


def save_line_webhook_event(db: sqlite3.Connection, event: dict[str, Any]) -> None:
    source = event.get("source") or {}
    message = event.get("message") or {}
    line_user_id = str(source.get("userId") or "").strip()
    event_type = str(event.get("type") or "")
    message_type = str(message.get("type") or "")
    message_text = str(message.get("text") or "").strip() if message_type == "text" else ""
    now = utc_now()

    db.execute(
        """
        INSERT INTO line_webhook_events (
          line_user_id, event_type, message_type, message_text, raw_event, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            line_user_id,
            event_type,
            message_type,
            message_text,
            json.dumps(event, ensure_ascii=False),
            now,
        ),
    )
    if not line_user_id:
        return
    db.execute(
        """
        INSERT INTO line_contacts (
          line_user_id, latest_message, latest_event_type, first_seen_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(line_user_id) DO UPDATE SET
          latest_message = excluded.latest_message,
          latest_event_type = excluded.latest_event_type,
          updated_at = excluded.updated_at
        """,
        (line_user_id, message_text, event_type, now, now),
    )


def line_contact_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "lineUserId": row["line_user_id"],
        "displayName": row["display_name"],
        "latestMessage": row["latest_message"],
        "latestEventType": row["latest_event_type"],
        "firstSeenAt": row["first_seen_at"],
        "updatedAt": row["updated_at"],
    }


def policy_to_dict(db: sqlite3.Connection, row: sqlite3.Row, include_private: bool) -> dict[str, Any]:
    policy = {
        "id": row["id"] if include_private else None,
        "publicRef": row["public_ref"],
        "customerName": row["customer_name"],
        "customerPhone": row["customer_phone"] if include_private else mask_phone(row["customer_phone"]),
        "lineName": row["line_name"] if include_private else "",
        "lineUserId": row["line_user_id"] if include_private else "",
        "assignedAgent": row["assigned_agent"],
        "insuranceCategory": row["insurance_category"],
        "productName": row["product_name"],
        "policyNumber": row["policy_number"],
        "insurerName": row["insurer_name"],
        "startDate": row["start_date"],
        "endDate": row["end_date"],
        "premiumAmount": row["premium_amount"],
        "salesStatus": row["sales_status"],
        "nextFollowUp": row["next_follow_up"] if include_private else "",
        "customerNotes": row["customer_notes"] if include_private else customer_safe_note(row["customer_notes"]),
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }
    if include_private:
        policy["attachments"] = [
            {
                "id": attachment["id"],
                "name": attachment["original_filename"],
                "type": attachment["mime_type"],
                "size": attachment["size_bytes"],
                "url": f"/api/attachments/{attachment['id']}",
                "addedAt": attachment["created_at"],
            }
            for attachment in db.execute(
                "SELECT * FROM attachments WHERE policy_id = ? ORDER BY created_at DESC",
                (row["id"],),
            ).fetchall()
        ]
    else:
        policy["attachments"] = []
    return policy


def customer_safe_note(note: str) -> str:
    if not note:
        return ""
    return note[:240]


def normalize_phone(phone: str) -> str:
    return "".join(character for character in str(phone) if character.isdigit())


def mask_phone(phone: str) -> str:
    normalized = normalize_phone(phone)
    if len(normalized) < 6:
        return "***"
    return f"{normalized[:3]}-xxx-{normalized[-4:]}"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def seed_demo_rows(db: sqlite3.Connection) -> None:
    count = db.execute("SELECT COUNT(*) AS total FROM policies WHERE policy_number LIKE 'MT4-DEMO-%'").fetchone()["total"]
    if count:
        return
    now = utc_now()
    rows = [
        {
            "public_ref": "MT4-DEMO-001",
            "customer_name": "สมชาย ใจดี",
            "customer_phone": "081-111-2222",
            "line_name": "somchai.line",
            "line_user_id": "",
            "assigned_agent": "เทพา",
            "insurance_category": "รถยนต์",
            "product_name": "ประเภท 1",
            "policy_number": "MT4-DEMO-001",
            "insurer_name": "มิตรแท้ประกันภัย",
            "start_date": "2026-01-01",
            "end_date": "2026-07-15",
            "premium_amount": 14500,
            "sales_status": "quoted",
            "next_follow_up": "2026-06-25",
            "customer_notes": "ส่งใบเสนอราคาแล้ว ลูกค้าขอเปรียบเทียบซ่อมห้างกับซ่อมอู่",
        },
        {
            "public_ref": "MT4-DEMO-002",
            "customer_name": "พิมพ์ชนก ร้านทะเล",
            "customer_phone": "089-333-4444",
            "line_name": "@shopsea",
            "line_user_id": "",
            "assigned_agent": "พรรณี",
            "insurance_category": "ธุรกิจ",
            "product_name": "SME",
            "policy_number": "MT4-DEMO-002",
            "insurer_name": "มิตรแท้ประกันภัย",
            "start_date": "2025-06-20",
            "end_date": "2026-06-23",
            "premium_amount": 8600,
            "sales_status": "documents",
            "next_follow_up": "2026-06-24",
            "customer_notes": "รอรูปหน้าร้านและรายการทรัพย์สิน",
        },
    ]
    for row in rows:
        db.execute(
            """
            INSERT INTO policies (
              public_ref, customer_name, customer_phone, line_name, line_user_id, assigned_agent,
              insurance_category, product_name, policy_number, insurer_name,
              start_date, end_date, premium_amount, sales_status, next_follow_up,
              customer_notes, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                row["public_ref"],
                row["customer_name"],
                row["customer_phone"],
                row["line_name"],
                row["line_user_id"],
                row["assigned_agent"],
                row["insurance_category"],
                row["product_name"],
                row["policy_number"],
                row["insurer_name"],
                row["start_date"],
                row["end_date"],
                row["premium_amount"],
                row["sales_status"],
                row["next_follow_up"],
                row["customer_notes"],
                now,
                now,
            ),
        )


def seed_line_test_rows(db: sqlite3.Connection, line_user_id: str) -> None:
    now = utc_now()
    rows = [
        {
            "public_ref": "MT4-LINE-TEST-001",
            "customer_name": "ทดสอบ ใกล้ต่ออายุ",
            "customer_phone": "081-000-1001",
            "line_name": "bom05183",
            "assigned_agent": "ทีม Mittare Sattahip",
            "insurance_category": "รถยนต์",
            "product_name": "รถยนต์ประเภท 1",
            "policy_number": "MT4-LINE-TEST-001",
            "insurer_name": "มิตรแท้ประกันภัย",
            "start_date": "2025-07-05",
            "end_date": "2026-07-05",
            "premium_amount": 15400,
            "sales_status": "quoted",
            "next_follow_up": "2026-06-27",
            "customer_notes": "เคสทดสอบต่ออายุใกล้ครบกำหนด ใช้ทดสอบข้อความ Renewal",
        },
        {
            "public_ref": "MT4-LINE-TEST-002",
            "customer_name": "ทดสอบ หมดอายุแล้ว",
            "customer_phone": "081-000-1002",
            "line_name": "bom05183",
            "assigned_agent": "ทีม Mittare Sattahip",
            "insurance_category": "พ.ร.บ.",
            "product_name": "ประกันภัยรถยนต์ภาคบังคับ",
            "policy_number": "MT4-LINE-TEST-002",
            "insurer_name": "มิตรแท้ประกันภัย",
            "start_date": "2025-06-20",
            "end_date": "2026-06-20",
            "premium_amount": 645.21,
            "sales_status": "waiting",
            "next_follow_up": "2026-06-26",
            "customer_notes": "เคสทดสอบหมดอายุแล้ว เหมาะกับข้อความติดตามด่วน",
        },
        {
            "public_ref": "MT4-LINE-TEST-003",
            "customer_name": "ทดสอบ รอเอกสาร",
            "customer_phone": "081-000-1003",
            "line_name": "bom05183",
            "assigned_agent": "พรรณี",
            "insurance_category": "บ้านและทรัพย์สิน",
            "product_name": "อัคคีภัยที่อยู่อาศัย",
            "policy_number": "MT4-LINE-TEST-003",
            "insurer_name": "มิตรแท้ประกันภัย",
            "start_date": "2026-07-01",
            "end_date": "2027-07-01",
            "premium_amount": 3200,
            "sales_status": "documents",
            "next_follow_up": "2026-06-28",
            "customer_notes": "รอสำเนาทะเบียนบ้าน รูปหน้าบ้าน และรายละเอียดทรัพย์สิน",
        },
        {
            "public_ref": "MT4-LINE-TEST-004",
            "customer_name": "ทดสอบ นัดชำระ",
            "customer_phone": "081-000-1004",
            "line_name": "bom05183",
            "assigned_agent": "เทพา",
            "insurance_category": "ธุรกิจ",
            "product_name": "ประกันภัยธุรกิจ SME",
            "policy_number": "MT4-LINE-TEST-004",
            "insurer_name": "มิตรแท้ประกันภัย",
            "start_date": "2026-07-10",
            "end_date": "2027-07-10",
            "premium_amount": 9800,
            "sales_status": "payment",
            "next_follow_up": "2026-06-29",
            "customer_notes": "ลูกค้าตกลงแผนแล้ว รอแจ้งช่องทางชำระเบี้ย",
        },
        {
            "public_ref": "MT4-LINE-TEST-005",
            "customer_name": "ทดสอบ ติดตามเคลม",
            "customer_phone": "081-000-1005",
            "line_name": "bom05183",
            "assigned_agent": "ทีมเคลม มิตรแท้สัตหีบ",
            "insurance_category": "รถยนต์",
            "product_name": "รถยนต์ประเภท 2+",
            "policy_number": "MT4-LINE-TEST-005",
            "insurer_name": "มิตรแท้ประกันภัย",
            "start_date": "2026-02-01",
            "end_date": "2027-02-01",
            "premium_amount": 8900,
            "sales_status": "claim-followup",
            "next_follow_up": "2026-06-26",
            "customer_notes": "เคสทดสอบติดตามเอกสารเคลมและสถานะหลังเกิดเหตุ",
        },
        {
            "public_ref": "MT4-LINE-TEST-006",
            "customer_name": "ทดสอบ ลูกค้าใหม่",
            "customer_phone": "081-000-1006",
            "line_name": "bom05183",
            "assigned_agent": "ทีม Mittare Sattahip",
            "insurance_category": "อุบัติเหตุ/สุขภาพ",
            "product_name": "ชดเชยรายได้กรณีเข้ารักษา",
            "policy_number": "MT4-LINE-TEST-006",
            "insurer_name": "มิตรแท้ประกันภัย",
            "start_date": "2026-07-15",
            "end_date": "2027-07-15",
            "premium_amount": 2500,
            "sales_status": "new",
            "next_follow_up": "2026-06-30",
            "customer_notes": "เคสทดสอบลูกค้าใหม่สำหรับลองสร้างข้อความแนะนำแผน",
        },
    ]
    for row in rows:
        existing = db.execute(
            "SELECT id FROM policies WHERE policy_number = ?",
            (row["policy_number"],),
        ).fetchone()
        if existing:
            db.execute(
                """
                UPDATE policies
                SET public_ref = ?, customer_name = ?, customer_phone = ?, line_name = ?, line_user_id = ?,
                    assigned_agent = ?, insurance_category = ?, product_name = ?, insurer_name = ?,
                    start_date = ?, end_date = ?, premium_amount = ?, sales_status = ?, next_follow_up = ?,
                    customer_notes = ?, updated_at = ?
                WHERE policy_number = ?
                """,
                (
                    row["public_ref"], row["customer_name"], row["customer_phone"], row["line_name"], line_user_id,
                    row["assigned_agent"], row["insurance_category"], row["product_name"], row["insurer_name"],
                    row["start_date"], row["end_date"], row["premium_amount"], row["sales_status"], row["next_follow_up"],
                    row["customer_notes"], now, row["policy_number"],
                ),
            )
            continue
        db.execute(
            """
            INSERT INTO policies (
              public_ref, customer_name, customer_phone, line_name, line_user_id, assigned_agent,
              insurance_category, product_name, policy_number, insurer_name, start_date, end_date,
              premium_amount, sales_status, next_follow_up, customer_notes, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                row["public_ref"], row["customer_name"], row["customer_phone"], row["line_name"], line_user_id,
                row["assigned_agent"], row["insurance_category"], row["product_name"], row["policy_number"], row["insurer_name"],
                row["start_date"], row["end_date"], row["premium_amount"], row["sales_status"], row["next_follow_up"],
                row["customer_notes"], now, now,
            ),
        )
    if line_user_id:
        db.execute(
            """
            INSERT INTO line_contacts (line_user_id, display_name, latest_message, latest_event_type, first_seen_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(line_user_id) DO UPDATE SET
              display_name = excluded.display_name,
              latest_message = excluded.latest_message,
              latest_event_type = excluded.latest_event_type,
              updated_at = excluded.updated_at
            """,
            (line_user_id, "bom05183", "เพิ่มข้อมูลตัวอย่างสำหรับแจ้งเตือนผู้ดูแลแล้ว", "manual-test", now, now),
        )


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
