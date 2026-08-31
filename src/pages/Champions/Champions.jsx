import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import { sortBrands } from "../../utils/rosterHelpers.js";
import { useAuth } from "../../context/AuthContext.jsx";
import ChangeTheChampionModal from "./changeTheChampionModal/ChangeTheChampionModal.jsx";
import LoadingSpinner from "../../components/animations/LoadingSpinner.jsx";
import styles from "./champion.module.css";

function Champions() {
  const { user } = useAuth();
  const [titles, setTitles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTitleToEdit, setSelectedTitleToEdit] = useState(null);

  const fetchChampionsData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1. Busca os títulos globais (com brand e os campeões padrões), marcas e os saves do usuário
      const [titlesRes, brandsRes, userChampsRes, superstarsRes, tagTeamsRes] =
        await Promise.all([
          supabase.from("championships").select(`
          *,
          brand:brands(id, name, image_url),
          champion:superstars(id, name, image_url),
          tag_champion:tag_teams(id, name, image_url)
        `),
          supabase.from("brands").select("*"),
          supabase
            .from("user_championships")
            .select("*")
            .eq("user_id", user.id),
          supabase.from("superstars").select("id, name, image_url"),
          supabase.from("tag_teams").select("id, name, image_url"),
        ]);

      let userChamps = userChampsRes.data || [];
      const allSuperstars = superstarsRes.data || [];
      const allTagTeams = tagTeamsRes.data || [];

      // Se o usuário ainda não tiver linhas criadas na tabela dele, cria para todos os títulos
      if (userChamps.length === 0 && titlesRes.data?.length > 0) {
        const initialInserts = titlesRes.data.map((title) => ({
          user_id: user.id,
          championship_id: title.id,
          champion_id: title.champion_id,
          tag_champion_id: title.tag_champion_id,
        }));

        const { data: insertedData } = await supabase
          .from("user_championships")
          .insert(initialInserts)
          .select();

        if (insertedData) userChamps = insertedData;
      }

      // Mapeia os dados combinando o global com o save do usuário
      const combinedTitles = titlesRes.data.map((title) => {
        const userOverride = userChamps.find(
          (uc) => uc.championship_id === title.id,
        );

        const activeChampId = userOverride
          ? userOverride.champion_id
          : title.champion_id;
        const activeTagId = userOverride
          ? userOverride.tag_champion_id
          : title.tag_champion_id;

        // Encontra o objeto completo do lutador ou da tag team com base no ID ativo
        const resolvedChampion =
          allSuperstars.find((s) => s.id === activeChampId) || null;
        const resolvedTagChampion =
          allTagTeams.find((t) => t.id === activeTagId) || null;

        return {
          ...title,
          active_champion_id: activeChampId,
          active_tag_champion_id: activeTagId,
          resolved_champion: resolvedChampion,
          resolved_tag_champion: resolvedTagChampion,
        };
      });

      setTitles(combinedTitles);
      setBrands(brandsRes.data || []);
    } catch (err) {
      console.error("Erro inesperado:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChampionsData();
    }
  }, [user]);

  const handleVacateTitle = async (titleId) => {
    if (!user) return;

    const { error } = await supabase.from("user_championships").upsert(
      {
        user_id: user.id,
        championship_id: titleId,
        champion_id: null,
        tag_champion_id: null,
      },
      { onConflict: "user_id, championship_id" },
    );

    if (error) {
      console.error("Erro ao deixar o título vago:", error.message);
      return;
    }
    fetchChampionsData();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const sortedBrands = sortBrands(brands);
  const brandIds = new Set(sortedBrands.map((b) => b.id));

  const interbrandTitles = titles.filter(
    (title) =>
      !title.brand_id ||
      !title.brand?.id ||
      !brandIds.has(title.brand_id || title.brand?.id),
  );

  const renderTitleCard = (title) => {
    const isTag = title.champion_type === "tagteam";
    // Usa o campeão resolvido do save do usuário atual
    const currentChampion = isTag
      ? title.resolved_tag_champion
      : title.resolved_champion;

    return (
      <div key={title.id} className={styles.card}>
        <div className={styles.cardContent}>
          <div className={styles.titleImageContainer}>
            {title.image_url && (
              <img
                src={title.image_url}
                alt={title.title_name}
                className={styles.titleImage}
              />
            )}
          </div>

          <div>
            <h3 className={styles.titleName}>{title.title_name}</h3>

            {title.brand && (
              <span className={styles.brandBadge}>
                <img
                  src={title.brand.image_url}
                  alt={title.brand.name}
                  className={styles.brandImage}
                />
              </span>
            )}
          </div>

          <hr className={styles.divider} />

          <div className={styles.championSection}>
            {currentChampion ? (
              <>
                {currentChampion.image_url && (
                  <img
                    src={currentChampion.image_url}
                    alt={currentChampion.name}
                    className={styles.championImage}
                  />
                )}
                <p className={styles.championName}>{currentChampion.name}</p>
              </>
            ) : (
              <p className={styles.vacantText}>Título Vago</p>
            )}
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button
            onClick={() => setSelectedTitleToEdit(title)}
            className={styles.changeButton}
          >
            Change The Champion
          </button>

          <button
            onClick={() => handleVacateTitle(title.id)}
            className={styles.vacateButton}
          >
            Vacate Title
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>CHAMPIONS</h2>

      {titles.length === 0 && (
        <p style={{ textAlign: "center", color: "#888", marginTop: "2rem" }}>
          Nenhum título/campeonato cadastrado.
        </p>
      )}

      {sortedBrands.map((brand) => {
        const brandTitles = titles.filter(
          (t) => (t.brand_id || t.brand?.id) === brand.id,
        );

        if (brandTitles.length === 0) return null;

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
                {brand.name} ({brandTitles.length})
              </h3>
            </div>

            <div className={styles.grid}>
              {brandTitles.map(renderTitleCard)}
            </div>
          </div>
        );
      })}

      {interbrandTitles.length > 0 && (
        <div className={styles.section}>
          <div className={styles.brandHeader}>
            <h3 className={styles.interbrandTitle}>
              {sortedBrands.length > 0 ? "Interbrand" : "Todos os Títulos"} (
              {interbrandTitles.length})
            </h3>
          </div>

          <div className={styles.grid}>
            {interbrandTitles.map(renderTitleCard)}
          </div>
        </div>
      )}

      {selectedTitleToEdit && (
        <ChangeTheChampionModal
          title={selectedTitleToEdit}
          onClose={() => setSelectedTitleToEdit(null)}
          onSuccess={fetchChampionsData}
        />
      )}
    </div>
  );
}

export default Champions;
