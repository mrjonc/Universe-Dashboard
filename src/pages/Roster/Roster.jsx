import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import { getTagTeams } from "../../lib/tagTeamService.js";
import { sortBrands, groupItemsByBrand } from "../../utils/rosterHelpers.js";
import WrestlerCard from "../../components/rosterComponents/WrestlerCard.jsx";
import TagTeamCard from "../../components/rosterComponents/TagTeamCard.jsx";
import CreateWrestlerOrTagModal from "./createWrestlerOrTagModal.jsx";

export default function Roster() {
  const [activeTab, setActiveTab] = useState("superstars");
  const [wrestlers, setWrestlers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tagTeams, setTagTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const fetchRosterData = async () => {
    setLoading(true);
    try {
      const [wrestlersRes, brandsRes, teamsData] = await Promise.all([
        supabase.from("superstars").select(`*, brands (id, name, image_url)`),
        supabase.from("brands").select("*"),
        getTagTeams(),
      ]);

      if (wrestlersRes.error)
        console.error("Erro ao buscar lutadores:", wrestlersRes.error.message);
      else setWrestlers(wrestlersRes.data || []);

      if (brandsRes.error)
        console.error("Erro ao buscar brands:", brandsRes.error.message);
      else setBrands(brandsRes.data || []);

      setTagTeams(teamsData || []);
    } catch (err) {
      console.error("Erro ao carregar dados do roster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRosterData();
  }, []);

  const handleEditWrestler = useCallback((wrestler) => {
    console.log("Editando wrestler:", wrestler);
    setItemToEdit({ type: "wrestler", data: wrestler });
    setIsModalOpen(true);
  }, []);

  const handleEditTeam = useCallback((team) => {
    setItemToEdit({ type: "tagteam", data: team });
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToEdit(null);
  };

  const handleUpdateWrestlerBrand = useCallback(
    (wrestlerId, newBrandId, newBrandObj) => {
      setWrestlers((prev) =>
        prev.map((w) =>
          w.id === wrestlerId
            ? { ...w, brand_id: newBrandId, brands: newBrandObj }
            : w,
        ),
      );
    },
    [],
  );

  const handleUpdateTeamBrand = useCallback(
    (teamId, newBrandId, newBrandObj) => {
      setTagTeams((prev) =>
        prev.map((t) =>
          t.id === teamId
            ? { ...t, brand_id: newBrandId, brand: newBrandObj }
            : t,
        ),
      );
    },
    [],
  );

  const handleDeleteWrestler = useCallback((id) => {
    setWrestlers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleDeleteTeam = useCallback((id) => {
    setTagTeams((prev) => prev.filter((s) => s.id !== id));
  }, []);

  if (loading) {
    return (
      <p style={{ textAlign: "center", padding: "2rem", color: "white" }}>
        Carregando roster...
      </p>
    );
  }

  const sortedBrands = sortBrands(brands);

  const groupedWrestlers = groupItemsByBrand(
    sortedBrands,
    wrestlers,
    (w) => w.brand_id,
  );
  const freeAgents = wrestlers.filter((w) => !w.brand_id);

  const groupedTagTeams = groupItemsByBrand(
    sortedBrands,
    tagTeams,
    (t) => t.brand?.id || t.brand_id,
  );
  const freeAgentTeams = tagTeams.filter((t) => !t.brand?.id && !t.brand_id);

  return (
    <div
      style={{
        padding: "2rem",
        width: "100%",
        boxSizing: "border-box",
        color: "white",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>ROSTER</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        <button
          onClick={() => setActiveTab("superstars")}
          style={{
            padding: "0.6rem 1.2rem",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            borderRadius: "6px",
            border: "none",
            backgroundColor: activeTab === "superstars" ? "#e0e0e0" : "#111",
            color: activeTab === "superstars" ? "#333" : "#fff",
            transition: "all 0.2s ease",
          }}
        >
          SUPERSTARS
        </button>

        <button
          onClick={() => setActiveTab("tagteams")}
          style={{
            padding: "0.6rem 1.2rem",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            borderRadius: "6px",
            border: "none",
            backgroundColor: activeTab === "tagteams" ? "#e0e0e0" : "#111",
            color: activeTab === "tagteams" ? "#333" : "#fff",
            transition: "all 0.2s ease",
          }}
        >
          TAG TEAMS
        </button>

        <button
          onClick={() => {
            setItemToEdit(null);
            setIsModalOpen(true);
          }}
          style={{
            padding: "0.6rem 1.2rem",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#d7182a",
            color: "#ece9e9",
            transition: "all 0.2s ease",
          }}
        >
          +
        </button>
      </div>

      {activeTab === "superstars" && (
        <>
          {sortedBrands.map((brand) => {
            const group = groupedWrestlers[brand.id];
            if (!group || group.items.length === 0) return null;

            return (
              <div key={brand.id} style={{ marginBottom: "3rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1rem",
                    borderBottom: "2px solid #ccc",
                    paddingBottom: "0.5rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  {brand.image_url && (
                    <img
                      src={brand.image_url}
                      alt={brand.name}
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "contain",
                      }}
                    />
                  )}
                  <h3 style={{ textTransform: "uppercase", margin: 0 }}>
                    {brand.name} ({group.items.length})
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1.5rem",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  {group.items.map((wrestler) => (
                    <WrestlerCard
                      key={wrestler.id}
                      wrestler={wrestler}
                      brands={brands}
                      onUpdateBrand={handleUpdateWrestlerBrand}
                      onEdit={handleEditWrestler}
                      onDelete={handleDeleteWrestler}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {freeAgents.length > 0 && (
            <div style={{ marginBottom: "3rem" }}>
              <div
                style={{
                  borderBottom: "2px solid #ccc",
                  paddingBottom: "0.5rem",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                <h3
                  style={{
                    textTransform: "uppercase",
                    margin: 0,
                    color: "#666",
                  }}
                >
                  Free Agents ({freeAgents.length})
                </h3>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1.5rem",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                {freeAgents.map((wrestler) => (
                  <WrestlerCard
                    key={wrestler.id}
                    wrestler={wrestler}
                    brands={brands}
                    onUpdateBrand={handleUpdateWrestlerBrand}
                    onEdit={handleEditWrestler}
                    onDelete={handleDeleteWrestler}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "tagteams" && (
        <>
          {sortedBrands.map((brand) => {
            const group = groupedTagTeams[brand.id];
            if (!group || group.items.length === 0) return null;

            return (
              <div key={brand.id} style={{ marginBottom: "3rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1rem",
                    borderBottom: "2px solid #ccc",
                    paddingBottom: "0.5rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  {brand.image_url && (
                    <img
                      src={brand.image_url}
                      alt={brand.name}
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "contain",
                      }}
                    />
                  )}
                  <h3 style={{ textTransform: "uppercase", margin: 0 }}>
                    {brand.name} ({group.items.length})
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1.5rem",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  {group.items.map((team) => (
                    <TagTeamCard
                      key={team.id}
                      team={team}
                      brands={brands}
                      onUpdateBrand={handleUpdateTeamBrand}
                      onEditTeam={handleEditTeam}
                      onDeleteTeam={handleDeleteTeam}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {freeAgentTeams.length > 0 && (
            <div style={{ marginBottom: "3rem" }}>
              <div
                style={{
                  borderBottom: "2px solid #ccc",
                  paddingBottom: "0.5rem",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                <h3
                  style={{
                    textTransform: "uppercase",
                    margin: 0,
                    color: "#666",
                  }}
                >
                  Free Agents ({freeAgentTeams.length})
                </h3>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1.5rem",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                {freeAgentTeams.map((team) => (
                  <TagTeamCard
                    key={team.id}
                    team={team}
                    brands={brands}
                    onUpdateBrand={handleUpdateTeamBrand}
                    onEditTeam={handleEditTeam}
                    onDeleteTeam={handleDeleteTeam}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <CreateWrestlerOrTagModal
          brands={brands}
          wrestlers={wrestlers}
          itemToEdit={itemToEdit}
          onClose={handleCloseModal}
          onSuccess={() => {
            fetchRosterData();
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}
