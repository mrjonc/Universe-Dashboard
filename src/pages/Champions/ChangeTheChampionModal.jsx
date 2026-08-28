import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient.js";

function EditChampionModal({ title, onClose, onSuccess }) {
  const [selectedChampionId, setSelectedChampionId] = useState("");
  const [optionsList, setOptionsList] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchOptions() {
      if (!title) return;

      const isTag = title.champion_type === "tagteam";
      const tableToFetch = isTag ? "tag_teams" : "superstars";

      const { data, error } = await supabase
        .from(tableToFetch)
        .select("id, name");

      if (error) {
        console.error("Erro ao carregar opções:", error.message);
      } else {
        setOptionsList(data || []);
      }
      setLoadingOptions(false);
    }

    fetchOptions();
  }, [title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChampionId || !title) return;

    setSaving(true);
    const isTag = title.champion_type === "tagteam";

    const updatePayload = {
      champion_id: isTag ? null : selectedChampionId,
      tag_champion_id: isTag ? selectedChampionId : null,
    };

    const { error } = await supabase
      .from("championships")
      .update(updatePayload)
      .eq("id", title.id);

    setSaving(false);

    if (error) {
      console.error("Erro ao trocar campeão:", error.message);
      alert("Erro ao atualizar o campeão.");
    } else {
      onSuccess();
      onClose();
    }
  };

  if (!title) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#222",
          padding: "2rem",
          borderRadius: "8px",
          width: "320px",
          color: "#fff",
        }}
      >
        <h3>Trocar Campeão</h3>
        <p style={{ fontSize: "0.9rem", color: "#aaa", marginBottom: "1rem" }}>
          {title.title_name}
        </p>

        {loadingOptions ? (
          <p>Carregando opções...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.85rem",
              }}
            >
              Selecione o novo campeão:
            </label>

            <select
              value={selectedChampionId}
              onChange={(e) => setSelectedChampionId(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                marginBottom: "1.5rem",
                background: "#333",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "4px",
              }}
            >
              <option value="">-- Selecione --</option>
              {optionsList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                style={{
                  padding: "0.5rem 1rem",
                  background: "transparent",
                  color: "#ccc",
                  border: "1px solid #555",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditChampionModal;
