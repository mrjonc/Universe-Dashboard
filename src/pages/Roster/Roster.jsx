import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";

export default function Roster() {
  const [wrestlers, setWrestlers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoster() {
      const { data, error } = await supabase
        .from("superstars")
        .select(`*, brands (name, image_url)`);

      if (error) {
        console.error("Erro ao buscar roster: ", error.message);
      } else {
        setWrestlers(data);
      }
      setLoading(false);
    }

    fetchRoster();
  }, []);

  if (loading) return <p>Carregando roster...</p>;

  if (wrestlers.length === 0) {
    return <p>Nenhum lutador cadastrado ainda.</p>;
  }

  return (
    <div style={{ padding: "2rem", width: "100%", boxSizing: "border-box" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>ROSTER</h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {wrestlers.map((wrestler) => (
          <div
            key={wrestler.id}
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              width: "220px",
              minWidth: "220px",
              maxWidth: "220px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#fff",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "180px",
                height: "200px",
                overflow: "hidden",
                borderRadius: "6px",
                marginBottom: "1rem",
                display: "block",
                position: "relative",
              }}
            >
              <img
                src={wrestler.image_url}
                alt={wrestler.name}
                style={{
                  width: "100%",
                  height: "100%",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  textTransform: "uppercase",
                  margin: 0,
                  fontSize: "1rem",
                  wordBreak: "break-word",
                  width: "100%",
                }}
              >
                {wrestler.name}
              </h3>

              {wrestler.brands?.image_url ? (
                <img
                  src={wrestler.brands.image_url}
                  alt={wrestler.brands.name || "Brand"}
                  style={{
                    width: "40px",
                    height: "40px",
                    maxWidth: "40px",
                    maxHeight: "40px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              ) : (
                <span style={{ fontSize: "0.85rem", color: "#666" }}>
                  Free Agent
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
