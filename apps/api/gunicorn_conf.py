# Gunicorn configuration for production deployment

import multiprocessing
import os

# Server socket
bind = f"0.0.0.0:{os.getenv('API_PORT', '8000')}"
backlog = 2048

# Worker processes
workers = min(4, multiprocessing.cpu_count() * 2 + 1)
worker_class = "uvicorn.workers.UvicornWorker" 
worker_connections = 1000
max_requests = 10000
max_requests_jitter = 1000

# Timeout
timeout = 120
keepalive = 5

# Restart workers after this many requests, with up to jitter additional requests
preload_app = True

# Security
limit_request_line = 8192
limit_request_fields = 200
limit_request_field_size = 8192

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "vitaltags-api"

# Preload application for better performance
preload_app = True

# Graceful timeout
graceful_timeout = 30

# TMP directory for worker heartbeat
tmp_upload_dir = None

# Capture output from workers
capture_output = True

# Enable auto-reload in development
if os.getenv("NODE_ENV") == "development":
    reload = True
    reload_extra_files = [
        "app/",
        "pyproject.toml",
    ]