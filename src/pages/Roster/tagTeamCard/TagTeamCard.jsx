import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient.js";
import { RiDeleteBin2Line, RiEditLine } from "react-icons/ri";
import styles from "./tagTeamCard.module.css";

export default function TagTeamCard({
  team,
  brands = [],
  onUpdateBrand,
  onDeleteTeam,
  onEditTeam,
}) {
  const [updatingTeam, setUpdatingTeam] = useState(false);

  const handleBrandChangeTeam = async (e) => {
    const newBrandTeamId = e.target.value === "" ? null : e.target.value;
    setUpdatingTeam(true);

    try {
      const { error } = await supabase
        .from("tag_teams")
        .update({ brand_id: newBrandTeamId })
        .eq("id", team.id);

      if (error) {
        console.log("Erro ao atualizar a brand da tag/stable", error.message);
        alert("Erro ao atualizar a brand");
      } else {
        const newBrandTeamObj = brands.find(
          (b) => String(b.id) === String(newBrandTeamId),
        );

        if (onUpdateBrand) {
          onUpdateBrand(team.id, newBrandTeamId, newBrandTeamObj);
        }
      }
    } catch (err) {
      console.error("Erro inesperado: ", err);
    } finally {
      setUpdatingTeam(false);
    }
  };

  const currentBrandObj = team.brand || team.brands;
  const currentBrandTeamId = team.brand_id || currentBrandObj?.id || "";
  const members = team.members || [];

  const handleDeleteTeam = async (teamId) => {
    if (!confirm("Tem certeza que deseja apagar esta tag/stable?")) return;

    const { error } = await supabase
      .from("tag_teams")
      .delete()
      .eq("id", teamId);

    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else if (onDeleteTeam) {
      onDeleteTeam(teamId);
    }
  };

  const getGridClass = () => {
    if (members.length === 1) return styles.gridSingle;
    if (members.length === 2) return styles.gridDouble;
    return styles.gridMultiple;
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {team.image_url ? (
          <img
            src={team.image_url}
            alt={team.name}
            className={styles.teamImage}
          />
        ) : members.length > 0 ? (
          <div className={`${styles.membersGrid} ${getGridClass()}`}>
            {members.slice(0, 4).map((member, index) => (
              <div
                key={member.id || index}
                title={member.name}
                className={styles.memberCell}
              >
                {member.image_url ? (
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className={styles.teamImage}
                  />
                ) : (
                  <div className={styles.naPlaceholder}>N/A</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span className={styles.noImageText}>Sem Imagem</span>
        )}
      </div>

      <h3 className={styles.teamName}>{team.name}</h3>

      <div className={styles.controlsContainer}>
        <div className={styles.actionsRow}>
          <select
            value={currentBrandTeamId}
            onChange={handleBrandChangeTeam}
            disabled={updatingTeam}
            className={styles.selectBrand}
          >
            <option value="">-- Free Agent --</option>
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
            onClick={() => onEditTeam && onEditTeam(team)}
          >
            <RiEditLine />
          </button>

          <button
            type="button"
            title="Excluir"
            className={styles.deleteButton}
            onClick={() => handleDeleteTeam(team.id)}
          >
            <RiDeleteBin2Line />
          </button>
        </div>
      </div>
    </div>
  );
}
