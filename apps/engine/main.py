from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import yfinance as yf
import pandas as pd
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Fintech Calculation Engine Ready", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Example financial calculation endpoint
@app.get("/calculate/compound-interest")
def calculate_compound_interest(principal: float, rate: float, years: int):
    # A = P(1 + r/n)^(nt)
    amount = principal * (1 + rate/100) ** years
    return {
        "principal": principal,
        "rate": rate,
        "years": years,
        "maturity_amount": round(amount, 2)
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
