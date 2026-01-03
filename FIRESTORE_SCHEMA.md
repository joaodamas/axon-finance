# Firestore Schema - Axon Finance

This document describes the recommended Firestore structure for the current
frontend/backend features: IA insights, 50/30/20, metas, and modo casal.

## Collections Overview

```
users/{uid}
  - profile fields (displayName, email, perfil, rendaMensal, groupId, ...)
  - transactions/{transactionId}
  - goals/{goalId}

groups/{groupId}
  - members: [uid, uid...]
  - createdAt, createdBy
  - transactions/{transactionId}
  - invites/{inviteId}
```

## users/{uid}

Suggested fields (aligned with current app.js):

- uid: string
- displayName: string | null
- email: string | null
- photoURL: string | null
- perfil: "moderado" | "arrojado" | ...
- rendaMensal: number (monthly income used by IA)
- objetivos: string[] (ex: ["reserva_emergencia"])
- groupId: string | null
- createdAt: timestamp
- lastLoginAt: timestamp

Note: The app currently writes `rendaMensal` (not `income`).

### users/{uid}/transactions/{transactionId}

- description: string
- amount: number (always positive)
- type: "entrada" | "saida"
- category: string (normalized for 50/30/20 and charts)
- account: string
- date: timestamp
- createdAt: timestamp
- ownerId: uid
- groupId: string | null

Note: We store a positive `amount` with `type` to determine sign.

### users/{uid}/goals/{goalId}

- name: string
- targetValue: number
- currentSaved: number
- deadline: timestamp | null
- createdAt: timestamp
- updatedAt: timestamp

## groups/{groupId}

Group document:

- members: string[] (uids)
- createdAt: timestamp
- createdBy: uid

### groups/{groupId}/transactions/{transactionId}

Same schema as `users/{uid}/transactions` plus:

- ownerId: uid
- groupId: groupId

### groups/{groupId}/invites/{inviteId}

- email: string (stored in lower-case)
- status: "pending" | "accepted" | "declined"
- invitedBy: uid
- createdAt: timestamp
- acceptedBy: uid | null
- acceptedAt: timestamp | null

Note: The app uses the invite doc id as the normalized email.

## Bootstrap Example (Optional)

This can be used once after login to populate test data.

```js
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

async function inicializarBancoTeste(userId) {
  await setDoc(
    doc(db, "users", userId),
    {
      displayName: "Seu Nome",
      perfil: "moderado",
      rendaMensal: 5000,
      lastLoginAt: serverTimestamp(),
    },
    { merge: true },
  );

  await addDoc(collection(db, `users/${userId}/transactions`), {
    description: "Aluguel",
    amount: 1500,
    category: "moradia",
    type: "saida",
    date: new Date(),
    createdAt: serverTimestamp(),
    ownerId: userId,
    groupId: null,
  });
}
```

## Index Notes

The app uses range queries on `date` with ordering. Firestore will request a
composite index the first time you apply date filters.

