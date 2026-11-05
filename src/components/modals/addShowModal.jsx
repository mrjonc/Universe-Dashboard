import styles from "./CalendarModal.module.css";
import AccessibleDialog from "./AccessibleDialog.jsx";

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
  const selectedBrandId = newBrandId || (brands[0] ? brands[0].id : null);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!selectedBrandId || Number(newMatchesCount) < 1) return;

    onCreate({
      brandId: selectedBrandId,
      matchesCount: Number(newMatchesCount),
      day: selectedDay,
    });
  };

  return (
    <AccessibleDialog
      overlayClassName={styles.modalOverlay}
      contentClassName={styles.modalContent}
      titleId="add-show-title"
      onClose={onClose}
    >
      <h3 id="add-show-title">Add a show — day {selectedDay}</h3>

      <form onSubmit={handleCreate}>
        <label htmlFor="show-event">Event:</label>
        <select
          id="show-event"
          value={selectedBrandId || ""}
          onChange={(e) => setNewBrandId(e.target.value)}
          required
          disabled={brands.length === 0}
        >
          {brands.length === 0 && (
            <option value="">No events available</option>
          )}
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.event_name || b.name || `Event ${b.id}`}
            </option>
          ))}
        </select>

        <label htmlFor="show-matches">Number of matches:</label>
        <input
          id="show-matches"
          type="number"
          min="1"
          step="1"
          required
          value={newMatchesCount}
          onChange={(e) => setNewMatchesCount(e.target.value)}
        />

        <div className={styles.modalActions}>
          <button type="button" onClick={onClose} className={styles.btnCancel}>
            Cancel
          </button>
          <button type="submit" disabled={!selectedBrandId}>
            Create show
          </button>
        </div>
      </form>
    </AccessibleDialog>
  );
}
