import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient.js";
import { useAuth } from "../../../context/useAuth.js";
import styles from "./changeTheChampionModal.module.css";
import AccessibleDialog from "../../../components/modals/AccessibleDialog.jsx";

function EditChampionModal({ title, onClose, onSuccess }) {
  const { user } = useAuth();
  const [selectedChampionId, setSelectedChampionId] = useState("");
  const [optionsList, setOptionsList] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchOptions() {
      if (!title) {
        setLoadingOptions(false);
        return;
      }

      try {
        setLoadingOptions(true);
        setErrorMessage("");
        const isTag = title.champion_type === "tagteam";
        const tableToFetch = isTag ? "tag_teams" : "superstars";

        const { data, error } = await supabase
          .from(tableToFetch)
          .select("id, name");

        if (error) throw error;
        setOptionsList(data || []);
      } catch (error) {
        console.error("Failed to load champion options:", error.message);
        setErrorMessage("Could not load champion options.");
      } finally {
        setLoadingOptions(false);
      }
    }

    fetchOptions();
  }, [title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChampionId || !title || !user) return;

    setSaving(true);
    setErrorMessage("");
    try {
      const isTag = title.champion_type === "tagteam";
      const upsertPayload = {
        user_id: user.id,
        championship_id: title.id,
        champion_id: isTag ? null : selectedChampionId,
        tag_champion_id: isTag ? selectedChampionId : null,
      };

      const { error } = await supabase
        .from("user_championships")
        .upsert(upsertPayload, { onConflict: "user_id, championship_id" });
      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to change champion:", error);
      setErrorMessage("Could not update the champion.");
    } finally {
      setSaving(false);
    }
  };

  if (!title) return null;

  return (
    <AccessibleDialog
      overlayClassName={styles.modalOverlay}
      contentClassName={styles.modalContent}
      titleId="change-champion-title"
      onClose={onClose}
    >
        <h3 id="change-champion-title">Change champion</h3>
        <p className={styles.subtitle}>{title.title_name}</p>

        {errorMessage && <p role="alert">{errorMessage}</p>}
        {loadingOptions ? (
          <p>Loading options...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className={styles.label} htmlFor="new-champion">
              Select the new champion:
            </label>

            <select
              id="new-champion"
              value={selectedChampionId}
              onChange={(e) => setSelectedChampionId(e.target.value)}
              required
              className={styles.selectInput}
            >
              <option value="">-- Select a champion --</option>
              {optionsList
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item) => (
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
                disabled={saving || !optionsList.length}
                className={styles.submitButton}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
    </AccessibleDialog>
  );
}

export default EditChampionModal;
