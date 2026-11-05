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
        console.error("Failed to update tag team brand:", error.message);
        alert("Could not update tag team's brand.");
      } else {
        const newBrandTeamObj = brands.find(
          (b) => String(b.id) === String(newBrandTeamId),
        );

        if (onUpdateBrand) {
          onUpdateBrand(team.id, newBrandTeamId, newBrandTeamObj);
        }
      }
    } catch (err) {
      console.error("Unexpected tag team error:", err);
      alert("Could not update tag team's brand.");
    } finally {
      setUpdatingTeam(false);
    }
  };

  const currentBrandObj = team.brand || team.brands;
  const currentBrandTeamId = team.brand_id || currentBrandObj?.id || "";
  const members = team.members || [];

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm(`Delete ${team.name}?`)) return;

    try {
      const { error } = await supabase
        .from("tag_teams")
        .delete()
        .eq("id", teamId);

      if (error) throw error;
      if (onDeleteTeam) onDeleteTeam(teamId);
    } catch (error) {
      console.error("Failed to delete tag team:", error);
      alert("Could not delete tag team.");
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
          <span className={styles.noImageText}>No image</span>
        )}
      </div>

      <h3 className={styles.teamName}>{team.name}</h3>

      <div className={styles.controlsContainer}>
        <div className={styles.actionsRow}>
          <select
            aria-label={`Brand for ${team.name}`}
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
            title="Edit"
            aria-label={`Edit ${team.name}`}
            className={styles.editButton}
            onClick={() => onEditTeam && onEditTeam(team)}
          >
            <RiEditLine />
          </button>

          <button
            type="button"
            title="Delete"
            aria-label={`Delete ${team.name}`}
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
