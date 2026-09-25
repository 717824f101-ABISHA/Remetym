```python
import os
import sys
import requests
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from forecasting.feature_engineering import create_time_series_features

MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models', 'xgboost_demand_model.joblib'))
BACKEND_HISTORICAL_URL = 'http://localhost:8080/api/inventory/historical'

def fetch_live_or_generate_historical_data():
    """
    Fetches real historical consumption records from backend database (consumption_history)
    or generates structured 180-day consumption history for training XGBoost.
    """
    try:
        res = requests.get(BACKEND_HISTORICAL_URL, timeout=3)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list) and len(data) > 0:
                records = []
                for item in data:
                    records.append({
                        'date': item.get('date', datetime.now().strftime('%Y-%m-%d')),
                        'phcId': item.get('phcId', 'PHC-676'),
                        'phcName': item.get('phcName', 'Facility'),
                        'medicineId': item.get('medicineId', 'MED-001'),
                        'medicineName': item.get('medicineName', 'Medicine'),
                        'quantity_dispensed': int(item.get('quantityConsumed', 15))
                    })
                df = pd.DataFrame(records)
                print(f"[XGBoost Training] Loaded {len(df)} real historical consumption records from backend API.")
                return df
    except Exception as e:
        print(f"[XGBoost Training WARNING] Could not fetch live historical dataset ({e}), constructing baseline dataset.")

    # Structured baseline dataset generator for active Oracle PHCs
    phcs = [
        {'id': 'PHC-676', 'name': 'AbiPHC'},
        {'id': 'PHC-201', 'name': 'AgalyaPHC'},
        {'id': 'PHC-675', 'name': 'DharPHC'},
        {'id': 'PHC-216', 'name': 'Dharshini PHC'},
        {'id': 'PHC-316', 'name': 'Gnana PHC'},
        {'id': 'PHC-222', 'name': 'Harinitha PHC'},
        {'
```
