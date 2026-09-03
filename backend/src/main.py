from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Vidyut API",
    description="Adaptive Career & Skill Trainer Platform",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Vidyut Modular Monolith API",
        "version": "0.1.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
