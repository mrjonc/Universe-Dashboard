import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { RiDeleteBin2Line, RiEditLine } from "react-icons/ri";

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

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "1rem",
        width: "240px",
        height: "300px",
        backgroundColor: "rgb(19, 13, 13)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: "0.5rem",
        alignItems: "center",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "150px",
          borderRadius: "6px",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1e1e1e",
          flexShrink: 0,
        }}
      >
        {team.image_url ? (
          <img
            src={team.image_url}
            alt={team.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : members.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: members.length === 1 ? "1fr" : "1fr 1fr",
              gridAutoRows: members.length > 2 ? "1fr" : "100%",
              width: "100%",
              height: "100%",
              gap: "2px",
            }}
          >
            {members.slice(0, 4).map((member, index) => (
              <div
                key={member.id || index}
                title={member.name}
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#2a2a2a",
                  overflow: "hidden",
                }}
              >
                {member.image_url ? (
                  <img
                    src={member.image_url}
                    alt={member.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      color: "#aaa",
                    }}
                  >
                    N/A
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span style={{ color: "#aaa", fontSize: "0.85rem" }}>Sem Imagem</span>
        )}
      </div>

      <h3
        style={{
          textTransform: "uppercase",
          margin: "0.25rem 0 0 0",
          textAlign: "center",
          fontSize: "1rem",
          color: "#fff",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "100%",
        }}
      >
        {team.name}
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          gap: "0.25rem",
        }}
      >
        <div
          style={{
            height: "35px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {currentBrandObj?.image_url && (
            <img
              src={currentBrandObj.image_url}
              alt={currentBrandObj.name || "Brand"}
              style={{
                maxHeight: "35px",
                maxWidth: "35px",
                objectFit: "contain",
              }}
            />
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.4rem",
            width: "100%",
            alignItems: "center",
          }}
        >
          <select
            value={currentBrandTeamId}
            onChange={handleBrandChangeTeam}
            disabled={updatingTeam}
            style={{
              padding: "0.4rem",
              borderRadius: "4px",
              border: "1px solid #444",
              fontSize: "0.85rem",
              backgroundColor: "#2a2a2a",
              color: "#fff",
              cursor: "pointer",
              flex: 1,
              textAlign: "center",
            }}
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
            style={{
              padding: "0.4rem 0.5rem",
              fontSize: "1rem",
              cursor: "pointer",
              backgroundColor: "#2563eb",
              borderRadius: "4px",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => onEditTeam && onEditTeam(team)}
          >
            <RiEditLine />
          </button>

          <button
            type="button"
            title="Excluir"
            style={{
              padding: "0.4rem 0.5rem",
              fontSize: "1rem",
              cursor: "pointer",
              backgroundColor: "#d7182a",
              borderRadius: "4px",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => handleDeleteTeam(team.id)}
          >
            <RiDeleteBin2Line />
          </button>
        </div>
      </div>
    </div>
  );
}
