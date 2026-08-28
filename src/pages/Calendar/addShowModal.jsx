import React from "react";
import styles from "./calendar.module.css";

export default function AddShowModal({
  selectedDay,
  brands,
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

        <label>Brand:</label>
        <select
          value={newBrandId}
          onChange={(e) => setNewBrandId(e.target.value)}
          style={{ width: "100px" }}
        >
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <label>Number of Matches:</label>
        <input
          type="number"
          min="1"
          value={newMatchesCount}
          onChange={(e) => setNewMatchesCount(e.target.value)}
          style={{ width: "35px" }}
        />

        <div className={styles.modalActions}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onCreate}>Create a Show</button>
        </div>
      </div>
    </div>
  );
}
