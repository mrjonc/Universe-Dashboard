import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient.js";
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
      const { error } = await supabase
        .from("superstars")
        .update({ brand_id: newBrandId })
        .eq("id", wrestler.id);

      if (error) {
        console.log("Erro ao atualizar a brand do lutador", error.message);
        alert("Erro ao atualizar a brand.");
      } else {
        const newBrandObj = brands.find(
          (b) => String(b.id) === String(newBrandId),
        );

        if (onUpdateBrand) {
          onUpdateBrand(wrestler.id, newBrandId, newBrandObj);
        }
      }
    } catch (err) {
      console.error("Erro inesperado: ", err);
    } finally {
      setUpdating(false);
    }
  };

  const currentBrandId = wrestler.brand_id || wrestler.brands?.id || "";

  const handleDeleteWrestler = async (wrestlerId) => {
    if (!confirm("Tem certeza que deseja apagar este lutador?")) return;

    try {
      await supabase
        .from("tag_team_members")
        .delete()
        .eq("superstar_id", wrestlerId);

      const { error } = await supabase
        .from("superstars")
        .delete()
        .eq("id", wrestlerId);

      if (error) {
        alert("Erro ao excluir: " + error.message);
        console.error(error);
      } else {
        if (onDelete) onDelete(wrestlerId);
      }
    } catch (err) {
      console.error("Erro ao excluir lutador:", err);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={wrestler.image_url}
          alt={wrestler.name}
          className={styles.wrestlerImage}
        />
      </div>

      <div className={styles.infoContainer}>
        <h3 className={styles.wrestlerName}>{wrestler.name}</h3>

        <div className={styles.controlsContainer}>
          <div className={styles.actionsRow}>
            <select
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
              title="Editar"
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
              title="Excluir"
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
