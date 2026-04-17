import { useEffect, useState } from "react";
console.log(process.env.REACT_APP_API_URL);
function App() {
  const [tab, setTab] = useState("search");

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚙️ Assistente Técnico Industrial</h1>

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

        <button
          onClick={() => setTab("admin")}
          style={tab === "admin" ? styles.activeTab : styles.tab}
        >
          🔧 Admin
        </button>
      </div>

      {tab === "search" && <Search />}
      {tab === "create" && <Create />}
      {tab === "admin" && <Admin />}
    </div>
  );
}

// 🔎 ================= BUSCA =================
function Search() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);

  const handleSearch = async () => {
    if (!query) return;

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/search?q=${query}`,
      );
      const result = await res.json();
      setData(result);
    } catch (error) {
      alert("Erro ao buscar");
    }
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
          Buscar erro
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
                    src={`${process.env.REACT_APP_API_URL}${o.image}`}
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
    const loadData = async () => {
      try {
        const resMachines = await fetch(
          `${process.env.REACT_APP_API_URL}/machines`,
        );

        const machinesData = await resMachines.json();

        console.log("machines:", machinesData);

        setMachines(machinesData);

        const resErrors = await fetch(
          `${process.env.REACT_APP_API_URL}/errors`,
        );

        const errorsData = await resErrors.json();

        console.log("errors:", errorsData);

        setErrors(errorsData);
      } catch (error) {
        console.log(error);
        alert("Erro ao carregar dados");
      }
    };

    loadData();
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

    setMachineId("");
    setErrorTypeId("");
    setSolutionText("");
    setWorked(true);
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

function Admin() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState(null);

  const [machineCode, setMachineCode] = useState("");
  const [machineBrand, setMachineBrand] = useState("");

  const [errorName, setErrorName] = useState("");

  const loadDashboard = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/dashboard`,
        {
          headers: {
            adminpassword: password,
          },
        },
      );

      const result = await res.json();

      console.log("admin:", result);

      if (!result.success) {
        alert(result.message || "Senha inválida");
        return;
      }

      setData(result);
    } catch (error) {
      console.log(error);
      alert("Erro ao carregar painel");
    }
  };

  const createMachine = async () => {
    await fetch(`${process.env.REACT_APP_API_URL}/admin/machines`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        adminpassword: password,
      },
      body: JSON.stringify({
        code: machineCode,
        brand: machineBrand,
      }),
    });

    alert("Máquina cadastrada");
    setMachineCode("");
    setMachineBrand("");
    loadDashboard();
  };

  const createError = async () => {
    await fetch(`${process.env.REACT_APP_API_URL}/admin/errors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        adminpassword: password,
      },
      body: JSON.stringify({
        name: errorName,
      }),
    });

    alert("Erro cadastrado");
    setErrorName("");
    loadDashboard();
  };

  return (
    <div style={styles.card}>
      <h2 style={{ textAlign: "center" }}>🔐 Painel Administrativo</h2>

      <input
        placeholder="Senha admin"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />

      <button onClick={loadDashboard} style={styles.button}>
        Entrar no Painel
      </button>

      {data?.success && (
        <>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3>🏭</h3>
              <p>{data.data.machines}</p>
              <small>Máquinas</small>
            </div>

            <div style={styles.statCard}>
              <h3>⚠️</h3>
              <p>{data.data.errors}</p>
              <small>Erros</small>
            </div>

            <div style={styles.statCard}>
              <h3>📅</h3>
              <p>{data.data.occurrences}</p>
              <small>Ocorrências</small>
            </div>
          </div>

          <div style={styles.section}>
            <h3>🏭 Nova Máquina</h3>

            <input
              placeholder="Código"
              value={machineCode}
              onChange={(e) => setMachineCode(e.target.value)}
              style={styles.input}
            />

            <input
              placeholder="Marca"
              value={machineBrand}
              onChange={(e) => setMachineBrand(e.target.value)}
              style={styles.input}
            />

            <button onClick={createMachine} style={styles.button}>
              Salvar Máquina
            </button>
          </div>

          <div style={styles.section}>
            <h3>⚠️ Novo Erro</h3>

            <input
              placeholder="Nome do erro"
              value={errorName}
              onChange={(e) => setErrorName(e.target.value)}
              style={styles.input}
            />

            <button onClick={createError} style={styles.button}>
              Salvar Erro
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// 🎨 ESTILO
const styles = {
  container: {
    padding: 20,
    maxWidth: 600,
    margin: "auto",
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
    background: "#f1f4f9",
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    marginBottom: 20,
    color: "#1a1a1a",
  },
  tabs: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 12,
    border: "none",
    borderRadius: 10,
    background: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  activeTab: {
    flex: 1,
    padding: 12,
    border: "none",
    borderRadius: 10,
    background: "#007bff",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  searchBox: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
    fontSize: 15,
  },
  textarea: {
    padding: 12,
    minHeight: 80,
    borderRadius: 10,
    border: "1px solid #ddd",
    fontSize: 15,
  },
  button: {
    padding: 12,
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer",
  },
  card: {
    background: "#ffffff",
    padding: 18,
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginTop: 15,
    marginBottom: 20,
  },

  statCard: {
    background: "#ffffff",
    borderRadius: 14,
    padding: 15,
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  section: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};

export default App;
