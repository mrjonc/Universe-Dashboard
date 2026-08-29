import React from "react";
import styles from "./calendar.module.css";

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

        <label>Event:</label>
        <select
          value={newBrandId}
          onChange={(e) => setNewBrandId(e.target.value)}
          style={{
            width: "100%",
            padding: "6px",
            marginBottom: "10px",
            backgroundColor: "#2a2a2a",
            color: "white",
            border: "1px solid #444",
          }}
        >
          {brands.map((b) => (
            <option key={b.id} value={b.id} style={{ color: "black" }}>
              {b.event_name || b.name || `Event ${b.id}`}
            </option>
          ))}
        </select>

        <label>Number of Matches:</label>
        <input
          type="number"
          min="1"
          value={newMatchesCount}
          onChange={(e) => setNewMatchesCount(e.target.value)}
          style={{ width: "50px", marginLeft: "8px" }}
        />

        <div className={styles.modalActions}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onCreate}>Create a Show</button>
        </div>
      </div>
    </div>
  );
}
