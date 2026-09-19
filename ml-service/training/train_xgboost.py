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
        {'id': 'PHC-20', 'name': 'Maha PHC'},
        {'id': 'PHC-229', 'name': 'ShyaamPHC'}
    ]

    medicines = [
        {'id': 'MED-001', 'name': 'Paracetamol 500mg', 'base_demand': 14},
        {'id': 'MED-002', 'name': 'Antibiotic Capsule 250mg', 'base_demand': 18},
        {'id': 'MED-003', 'name': 'ORS Oral Rehydration Salt', 'base_demand': 12},
        {'id': 'MED-004', 'name': 'Amoxicillin Oral Suspension 125mg', 'base_demand': 15},
        {'id': 'MED-005', 'name': 'Erythromycin', 'base_demand': 10},
        {'id': 'MED-006', 'name': 'Becosules Z Capsule', 'base_demand': 16}
    ]

    end_date = datetime.now()
    dates = [end_date - timedelta(days=i) for i in range(180, 0, -1)]

    records = []
    np.random.seed(42)

    for phc in phcs:
        for med in medicines:
            base = med['base_demand']
            for d in dates:
                day_of_week = d.weekday()
                month = d.month
                day_factor = 1.2 if day_of_week in [1, 2, 3] else (0.8 if day_of_week == 6 else 1.0)
                month_factor = 1.15 if month in [6, 7, 8, 12, 1] else 1.0
                noise = np.random.normal(0, 2.5)

                demand = max(1, int(round(base * day_factor * month_factor + noise)))

                records.append({
                    'date': d.strftime('%Y-%m-%d'),
                    'phcId': phc['id'],
                    'phcName': phc['name'],
                    'medicineId': med['id'],
                    'medicineName': med['name'],
                    'quantity_dispensed': demand
                })

    df = pd.DataFrame(records)
    return df

def train_xgboost_model():
    print("===== STARTING XGBOOST DEMAND FORECAST TRAINING =====")

    # 1. Load historical dataset
    df = fetch_live_or_generate_historical_data()
    print(f"Historical Records Loaded: {len(df)} rows.")

    # 2. Feature Engineering
    df_features = create_time_series_features(df, date_col='date', target_col='quantity_dispensed')

    feature_cols = [
        'year', 'month', 'day', 'day_of_week', 'day_of_year', 'week_of_year',
        'lag_1', 'lag_7', 'lag_14', 'lag_30',
        'rolling_mean_7', 'rolling_mean_14', 'rolling_mean_30',
        'rolling_std_7', 'rolling_std_30'
    ]

    X = df_features[feature_cols]
    y = df_features['quantity_dispensed']

    # 3. Chronological Train/Test Split (80% Train, 20% Test - NO random shuffle)
    split_idx = int(len(df_features) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    print(f"Training Samples: {len(X_train)} | Test Samples: {len(X_test)}")

    # 4. Train XGBoost Regressor
    model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective='reg:squarederror',
        random_state=42
    )

    model.fit(X_train, y_train)

    # 5. Evaluate Chronological Test Performance
    y_pred = model.predict(X_test)
    y_pred = np.maximum(1, np.round(y_pred))

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    non_zero = y_test != 0
    mape = float(np.mean(np.abs((y_test[non_zero] - y_pred[non_zero]) / y_test[non_zero])) * 100)

    metrics = {
        'mae': round(mae, 2),
        'rmse': round(rmse, 2),
        'mape': f"{round(mape, 1)}%",
        'r2': round(r2, 2),
        'trained_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'training_count': len(X_train),
        'test_count': len(X_test)
    }

    print(f"Model Training Results -> MAE: {metrics['mae']} | RMSE: {metrics['rmse']} | MAPE: {metrics['mape']} | R²: {metrics['r2']}")

    # 6. Save Model artifact
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump({'model': model, 'feature_cols': feature_cols, 'metrics': metrics, 'historical_df': df}, MODEL_PATH)

    print(f"XGBoost Model successfully saved to: {MODEL_PATH}")
    return metrics

if __name__ == '__main__':
    train_xgboost_model()
