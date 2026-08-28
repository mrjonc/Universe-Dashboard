import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient.js";

export default function CreateWrestlerOrTagModal({
  brands = [],
  wrestlers = [],
  itemToEdit = null,
  onClose,
  onSuccess,
}) {
  const isEditing = Boolean(itemToEdit);

  const [type, setType] = useState("wrestler");
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [brandId, setBrandId] = useState("");
  const [selectedMembers, setSelectedMembers] = useState(["", ""]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setType(itemToEdit.type);
      setName(itemToEdit.data.name || "");
      setImageUrl(itemToEdit.data.image_url || "");
      setBrandId(itemToEdit.data.brand_id || itemToEdit.data.brand?.id || "");

      if (itemToEdit.type === "tagteam") {
        const memberIds = itemToEdit.data.members?.map((m) => m.id) || [];
        setSelectedMembers(memberIds.length > 0 ? memberIds : ["", ""]);
      }
    } else {
      setName("");
      setImageUrl("");
      setBrandId("");
      setSelectedMembers(["", ""]);
    }
  }, [itemToEdit]);

  const handleMemberChange = (index, value) => {
    const updated = [...selectedMembers];
    updated[index] = value;
    setSelectedMembers(updated);
  };

  const handleAddMemberSlot = () => {
    setSelectedMembers([...selectedMembers, ""]);
  };

  const handleRemoveMemberSlot = (index) => {
    if (selectedMembers.length <= 1) return;
    const updated = selectedMembers.filter((_, i) => i !== index);
    setSelectedMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === "wrestler") {
        const payload = {
          name,
          image_url: imageUrl || null,
          brand_id: brandId || null,
        };

        if (isEditing) {
          const { error } = await supabase
            .from("superstars")
            .update(payload)
            .eq("id", itemToEdit.data.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("superstars").insert([payload]);
          if (error) throw error;
        }
      } else {
        const teamPayload = {
          name,
          image_url: imageUrl || null,
          brand_id: brandId || null,
        };

        let teamId = itemToEdit?.data?.id;

        if (isEditing) {
          const { error } = await supabase
            .from("tag_teams")
            .update(teamPayload)
            .eq("id", teamId);
          if (error) throw error;

          const { error: deleteMembersError } = await supabase
            .from("tag_team_members")
            .delete()
            .eq("tag_team_id", teamId);
          if (deleteMembersError) throw deleteMembersError;
        } else {
          const { data: newTeam, error } = await supabase
            .from("tag_teams")
            .insert([teamPayload])
            .select()
            .single();
          if (error) throw error;
          teamId = newTeam.id;
        }

        const validMembers = selectedMembers.filter((id) => id !== "");

        if (validMembers.length > 0) {
          const membersPayload = validMembers.map((wrestlerId) => ({
            tag_team_id: teamId,
            superstar_id: wrestlerId,
          }));

          const { error: membersError } = await supabase
            .from("tag_team_members")
            .insert(membersPayload);
          if (membersError) throw membersError;
        }
      }

      onSuccess();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#191919",
          padding: "2rem",
          borderRadius: "8px",
          width: "400px",
          maxHeight: "90vh",
          overflowY: "auto",
          color: "#fff",
          border: "1px solid #333",
        }}
      >
        <h3 style={{ marginTop: 0, textAlign: "center" }}>
          {isEditing
            ? `Editar ${type === "wrestler" ? "Superstar" : "Tag Team"}`
            : "Criar Novo"}
        </h3>

        {!isEditing && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <button
              type="button"
              onClick={() => setType("wrestler")}
              style={{
                flex: 1,
                padding: "0.5rem",
                backgroundColor: type === "wrestler" ? "#d7182a" : "#333",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Superstar
            </button>
            <button
              type="button"
              onClick={() => setType("tagteam")}
              style={{
                flex: 1,
                padding: "0.5rem",
                backgroundColor: type === "tagteam" ? "#d7182a" : "#333",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Tag Team
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              Nome
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #444",
                backgroundColor: "#2a2a2a",
                color: "#fff",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              URL da Imagem
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #444",
                backgroundColor: "#2a2a2a",
                color: "#fff",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              Brand
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #444",
                backgroundColor: "#2a2a2a",
                color: "#fff",
                boxSizing: "border-box",
              }}
            >
              <option value="">-- Free Agent --</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {type === "tagteam" && (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  marginBottom: "0.5rem",
                }}
              >
                Membros da Tag/Stable
              </label>

              {selectedMembers.map((memberId, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <select
                    value={memberId}
                    onChange={(e) => handleMemberChange(idx, e.target.value)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: "1px solid #444",
                      backgroundColor: "#2a2a2a",
                      color: "#fff",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">(Selecione um Lutador)</option>
                    {wrestlers.map((wrestler) => (
                      <option key={wrestler.id} value={wrestler.id}>
                        {wrestler.name}
                      </option>
                    ))}
                  </select>

                  {selectedMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMemberSlot(idx)}
                      style={{
                        padding: "0.5rem 0.75rem",
                        backgroundColor: "#d7182a",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddMemberSlot}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  backgroundColor: "#333",
                  color: "#fff",
                  border: "1px dashed #666",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  marginTop: "0.25rem",
                }}
              >
                + Adicionar Membro
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "0.6rem",
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {loading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: "0.6rem",
                backgroundColor: "#444",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
