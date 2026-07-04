import client from "./client";

// --- Auth ---
export async function login(email, password) {
  const { data } = await client.post("/auth/login", { email, password });
  return data;
}

// --- Stats ---
export async function getStats() {
  const { data } = await client.get("/admin/stats");
  return data;
}

// --- Pharmacies ---
export async function listPharmacies(verified) {
  const params = verified !== undefined ? { verified } : {};
  const { data } = await client.get("/admin/pharmacies", { params });
  return data;
}

export async function verifyPharmacy(id, verified) {
  const { data } = await client.put(`/admin/pharmacies/${id}/verify`, { verified });
  return data;
}

// --- Users ---
export async function listUsers(role) {
  const params = role ? { role } : {};
  const { data } = await client.get("/admin/users", { params });
  return data;
}

export async function updateUserStatus(id, isActive) {
  const { data } = await client.put(`/admin/users/${id}/status`, { isActive });
  return data;
}

// --- Medicines ---
export async function listMedicines({ name, page = 1, limit = 20 } = {}) {
  const params = { page, limit };
  if (name) params.name = name;
  const { data } = await client.get("/admin/medicines", { params });
  return data;
}

export async function updateMedicine(id, updates) {
  const { data } = await client.put(`/admin/medicines/${id}`, updates);
  return data;
}

// Note: create uses the plain /medicines route (admin-only via authorize('admin')),
// not /admin/medicines — matches your existing medicineRoutes.js.
export async function createMedicine({ name, genericName, category }) {
  const { data } = await client.post("/medicines", { name, genericName, category });
  return data;
}