"""
Vital sign anomaly evaluation service.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Dict, Optional


def evaluate_anomaly(vital_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Evaluate vital readings against patient safety thresholds.
    Returns structured anomaly alert dict if out-of-range, else None.
    """
    vital_type = vital_data.get("vital_type", "")
    try:
        val = float(vital_data.get("value", 0))
    except (ValueError, TypeError):
        return None

    patient_id = str(vital_data.get("user_id") or vital_data.get("patient_id") or "")
    severity = None
    message = ""

    if vital_type in ["heart_rate", "hr"]:
        if val < 50 or val > 120:
            severity = "emergency" if (val < 40 or val > 140) else "high"
            message = f"Critical Heart Rate: {val} bpm"
    elif vital_type in ["oxygen_saturation", "spo2"]:
        if val < 92:
            severity = "emergency" if val < 88 else "high"
            message = f"Low Oxygen Saturation: {val}%"
    elif vital_type in ["temperature", "temp"]:
        if val > 100.4 or val < 95.0:
            severity = "high"
            message = f"Abnormal Temperature: {val}°F"
    elif vital_type in ["blood_glucose", "glucose"]:
        if val > 180 or val < 70:
            severity = "emergency" if (val > 250 or val < 55) else "high"
            message = f"Out-of-range Glucose: {val} mg/dL"
    elif vital_type in ["blood_pressure_systolic", "bp_systolic"]:
        if val > 140 or val < 90:
            severity = "emergency" if val > 180 else "high"
            message = f"Abnormal Systolic BP: {val} mmHg"
    elif vital_type in ["blood_pressure_diastolic", "bp_diastolic"]:
        if val > 90 or val < 60:
            severity = "high"
            message = f"Abnormal Diastolic BP: {val} mmHg"

    if severity:
        now_str = datetime.utcnow().isoformat() + "Z"
        return {
            "id": f"alert_{uuid.uuid4()}",
            "type": "anomaly_alert",
            "patient_id": patient_id,
            "patient_name": vital_data.get("patient_name", "Patient"),
            "vital_type": vital_type,
            "value": val,
            "severity": severity,
            "priority": severity,
            "message": message,
            "timestamp": now_str,
            "created_at": now_str,
            "acknowledged": False,
        }

    return None
