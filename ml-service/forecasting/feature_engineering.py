import pandas as pd
import numpy as np

def create_time_series_features(df, date_col='date', target_col='quantity_dispensed'):
    """
    Generate time-series lag and rolling features for XGBoost regressor.
    """
    df = df.copy()
    df[date_col] = pd.to_datetime(df[date_col])
    df = df.sort_values(by=['phcId', 'medicineId', date_col])

    # Calendar features
    df['year'] = df[date_col].dt.year
    df['month'] = df[date_col].dt.month
    df['day'] = df[date_col].dt.day
    df['day_of_week'] = df[date_col].dt.dayofweek
    df['day_of_year'] = df[date_col].dt.dayofyear
    df['week_of_year'] = df[date_col].dt.isocalendar().week.astype(int)

    # Lag features per PHC & Medicine group
    grouped = df.groupby(['phcId', 'medicineId'])[target_col]

    df['lag_1'] = grouped.shift(1)
    df['lag_7'] = grouped.shift(7)
    df['lag_14'] = grouped.shift(14)
    df['lag_30'] = grouped.shift(30)

    # Rolling statistics
    df['rolling_mean_7'] = grouped.transform(lambda x: x.shift(1).rolling(window=7, min_periods=1).mean())
    df['rolling_mean_14'] = grouped.transform(lambda x: x.shift(1).rolling(window=14, min_periods=1).mean())
    df['rolling_mean_30'] = grouped.transform(lambda x: x.shift(1).rolling(window=30, min_periods=1).mean())

    df['rolling_std_7'] = grouped.transform(lambda x: x.shift(1).rolling(window=7, min_periods=1).std()).fillna(0)
    df['rolling_std_30'] = grouped.transform(lambda x: x.shift(1).rolling(window=30, min_periods=1).std()).fillna(0)

    # Fill NaN lag values with forward/backward fill or 0
    df = df.fillna(0)

    return df
