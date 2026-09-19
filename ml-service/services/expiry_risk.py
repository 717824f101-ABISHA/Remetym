from datetime import datetime

def calculate_expiry_risk(batch_number, expiry_date_str, current_stock, daily_predicted_demand):
    """
    Computes AI-assisted expiry risk score by evaluating remaining shelf life
    against XGBoost predicted consumption prior to the batch expiry date.
    """
    try:
        exp_date = datetime.strptime(expiry_date_str, '%Y-%m-%d')
        today = datetime.now()
        days_to_expiry = (exp_date - today).days
    except Exception:
        days_to_expiry = 180

    if days_to_expiry <= 0:
        return {
            'batchNumber': batch_number,
            'expiryDate': expiry_date_str,
            'daysToExpiry': 0,
            'predictedConsumptionBeforeExpiry': 0,
            'potentialExcessStock': current_stock,
            'riskLevel': 'HIGH',
            'status': 'EXPIRED'
        }

    predicted_consumption = int(round(days_to_expiry * daily_predicted_demand))
    potential_excess = max(0, current_stock - predicted_consumption)

    if days_to_expiry <= 60 and current_stock > predicted_consumption:
        risk_level = 'HIGH'
    elif days_to_expiry <= 120 and current_stock > predicted_consumption:
        risk_level = 'MEDIUM'
    elif potential_excess > (current_stock * 0.5):
        risk_level = 'MEDIUM'
    else:
        risk_level = 'LOW'

    return {
        'batchNumber': batch_number,
        'expiryDate': expiry_date_str,
        'daysToExpiry': days_to_expiry,
        'predictedConsumptionBeforeExpiry': predicted_consumption,
        'potentialExcessStock': potential_excess,
        'riskLevel': risk_level,
        'status': f'{risk_level} EXPIRY RISK'
    }
