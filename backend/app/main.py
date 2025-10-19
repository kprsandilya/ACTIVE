from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes_users

app = FastAPI(title="My Simple Python Backend")

# ✅ Allow access from React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict later for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(routes_users.router, prefix="/api/users")

@app.get("/")
def root():
    return {"message": "Backend is running successfully 🚀"}
