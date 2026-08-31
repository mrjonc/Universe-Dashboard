import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import styles from "./changeTheChampionModal.module.css";

function EditChampionModal({ title, onClose, onSuccess }) {
  const { user } = useAuth();
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
    if (!selectedChampionId || !title || !user) return;

    setSaving(true);
    const isTag = title.champion_type === "tagteam";

    // Prepara os dados que serão salvos na tabela isolada do usuário
    const upsertPayload = {
      user_id: user.id,
      championship_id: title.id,
      champion_id: isTag ? null : selectedChampionId,
      tag_champion_id: isTag ? selectedChampionId : null,
    };

    // Salva na tabela user_championships usando upsert (insere se não existir, atualiza se já existir)
    const { error } = await supabase
      .from("user_championships")
      .upsert(upsertPayload, { onConflict: "user_id, championship_id" });

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
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Trocar Campeão</h3>
        <p className={styles.subtitle}>{title.title_name}</p>

        {loadingOptions ? (
          <p>Carregando opções...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className={styles.label}>Select the new champion:</label>

            <select
              value={selectedChampionId}
              onChange={(e) => setSelectedChampionId(e.target.value)}
              required
              className={styles.selectInput}
            >
              <option value="">-- Select the wrestler --</option>
              {optionsList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <div className={styles.actionsContainer}>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={styles.submitButton}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditChampionModal;
