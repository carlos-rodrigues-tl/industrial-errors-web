import { useEffect, useState } from "react";

function App() {
  const [tab, setTab] = useState("search");

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔧 Assistente Técnico</h1>

      {/* MENU */}
      <div style={styles.tabs}>
        <button
          onClick={() => setTab("search")}
          style={tab === "search" ? styles.activeTab : styles.tab}
        >
          🔎 Buscar
        </button>

        <button
          onClick={() => setTab("create")}
          style={tab === "create" ? styles.activeTab : styles.tab}
        >
          ➕ Registrar
        </button>
      </div>

      {tab === "search" ? <Search /> : <Create />}
    </div>
  );
}

// 🔎 ================= BUSCA =================
function Search() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);

  const handleSearch = async () => {
    if (!query) return;

    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/search?q=${query}`,
    );
    const result = await res.json();

    setData(result);
  };

  return (
    <div>
      <div style={styles.searchBox}>
        <input
          placeholder="Ex: let off 2301"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={styles.input}
        />

        <button onClick={handleSearch} style={styles.button}>
          Buscar
        </button>
      </div>

      {data && (
        <div style={styles.card}>
          <h2>⚠️ {data.error?.name}</h2>

          {data.machine && (
            <p>
              🏭 {data.machine.code} ({data.machine.brand})
            </p>
          )}

          {data.bestSolution && (
            <div
              style={{
                background: "#d4edda",
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              ⭐ Melhor solução: <strong>{data.bestSolution.text}</strong>
              <br />
              📊 Taxa de sucesso: {data.bestSolution.rate}%
            </div>
          )}

          {/* SOLUÇÕES */}
          <h3>🔧 Soluções</h3>
          <ul>
            {data.solutions?.map((s) => (
              <li key={s.id}>{s.description}</li>
            ))}
          </ul>

          {/* HISTÓRICO */}
          <h3>📅 Histórico</h3>
          <ul>
            {data.occurrences?.map((o) => (
              <li key={o.id} style={{ marginBottom: 10 }}>
                <div>
                  {new Date(o.date).toLocaleDateString()} - {o.solutionText}
                  {o.worked ? " ✅" : " ❌"}
                </div>

                {o.image && (
                  <img
                    src={`${process.env.REACT_APP_API_URL}/${o.image}`}
                    alt="ocorrência"
                    style={{
                      width: "100%",
                      maxWidth: 250,
                      marginTop: 5,
                      borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ➕ ================= CADASTRO =================
function Create() {
  const [machines, setMachines] = useState([]);
  const [errors, setErrors] = useState([]);

  const [machineId, setMachineId] = useState("");
  const [errorTypeId, setErrorTypeId] = useState("");
  const [solutionText, setSolutionText] = useState("");
  const [worked, setWorked] = useState(true);
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/machines`)
      .then((res) => res.json())
      .then(setMachines);

    fetch(`${process.env.REACT_APP_API_URL}/errors`)
      .then((res) => res.json())
      .then(setErrors);
  }, []);

  const handleSubmit = async () => {
    if (!machineId || !errorTypeId) {
      alert("Preencha máquina e erro");
      return;
    }

    const res = await fetch(`${process.env.REACT_APP_API_URL}/occurrences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        machineId,
        errorTypeId,
        solutionText,
        worked,
        notes,
      }),
    });

    const data = await res.json();

    if (image) {
      const formData = new FormData();
      formData.append("image", image);

      await fetch(`${process.env.REACT_APP_API_URL}/uploads-api/${data.id}`, {
        method: "POST",
        body: formData,
      });
    }

    alert("Salvo ✅");

    setSolutionText("");
    setNotes("");
    setImage(null);
  };

  return (
    <div style={styles.card}>
      <select
        value={machineId}
        onChange={(e) => setMachineId(e.target.value)}
        style={styles.input}
      >
        <option value="">Máquina</option>
        {machines.map((m) => (
          <option key={m.id} value={m.id}>
            {m.code} - {m.brand}
          </option>
        ))}
      </select>

      <select
        value={errorTypeId}
        onChange={(e) => setErrorTypeId(e.target.value)}
        style={styles.input}
      >
        <option value="">Erro</option>
        {errors.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>

      <textarea
        placeholder="O que fez..."
        value={solutionText}
        onChange={(e) => setSolutionText(e.target.value)}
        style={styles.textarea}
      />

      <select
        value={worked}
        onChange={(e) => setWorked(e.target.value === "true")}
        style={styles.input}
      >
        <option value="true">Funcionou</option>
        <option value="false">Não funcionou</option>
      </select>

      <textarea
        placeholder="Observações"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={styles.textarea}
      />

      <input type="file" onChange={(e) => setImage(e.target.files[0])} />

      <button onClick={handleSubmit} style={styles.button}>
        Salvar
      </button>
    </div>
  );
}

// 🎨 ESTILO
const styles = {
  container: {
    padding: 20,
    maxWidth: 600,
    margin: "auto",
    fontFamily: "Arial",
  },
  title: {
    textAlign: "center",
  },
  tabs: {
    display: "flex",
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 10,
  },
  activeTab: {
    flex: 1,
    padding: 10,
    background: "#007bff",
    color: "#fff",
  },
  searchBox: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 10,
  },
  textarea: {
    padding: 10,
    minHeight: 70,
  },
  button: {
    padding: 10,
    background: "#007bff",
    color: "#fff",
    border: "none",
  },
  card: {
    background: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};

export default App;
