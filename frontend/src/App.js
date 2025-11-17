import { useState } from "react";
import { api } from "./api/client";
import { isValidCF } from "./utils/validators";

const isProvince = (v) => /^[A-Z]{2}$/i.test(v);

export default function App() {
  // THEME
  const [dark, setDark] = useState(false);

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

  // ---------- THEME-DEPENDENT STYLES ----------
  const bgColor = dark ? "#020617" : "#f5f7fa";
  const fgColor = dark ? "#e5e7eb" : "#111827";
  const cardBg = dark ? "#020617" : "white";
  const cardBorder = dark ? "1px solid #1f2937" : "none";
  const titleBg = dark ? "#111827" : "#e8eefc";
  const titleColor = dark ? "#e5e7eb" : "#222";
  const tableHeaderBg = dark ? "#111827" : "#4f6df5";
  const tableHeaderColor = dark ? "#e5e7eb" : "white";
  const tableRowBorder = dark ? "1px solid #111827" : "1px solid #eee";
  const inputBg = dark ? "#020617" : "white";
  const inputBorder = dark ? "1px solid #1f2937" : "1px solid #ccc";
  const inputColor = dark ? "#e5e7eb" : "#111827";

  const primaryButtonStyle = {
    padding: "8px 18px",
    backgroundImage: dark
      ? "linear-gradient(135deg, #4f46e5, #06b6d4)"
      : "linear-gradient(135deg, #6366f1, #a855f7)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#ffffff",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    boxShadow: dark
      ? "0 8px 24px rgba(15,23,42,0.9)"
      : "0 8px 24px rgba(15,23,42,0.3)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    transition: "transform 0.1s ease, box-shadow 0.1s ease, background 0.3s ease",
  };

  const secondaryButtonStyle = {
    padding: "8px 18px",
    backgroundImage: dark
      ? "linear-gradient(135deg, #f97373, #ef4444)"
      : "linear-gradient(135deg, #f97373, #ef4444)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#ffffff",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    boxShadow: dark
      ? "0 8px 24px rgba(127,29,29,0.9)"
      : "0 8px 24px rgba(127,29,29,0.4)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    transition: "transform 0.1s ease, box-shadow 0.1s ease, background 0.3s ease",
  };

  const sectionCardStyle = {
    background: cardBg,
    padding: 20,
    borderRadius: 16,
    boxShadow: dark
      ? "0 18px 40px rgba(0,0,0,0.9)"
      : "0 10px 30px rgba(15,23,42,0.15)",
    marginBottom: 24,
    border: cardBorder,
    transition: "background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
  };

  const sectionTitleStyle = {
    marginTop: 0,
    marginBottom: 12,
    color: titleColor,
    background: titleBg,
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 600,
  };

  const baseInputStyle = {
    marginRight: 8,
    padding: "8px 10px",
    borderRadius: 8,
    border: inputBorder,
    minWidth: 220,
    fontSize: 14,
    backgroundColor: inputBg,
    color: inputColor,
    outline: "none",
    transition: "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease",
  };

  const inputCreate = (name, placeholder, width = 220) => (
    <input
      style={{
        ...baseInputStyle,
        width,
        marginBottom: 8,
      }}
      value={form[name]}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      placeholder={placeholder}
    />
  );

  const inputEdit = (name, placeholder, width = 220) => (
    <input
      style={{
        ...baseInputStyle,
        width,
        marginBottom: 8,
      }}
      value={edit[name]}
      onChange={(e) => setEdit({ ...edit, [name]: e.target.value })}
      placeholder={placeholder}
    />
  );

  const addr = person?.address || {};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bgColor,
        display: "flex",
        justifyContent: "center",
        paddingTop: 40,
        paddingBottom: 40,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: fgColor,
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      <div style={{ width: "90%", maxWidth: 900 }}>
        {/* TOP BAR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 24 }}>
            Person Registry
          </h1>
          <button
            onClick={() => setDark((d) => !d)}
            style={{
              ...primaryButtonStyle,
              padding: "6px 14px",
              fontSize: 13,
              backgroundImage: dark
                ? "linear-gradient(135deg, #0f172a, #1f2937)"
                : "linear-gradient(135deg, #e5e7eb, #cbd5f5)",
              color: dark ? "#e5e7eb" : "#111827",
              boxShadow: dark
                ? "0 4px 16px rgba(0,0,0,0.8)"
                : "0 4px 16px rgba(148,163,184,0.8)",
            }}
          >
            {dark ? "☀️ Light mode" : "🌙 Dark mode"}
          </button>
        </div>

        {/* ---- SEARCH BY CF + BY NAME ---- */}
        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>Search Person by Codice Fiscale</h2>
          <div style={{ marginBottom: 8 }}>
            <input
              value={cf}
              onChange={(e) => setCf(e.target.value)}
              placeholder="Enter CF"
              style={baseInputStyle}
            />
            <button
              onClick={handleSearch}
              style={primaryButtonStyle}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Search
            </button>
          </div>

          {msg && (
            <p
              style={{
                color: msg.includes("✔") ? "#22c55e" : dark ? "#f97373" : "#dc2626",
                marginTop: 8,
              }}
            >
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
              style={baseInputStyle}
            />
            <button
              onClick={handleSearchByName}
              style={primaryButtonStyle}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
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
                      style={{
                        cursor: "pointer",
                        textDecoration: "underline",
                        color: dark ? "#a5b4fc" : "#4f46e5",
                      }}
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
          <button
            onClick={handleLoadAll}
            style={primaryButtonStyle}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Load all persons
          </button>

          {allPersons.length > 0 && (
            <table
              style={{
                marginTop: 12,
                width: "100%",
                borderCollapse: "collapse",
                background: cardBg,
                borderRadius: 12,
                overflow: "hidden",
                fontSize: 14,
                transition: "background-color 0.3s ease",
              }}
            >
              <thead>
                <tr>
                  {["CF", "Name", "Surname", "City", "Province", "Country"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px",
                        background: tableHeaderBg,
                        color: tableHeaderColor,
                        fontWeight: 500,
                        textAlign: "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPersons.map((p, idx) => {
                  const a = p.address || {};
                  const rowBg =
                    dark && idx % 2 === 1
                      ? "#020617"
                      : dark
                      ? "#020617"
                      : idx % 2 === 0
                      ? "#ffffff"
                      : "#f9fafb";
                  return (
                    <tr
                      key={p.taxCode}
                      style={{
                        cursor: "pointer",
                        backgroundColor: rowBg,
                        transition: "background-color 0.2s ease",
                      }}
                      onClick={() => {
                        setPerson(p);
                        setCf(p.taxCode);
                        fillEditFromDto(p);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = dark
                          ? "#111827"
                          : "#e0e7ff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = rowBg;
                      }}
                    >
                      <td style={{ padding: "10px", borderBottom: tableRowBorder }}>
                        {p.taxCode}
                      </td>
                      <td style={{ padding: "10px", borderBottom: tableRowBorder }}>
                        {p.name}
                      </td>
                      <td style={{ padding: "10px", borderBottom: tableRowBorder }}>
                        {p.surname}
                      </td>
                      <td style={{ padding: "10px", borderBottom: tableRowBorder }}>
                        {a.city || ""}
                      </td>
                      <td style={{ padding: "10px", borderBottom: tableRowBorder }}>
                        {a.province || ""}
                      </td>
                      <td style={{ padding: "10px", borderBottom: tableRowBorder }}>
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
              <button
                onClick={handleUpdate}
                style={{ ...primaryButtonStyle, marginRight: 8 }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Update
              </button>
              <button
                onClick={handleDelete}
                style={secondaryButtonStyle}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
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
          <button
            onClick={handleCreate}
            style={{ ...primaryButtonStyle, marginTop: 8 }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
