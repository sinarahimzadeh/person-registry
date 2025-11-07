import { useState } from "react";
import { api } from "./api/client";
import { isValidCF } from "./utils/validators";

const isProvince = (v) => /^[A-Z]{2}$/i.test(v);

export default function App() {
  // SEARCH
  const [cf, setCf] = useState("");
  const [person, setPerson] = useState(null);
  const [msg, setMsg] = useState("");

  const handleSearch = async () => {
    if (!isValidCF(cf)) {
      setMsg("Codice Fiscale must be 16 letters/numbers");
      setPerson(null);
      return;
    }
    try {
      const res = await api.get(`/persons/${cf.toUpperCase()}`);
      setPerson(res.data);
      setMsg("");
    } catch {
      setPerson(null);
      setMsg("Person not found");
    }
  };

  // CREATE
  const [form, setForm] = useState({
    taxCode: "",
    name: "",
    surname: "",
    street: "",
    streetNo: "",
    city: "",
    province: "",
    country: "",
  });

  const handleCreate = async () => {
    // minimal validations
    if (!isValidCF(form.taxCode)) return setMsg("Invalid CF (16 letters/numbers).");
    if (!isProvince(form.province)) return setMsg("Province must be 2 letters (e.g., MI).");

    const payload = {
      taxCode: form.taxCode.toUpperCase(),
      name: form.name,
      surname: form.surname,
      address: {
        street: form.street,
        streetNo: form.streetNo,
        city: form.city,
        province: form.province.toUpperCase(),
        country: form.country,
      },
    };

    try {
      await api.post("/persons", payload);
      setMsg("Saved ✔");
      // quick check: fetch back and show
      const res = await api.get(`/persons/${payload.taxCode}`);
      setPerson(res.data);
    } catch (e) {
      setMsg("Create failed. If CF already exists, use another one.");
    }
  };

  const input = (name, placeholder, width = 220) => (
    <input
      style={{ width, marginRight: 8, marginBottom: 8 }}
      value={form[name]}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      placeholder={placeholder}
    />
  );

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif", lineHeight: 1.6 }}>
      <h2>Search Person by Codice Fiscale</h2>
      <input
        value={cf}
        onChange={(e) => setCf(e.target.value)}
        placeholder="Enter CF"
        style={{ marginRight: 8 }}
      />
      <button onClick={handleSearch}>Search</button>

      {msg && <p style={{ color: msg.includes("✔") ? "green" : "red" }}>{msg}</p>}

      {person && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", width: 420 }}>
          <b>Result</b>
          <div>Name: {person.name}</div>
          <div>Surname: {person.surname}</div>
          <div>
            Address: {person.address.street} {person.address.streetNo},{" "}
            {person.address.city} ({person.address.province}), {person.address.country}
          </div>
        </div>
      )}

      <hr style={{ margin: "24px 0" }} />

      <h2>Create Person</h2>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 460 }}>
        {input("taxCode", "CF (16 chars)")}
        <div>
          {input("name", "Name")} {input("surname", "Surname")}
        </div>
        <div>
          {input("street", "Street", 240)} {input("streetNo", "No", 80)}
        </div>
        <div>
          {input("city", "City")} {input("province", "Province (MI)", 120)}{" "}
          {input("country", "Country")}
        </div>
      </div>
      <button onClick={handleCreate} style={{ marginTop: 8 }}>
        Save
      </button>
    </div>
  );
}
