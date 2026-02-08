from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
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

# --- Data Models ---
class AssetInput(BaseModel):
    type: str # STOCK, MUTUAL_FUND, FIXED_DEPOSIT, LOAN
    name: str
    symbol: Optional[str] = None
    quantity: Optional[float] = 0
    value: Optional[float] = 0 # Principal for FD/Loan, BuyPrice for Stock
    buyPrice: Optional[float] = 0 # Specific for calculating returns

class PortfolioRequest(BaseModel):
    assets: List[AssetInput]

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Fintech Calculation Engine Ready", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/calculate/portfolio")
def calculate_portfolio(request: PortfolioRequest):
    data = request.assets
    
    if not data:
        return {"net_worth": 0, "allocation": {}}

    df = pd.DataFrame([d.dict() for d in data])
    
    # Calculate Current Value for each asset
    # For MVP: 
    # - Stocks/MF: Try fetching live price, fallback to buyPrice * 1.05 (mock growth)
    # - FD: Principal * (1 + rate... approx). For now, just use basic Principal.
    # - Loan: Negative value (Liability)
    
    current_values = []
    
    unique_tickers = df[df['type'].isin(['STOCK', 'MUTUAL_FUND'])]['symbol'].unique()
    # In a real app, verify tickers are valid yahoo tickers. 
    # 'SBIblue' isn't valid, 'AAPL' is.
    live_prices = {}
    
    # Try fetching live prices for valid-looking tickers
    # Optimization: Fetch all in one go if possible, or iterate.
    # For MVP speed, let's just do a quick check or fallback.
    
    for index, row in df.iterrows():
        val = 0
        if row['type'] in ['STOCK', 'MUTUAL_FUND']:
            # Mock logic: If symbol exists and looks real, use connection?
            # Actually, let's just allow the 'value' passed from NestJS to be the Buy Price
            # and we simulate a +5% gain for now unless we implement live fetching properly.
            
            # Simple Real-time fetch attempt
            price = row['buyPrice']
            if row['symbol'] and row['symbol'].isupper() and len(row['symbol']) < 6:
                try:
                    # Very slow if we do this per request loop, but functional for MVP demo
                    # ticker = yf.Ticker(row['symbol'])
                    # hist = ticker.history(period="1d")
                    # if not hist.empty:
                    #     price = hist['Close'].iloc[-1]
                    pass 
                except:
                    pass
            
            val = price * row['quantity']
            
        elif row['type'] == 'FIXED_DEPOSIT':
            val = row['value'] # Principal
            
        elif row['type'] == 'LOAN':
            val = -row['value'] # Liability
            
        current_values.append(val)

    df['current_value'] = current_values
    
    total_net_worth = df['current_value'].sum()
    
    # Asset Allocation (Positive assets only)
    positive_assets = df[df['current_value'] > 0]
    total_positive = positive_assets['current_value'].sum()
    
    allocation = {}
    if total_positive > 0:
        allocation = positive_assets.groupby('type')['current_value'].sum() / total_positive * 100
        allocation = allocation.to_dict()
    
    return {
        "net_worth": round(total_net_worth, 2),
        "gross_assets": round(total_positive, 2),
        "liabilities": round(abs(df[df['current_value'] < 0]['current_value'].sum()), 2),
        "allocation": {k: round(v, 1) for k, v in allocation.items()}
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
