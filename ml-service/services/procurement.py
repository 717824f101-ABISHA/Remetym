import math

def calculate_procurement_recommendation(
    current_stock,
    predicted_demand,
    daily_std_dev=3.5,
    lead_time_days=5,
    pending_orders=0,
    service_level_z=1.65
):
    """
    Computes dynamic procurement recommendations and safety stock using XGBoost predicted demand.
    Formula:
      Safety Stock = Z * std_dev * sqrt(Lead Time)
      Recommended Procurement = max(0, Predicted Demand + Safety Stock - Current Stock - Pending Orders)
    """
    safety_stock = int(round(service_level_z * daily_std_dev * math.sqrt(lead_time_days)))
    if safety_stock < 20:
        safety_stock = 30  # Configurable baseline safety stock

    raw_procurement = predicted_demand + safety_stock - current_stock - pending_orders
    recommended_procurement = max(0, int(round(raw_procurement)))

    # Compute estimated stockout timeframe
    avg_daily_demand = predicted_demand / 30.0 if predicted_demand > 0 else 1.0
    days_until_stockout = round(current_stock / avg_daily_demand, 1) if avg_daily_demand > 0 else 999.0

    # Categorize status
    if current_stock <= 0:
        status = "URGENT PROCUREMENT"
        urgency_level = "CRITICAL"
    elif days_until_stockout <= 7:
        status = "URGENT PROCUREMENT"
        urgency_level = "CRITICAL"
    elif current_stock < safety_stock or recommended_procurement > 100:
        status = "PROCUREMENT RECOMMENDED"
        urgency_level = "HIGH"
    elif recommended_procurement > 0:
        status = "LOW STOCK"
        urgency_level = "MEDIUM"
    else:
        status = "NO PROCUREMENT REQUIRED"
        urgency_level = "LOW"

    return {
        "currentStock": current_stock,
        "predictedDemand": predicted_demand,
        "safetyStock": safety_stock,
        "pendingOrders": pending_orders,
        "recommendedProcurement": recommended_procurement,
        "daysUntilStockout": days_until_stockout,
        "status": status,
        "urgencyLevel": urgency_level
    }
