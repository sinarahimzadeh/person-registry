import { useState } from "react";
import { api } from "./api/client";
import { isValidCF } from "./utils/validators";

const isProvince = (v) => /^[A-Z]{2}$/i.test(v);

export default function App() {
  // SEARCH BY CF
  const [cf, setCf] = useState("");
  const [person, setPerson] = useState(null);
  const [msg, setMsg] = useState("");

  // CREATE FORM
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

  // EDIT FORM
  const [edit, setEdit] = useState({
    name: "",
    surname: "",
    street: "",
    streetNo: "",
    city: "",
    province: "",
    country: "",
  });

  // SEARCH BY NAME
  const [nameQuery, setNameQuery] = useState("");
  const [nameResults, setNameResults] = useState([]);

  // LIST ALL
  const [allPersons, setAllPersons] = useState([]);

  const fillEditFromDto = (dto) => {
    const a = dto?.address || {};
    setEdit({
      name: dto?.name || "",
      surname: dto?.surname || "",
      street: a.street || "",
      streetNo: a.streetNo || "",
      city: a.city || "",
      province: a.province || "",
      country: a.country || "",
    });
  };

  // ---- SEARCH BY CF ----
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
      setCf(taxCode);
      fillEditFromDto(res.data);
      setMsg("");
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

  // ---- UPDATE (CF immutable) ----
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

  // ---- SEARCH BY NAME / SURNAME ----
  const handleSearchByName = async () => {
    const q = nameQuery.trim();
    if (!q) {
      setMsg("Enter a name or surname to search.");
      setNameResults([]);
      return;
    }

    try {
      const res = await api.get("/person/search", { params: { name: q } });
      const data = res.data || [];
      setNameResults(data);
      if (data.length === 0) setMsg("No persons found with that name.");
      else setMsg("");
    } catch (e) {
      console.error("Search by name error", e);
      setMsg("Search by name failed.");
      setNameResults([]);
    }
  };

  // ---- LOAD ALL PERSONS ----
  const handleLoadAll = async () => {
    try {
      const res = await api.get("/person");
      setAllPersons(res.data || []);
      setMsg("");
    } catch (e) {
      console.error("Load all error", e);
      setMsg("Failed to load persons.");
      setAllPersons([]);
    }
  };

  const inputCreate = (name, placeholder, width = 220) => (
    <input
      style={{
        width,
        marginRight: 8,
        marginBottom: 8,
        padding: "8px 10px",
        borderRadius: 6,
        border: "1px solid #ccc",
        fontSize: 14,
      }}
      value={form[name]}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      placeholder={placeholder}
    />
  );

  const inputEdit = (name, placeholder, width = 220) => (
    <input
      style={{
        width,
        marginRight: 8,
        marginBottom: 8,
        padding: "8px 10px",
        borderRadius: 6,
        border: "1px solid #ccc",
        fontSize: 14,
      }}
      value={edit[name]}
      onChange={(e) => setEdit({ ...edit, [name]: e.target.value })}
      placeholder={placeholder}
    />
  );

  const primaryButtonStyle = {
    padding: "8px 16px",
    background: "#4f6df5",
    border: "none",
    color: "white",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 14,
  };

  const secondaryButtonStyle = {
    padding: "8px 16px",
    background: "#e64545",
    border: "none",
    color: "white",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 14,
  };

  const sectionCardStyle = {
    background: "white",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    marginBottom: 24,
  };

  const sectionTitleStyle = {
    marginTop: 0,
    marginBottom: 12,
    color: "#222",
    background: "#e8eefc",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 18,
  };

  const addr = person?.address || {};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        display: "flex",
        justifyContent: "center",
        paddingTop: 40,
        paddingBottom: 40,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ width: "90%", maxWidth: 900 }}>
        {/* ---- SEARCH BY CF ---- */}
        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>Search Person by Codice Fiscale</h2>
          <div style={{ marginBottom: 8 }}>
            <input
              value={cf}
              onChange={(e) => setCf(e.target.value)}
              placeholder="Enter CF"
              style={{
                marginRight: 8,
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                minWidth: 220,
                fontSize: 14,
              }}
            />
            <button onClick={handleSearch} style={primaryButtonStyle}>
              Search
            </button>
          </div>

          {msg && (
            <p style={{ color: msg.includes("✔") ? "green" : "red", marginTop: 8 }}>
              {msg}
            </p>
          )}

          {/* ----- SEARCH BY NAME / SURNAME ----- */}
          <h3 style={{ marginTop: 20, marginBottom: 8 }}>Search by Name / Surname</h3>
          <div>
            <input
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              placeholder="Enter name or surname"
              style={{
                marginRight: 8,
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                minWidth: 220,
                fontSize: 14,
              }}
            />
            <button onClick={handleSearchByName} style={primaryButtonStyle}>
              Search by name
            </button>
          </div>

          {nameResults.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <b>Matches:</b>
              <ul>
                {nameResults.map((p) => (
                  <li key={p.taxCode}>
                    <span
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => {
                        setPerson(p);
                        setCf(p.taxCode);
                        fillEditFromDto(p);
                      }}
                    >
                      {p.taxCode} – {p.name} {p.surname} ({p.address?.city || ""})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ----- ALL PERSONS TABLE ----- */}
        <div style={sectionCardStyle}>
          <h3 style={sectionTitleStyle}>All Persons</h3>
          <button onClick={handleLoadAll} style={primaryButtonStyle}>
            Load all persons
          </button>

          {allPersons.length > 0 && (
            <table
              style={{
                marginTop: 12,
                width: "100%",
                borderCollapse: "collapse",
                background: "white",
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                fontSize: 14,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      padding: "10px",
                      background: "#4f6df5",
                      color: "white",
                      fontWeight: "normal",
                      textAlign: "left",
                    }}
                  >
                    CF
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      background: "#4f6df5",
                      color: "white",
                      fontWeight: "normal",
                      textAlign: "left",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      background: "#4f6df5",
                      color: "white",
                      fontWeight: "normal",
                      textAlign: "left",
                    }}
                  >
                    Surname
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      background: "#4f6df5",
                      color: "white",
                      fontWeight: "normal",
                      textAlign: "left",
                    }}
                  >
                    City
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      background: "#4f6df5",
                      color: "white",
                      fontWeight: "normal",
                      textAlign: "left",
                    }}
                  >
                    Province
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      background: "#4f6df5",
                      color: "white",
                      fontWeight: "normal",
                      textAlign: "left",
                    }}
                  >
                    Country
                  </th>
                </tr>
              </thead>
              <tbody>
                {allPersons.map((p) => {
                  const a = p.address || {};
                  return (
                    <tr
                      key={p.taxCode}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setPerson(p);
                        setCf(p.taxCode);
                        fillEditFromDto(p);
                      }}
                    >
                      <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                        {p.taxCode}
                      </td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                        {p.name}
                      </td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                        {p.surname}
                      </td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                        {a.city || ""}
                      </td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                        {a.province || ""}
                      </td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                        {a.country || ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ----- DETAIL + EDIT ----- */}
        {person && (
          <div style={sectionCardStyle}>
            <h3 style={sectionTitleStyle}>Person Details & Edit</h3>
            <div style={{ marginBottom: 8 }}>
              <div>
                <b>CF:</b> {person.taxCode}
              </div>
              <div>
                <b>Name:</b> {person.name}
              </div>
              <div>
                <b>Surname:</b> {person.surname}
              </div>
              <div>
                <b>Address:</b>{" "}
                {addr.street || ""} {addr.streetNo || ""},{" "}
                {addr.city || ""} ({addr.province || ""}), {addr.country || ""}
              </div>
            </div>

            <hr style={{ margin: "16px 0" }} />
            <b>Edit & Update</b>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
              <div>
                {inputEdit("name", "Name")} {inputEdit("surname", "Surname")}
              </div>
              <div>
                {inputEdit("street", "Street", 240)} {inputEdit("streetNo", "No", 80)}
              </div>
              <div>
                {inputEdit("city", "City")}{" "}
                {inputEdit("province", "Province (MI)", 120)}{" "}
                {inputEdit("country", "Country")}
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button onClick={handleUpdate} style={{ ...primaryButtonStyle, marginRight: 8 }}>
                Update
              </button>
              <button onClick={handleDelete} style={secondaryButtonStyle}>
                Delete
              </button>
            </div>
          </div>
        )}

        {/* ----- CREATE ----- */}
        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>Create Person</h2>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 500 }}>
            {inputCreate("taxCode", "CF (16 chars)")}
            <div>
              {inputCreate("name", "Name")} {inputCreate("surname", "Surname")}
            </div>
            <div>
              {inputCreate("street", "Street", 240)}{" "}
              {inputCreate("streetNo", "No", 80)}
            </div>
            <div>
              {inputCreate("city", "City")}{" "}
              {inputCreate("province", "Province (MI)", 120)}{" "}
              {inputCreate("country", "Country")}
            </div>
          </div>
          <button onClick={handleCreate} style={{ ...primaryButtonStyle, marginTop: 8 }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
