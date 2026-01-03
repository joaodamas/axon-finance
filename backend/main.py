from datetime import datetime, timedelta
import os

import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    userId: str


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


def get_firestore_client():
    if not firebase_admin._apps:
        key_path = (
            os.environ.get("FIREBASE_SERVICE_ACCOUNT")
            or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
            or os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
        )
        if not os.path.exists(key_path):
            raise RuntimeError(
                "Service account JSON not found. Set FIREBASE_SERVICE_ACCOUNT or "
                "place serviceAccountKey.json in backend/."
            )
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)
    return firestore.client()


BUDGET_TARGETS = {
    "needs": 50,
    "wants": 30,
    "savings": 20,
}

CATEGORY_BUCKETS = {
    "needs": {
        "moradia",
        "saude",
        "transporte",
        "educacao",
        "alimentacao",
        "contas",
        "mercado",
    },
    "wants": {"lazer", "viagem", "restaurante", "assinatura", "compras", "streaming"},
    "savings": {"investimento", "reserva", "poupanca", "emergencia"},
}


def normalize_key(value: str) -> str:
    if not value:
        return ""
    return (
        value.lower()
        .replace("á", "a")
        .replace("à", "a")
        .replace("ã", "a")
        .replace("â", "a")
        .replace("é", "e")
        .replace("ê", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ô", "o")
        .replace("õ", "o")
        .replace("ú", "u")
        .replace("ç", "c")
    )


def resolve_bucket(category: str) -> str:
    key = normalize_key(category)
    if not key:
        return "wants"
    for bucket, values in CATEGORY_BUCKETS.items():
        if any(value in key for value in values):
            return bucket
    return "wants"


def normalize_tx_date(value):
    if isinstance(value, datetime):
        return value
    if hasattr(value, "to_datetime"):
        return value.to_datetime()
    if hasattr(value, "datetime"):
        return value.datetime
    return None


def build_budget_insight(transactions):
    totals = {"needs": 0.0, "wants": 0.0, "savings": 0.0, "total": 0.0}
    by_category = {}
    now = datetime.utcnow()
    month_ago = now - timedelta(days=30)
    quarter_ago = now - timedelta(days=90)
    net_last_month = 0.0
    net_last_quarter = 0.0

    for tx in transactions:
        if tx.get("type") != "saida":
            if tx.get("type") == "entrada":
                amount = float(tx.get("amount") or 0)
                tx_date = normalize_tx_date(tx.get("date"))
                if tx_date and tx_date >= month_ago:
                    net_last_month += amount
                if tx_date and tx_date >= quarter_ago:
                    net_last_quarter += amount
            continue
        amount = float(tx.get("amount") or 0)
        if amount <= 0:
            continue
        category = tx.get("category") or "Outros"
        bucket = resolve_bucket(category)
        totals[bucket] += amount
        totals["total"] += amount
        by_category[category] = by_category.get(category, 0) + amount
        tx_date = normalize_tx_date(tx.get("date"))
        if tx_date and tx_date >= month_ago:
            net_last_month -= amount
        if tx_date and tx_date >= quarter_ago:
            net_last_quarter -= amount

    if totals["total"] == 0:
        investment_tip = (
            "Foque em reduzir custos fixos para conseguir poupar ao menos 10% da renda."
        )
        advice_message = (
            "Sem despesas no periodo. Adicione transacoes para comparar com o 50/30/20. "
            f"Dica de investimento: {investment_tip}"
        )
        return {
            "status": "success",
            "insight": advice_message,
            "ai_advice": {"message": advice_message},
            "metrics": totals,
            "projection": {"avg_monthly_savings": 0, "months_to_goal": None},
        }

    def percent(value):
        return round((value / totals["total"]) * 100)

    needs_pct = percent(totals["needs"])
    wants_pct = percent(totals["wants"])
    savings_pct = percent(totals["savings"])

    alerts = []
    if needs_pct > BUDGET_TARGETS["needs"] + 5:
        alerts.append(f"Necessidades acima do ideal ({needs_pct}% vs 50%).")
    if wants_pct > BUDGET_TARGETS["wants"] + 5:
        alerts.append(f"Desejos acima do ideal ({wants_pct}% vs 30%).")
    if savings_pct < BUDGET_TARGETS["savings"] - 5:
        alerts.append(f"Poupanca abaixo do ideal ({savings_pct}% vs 20%).")

    top_category = None
    if by_category:
        top_category = max(by_category.items(), key=lambda item: item[1])[0]

    if alerts:
        insight = " ".join(alerts)
        if top_category:
            insight += f" Categoria com maior impacto: {top_category}."
    else:
        insight = "Distribuicao equilibrada. Seu 50/30/20 esta dentro do ideal."

    avg_monthly_savings = round(net_last_quarter / 3, 2)
    if net_last_month > 500:
        investment_tip = (
            "Seu excedente esta alto. Recomendamos alocar em um CDB de liquidez diaria."
        )
    else:
        investment_tip = (
            "Foque em reduzir custos fixos para conseguir poupar ao menos 10% da renda."
        )

    advice_message = f"{insight} Dica de investimento: {investment_tip}"

    return {
        "status": "success",
        "insight": advice_message,
        "ai_advice": {"message": advice_message},
        "metrics": {
            "needs_pct": needs_pct,
            "wants_pct": wants_pct,
            "savings_pct": savings_pct,
            "top_category": top_category,
        },
        "projection": {
            "avg_monthly_savings": avg_monthly_savings,
            "months_to_goal": None,
        },
    }


def fetch_recent_transactions(db_client, user_id: str, days: int = 90):
    start_date = datetime.utcnow() - timedelta(days=days)
    user_doc = db_client.document(f"users/{user_id}").get()
    group_id = None
    if user_doc.exists:
        group_id = user_doc.to_dict().get("groupId")

    collection_path = (
        f"groups/{group_id}/transactions" if group_id else f"users/{user_id}/transactions"
    )

    docs = (
        db_client.collection(collection_path)
        .where("date", ">=", start_date)
        .stream()
    )
    return [doc.to_dict() for doc in docs]


@app.post("/analyze")
async def analyze(data: AnalyzeRequest):
    return await analyze_budget(data)


@app.post("/analyze-budget")
async def analyze_budget(data: AnalyzeRequest):
    try:
        db_client = get_firestore_client()
    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

    transactions = fetch_recent_transactions(db_client, data.userId)
    return build_budget_insight(transactions)
