import { useState } from "react";
import { api } from "./api/client";
import { isValidCF } from "./utils/validators";

const isProvince = (v) => /^[A-Z]{2}$/i.test(v);

export default function App() {
  // SEARCH
  const [cf, setCf] = useState("");
  const [person, setPerson] = useState(null);
  const [msg, setMsg] = useState("");
const [nameQuery, setNameQuery] = useState("");
const [nameResults, setNameResults] = useState([]);

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

  // EDIT
  const [edit, setEdit] = useState({
    name: "",
    surname: "",
    street: "",
    streetNo: "",
    city: "",
    province: "",
    country: "",
  });

  const fillEditFromDto = (dto) => {
    if (!dto || !dto.address) return;
    setEdit({
      name: dto.name || "",
      surname: dto.surname || "",
      street: dto.address.street || "",
      streetNo: dto.address.streetNo || "",
      city: dto.address.city || "",
      province: dto.address.province || "",
      country: dto.address.country || "",
    });
  };

  // ---- SEARCH ----
  const handleSearchByName = async () => {
  const q = nameQuery.trim();
  if (!q) {
    setMsg("Enter a name or surname to search.");
    setNameResults([]);
    return;
  }

  try {
    const res = await api.get("/person/search", { params: { name: q } });
    setNameResults(res.data);
    if (res.data.length === 0) {
      setMsg("No persons found with that name.");
    } else {
      setMsg("");
    }
  } catch (e) {
    console.error("Search by name error", e);
    setMsg("Search by name failed.");
    setNameResults([]);
  }
};
  const handleSearch = async () => {
    const raw = cf.trim();
    if (!isValidCF(raw)) {
      setMsg("Codice Fiscale must be 16 letters/numbers");
      setPerson(null);
      return;
    }

    const taxCode = raw.toUpperCase();

    try {
      const res = await api.get(`/person/${encodeURIComponent(taxCode)}`);
      setPerson(res.data);
      setMsg("");
      setCf(taxCode);
      fillEditFromDto(res.data);
    } catch (e) {
      console.error("Search error", e);
      setPerson(null);
      setMsg("Person not found");
    }
  };

  // ---- CREATE ----
  const handleCreate = async () => {
    const rawCf = form.taxCode.trim();

    if (!isValidCF(rawCf)) {
      return setMsg("Invalid CF (16 letters/numbers).");
    }
    if (!isProvince(form.province)) {
      return setMsg("Province must be 2 letters (e.g., MI).");
    }

    const payload = {
      taxCode: rawCf.toUpperCase(),
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
      await api.post("/person", payload);
      setMsg("Saved ✔");

      const res = await api.get(`/person/${encodeURIComponent(payload.taxCode)}`);
      setPerson(res.data);
      setCf(payload.taxCode);
      fillEditFromDto(res.data);
    } catch (e) {
      console.error("Create error", e);
      setMsg("Create failed. If CF already exists, use another one.");
    }
  };

  // ---- UPDATE (CF is immutable) ----
  const handleUpdate = async () => {
    if (!person) return setMsg("Search a person first.");
    if (!isProvince(edit.province)) {
      return setMsg("Province must be 2 letters (e.g., MI).");
    }

    const payload = {
      taxCode: person.taxCode,
      name: edit.name,
      surname: edit.surname,
      address: {
        street: edit.street,
        streetNo: edit.streetNo,
        city: edit.city,
        province: edit.province.toUpperCase(),
        country: edit.country,
      },
    };

    try {
      await api.put(`/person/${encodeURIComponent(person.taxCode)}`, payload);
      setMsg("Updated ✔");

      const res = await api.get(`/person/${encodeURIComponent(person.taxCode)}`);
      setPerson(res.data);
      fillEditFromDto(res.data);
    } catch (e) {
      console.error("Update error", e);
      setMsg("Update failed.");
    }
  };

  // ---- DELETE ----
  const handleDelete = async () => {
    if (!person) return setMsg("Search a person first.");
    const ok = window.confirm(`Delete ${person.taxCode}? This cannot be undone.`);
    if (!ok) return;

    try {
      await api.delete(`/person/${encodeURIComponent(person.taxCode)}`);
      setMsg("Deleted ✔");
      setPerson(null);
      setEdit({
        name: "",
        surname: "",
        street: "",
        streetNo: "",
        city: "",
        province: "",
        country: "",
      });
    } catch (e) {
      console.error("Delete error", e);
      setMsg("Delete failed.");
    }
  };

  const inputCreate = (name, placeholder, width = 220) => (
    <input
      style={{ width, marginRight: 8, marginBottom: 8 }}
      value={form[name]}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      placeholder={placeholder}
    />
  );

  const inputEdit = (name, placeholder, width = 220) => (
    <input
      style={{ width, marginRight: 8, marginBottom: 8 }}
      value={edit[name]}
      onChange={(e) => setEdit({ ...edit, [name]: e.target.value })}
      placeholder={placeholder}
    />
  );

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif", lineHeight: 1.6, maxWidth: 800 }}>
      <h2>Search Person by Codice Fiscale</h2>
      <input
        value={cf}
        onChange={(e) => setCf(e.target.value)}
        placeholder="Enter CF"
        style={{ marginRight: 8 }}
      />
      <button onClick={handleSearch}>Search</button>

      {msg && (
        <p style={{ color: msg.includes("✔") ? "green" : "red" }}>
          {msg}
        </p>
      )}
<h3>Search by Name / Surname</h3>
<input
  value={nameQuery}
  onChange={(e) => setNameQuery(e.target.value)}
  placeholder="Enter name or surname"
  style={{ marginRight: 8 }}
/>
<button onClick={handleSearchByName}>Search by name</button>

{nameResults.length > 0 && (
  <div style={{ marginTop: 12 }}>
    <b>Matches:</b>
    <ul>
      {nameResults.map((p) => (
        <li key={p.taxCode}>
          <span
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => {
              // when you click a result, load it into the main detail view
              setPerson(p);
              setCf(p.taxCode);
              setEdit({
                name: p.name,
                surname: p.surname,
                street: p.address.street,
                streetNo: p.address.streetNo,
                city: p.address.city,
                province: p.address.province,
                country: p.address.country,
              });
            }}
          >
            {p.taxCode} – {p.name} {p.surname} ({p.address.city})
          </span>
        </li>
      ))}
    </ul>
  </div>
)}

      {person && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", width: 500 }}>
          <b>Result</b>
          <div><b>CF:</b> {person.taxCode}</div>
          <div><b>Name:</b> {person.name}</div>
          <div><b>Surname:</b> {person.surname}</div>
          <div>
            <b>Address:</b>{" "}
            {person.address.street} {person.address.streetNo},{" "}
            {person.address.city} ({person.address.province}), {person.address.country}
          </div>

          <hr style={{ margin: "16px 0" }} />
          <b>Edit & Update</b>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
              {inputEdit("name", "Name")} {inputEdit("surname", "Surname")}
            </div>
            <div>
              {inputEdit("street", "Street", 240)} {inputEdit("streetNo", "No", 80)}
            </div>
            <div>
              {inputEdit("city", "City")} {inputEdit("province", "Province (MI)", 120)}{" "}
              {inputEdit("country", "Country")}
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={handleUpdate} style={{ marginRight: 8 }}>
              Update
            </button>
            <button
              onClick={handleDelete}
              style={{ color: "white", background: "#c33" }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <hr style={{ margin: "24px 0" }} />

      <h2>Create Person</h2>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 500 }}>
        {inputCreate("taxCode", "CF (16 chars)")}
        <div>
          {inputCreate("name", "Name")} {inputCreate("surname", "Surname")}
        </div>
        <div>
          {inputCreate("street", "Street", 240)} {inputCreate("streetNo", "No", 80)}
        </div>
        <div>
          {inputCreate("city", "City")} {inputCreate("province", "Province (MI)", 120)}{" "}
          {inputCreate("country", "Country")}
        </div>
      </div>
      <button onClick={handleCreate} style={{ marginTop: 8 }}>
        Save
      </button>
    </div>
  );
}
