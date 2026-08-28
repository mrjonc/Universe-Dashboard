import { useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import { RiDeleteBin2Line, RiEditLine } from "react-icons/ri";

function WrestlerCard({
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
    <div
      style={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "1rem",
        width: "220px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: "rgb(19, 13, 13)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "180px",
          height: "200px",
          overflow: "hidden",
          borderRadius: "6px",
          marginBottom: "1rem",
        }}
      >
        <img
          src={wrestler.image_url}
          alt={wrestler.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            textTransform: "uppercase",
            margin: 0,
            fontSize: "1rem",
            wordBreak: "break-word",
          }}
        >
          {wrestler.name}
        </h3>

        <div
          style={{
            marginTop: "0.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              width: "100%",
              alignItems: "center",
            }}
          >
            <select
              value={currentBrandId}
              onChange={handleBrandChange}
              disabled={updating}
              style={{
                padding: "0.3rem 0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "0.85rem",
                backgroundColor: "#f9f9f9",
                cursor: "pointer",
                flex: 1,
                textAlign: "center",
              }}
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
              onClick={() => {
                if (onEdit) {
                  onEdit(wrestler);
                }
              }}
            >
              <RiEditLine />
            </button>

            <button
              onClick={() => handleDeleteWrestler(wrestler.id)}
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
            >
              <RiDeleteBin2Line />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WrestlerCard;
