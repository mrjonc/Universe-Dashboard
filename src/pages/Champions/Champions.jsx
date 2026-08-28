import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import ChangeTheChampionModal from "./ChangeTheChampionModal.jsx";
import LoadingSpinner from "../../components/animations/LoadingSpinner.jsx";

function Champions() {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTitleToEdit, setSelectedTitleToEdit] = useState(null);

  const fetchChampions = async () => {
    try {
      const { data, error } = await supabase.from("championships").select(`
          *,
          champion:superstars(id, name, image_url),
          tag_champion:tag_teams(id, name, image_url),
          brand:brands(id, name, image_url)
        `);

      if (error) {
        console.error("Erro ao buscar campeões:", error.message);
      } else {
        setTitles(data || []);
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChampions();
  }, []);

  const handleVacateTitle = async (titleId) => {
    const { error } = await supabase
      .from("championships")
      .update({ champion_id: null, tag_champion_id: null })
      .eq("id", titleId);

    if (error) {
      console.error("Erro ao deixar o título vago", error.message);
      return;
    }
    fetchChampions();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          color: "#d7182a",
        }}
      >
        CHAMPIONS
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {titles.map((title) => {
          const isTag = title.champion_type === "tagteam";
          const currentChampion = isTag ? title.tag_champion : title.champion;

          return (
            <div
              key={title.id}
              style={{
                border: "1px solid #f0e9e9",
                borderRadius: "8px",
                padding: "1rem",
                textAlign: "center",
                color: "white",
                backgroundColor: "rgb(19, 13, 13)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "380px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    height: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  {title.image_url && (
                    <img
                      src={title.image_url}
                      alt={title.title_name}
                      style={{
                        height: "80px",
                        width: "140px",
                        objectFit: "contain",
                      }}
                    />
                  )}
                </div>

                <div>
                  <h3
                    style={{
                      textTransform: "uppercase",
                      fontSize: "1rem",
                      margin: "0.5rem 0",
                    }}
                  >
                    {title.title_name}
                  </h3>

                  {title.brand && (
                    <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                      <img
                        src={title.brand.image_url}
                        alt={title.brand.name}
                        style={{
                          width: "50px",
                          height: "30px",
                          objectFit: "contain",
                        }}
                      />
                    </span>
                  )}
                </div>

                <hr
                  style={{
                    margin: "0.8rem 0",
                    borderColor: "#444",
                    width: "100%",
                  }}
                />

                <div
                  style={{
                    minHeight: "100px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {currentChampion ? (
                    <>
                      {currentChampion.image_url && (
                        <img
                          src={currentChampion.image_url}
                          alt={currentChampion.name}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            marginBottom: "0.5rem",
                          }}
                        />
                      )}
                      <p
                        style={{
                          fontWeight: "bold",
                          margin: 0,
                          textTransform: "uppercase",
                        }}
                      >
                        {currentChampion.name}
                      </p>
                    </>
                  ) : (
                    <p
                      style={{ fontStyle: "italic", color: "#888", margin: 0 }}
                    >
                      Título Vago
                    </p>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginTop: "1rem",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => setSelectedTitleToEdit(title)}
                  style={{
                    padding: "0.5rem",
                    backgroundColor: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                  }}
                >
                  Change The Champion
                </button>

                <button
                  onClick={() => handleVacateTitle(title.id)}
                  style={{
                    padding: "0.5rem",
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                  }}
                >
                  Vacate Title
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedTitleToEdit && (
        <ChangeTheChampionModal
          title={selectedTitleToEdit}
          onClose={() => setSelectedTitleToEdit(null)}
          onSuccess={fetchChampions}
        />
      )}
    </div>
  );
}

export default Champions;
