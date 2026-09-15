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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Usuário não autenticado");
        setLoading(false);
        return;
      }

      const [brandsRes, teamsData] = await Promise.all([
        supabase.from("brands").select("*"),
        getTagTeams(),
      ]);

      if (brandsRes.error)
        console.error("Erro ao buscar brands:", brandsRes.error.message);
      else setBrands(brandsRes.data || []);

      setTagTeams(teamsData || []);

      // 1. Busca os lutadores do usuário
      let { data: userSuperstars, error: userSupErr } = await supabase
        .from("user_superstars")
        .select(`*, brands (id, name, image_url)`)
        .eq("user_id", user.id);

      if (userSupErr) {
        console.error("Erro ao buscar user_superstars:", userSupErr.message);
      }

      // 2. Se estiver vazio, fazemos o seed garantindo que não há duplicidade pelo superstar_id
      if (!userSuperstars || userSuperstars.length === 0) {
        const { data: globalSuperstars, error: globalErr } = await supabase
          .from("superstars")
          .select("*");

        if (!globalErr && globalSuperstars && globalSuperstars.length > 0) {
          // Mapeia tirando eventuais duplicatas do global por garantia
          const uniqueGlobal = Array.from(
            new Map(globalSuperstars.map((s) => [s.id, s])).values(),
          );

          const payload = uniqueGlobal.map((s) => ({
            user_id: user.id,
            superstar_id: s.id,
            name: s.name,
            brand_id: s.brand_id,
            image_url: s.image_url,
          }));

          const { data: insertedData, error: insertErr } = await supabase
            .from("user_superstars")
            .insert(payload)
            .select(`*, brands (id, name, image_url)`);

          if (insertErr) {
            console.error(
              "Erro ao popular user_superstars:",
              insertErr.message,
            );
          } else {
            userSuperstars = insertedData;
          }
        }
      }

      // Ordena alfabeticamente pelo nome antes de salvar no estado
      if (userSuperstars && userSuperstars.length > 0) {
        userSuperstars.sort((a, b) => a.name.localeCompare(b.name));
      }

      setWrestlers(userSuperstars || []);
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
    async (wrestlerId, newBrandId, newBrandObj) => {
      // Atualiza no banco do usuário
      const { error } = await supabase
        .from("user_superstars")
        .update({ brand_id: newBrandId })
        .eq("id", wrestlerId);

      if (error) {
        console.error("Erro ao atualizar brand no banco:", error.message);
        return;
      }

      // Atualiza no estado local e mantém em ordem alfabética
      setWrestlers((prev) => {
        const updated = prev.map((w) =>
          w.id === wrestlerId
            ? { ...w, brand_id: newBrandId, brands: newBrandObj }
            : w,
        );
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });
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

  const handleDeleteWrestler = useCallback(async (id) => {
    // Deleta do banco do usuário
    const { error } = await supabase
      .from("user_superstars")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar lutador:", error.message);
      return;
    }

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
