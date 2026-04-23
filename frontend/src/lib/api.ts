const BASE_URL = "http://127.0.0.1:8000"

function getToken() {
  return localStorage.getItem("token")
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  }
}

async function request(method: string, path: string, body?: object) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error)
  }

  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const form = new URLSearchParams()
  form.append("username", email)
  form.append("password", password)

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    body: form,
  })

  if (!res.ok) throw new Error("Invalid email or password")

  const data = await res.json()
  localStorage.setItem("token", data.access_token)
  return data
}

export async function getMe() {
  return request("GET", "/auth/me")
}

export function logout() {
  localStorage.removeItem("token")
}

// ── Guardians ─────────────────────────────────────────────────────────────────

export async function getGuardians() {
  return request("GET", "/guardians/")
}

export async function createGuardian(data: { first_name: string; last_name: string; phone: string }) {
  return request("POST", "/guardians/", data)
}

// ── Participants ──────────────────────────────────────────────────────────────

export async function getParticipants() {
  return request("GET", "/participants/")
}

export async function createParticipant(data: { guardian_id: string; first_name: string; last_name: string }) {
  return request("POST", "/participants/", data)
}

// ── Packages ──────────────────────────────────────────────────────────────────

export async function getPackages() {
  return request("GET", "/packages/")
}

export async function createPackage(data: { participant_id: string; name: string; sessions_total: number; price: number }) {
  return request("POST", "/packages/", data)
}

export async function getPackagesForParticipant(participantId: string) {
  return request("GET", `/packages/participant/${participantId}`)
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function getSessions() {
  return request("GET", "/sessions/")
}

export async function getTodaySession() {
  return request("GET", "/sessions/today")
}

export async function createSession(data: { title: string; session_date: string }) {
  return request("POST", "/sessions/", data)
}

// ── Attendance ────────────────────────────────────────────────────────────────

export async function getSessionAttendance(sessionId: string) {
  return request("GET", `/attendance/session/${sessionId}`)
}

export async function checkIn(data: { session_id: string; participant_id: string; package_id: string }) {
  return request("POST", "/attendance/", data)
}

// ── Payments ──────────────────────────────────────────────────────────────────

export async function getPayments() {
  return request("GET", "/payments/")
}

export async function createPayment(data: { participant_id: string; amount: number; method: string }) {
  return request("POST", "/payments/", data)
}

// ── Expenses ──────────────────────────────────────────────────────────────────

export async function getExpenses() {
  return request("GET", "/expenses/")
}

export async function createExpense(data: { description: string; amount: number; expense_date: string }) {
  return request("POST", "/expenses/", data)
}

// ── Profit ────────────────────────────────────────────────────────────────────

export async function getProfit() {
  return request("GET", "/profit/")
}