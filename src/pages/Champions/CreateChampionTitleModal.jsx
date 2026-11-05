import { useState } from "react";
import AccessibleDialog from "../../components/modals/AccessibleDialog.jsx";
import styles from "./champion.module.css";

export default function CreateChampionTitleModal({
  brands,
  brandId,
  onClose,
  onCreate,
}) {
  const [titleName, setTitleName] = useState("");
  const [championType, setChampionType] = useState("singles");
  const [imageUrl, setImageUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    const trimmedTitleName = titleName.trim();
    if (!trimmedTitleName) {
      setErrorMessage("Enter a title name.");
      return;
    }

    setSaving(true);
    try {
      await onCreate({
        title_name: trimmedTitleName,
        champion_type: championType,
        image_url: imageUrl.trim() || null,
        brand_id: Number(brandId),
      });
      onClose();
    } catch (error) {
      console.error("Failed to create championship:", error);
      setErrorMessage("Could not create this title. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccessibleDialog
      overlayClassName={styles.titleModalOverlay}
      contentClassName={styles.titleModal}
      titleId="create-title-heading"
      onClose={onClose}
    >
      <h2 id="create-title-heading">Create championship title</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="championship-title-name">Title name</label>
        <input
          id="championship-title-name"
          value={titleName}
          onChange={(event) => setTitleName(event.target.value)}
          required
          maxLength={120}
        />

        <label htmlFor="championship-title-brand">Brand</label>
        <select id="championship-title-brand" value={brandId} disabled>
          {brands
            .filter((brand) => String(brand.id) === String(brandId))
            .map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
        </select>

        <label htmlFor="championship-title-type">Title type</label>
        <select
          id="championship-title-type"
          value={championType}
          onChange={(event) => setChampionType(event.target.value)}
        >
          <option value="singles">Singles</option>
          <option value="tagteam">Tag team</option>
        </select>

        <label htmlFor="championship-title-image">Image URL (optional)</label>
        <input
          id="championship-title-image"
          type="url"
          inputMode="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
        />

        {errorMessage && <p role="alert">{errorMessage}</p>}
        <div className={styles.titleModalActions}>
          <button type="button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" disabled={saving || !brands.length}>
            {saving ? "Creating..." : "Create title"}
          </button>
        </div>
      </form>
    </AccessibleDialog>
  );
}
