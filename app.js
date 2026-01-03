import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore,
  addDoc,
  arrayUnion,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  serverTimestamp,
  where,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDfxYD1as0lU9w1yu_EsOlztU676IvMYXg",
  authDomain: "axon-finance.firebaseapp.com",
  projectId: "axon-finance",
  storageBucket: "axon-finance.firebasestorage.app",
  messagingSenderId: "979064630934",
  appId: "1:979064630934:web:80e627c4cc0ca9d3859cb7",
  measurementId: "G-FHCC7PJHL8",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

try {
  getAnalytics(app);
} catch (error) {
  console.warn("Analytics indisponível neste ambiente.", error);
}

const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const navLinks = document.querySelectorAll(".nav-link");
const screens = document.querySelectorAll(".screen");
const availableViews = new Set(Array.from(screens, (screen) => screen.dataset.view));
const authStatus = document.querySelector("#authStatus");
const loginBtn = document.querySelector("#loginBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const authModal = document.querySelector("#authModal");
const closeAuthModal = document.querySelector("#closeAuthModal");
const authTabs = document.querySelectorAll(".auth-tab");
const authPanels = document.querySelectorAll(".auth-panel");
const googleLoginBtn = document.querySelector("#googleLoginBtn");
const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const loginError = document.querySelector("#loginError");
const signupForm = document.querySelector("#signupForm");
const signupName = document.querySelector("#signupName");
const signupEmail = document.querySelector("#signupEmail");
const signupPassword = document.querySelector("#signupPassword");
const signupIncome = document.querySelector("#signupIncome");
const signupProfile = document.querySelector("#signupProfile");
const signupError = document.querySelector("#signupError");
const verifyOverlay = document.querySelector("#verifyOverlay");
const resendVerificationBtn = document.querySelector("#resendVerificationBtn");
const checkVerificationBtn = document.querySelector("#checkVerificationBtn");
const logoutUnverifiedBtn = document.querySelector("#logoutUnverifiedBtn");
const verifyStatus = document.querySelector("#verifyStatus");
const userProfileCard = document.querySelector("#user-profile-card");
const userName = document.querySelector("#user-name");
const userStatus = document.querySelector("#user-status");
const userPhoto = document.querySelector("#user-photo");
const aiAdviceText = document.querySelector("#ai-advice-text");
const aiCard = aiAdviceText ? aiAdviceText.closest(".ai-card") : null;
const categoryChartCanvas = document.querySelector("#categoryChart");
const syncStatus = document.querySelector("#sync-status");
const budgetStatus = document.querySelector("#budgetStatus");
const needsBar = document.querySelector("#needsBar");
const wantsBar = document.querySelector("#wantsBar");
const savingsBar = document.querySelector("#savingsBar");
const needsValue = document.querySelector("#needsValue");
const wantsValue = document.querySelector("#wantsValue");
const savingsValue = document.querySelector("#savingsValue");
const budgetAlerts = document.querySelector("#budgetAlerts");
const goalsContainer = document.querySelector("#goals-container");
const openGoalModal = document.querySelector("#open-goal-modal");
const goalModal = document.querySelector("#goalModal");
const goalForm = document.querySelector("#goalForm");
const goalName = document.querySelector("#goalName");
const goalTarget = document.querySelector("#goalTarget");
const goalSaved = document.querySelector("#goalSaved");
const closeGoalModal = document.querySelector("#closeGoalModal");
const cancelGoalModal = document.querySelector("#cancelGoalModal");
const widgetGoalName = document.querySelector("#widget-goal-name");
const widgetCurrent = document.querySelector("#widget-current");
const widgetTarget = document.querySelector("#widget-target");
const widgetBar = document.querySelector("#widget-bar");
const widgetPercent = document.querySelector("#widget-percent");
const widgetEta = document.querySelector("#widget-eta");
const groupIdLabel = document.querySelector("#groupIdLabel");
const groupStatus = document.querySelector("#groupStatus");
const partnerEmail = document.querySelector("#partnerEmail");
const invitePartnerBtn = document.querySelector("#invitePartnerBtn");
const createGroupBtn = document.querySelector("#createGroupBtn");
const compoundContribution = document.querySelector("#compoundContribution");
const compoundMonths = document.querySelector("#compoundMonths");
const compoundRate = document.querySelector("#compoundRate");
const compoundResult = document.querySelector("#compoundResult");
const setupForm = document.querySelector("#setupForm");
const setupIncome = document.querySelector("#setupIncome");
const setupExtraIncome = document.querySelector("#setupExtraIncome");
const setupProfile = document.querySelector("#setupProfile");
const setupStartDate = document.querySelector("#setupStartDate");
const setupStatus = document.querySelector("#setupStatus");
const skipSetupBtn = document.querySelector("#skipSetupBtn");
const connectBankBtn = document.querySelector("#connectBankBtn");
const viewConnectionsBtn = document.querySelector("#viewConnectionsBtn");
const setupStatement = document.querySelector("#setupStatement");
const statementStatus = document.querySelector("#statementStatus");

const incomeInput = document.querySelector("#income");
const fixedInput = document.querySelector("#fixed");
const variableInput = document.querySelector("#variable");
const safeValue = document.querySelector("#safeValue");
const scoreValue = document.querySelector("#score");
const outputs = document.querySelectorAll("[data-output]");

const transactionList = document.querySelector("#transactionList");
const searchInput = document.querySelector("#searchInput");
const typeFilter = document.querySelector("#typeFilter");
const dateFrom = document.querySelector("#dateFrom");
const dateTo = document.querySelector("#dateTo");
const transactionForm = document.querySelector("#transactionForm");
const txDescription = document.querySelector("#txDescription");
const txAmount = document.querySelector("#txAmount");
const txType = document.querySelector("#txType");
const txCategory = document.querySelector("#txCategory");
const txAccount = document.querySelector("#txAccount");
const txDate = document.querySelector("#txDate");

const seedTransactions = [
  {
    id: 1,
    description: "Salário",
    category: "Receita",
    type: "entrada",
    amount: 12400,
    date: "2026-06-05",
    account: "Conta principal",
  },
  {
    id: 2,
    description: "Cartão - Mercado",
    category: "Alimentação",
    type: "saida",
    amount: 820,
    date: "2026-06-09",
    account: "Cartão Black",
  },
  {
    id: 3,
    description: "Assinatura streaming",
    category: "Lazer",
    type: "saida",
    amount: 49,
    date: "2026-06-10",
    account: "Cartão Black",
  },
  {
    id: 4,
    description: "Reembolso consultoria",
    category: "Receita",
    type: "entrada",
    amount: 1350,
    date: "2026-06-12",
    account: "Conta PJ",
  },
];

let transactions = [...seedTransactions];
let categoryChart = null;
let activeGroupId = null;
let activeUserId = null;
let currentUserProfile = null;
let setupDismissed = false;
const goals = [
  {
    id: 1,
    name: "Reserva de Emergencia",
    targetValue: 10000,
    currentSaved: 4500,
  },
  {
    id: 2,
    name: "Viagem 2026",
    targetValue: 8000,
    currentSaved: 3200,
  },
];

function setActiveView(view) {
  const targetView = availableViews.has(view) ? view : "dashboard";
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.view === targetView);
  });
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.view === targetView);
  });
  if (targetView) {
    history.replaceState(null, "", `#${targetView}`);
  }
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActiveView(link.dataset.view);
  });
});

window.addEventListener("hashchange", () => {
  const view = window.location.hash.replace("#", "");
  if (view) {
    setActiveView(view);
  }
});

const initialView = window.location.hash.replace("#", "") || "dashboard";
setActiveView(initialView);

function updateForecast() {
  const income = Number(incomeInput.value);
  const fixed = Number(fixedInput.value);
  const variable = Number(variableInput.value);
  const safeToSpend = Math.max(income - fixed - variable, 0);
  const score = Math.min(980, Math.max(420, Math.round(620 + safeToSpend / 20)));

  safeValue.textContent = formatter.format(safeToSpend);
  scoreValue.textContent = score;

  outputs.forEach((item) => {
    const key = item.dataset.output;
    const value = key === "income" ? income : key === "fixed" ? fixed : variable;
    item.textContent = formatter.format(value);
  });
}

[incomeInput, fixedInput, variableInput].forEach((input) => {
  input.addEventListener("input", updateForecast);
});

const filterButtons = document.querySelectorAll(".filter-btn");
const backlogItems = document.querySelectorAll(".backlog-item");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    backlogItems.forEach((item) => {
      const priority = item.dataset.priority;
      const show = filter === "all" || priority === filter;
      item.style.display = show ? "block" : "none";
    });
  });
});

function formatShortDate(value) {
  const date = normalizeDateValue(value);
  if (!date) {
    return "";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function normalizeDateValue(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value.toDate === "function") {
    return value.toDate();
  }
  if (typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }
  return null;
}

function parseDateInput(value, endOfDay = false) {
  if (!value) {
    return null;
  }
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  const hours = endOfDay ? 23 : 0;
  const minutes = endOfDay ? 59 : 0;
  const seconds = endOfDay ? 59 : 0;
  const milliseconds = endOfDay ? 999 : 0;
  return new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
}

function getDateRangeFilters() {
  const from = parseDateInput(dateFrom?.value);
  const to = parseDateInput(dateTo?.value, true);
  if (from && to && from > to) {
    return { from: to, to: from };
  }
  return { from, to };
}

function setSyncStatus(text, state) {
  if (!syncStatus) {
    return;
  }
  syncStatus.textContent = text;
  syncStatus.classList.remove("loading", "ok", "error");
  if (state) {
    syncStatus.classList.add(state);
  }
}

function setAuthError(target, message) {
  if (target) {
    target.textContent = message || "";
  }
}

function setSetupStatus(message, tone) {
  if (!setupStatus) {
    return;
  }
  setupStatus.textContent = message || "";
  setupStatus.classList.remove("ok", "error");
  if (tone) {
    setupStatus.classList.add(tone);
  }
}

function setStatementStatus(message) {
  if (statementStatus) {
    statementStatus.textContent = message || "";
  }
}

function formatDateForInput(value) {
  const date = normalizeDateValue(value);
  if (!date) {
    return "";
  }
  return date.toISOString().split("T")[0];
}

function clearAuthErrors() {
  setAuthError(loginError, "");
  setAuthError(signupError, "");
  setAuthError(verifyStatus, "");
}

function setAppAccess(allowed) {
  document.body.classList.toggle("app-locked", !allowed);
  if (verifyOverlay) {
    verifyOverlay.classList.toggle("hidden", allowed);
  }
}

function isSetupComplete(profile) {
  if (!profile) {
    return false;
  }
  if (profile.setupComplete === true) {
    return true;
  }
  const rendaMensal = Number(profile.rendaMensal || 0);
  return rendaMensal > 0 && profile.setupComplete !== false;
}

function populateSetupForm(profile) {
  if (!setupForm || !profile) {
    return;
  }
  const rendaMensal = Number(profile.rendaMensal || 0);
  const rendaExtra = Number(profile.rendaExtra || 0);
  if (setupIncome) {
    setupIncome.value = rendaMensal ? String(rendaMensal) : "";
  }
  if (setupExtraIncome) {
    setupExtraIncome.value = rendaExtra ? String(rendaExtra) : "";
  }
  if (setupProfile) {
    const perfil = profile.perfil || "moderado";
    const hasOption = Array.from(setupProfile.options || []).some(
      (option) => option.value === perfil,
    );
    setupProfile.value = hasOption ? perfil : "moderado";
  }
  if (setupStartDate) {
    setupStartDate.value = formatDateForInput(profile.inicioAcompanhamento);
  }
  setSetupStatus("", null);
}

function setAuthTab(tab) {
  authTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.authTab === tab);
  });
  authPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.authPanel === tab);
  });
  clearAuthErrors();
}

function openAuthModal(defaultTab = "login") {
  if (!authModal) {
    return;
  }
  authModal.classList.remove("hidden");
  setAuthTab(defaultTab);
}

function closeAuthModalWindow() {
  if (!authModal) {
    return;
  }
  authModal.classList.add("hidden");
  if (loginForm) {
    loginForm.reset();
  }
  if (signupForm) {
    signupForm.reset();
  }
  clearAuthErrors();
}

function isUserVerified(user) {
  if (!user) {
    return false;
  }
  if (user.emailVerified) {
    return true;
  }
  const hasPasswordProvider = user.providerData?.some(
    (provider) => provider.providerId === "password",
  );
  return !hasPasswordProvider;
}

function setGroupStatus(text, state) {
  if (!groupStatus) {
    return;
  }
  groupStatus.textContent = text;
  groupStatus.classList.remove("ok", "error");
  if (state) {
    groupStatus.classList.add(state);
  }
}

function setActiveGroup(groupId) {
  activeGroupId = groupId || null;
  if (groupIdLabel) {
    groupIdLabel.textContent = activeGroupId || "Nenhum";
  }
  if (activeGroupId) {
    setGroupStatus("Espaco compartilhado ativo.", "ok");
  } else {
    setGroupStatus("Crie um espaco para convidar e somar as transacoes do casal.");
  }
}

function normalizeEmail(value) {
  return value ? value.trim().toLowerCase() : "";
}

function getTransactionsCollection(userId) {
  if (activeGroupId) {
    return collection(db, `groups/${activeGroupId}/transactions`);
  }
  return collection(db, `users/${userId}/transactions`);
}

async function createSharedGroup(userId) {
  if (!userId) {
    setGroupStatus("Autentique-se para criar um espaco.", "error");
    return null;
  }
  try {
    setGroupStatus("Criando espaco compartilhado...");
    const groupRef = await addDoc(collection(db, "groups"), {
      members: [userId],
      createdAt: serverTimestamp(),
      createdBy: userId,
    });
    await setDoc(doc(db, "users", userId), { groupId: groupRef.id }, { merge: true });
    setActiveGroup(groupRef.id);
    return groupRef.id;
  } catch (error) {
    console.warn("Falha ao criar espaco compartilhado.", error);
    setGroupStatus("Falha ao criar espaco.", "error");
    return null;
  }
}

async function sendPartnerInvite() {
  const userId = activeUserId;
  const email = normalizeEmail(partnerEmail?.value);
  if (!userId) {
    setGroupStatus("Autentique-se para convidar.", "error");
    return;
  }
  if (!email || !email.includes("@")) {
    setGroupStatus("Informe um email valido.", "error");
    return;
  }

  let groupId = activeGroupId;
  if (!groupId) {
    groupId = await createSharedGroup(userId);
  }
  if (!groupId) {
    return;
  }

  try {
    await setDoc(
      doc(db, `groups/${groupId}/invites/${email}`),
      {
        email,
        status: "pending",
        invitedBy: userId,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
    if (partnerEmail) {
      partnerEmail.value = "";
    }
    setGroupStatus(`Convite enviado para ${email}.`, "ok");
  } catch (error) {
    console.warn("Falha ao enviar convite.", error);
    setGroupStatus("Falha ao enviar convite.", "error");
  }
}

async function acceptInvite(user, groupId, inviteRef) {
  try {
    await updateDoc(doc(db, "groups", groupId), {
      members: arrayUnion(user.uid),
    });
    await setDoc(doc(db, "users", user.uid), { groupId }, { merge: true });
    await updateDoc(inviteRef, {
      status: "accepted",
      acceptedBy: user.uid,
      acceptedAt: serverTimestamp(),
    });
    setActiveGroup(groupId);
    setGroupStatus("Convite aceito. Espaco sincronizado.", "ok");
    await loadTransactions(user.uid, getDateRangeFilters());
  } catch (error) {
    console.warn("Falha ao aceitar convite.", error);
    setGroupStatus("Falha ao aceitar convite.", "error");
  }
}

async function checkPendingInvites(user, profile) {
  if (!user?.email || profile?.groupId) {
    return;
  }
  const email = normalizeEmail(user.email);
  if (!email) {
    return;
  }

  try {
    const inviteQuery = query(
      collectionGroup(db, "invites"),
      where("email", "==", email),
      where("status", "==", "pending"),
      limit(1),
    );
    const snapshot = await getDocs(inviteQuery);
    if (snapshot.empty) {
      return;
    }

    const inviteDoc = snapshot.docs[0];
    const groupId = inviteDoc.ref.parent?.parent?.id;
    if (!groupId) {
      return;
    }

    setGroupStatus("Convite pendente encontrado.", "ok");
    const accepted = window.confirm("Convite do Modo Casal encontrado. Deseja aceitar?");
    if (accepted) {
      await acceptInvite(user, groupId, inviteDoc.ref);
    }
  } catch (error) {
    console.warn("Falha ao verificar convites.", error);
  }
}

const budgetTargets = {
  needs: 50,
  wants: 30,
  savings: 20,
};

const categoryBuckets = {
  needs: [
    "moradia",
    "saude",
    "transporte",
    "educacao",
    "alimentacao",
    "contas",
    "mercado",
  ],
  wants: ["lazer", "viagem", "restaurante", "assinatura", "compras", "streaming"],
  savings: ["investimento", "reserva", "poupanca", "emergencia"],
};

function normalizeKey(value) {
  if (!value) {
    return "";
  }
  return value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function resolveBucket(category) {
  const key = normalizeKey(category);
  if (!key) {
    return "wants";
  }
  if (categoryBuckets.needs.some((item) => key.includes(item))) {
    return "needs";
  }
  if (categoryBuckets.savings.some((item) => key.includes(item))) {
    return "savings";
  }
  if (categoryBuckets.wants.some((item) => key.includes(item))) {
    return "wants";
  }
  return "wants";
}

function setBudgetStatus(text, tone) {
  if (!budgetStatus) {
    return;
  }
  budgetStatus.textContent = text;
  budgetStatus.classList.remove("green", "coral");
  if (tone) {
    budgetStatus.classList.add(tone);
  }
}

function updateBudgetAlerts(items) {
  if (!budgetAlerts || !needsBar || !wantsBar || !savingsBar) {
    return;
  }

  const totals = items.reduce(
    (acc, tx) => {
      if (tx.type !== "saida") {
        return acc;
      }
      const amount = Number(tx.amount) || 0;
      if (!amount) {
        return acc;
      }
      const bucket = resolveBucket(tx.category);
      acc[bucket] += amount;
      acc.total += amount;
      return acc;
    },
    { needs: 0, wants: 0, savings: 0, total: 0 },
  );

  const computePercent = (value) => (totals.total ? Math.round((value / totals.total) * 100) : 0);
  const needsPercent = computePercent(totals.needs);
  const wantsPercent = computePercent(totals.wants);
  const savingsPercent = computePercent(totals.savings);

  needsBar.style.setProperty("--value", `${Math.min(needsPercent, 100)}%`);
  wantsBar.style.setProperty("--value", `${Math.min(wantsPercent, 100)}%`);
  savingsBar.style.setProperty("--value", `${Math.min(savingsPercent, 100)}%`);

  needsValue.textContent = `${needsPercent}%`;
  wantsValue.textContent = `${wantsPercent}%`;
  savingsValue.textContent = `${savingsPercent}%`;

  budgetAlerts.innerHTML = "";

  if (!totals.total) {
    setBudgetStatus("Sem despesas", null);
    const empty = document.createElement("li");
    empty.textContent = "Adicione despesas para comparar com o ideal 50/30/20.";
    budgetAlerts.appendChild(empty);
    return;
  }

  const alerts = [];
  if (needsPercent > budgetTargets.needs + 5) {
    alerts.push(`Necessidades acima do ideal (${needsPercent}% vs. 50%).`);
  }
  if (wantsPercent > budgetTargets.wants + 5) {
    alerts.push(`Desejos acima do ideal (${wantsPercent}% vs. 30%).`);
  }
  if (savingsPercent < budgetTargets.savings - 5) {
    alerts.push(`Poupança abaixo do ideal (${savingsPercent}% vs. 20%).`);
  }

  if (alerts.length) {
    setBudgetStatus("Ajuste necessário", "coral");
    alerts.forEach((message) => {
      const item = document.createElement("li");
      item.textContent = message;
      budgetAlerts.appendChild(item);
    });
  } else {
    setBudgetStatus("Dentro do ideal", "green");
    const ok = document.createElement("li");
    ok.textContent = "Distribuição equilibrada para o período selecionado.";
    budgetAlerts.appendChild(ok);
  }
}

function updateReports() {
  renderCategoryChart(transactions);
  updateBudgetAlerts(transactions);
  updateGoals(transactions);
}

function calculateGoalETA(targetValue, currentSaved, avgMonthlySavings) {
  if (targetValue <= currentSaved) {
    return "Meta concluida";
  }
  if (avgMonthlySavings <= 0) {
    return "Indeterminado (poupe mais)";
  }
  const remaining = targetValue - currentSaved;
  const months = Math.ceil(remaining / avgMonthlySavings);
  return `Faltam ~${months} meses`;
}

function calculateAvgMonthlySavings(items, windowSize = 3) {
  const buckets = new Map();
  items.forEach((tx) => {
    const date = normalizeDateValue(tx.date);
    if (!date) {
      return;
    }
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const entry = buckets.get(key) || { income: 0, expense: 0 };
    const amount = Number(tx.amount) || 0;
    if (tx.type === "entrada") {
      entry.income += amount;
    } else if (tx.type === "saida") {
      entry.expense += amount;
    }
    buckets.set(key, entry);
  });

  const keys = Array.from(buckets.keys()).sort();
  const recentKeys = keys.slice(-windowSize);
  if (!recentKeys.length) {
    return 0;
  }
  const totals = recentKeys.map((key) => {
    const entry = buckets.get(key) || { income: 0, expense: 0 };
    return entry.income - entry.expense;
  });
  const avg = totals.reduce((sum, value) => sum + value, 0) / totals.length;
  return Math.round(avg);
}

function renderGoals(avgMonthlySavings) {
  if (!goalsContainer) {
    return;
  }
  goalsContainer.innerHTML = "";

  if (!goals.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Nenhuma meta cadastrada.";
    goalsContainer.appendChild(empty);
    return;
  }

  goals.forEach((goal) => {
    const percent = goal.targetValue
      ? Math.min(100, Math.round((goal.currentSaved / goal.targetValue) * 100))
      : 0;
    const eta = calculateGoalETA(goal.targetValue, goal.currentSaved, avgMonthlySavings);

    const card = document.createElement("div");
    card.className = "goal-entry";
    card.innerHTML = `
      <div class="goal-info">
        <strong>${goal.name}</strong>
        <span class="muted">Alvo: ${formatter.format(goal.targetValue)}</span>
      </div>
      <div class="meter"><span style="--value: ${percent}%"></span></div>
      <div class="goal-footer">
        <small>${percent}% concluido</small>
        <small class="goal-eta">${eta}</small>
      </div>
    `;
    goalsContainer.appendChild(card);
  });
}

function updateGoals(items) {
  const avgMonthlySavings = calculateAvgMonthlySavings(items);
  renderGoals(avgMonthlySavings);
  updateMainGoalWidget(items, avgMonthlySavings);
}

function updateMainGoalWidget(items, avgMonthlySavings) {
  if (!widgetGoalName || !widgetCurrent || !widgetTarget || !widgetBar || !widgetPercent || !widgetEta) {
    return;
  }

  if (!goals.length) {
    widgetGoalName.textContent = "Sem meta";
    widgetCurrent.textContent = formatter.format(0);
    widgetTarget.textContent = formatter.format(0);
    widgetBar.style.setProperty("--value", "0%");
    widgetPercent.textContent = "0%";
    widgetEta.textContent = "Adicione uma meta";
    updateGoalBadge(0);
    return;
  }

  const mainGoal = [...goals].sort((a, b) => {
    const aRatio = a.targetValue ? a.currentSaved / a.targetValue : 0;
    const bRatio = b.targetValue ? b.currentSaved / b.targetValue : 0;
    return bRatio - aRatio;
  })[0];

  const percent = mainGoal.targetValue
    ? Math.min(100, Math.round((mainGoal.currentSaved / mainGoal.targetValue) * 100))
    : 0;
  const eta = calculateGoalETA(
    mainGoal.targetValue,
    mainGoal.currentSaved,
    avgMonthlySavings,
  );

  widgetGoalName.textContent = mainGoal.name;
  widgetCurrent.textContent = formatter.format(mainGoal.currentSaved);
  widgetTarget.textContent = formatter.format(mainGoal.targetValue);
  widgetBar.style.setProperty("--value", `${percent}%`);
  widgetPercent.textContent = `${percent}%`;
  widgetEta.textContent = eta;
  updateGoalBadge(percent);
}

function updateGoalBadge(percent) {
  if (!widgetPercent) {
    return;
  }
  widgetPercent.classList.remove("positive", "neutral", "negative");
  if (percent >= 70) {
    widgetPercent.classList.add("positive");
  } else if (percent >= 40) {
    widgetPercent.classList.add("neutral");
  } else {
    widgetPercent.classList.add("negative");
  }
}

function openGoalDialog() {
  if (!goalModal) {
    return;
  }
  goalModal.classList.remove("hidden");
  if (goalName) {
    goalName.focus();
  }
}

function closeGoalDialog() {
  if (!goalModal) {
    return;
  }
  goalModal.classList.add("hidden");
  if (goalForm) {
    goalForm.reset();
  }
}

function handleGoalSubmit(event) {
  event.preventDefault();
  const name = goalName?.value.trim();
  const target = Number(goalTarget?.value);
  const saved = Math.max(0, Number(goalSaved?.value || 0));

  if (!name || !target) {
    return;
  }

  goals.unshift({
    id: Date.now(),
    name,
    targetValue: target,
    currentSaved: saved,
  });
  updateGoals(transactions);
  closeGoalDialog();
}

async function handleSetupSubmit(event) {
  event.preventDefault();
  setSetupStatus("", null);
  const user = auth.currentUser;
  if (!user) {
    setSetupStatus("Faça login para salvar.", "error");
    return;
  }

  const rendaMensal = Math.max(0, Number(setupIncome?.value || 0));
  if (!rendaMensal) {
    setSetupStatus("Informe a renda mensal.", "error");
    return;
  }

  const rendaExtra = Math.max(0, Number(setupExtraIncome?.value || 0));
  const perfil = setupProfile?.value || "moderado";
  const startDate = setupStartDate?.value;

  const updates = {
    rendaMensal,
    rendaExtra,
    perfil,
    setupComplete: true,
    setupCompletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (startDate) {
    updates.inicioAcompanhamento = new Date(startDate);
  }

  try {
    setSetupStatus("Salvando configuracoes...", null);
    await setDoc(doc(db, "users", user.uid), updates, { merge: true });
    currentUserProfile = { ...(currentUserProfile || {}), ...updates };
    renderUserProfile(user, currentUserProfile);
    if (incomeInput) {
      incomeInput.value = rendaMensal;
      updateForecast();
    }
    setupDismissed = true;
    setSetupStatus("Configuracoes salvas.", "ok");
    setActiveView("dashboard");
  } catch (error) {
    console.warn("Falha ao salvar configuracoes.", error);
    setSetupStatus("Nao foi possivel salvar.", "error");
  }
}

function simularJuros(valorMensal, meses, taxaMensal = 0.01) {
  if (taxaMensal <= 0) {
    return valorMensal * meses;
  }
  return valorMensal * ((Math.pow(1 + taxaMensal, meses) - 1) / taxaMensal);
}

function updateCompoundResult() {
  if (!compoundResult || !compoundContribution || !compoundMonths || !compoundRate) {
    return;
  }
  const valorMensal = Math.max(0, Number(compoundContribution.value));
  const meses = Math.max(0, Number(compoundMonths.value));
  const taxaMensal = Math.max(0, Number(compoundRate.value)) / 100;

  if (!meses) {
    compoundResult.textContent = "Resultado estimado: R$ 0";
    return;
  }

  const resultado = simularJuros(valorMensal, meses, taxaMensal);
  compoundResult.textContent = `Resultado estimado: ${formatter.format(resultado)}`;
}

function renderTransactions() {
  if (!transactionList) {
    return;
  }

  const queryText = searchInput?.value.trim().toLowerCase() || "";
  const type = typeFilter?.value || "all";
  const { from: fromDate, to: toDate } = getDateRangeFilters();

  const filtered = transactions.filter((tx) => {
    const matchesType = type === "all" || tx.type === type;
    const haystack = `${tx.description} ${tx.category} ${tx.account}`.toLowerCase();
    const matchesQuery = !queryText || haystack.includes(queryText);
    const txDate = normalizeDateValue(tx.date);
    const hasDateFilter = !!fromDate || !!toDate;
    const matchesDate = hasDateFilter
      ? !!txDate &&
        (!fromDate || txDate >= fromDate) &&
        (!toDate || txDate <= toDate)
      : true;
    return matchesType && matchesQuery && matchesDate;
  });

  transactionList.innerHTML = "";

  if (!filtered.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Nenhuma transação encontrada.";
    transactionList.appendChild(empty);
    return;
  }

  filtered.forEach((tx) => {
    const item = document.createElement("li");
    item.className = "transaction-item";

    const meta = document.createElement("div");
    meta.className = "transaction-meta";

    const title = document.createElement("strong");
    title.textContent = tx.description;

    const tags = document.createElement("div");
    tags.className = "transaction-tags";
    const typeBadge = tx.type === "entrada" ? "Entrada" : "Saída";
    tags.innerHTML = `
      <span class="type-badge ${tx.type}">${typeBadge}</span>
      <span>${tx.category}</span>
      <span>${tx.account}</span>
      <span>${formatShortDate(tx.date)}</span>
    `;

    meta.appendChild(title);
    meta.appendChild(tags);

    const amount = document.createElement("span");
    amount.className = `transaction-amount ${tx.type}`;
    const sign = tx.type === "entrada" ? "+" : "-";
    amount.textContent = `${sign} ${formatter.format(tx.amount)}`;

    item.appendChild(meta);
    item.appendChild(amount);

    transactionList.appendChild(item);
  });
}

async function saveTransaction(userId, transactionData) {
  try {
    const parsedDate = normalizeDateValue(transactionData.date) || new Date();
    const groupId = activeGroupId || null;
    const payload = {
      ...transactionData,
      date: parsedDate,
      createdAt: serverTimestamp(),
      ownerId: userId,
      groupId,
    };
    const docRef = await addDoc(getTransactionsCollection(userId), payload);
    transactions.unshift({ ...transactionData, id: docRef.id, ownerId: userId, groupId });
    renderTransactions();
    updateReports();
    await triggerAiAnalysis(userId);
  } catch (error) {
    console.error("Erro ao salvar: ", error);
  }
}

async function loadTransactions(userId, range = {}) {
  let success = true;
  if (!userId) {
    transactions = [...seedTransactions];
    renderTransactions();
    updateReports();
    return success;
  }

  try {
    let { from, to } = range;
    if (from && to && from > to) {
      const temp = from;
      from = to;
      to = temp;
    }

    const constraints = [];
    if (from) {
      constraints.push(where("date", ">=", from));
    }
    if (to) {
      constraints.push(where("date", "<=", to));
    }
    constraints.push(orderBy("date", "desc"), limit(120));

    const txQuery = query(getTransactionsCollection(userId), ...constraints);
    const snapshot = await getDocs(txQuery);
    transactions = snapshot.docs.map((docItem) => {
      const data = docItem.data();
      return {
        id: docItem.id,
        description: data.description || "",
        category: data.category || "",
        type: data.type || "saida",
        amount: Number(data.amount) || 0,
        date: data.date ? normalizeDateValue(data.date) || data.date : null,
        account: data.account || "",
        ownerId: data.ownerId || null,
        groupId: data.groupId || null,
      };
    });
  } catch (error) {
    console.warn("Falha ao carregar transacoes.", error);
    transactions = [...seedTransactions];
    success = false;
  }

  renderTransactions();
  updateReports();
  return success;
}

function renderCategoryChart(items) {
  const ChartConstructor = globalThis.Chart;
  if (!categoryChartCanvas || !ChartConstructor) {
    return;
  }

  const totals = items.reduce((acc, tx) => {
    if (tx.type !== "saida") {
      return acc;
    }
    const amount = Number(tx.amount) || 0;
    if (!amount) {
      return acc;
    }
    const key = tx.category || "Outros";
    acc[key] = (acc[key] || 0) + amount;
    return acc;
  }, {});

  let labels = Object.keys(totals);
  let values = Object.values(totals);
  let palette = ["#10b981", "#f43f5e", "#3b82f6", "#f59e0b", "#8b5cf6", "#22c55e"];

  if (!labels.length) {
    labels = ["Sem despesas"];
    values = [1];
    palette = ["rgba(148, 163, 184, 0.35)"];
  }

  const colors = labels.map((_, index) => palette[index % palette.length]);
  const context = categoryChartCanvas.getContext("2d");

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new ChartConstructor(context, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#e8edf6",
            boxWidth: 12,
            padding: 16,
          },
        },
      },
    },
  });
}

async function triggerAiAnalysis(userId) {
  if (!aiAdviceText || !userId) {
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/analyze-budget", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao analisar: ${response.status}`);
    }

    const data = await response.json();
    const message = data?.ai_advice?.message || "Sem insight no momento.";
    const wantsPct = Number(data?.metrics?.wants_pct);

    if (aiCard) {
      aiCard.classList.remove("alert");
    }
    aiAdviceText.classList.remove("alert-text");

    if (Number.isFinite(wantsPct) && wantsPct > 35) {
      if (aiCard) {
        aiCard.classList.add("alert");
      }
      aiAdviceText.classList.add("alert-text");
      aiAdviceText.textContent = `Alerta de desejos: ${message}`;
    } else {
      aiAdviceText.textContent = message;
    }
  } catch (error) {
    console.warn("IA indisponivel no momento.", error);
    aiAdviceText.textContent = "IA indisponivel. Tente novamente mais tarde.";
    if (aiCard) {
      aiCard.classList.remove("alert");
    }
    aiAdviceText.classList.remove("alert-text");
  }
}

if (transactionForm) {
  transactionForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const amount = Math.max(0, Number(txAmount.value));
    const newTransaction = {
      id: Date.now(),
      description: txDescription.value.trim(),
      category: txCategory.value,
      type: txType.value,
      amount,
      date: txDate.value,
      account: txAccount.value,
    };

    if (!newTransaction.description || !amount) {
      return;
    }

    const user = auth.currentUser;
    if (user) {
      await saveTransaction(user.uid, newTransaction);
    } else {
      transactions.unshift(newTransaction);
      renderTransactions();
      updateReports();
    }
    transactionForm.reset();
    txType.value = "saida";
    txDate.value = new Date().toISOString().split("T")[0];
  });
}

async function handleDateRangeChange() {
  const user = auth.currentUser;
  const range = getDateRangeFilters();
  setSyncStatus("Sincronizando...", "loading");
  if (user) {
    const ok = await loadTransactions(user.uid, range);
    setSyncStatus(ok ? "Atualizado" : "Falha", ok ? "ok" : "error");
    return;
  }
  renderTransactions();
  updateReports();
  setSyncStatus("Atualizado", "ok");
}

if (searchInput) {
  searchInput.addEventListener("input", renderTransactions);
}

if (typeFilter) {
  typeFilter.addEventListener("input", renderTransactions);
  typeFilter.addEventListener("change", renderTransactions);
}

if (openGoalModal) {
  openGoalModal.addEventListener("click", openGoalDialog);
}

if (closeGoalModal) {
  closeGoalModal.addEventListener("click", closeGoalDialog);
}

if (cancelGoalModal) {
  cancelGoalModal.addEventListener("click", closeGoalDialog);
}

if (goalModal) {
  goalModal.addEventListener("click", (event) => {
    if (event.target === goalModal) {
      closeGoalDialog();
    }
  });
}

if (goalForm) {
  goalForm.addEventListener("submit", handleGoalSubmit);
}

if (setupForm) {
  setupForm.addEventListener("submit", handleSetupSubmit);
}

if (skipSetupBtn) {
  skipSetupBtn.addEventListener("click", () => {
    setupDismissed = true;
    setActiveView("dashboard");
  });
}

if (setupStatement) {
  setupStatement.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setStatementStatus("Nenhum arquivo selecionado.");
      return;
    }
    setStatementStatus(`Arquivo selecionado: ${file.name}`);
  });
}

if (connectBankBtn) {
  connectBankBtn.addEventListener("click", () => {
    setStatementStatus("Conexao Open Finance simulada. Em breve.");
  });
}

if (viewConnectionsBtn) {
  viewConnectionsBtn.addEventListener("click", () => {
    setStatementStatus("Nenhuma conexao ativa no momento.");
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && goalModal && !goalModal.classList.contains("hidden")) {
    closeGoalDialog();
  }
});

[createGroupBtn, invitePartnerBtn].forEach((button) => {
  if (button) {
    button.addEventListener("click", async () => {
      if (button === createGroupBtn) {
        await createSharedGroup(activeUserId);
        if (activeUserId) {
          await loadTransactions(activeUserId, getDateRangeFilters());
        }
        return;
      }
      if (button === invitePartnerBtn) {
        await sendPartnerInvite();
      }
    });
  }
});

[compoundContribution, compoundMonths, compoundRate].forEach((input) => {
  if (input) {
    input.addEventListener("input", updateCompoundResult);
    input.addEventListener("change", updateCompoundResult);
  }
});

[dateFrom, dateTo].forEach((input) => {
  if (input) {
    input.addEventListener("input", handleDateRangeChange);
    input.addEventListener("change", handleDateRangeChange);
  }
});

function updateAuthUI(user) {
  if (user) {
    authStatus.textContent = `Olá, ${user.displayName || user.email || "usuário"}`;
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    return;
  }

  authStatus.textContent = "Desconectado";
  loginBtn.classList.remove("hidden");
  logoutBtn.classList.add("hidden");
  userProfileCard.classList.add("hidden");
  activeUserId = null;
  currentUserProfile = null;
  setupDismissed = false;
  setSetupStatus("", null);
  setStatementStatus("Nenhum arquivo selecionado.");
  setActiveGroup(null);
  setAppAccess(true);
  if (aiAdviceText) {
    aiAdviceText.textContent = "Conecte uma conta para receber sugestões personalizadas.";
    aiAdviceText.classList.remove("alert-text");
    if (aiCard) {
      aiCard.classList.remove("alert");
    }
  }
}

async function syncUserProfile(user) {
  if (!user) {
    return null;
  }

  const profileRef = doc(db, "users", user.uid);
  try {
    const snapshot = await getDoc(profileRef);
    if (!snapshot.exists()) {
      const initialData = {
        uid: user.uid,
        nome: user.displayName || null,
        displayName: user.displayName || null,
        email: user.email || null,
        photoURL: user.photoURL || null,
        provider: user.providerData?.[0]?.providerId || null,
        perfil: "moderado",
        objetivos: ["reserva_emergencia"],
        rendaMensal: 0,
        rendaExtra: 0,
        inicioAcompanhamento: null,
        setupComplete: false,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };

      await setDoc(profileRef, initialData);
      return initialData;
    }

    const updates = {
      nome: user.displayName || snapshot.data()?.nome || null,
      displayName: user.displayName || snapshot.data()?.displayName || null,
      email: user.email || snapshot.data()?.email || null,
      photoURL: user.photoURL || snapshot.data()?.photoURL || null,
      provider: user.providerData?.[0]?.providerId || snapshot.data()?.provider || null,
      lastLoginAt: serverTimestamp(),
    };

    await setDoc(profileRef, updates, { merge: true });
    return { ...snapshot.data(), ...updates };
  } catch (error) {
    console.warn("Falha ao sincronizar perfil no Firestore.", error);
    return null;
  }
}

function buildInitials(name) {
  if (!name) {
    return "AF";
  }
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]).join("").toUpperCase();
}

function buildAvatarDataUrl(initials) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
      <defs>
        <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#4cc3ff"/>
          <stop offset="100%" stop-color="#35e3a1"/>
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="48" fill="url(#grad)"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="Space Grotesk, sans-serif" font-size="34" fill="#04121e">
        ${initials}
      </text>
    </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function formatProfileLabel(perfil) {
  const base = perfil ? perfil.toString().replace(/_/g, " ") : "moderado";
  return `Perfil ${base.charAt(0).toUpperCase()}${base.slice(1)}`;
}

function renderUserProfile(user, profile) {
  if (!user) {
    return;
  }

  const name = profile?.nome || profile?.displayName || user.displayName || user.email || "Usuário";
  const photo = profile?.photoURL || user.photoURL;
  const perfil = profile?.perfil || "moderado";

  userName.textContent = name;
  userStatus.textContent = formatProfileLabel(perfil);
  userPhoto.src = photo || buildAvatarDataUrl(buildInitials(name));
  userProfileCard.classList.remove("hidden");
  setActiveGroup(profile?.groupId || null);
}

async function handleEmailLogin(event) {
  event.preventDefault();
  clearAuthErrors();
  const email = loginEmail?.value.trim();
  const password = loginPassword?.value;
  if (!email || !password) {
    setAuthError(loginError, "Informe email e senha.");
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
    closeAuthModalWindow();
  } catch (error) {
    console.error("Erro no login:", error.code, error.message);
    setAuthError(loginError, "Nao foi possivel entrar. Verifique seus dados.");
  }
}

async function handleSignup(event) {
  event.preventDefault();
  clearAuthErrors();
  const name = signupName?.value.trim();
  const email = signupEmail?.value.trim();
  const password = signupPassword?.value;
  const rendaMensal = Math.max(0, Number(signupIncome?.value || 0));
  const perfil = signupProfile?.value || "moderado";

  if (!name || !email || !password) {
    setAuthError(signupError, "Preencha todos os campos obrigatorios.");
    return;
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (result.user) {
      await updateProfile(result.user, { displayName: name });
      await setDoc(
        doc(db, "users", result.user.uid),
        {
          nome: name,
          displayName: name,
          email,
          perfil,
          rendaMensal,
          rendaExtra: 0,
          inicioAcompanhamento: null,
          setupComplete: false,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        },
        { merge: true },
      );
      await sendEmailVerification(result.user);
    }
    closeAuthModalWindow();
    setAppAccess(false);
    setAuthError(verifyStatus, "Email de confirmacao enviado.");
  } catch (error) {
    console.error("Erro no cadastro:", error.code, error.message);
    setAuthError(signupError, "Nao foi possivel criar a conta.");
  }
}

async function handleLogin() {
  try {
    console.log("Iniciando login...");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    console.log("Usuario logado com sucesso:", result.user?.displayName);
    closeAuthModalWindow();
  } catch (error) {
    console.error("Erro detalhado do Firebase:", error.code, error.message);
    authStatus.textContent = "Falha ao autenticar.";
    if (error.code === "auth/popup-blocked") {
      window.alert("Por favor, habilite pop-ups para este site.");
    } else if (error.code === "auth/operation-not-allowed") {
      window.alert("Erro: O login do Google ainda nao foi habilitado no Console.");
    }
  }
}

if (loginBtn) {
  loginBtn.addEventListener("click", () => openAuthModal("login"));
}

if (closeAuthModal) {
  closeAuthModal.addEventListener("click", closeAuthModalWindow);
}

if (authModal) {
  authModal.addEventListener("click", (event) => {
    if (event.target === authModal) {
      closeAuthModalWindow();
    }
  });
}

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setAuthTab(tab.dataset.authTab);
  });
});

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", handleLogin);
}

if (loginForm) {
  loginForm.addEventListener("submit", handleEmailLogin);
}

if (signupForm) {
  signupForm.addEventListener("submit", handleSignup);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && authModal && !authModal.classList.contains("hidden")) {
    closeAuthModalWindow();
  }
});

if (resendVerificationBtn) {
  resendVerificationBtn.addEventListener("click", async () => {
    clearAuthErrors();
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setAuthError(verifyStatus, "Email reenviado.");
      }
    } catch (error) {
      console.error("Erro ao reenviar email:", error.code, error.message);
      setAuthError(verifyStatus, "Nao foi possivel reenviar o email.");
    }
  });
}

if (checkVerificationBtn) {
  checkVerificationBtn.addEventListener("click", async () => {
    clearAuthErrors();
    if (!auth.currentUser) {
      return;
    }
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setAppAccess(true);
        setAuthError(verifyStatus, "");
      } else {
        setAuthError(verifyStatus, "Email ainda nao confirmado.");
      }
    } catch (error) {
      console.error("Erro ao verificar email:", error.code, error.message);
      setAuthError(verifyStatus, "Nao foi possivel verificar o email.");
    }
  });
}

if (logoutUnverifiedBtn) {
  logoutUnverifiedBtn.addEventListener("click", async () => {
    await signOut(auth);
  });
}

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.warn("Falha ao sair.", error);
  }
});

onAuthStateChanged(auth, async (user) => {
  updateAuthUI(user);
  activeUserId = user ? user.uid : null;
  if (!user) {
    await loadTransactions(null);
    setSyncStatus("Atualizado", "ok");
    return;
  }

  const verified = isUserVerified(user);
  setAppAccess(verified);
  if (!verified) {
    setAuthError(verifyStatus, "Confirme seu email para liberar o acesso.");
    return;
  }

  const profile = await syncUserProfile(user);
  currentUserProfile = profile;
  populateSetupForm(profile);
  renderUserProfile(user, profile);
  await checkPendingInvites(user, profile);
  if (profile?.rendaMensal && incomeInput) {
    incomeInput.value = String(profile.rendaMensal);
    updateForecast();
  }
  if (!isSetupComplete(profile) && !setupDismissed) {
    setActiveView("setup");
  }
  if (aiAdviceText) {
    aiAdviceText.textContent = "Analisando seu perfil financeiro...";
  }
  setSyncStatus("Sincronizando...", "loading");
  const ok = await loadTransactions(user.uid, getDateRangeFilters());
  setSyncStatus(ok ? "Atualizado" : "Falha", ok ? "ok" : "error");
});

updateForecast();
loadTransactions(null);
updateCompoundResult();
updateGoals(transactions);
if (txDate) {
  txDate.value = new Date().toISOString().split("T")[0];
}
