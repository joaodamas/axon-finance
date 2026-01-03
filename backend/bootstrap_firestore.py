import argparse
import os
import sys
from datetime import datetime, timedelta

import firebase_admin
from firebase_admin import credentials, firestore


def get_firestore_client():
    if not firebase_admin._apps:
        key_path = (
            os.environ.get("FIREBASE_SERVICE_ACCOUNT")
            or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
            or os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
        )
        if not os.path.exists(key_path):
            print(
                "Service account JSON not found. Set FIREBASE_SERVICE_ACCOUNT or place "
                "serviceAccountKey.json in backend/.",
                file=sys.stderr,
            )
            sys.exit(1)
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)
    return firestore.client()


def seed_user(db, args, group_id):
    user_ref = db.collection("users").document(args.user_id)
    user_ref.set(
        {
            "uid": args.user_id,
            "displayName": args.display_name,
            "email": args.email,
            "perfil": args.perfil,
            "rendaMensal": args.renda_mensal,
            "objetivos": ["reserva_emergencia"],
            "groupId": group_id,
            "createdAt": firestore.SERVER_TIMESTAMP,
            "lastLoginAt": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )
    return user_ref


def seed_group(db, owner_id):
    group_ref = db.collection("groups").document()
    group_ref.set(
        {
            "members": [owner_id],
            "createdAt": firestore.SERVER_TIMESTAMP,
            "createdBy": owner_id,
        }
    )
    return group_ref


def add_invite(group_ref, email, invited_by):
    invite_id = email.strip().lower()
    if not invite_id:
        return
    group_ref.collection("invites").document(invite_id).set(
        {
            "email": invite_id,
            "status": "pending",
            "invitedBy": invited_by,
            "createdAt": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )


def seed_transactions(collection_ref, owner_id, group_id=None):
    now = datetime.utcnow()
    transactions = [
        {
            "description": "Salario",
            "amount": 7200,
            "category": "receita",
            "type": "entrada",
            "account": "Conta principal",
            "date": now - timedelta(days=3),
        },
        {
            "description": "Aluguel",
            "amount": 1800,
            "category": "moradia",
            "type": "saida",
            "account": "Conta principal",
            "date": now - timedelta(days=10),
        },
        {
            "description": "Mercado",
            "amount": 450,
            "category": "alimentacao",
            "type": "saida",
            "account": "Cartao Black",
            "date": now - timedelta(days=2),
        },
    ]

    for tx in transactions:
        collection_ref.add(
            {
                **tx,
                "ownerId": owner_id,
                "groupId": group_id,
                "createdAt": firestore.SERVER_TIMESTAMP,
            }
        )


def seed_goals(user_ref):
    user_ref.collection("goals").add(
        {
            "name": "Viagem 2026",
            "targetValue": 10000,
            "currentSaved": 2500,
            "deadline": datetime.utcnow() + timedelta(days=300),
            "createdAt": firestore.SERVER_TIMESTAMP,
            "updatedAt": firestore.SERVER_TIMESTAMP,
        }
    )


def main():
    parser = argparse.ArgumentParser(description="Bootstrap Firestore data.")
    parser.add_argument("--user-id", default="demo-user")
    parser.add_argument("--display-name", default="Usuario Demo")
    parser.add_argument("--email", default="demo@axon.finance")
    parser.add_argument("--perfil", default="moderado")
    parser.add_argument("--renda-mensal", type=float, default=5000)
    parser.add_argument("--with-group", action="store_true")
    parser.add_argument("--invite-email", default="")
    parser.add_argument("--no-sample", action="store_true")
    args = parser.parse_args()

    db = get_firestore_client()
    group_ref = None
    group_id = None

    if args.with_group:
        group_ref = seed_group(db, args.user_id)
        group_id = group_ref.id

    user_ref = seed_user(db, args, group_id)

    if group_ref and args.invite_email:
        add_invite(group_ref, args.invite_email, args.user_id)

    if not args.no_sample:
        seed_transactions(user_ref.collection("transactions"), args.user_id, group_id)
        seed_goals(user_ref)
        if group_ref:
            seed_transactions(group_ref.collection("transactions"), args.user_id, group_id)

    print("Bootstrap concluido.")
    print(f"User: {args.user_id}")
    if group_id:
        print(f"Group: {group_id}")
    if args.no_sample:
        print("Sem dados de exemplo.")
    else:
        print("Dados de exemplo criados.")


if __name__ == "__main__":
    main()
