from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time
import logging
from .config import settings

# Import routers (will create these next)
# from .routers import auth, public, me_profile, me_medical, me_tags

app = FastAPI(
    title="Vital Tags API",
    description="Privacy-first emergency medical information system",
    version="0.1.0",
    docs_url="/docs" if settings.NODE_ENV == "development" else None,
    redoc_url="/redoc" if settings.NODE_ENV == "development" else None,
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "vitaltags.local", "*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"] if settings.NODE_ENV == "development" else [],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
    
    if settings.NODE_ENV == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


# Include routers
# app.include_router(auth.router, prefix="/auth", tags=["auth"])
# app.include_router(public.router, tags=["public"])
# app.include_router(me_profile.router, prefix="/me", tags=["profile"])
# app.include_router(me_medical.router, prefix="/me", tags=["medical"])
# app.include_router(me_tags.router, prefix="/me", tags=["tags"])


@app.get("/")
async def root():
    return {
        "service": "Vital Tags API",
        "version": "0.1.0",
        "status": "ok",
        "timestamp": time.time()
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.NODE_ENV == "development"
    )