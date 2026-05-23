function App() {
  return (
    <div
      style={{
        fontFamily: "Arial",
        background: "#f4f7fb",
        minHeight: "100vh",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          color: "#1e3a8a",
          fontSize: "48px",
          marginBottom: "20px",
        }}
      >
        AI Insurance Advisor
      </h1>

      <p
        style={{
          fontSize: "20px",
          color: "#444",
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        Compare LIC policies, calculate premiums,
        and get smart AI-powered insurance advice.
      </p>

      <button
        style={{
          marginTop: "30px",
          padding: "15px 30px",
          fontSize: "18px",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          background: "#2563eb",
          color: "white",
        }}
      >
        Get Started
      </button>
    </div>
  )
}

export default App
