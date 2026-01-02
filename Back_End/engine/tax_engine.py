# tax_engine.py

from .tax_rules_2024 import calculate_pita_2024
from .tax_rules_2026 import calculate_pita_2026


def calculate_tax_impact(monthly_income: float) -> dict:
    annual_income = monthly_income * 12

    current = calculate_pita_2024(annual_income)
    proposed = calculate_pita_2026(annual_income)

    annual_relief = current["annual_tax"] - proposed["annual_tax"]
    monthly_relief = annual_relief / 12

    percentage_change = (
        (annual_relief / current["annual_tax"]) * 100
        if current["annual_tax"] > 0 else 0
    )

    return {
        "monthly_income": monthly_income,
        "annual_income": annual_income,

        "current": {
            "label": "2024 PITA",
            **current
        },

        "proposed": {
            "label": "2026 Reform",
            **proposed
        },

        "impact": {
            "monthly_relief": round(monthly_relief, 2),
            "annual_relief": round(annual_relief, 2),
            "percentage_change": round(percentage_change, 2)
        }
    }
