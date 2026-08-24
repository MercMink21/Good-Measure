#!/usr/bin/env python3
"""
send_adhoc_email.py — deliver social post graphics + captions (or any
one-off files) to an inbox via Gmail SMTP (_gmail_email.py).

Usage:
  python3 scripts/send_adhoc_email.py --subject "..." --intro "..." \
      --file social/post1.png --file social/captions.md
"""
import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _gmail_email import send_email as _send_gmail  # noqa: E402

SOCIAL_EMAIL_TO = os.environ.get("SOCIAL_EMAIL_TO", "")


def _caption_block(title: str, text: str) -> str:
    html_text = text.replace("\n", "<br>")
    return (
        f'<h3 style="margin-bottom:4px">{title}</h3>'
        f'<div style="background:#f5f5f5;border-radius:6px;padding:12px 16px;'
        f'font-family:monospace;font-size:13px;white-space:pre-wrap;margin-bottom:20px">{html_text}</div>'
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject", required=True)
    parser.add_argument("--intro", default="")
    parser.add_argument("--caption", action="append", dest="captions", default=[],
                         help="Repeatable: a caption block to include, e.g. --caption 'Post 1: ...'")
    parser.add_argument("--to", default=None, help="Override recipient (defaults to SOCIAL_EMAIL_TO)")
    parser.add_argument("--file", action="append", dest="files", required=True)
    args = parser.parse_args()

    recipient = args.to or SOCIAL_EMAIL_TO
    if not recipient:
        raise RuntimeError("No recipient (pass --to or set SOCIAL_EMAIL_TO)")

    file_paths = [Path(f) for f in args.files]
    filename_list_html = "".join(f"<li>{p.name}</li>" for p in file_paths)
    body_html = f"<p>{args.intro}</p><p>Attached:</p><ul>{filename_list_html}</ul>"
    if args.captions:
        body_html += "<p>Captions below, ready to copy-paste:</p>"
        for i, cap in enumerate(args.captions, 1):
            body_html += _caption_block(f"Caption {i}", cap)

    ok, msg = _send_gmail(args.subject, recipient, body_html, attachments=file_paths)
    if not ok:
        raise RuntimeError(f"Gmail send failed: {msg}")
    print(f"Email sent: {args.subject} ({len(file_paths)} attachment(s))")


if __name__ == "__main__":
    main()
