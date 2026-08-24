"""
_gmail_email.py — shared Gmail SMTP sender for Good Measure automation
(send_adhoc_email.py's social-post delivery, and anything added later).

Sends from goodmeasurebarco@gmail.com using an App Password (not the
account password) — no domain verification needed, works with any
recipient. GMAIL_USER is the sending account (also the account the App
Password was generated for — these are tightly coupled, changing one
without the other breaks auth, so this is a plain constant rather than
a second secret).

Usage:
  from _gmail_email import send_email
  ok, msg = send_email("Subject", "recipient@example.com", "<p>html body</p>")
  ok, msg = send_email("Subject", "recipient@example.com", "<p>html body</p>", attachments=[Path("post1.png")])
"""
from __future__ import annotations
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from pathlib import Path

GMAIL_USER = "goodmeasurebarco@gmail.com"
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")


def send_email(subject: str, to: str | list[str], html_body: str, attachments: list[Path] | None = None) -> tuple[bool, str]:
    """Never raises — returns (success, message) so callers can log the
    result themselves."""
    if not GMAIL_APP_PASSWORD:
        return False, "GMAIL_APP_PASSWORD not set"
    recipients = [to] if isinstance(to, str) else list(dict.fromkeys(r for r in to if r))
    if not recipients:
        return False, "no recipient"

    msg = MIMEMultipart()
    msg["From"] = f"Good Measure <{GMAIL_USER}>"
    msg["To"] = recipients[0] if len(recipients) == 1 else GMAIL_USER
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))

    for path in attachments or []:
        path = Path(path)
        with open(path, "rb") as f:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f"attachment; filename={path.name}")
        msg.attach(part)

    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as server:
            server.starttls()
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, recipients, msg.as_string())
        return True, "sent"
    except Exception as exc:
        return False, str(exc)
