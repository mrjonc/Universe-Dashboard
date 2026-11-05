import { useState } from "react";
import { RiDeleteBin2Line, RiEditLine } from "react-icons/ri";
import styles from "./wrestlerCard.module.css";

export default function WrestlerCard({
  wrestler,
  brands = [],
  onUpdateBrand,
  onDelete,
  onEdit,
}) {
  const [updating, setUpdating] = useState(false);

  const handleBrandChange = async (e) => {
    const newBrandId = e.target.value === "" ? null : e.target.value;
    setUpdating(true);

    try {
      const newBrandObj = brands.find(
        (b) => String(b.id) === String(newBrandId),
      );
      await onUpdateBrand(wrestler.id, newBrandId, newBrandObj);
    } catch (err) {
      console.error("Failed to update wrestler brand:", err);
      alert("Could not update wrestler's brand.");
    } finally {
      setUpdating(false);
    }
  };

  const currentBrandId = wrestler.brand_id || wrestler.brands?.id || "";

  const handleDeleteWrestler = async (wrestlerRecordId) => {
    if (!window.confirm(`Delete ${wrestler.name} from your roster?`))
      return;

    try {
      await onDelete(wrestlerRecordId);
    } catch (err) {
      console.error("Failed to delete wrestler:", err);
      alert("Could not delete wrestler.");
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={wrestler.image_url}
          alt={wrestler.image_url ? wrestler.name : ""}
          className={styles.wrestlerImage}
        />
      </div>

      <div className={styles.infoContainer}>
        <h3 className={styles.wrestlerName}>{wrestler.name}</h3>

        <div className={styles.controlsContainer}>
          <div className={styles.actionsRow}>
            <select
              aria-label={`Brand for ${wrestler.name}`}
              value={currentBrandId}
              onChange={handleBrandChange}
              disabled={updating}
              className={styles.selectBrand}
            >
              <option value=""> -- Free Agent --</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              title="Edit"
              aria-label={`Edit ${wrestler.name}`}
              className={styles.editButton}
              onClick={() => {
                if (onEdit) {
                  onEdit(wrestler);
                }
              }}
            >
              <RiEditLine />
            </button>

            <button
              type="button"
              title="Delete"
              aria-label={`Delete ${wrestler.name}`}
              className={styles.deleteButton}
              onClick={() => handleDeleteWrestler(wrestler.id)}
            >
              <RiDeleteBin2Line />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
