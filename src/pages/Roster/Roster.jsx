import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import { getTagTeams } from "../../lib/tagTeamService.js";
import { sortBrands, groupItemsByBrand } from "../../utils/rosterHelpers.js";
import WrestlerCard from "./wrestlerCard/WrestlerCard.jsx";
import TagTeamCard from "./tagTeamCard/TagTeamCard.jsx";
import CreateWrestlerOrTagModal from "./createWrestlerOrTagModal/createWrestlerOrTagModal.jsx";
import LoadingSpinner from "../../components/animations/LoadingSpinner.jsx";
import styles from "./roster.module.css";

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
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
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
    <div className={styles.container}>
      <h2 className={styles.title}>ROSTER</h2>

      <div className={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab("superstars")}
          className={`${styles.tabButton} ${
            activeTab === "superstars" ? styles.tabButtonActive : ""
          }`}
        >
          SUPERSTARS
        </button>

        <button
          onClick={() => setActiveTab("tagteams")}
          className={`${styles.tabButton} ${
            activeTab === "tagteams" ? styles.tabButtonActive : ""
          }`}
        >
          TAG TEAMS
        </button>

        <button
          onClick={() => {
            setItemToEdit(null);
            setIsModalOpen(true);
          }}
          className={styles.addButton}
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
              <div key={brand.id} className={styles.section}>
                <div className={styles.brandHeader}>
                  {brand.image_url && (
                    <img
                      src={brand.image_url}
                      alt={brand.name}
                      className={styles.brandLogo}
                    />
                  )}
                  <h3 className={styles.brandHeaderTitle}>
                    {brand.name} ({group.items.length})
                  </h3>
                </div>

                <div className={styles.grid}>
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
            <div className={styles.section}>
              <div className={styles.brandHeader}>
                <h3 className={styles.freeAgentTitle}>
                  Free Agents ({freeAgents.length})
                </h3>
              </div>

              <div className={styles.grid}>
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
              <div key={brand.id} className={styles.section}>
                <div className={styles.brandHeader}>
                  {brand.image_url && (
                    <img
                      src={brand.image_url}
                      alt={brand.name}
                      className={styles.brandLogo}
                    />
                  )}
                  <h3 className={styles.brandHeaderTitle}>
                    {brand.name} ({group.items.length})
                  </h3>
                </div>

                <div className={styles.grid}>
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
            <div className={styles.section}>
              <div className={styles.brandHeader}>
                <h3 className={styles.freeAgentTitle}>
                  Free Agents ({freeAgentTeams.length})
                </h3>
              </div>

              <div className={styles.grid}>
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
