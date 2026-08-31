import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient.js";
import styles from "./createWrestlerOrTagModal.module.css";

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
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>
          {isEditing
            ? `Editar ${type === "wrestler" ? "Superstar" : "Tag Team"}`
            : "Create"}
        </h3>

        {!isEditing && (
          <div className={styles.typeSelector}>
            <button
              type="button"
              onClick={() => setType("wrestler")}
              className={`${styles.typeButton} ${
                type === "wrestler" ? styles.typeButtonActive : ""
              }`}
            >
              Superstar
            </button>
            <button
              type="button"
              onClick={() => setType("tagteam")}
              className={`${styles.typeButton} ${
                type === "tagteam" ? styles.typeButtonActive : ""
              }`}
            >
              Tag Team
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div>
            <label className={styles.label}>Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={styles.input}
            />
          </div>

          <div>
            <label className={styles.label}>Brand</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className={styles.select}
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
                className={styles.label}
                style={{ marginBottom: "0.5rem" }}
              >
                Tag/Stable Members
              </label>

              {selectedMembers.map((memberId, idx) => (
                <div key={idx} className={styles.memberRow}>
                  <select
                    value={memberId}
                    onChange={(e) => handleMemberChange(idx, e.target.value)}
                    className={styles.select}
                  >
                    <option value="">(Select A Wrestler)</option>
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
                      className={styles.removeMemberButton}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddMemberSlot}
                className={styles.addMemberButton}
              >
                + Add A Member
              </button>
            </div>
          )}

          <div className={styles.actionButtons}>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Saving..." : isEditing ? "Atualizar" : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
