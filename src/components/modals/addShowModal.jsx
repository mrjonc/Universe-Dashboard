import React from "react";
import styles from "./CalendarModal.module.css";

export default function AddShowModal({
  selectedDay,
  brands = [],
  newBrandId,
  setNewBrandId,
  newMatchesCount,
  setNewMatchesCount,
  onClose,
  onCreate,
}) {
  const handleCreate = (e) => {
    e.preventDefault();

    // Garante um ID válido caso o usuário não mexa no select
    const selectedBrandId = newBrandId || (brands[0] ? brands[0].id : null);

    if (!selectedBrandId) {
      alert("Selecione um evento válido!");
      return;
    }

    // Passa o objeto estruturado em vez do evento 'e'
    onCreate({
      brandId: selectedBrandId,
      matchesCount: Number(newMatchesCount) || 1,
      day: selectedDay,
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div
        className={styles.modalContent}
        style={{
          backgroundColor: "rgb(56, 53, 53)",
          color: "white",
        }}
      >
        <h3>Add a Show - Day {selectedDay}</h3>

        <label style={{ display: "block", marginBottom: "4px" }}>Event:</label>
        <select
          value={newBrandId || (brands[0] ? brands[0].id : "")}
          onChange={(e) => setNewBrandId(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "12px",
            backgroundColor: "#2a2a2a",
            color: "white",
            border: "1px solid #444",
            borderRadius: "4px",
          }}
        >
          {brands.map((b) => (
            <option key={b.id} value={b.id} style={{ color: "black" }}>
              {b.event_name || b.name || `Event ${b.id}`}
            </option>
          ))}
        </select>

        <div style={{ marginBottom: "16px" }}>
          <label>Number of Matches: </label>
          <input
            type="number"
            min="1"
            value={newMatchesCount}
            onChange={(e) => setNewMatchesCount(e.target.value)}
            style={{
              width: "60px",
              padding: "4px 8px",
              marginLeft: "8px",
              backgroundColor: "#2a2a2a",
              color: "white",
              border: "1px solid #444",
              borderRadius: "4px",
            }}
          />
        </div>

        <div className={styles.modalActions}>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" onClick={handleCreate}>
            Create a Show
          </button>
        </div>
      </div>
    </div>
  );
}
