// frontend/src/api/client.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080",
});

const enc = (v) => encodeURIComponent((v || "").toUpperCase().trim());

export function createPerson(payload) {
  return api.post("/person", {
    ...payload,
    taxCode: (payload.taxCode || "").toUpperCase().trim(),
  });
}

export function getPerson(taxCode) {
  return api.get(`/person/${enc(taxCode)}`);
}

export function listPersons() {
  return api.get("/person");
}

export function updatePerson(taxCode, payload) {
  return api.put(`/person/${enc(taxCode)}`, {
    ...payload,
    taxCode: (payload.taxCode || taxCode || "").toUpperCase().trim(),
  });
}

export function deletePerson(taxCode) {
  return api.delete(`/person/${enc(taxCode)}`);
}
