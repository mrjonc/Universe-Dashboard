import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import { sortBrands } from "../../utils/rosterHelpers.js";
import { useAuth } from "../../context/useAuth.js";
import ChangeTheChampionModal from "./changeTheChampionModal/ChangeTheChampionModal.jsx";
import CreateChampionTitleModal from "./CreateChampionTitleModal.jsx";
import LoadingSpinner from "../../components/animations/LoadingSpinner.jsx";
import styles from "./champion.module.css";

function Champions() {
  const { user } = useAuth();
  const [titles, setTitles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedTitleToEdit, setSelectedTitleToEdit] = useState(null);
  const [selectedBrandToAddTitle, setSelectedBrandToAddTitle] = useState(null);

  const fetchChampionsData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadError("");

      // Load global titles, brands, and this user's champion assignments.
      const [titlesRes, brandsRes, userChampsRes, superstarsRes, tagTeamsRes] =
        await Promise.all([
          supabase.from("championships").select(`
          *,
          brand:brands(id, name, image_url),
          champion:superstars(id, name, image_url),
          tag_champion:tag_teams(id, name, image_url)
        `).or(`user_id.is.null,user_id.eq.${user.id}`),
          supabase.from("brands").select("*"),
          supabase
            .from("user_championships")
            .select("*")
            .eq("user_id", user.id),
          supabase.from("superstars").select("id, name, image_url"),
          supabase.from("tag_teams").select("id, name, image_url"),
        ]);

      const queryError = [
        titlesRes.error,
        brandsRes.error,
        userChampsRes.error,
        superstarsRes.error,
        tagTeamsRes.error,
      ].find(Boolean);
      if (queryError) throw queryError;

      let userChamps = userChampsRes.data || [];
      const allSuperstars = superstarsRes.data || [];
      const allTagTeams = tagTeamsRes.data || [];

      // Seed champion assignments for this user if none exist yet.
      if (userChamps.length === 0 && titlesRes.data?.length > 0) {
        const initialInserts = titlesRes.data.map((title) => ({
          user_id: user.id,
          championship_id: title.id,
          champion_id: title.champion_id,
          tag_champion_id: title.tag_champion_id,
        }));

        const { data: insertedData, error: insertError } = await supabase
          .from("user_championships")
          .insert(initialInserts)
          .select();

        if (insertError) throw insertError;
        if (insertedData) userChamps = insertedData;
      }

      // Combine global titles with this user's champion assignments.
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

        // Resolve the champion record from the active ID.
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
      console.error("Failed to load championships:", err);
      setLoadError("Could not load championships.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChampionsData();
  }, [fetchChampionsData]);

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
      console.error("Failed to vacate title:", error.message);
      setLoadError("Could not vacate this title.");
      return;
    }
    fetchChampionsData();
  };

  const handleCreateTitle = async (title) => {
    if (!user) throw new Error("You must be signed in to create a title.");

    const { error } = await supabase.from("championships").insert({
      ...title,
      user_id: user.id,
    });
    if (error) throw error;

    await fetchChampionsData();
  };

  const handleDeleteTitle = async (title) => {
    if (String(title.user_id) !== String(user?.id)) return;
    if (!window.confirm(`Delete "${title.title_name}"? This cannot be undone.`))
      return;

    setLoadError("");
    const { data: championOverrides, error: lookupError } = await supabase
      .from("user_championships")
      .select("*")
      .eq("championship_id", title.id)
      .eq("user_id", user.id);
    if (lookupError) {
      console.error("Failed to check championship assignments:", lookupError);
      setLoadError("Could not delete this title.");
      return;
    }

    if (championOverrides?.length) {
      const { error } = await supabase
        .from("user_championships")
        .delete()
        .eq("championship_id", title.id)
        .eq("user_id", user.id);
      if (error) {
        console.error("Failed to remove title assignment:", error);
        setLoadError("Could not delete this title.");
        return;
      }
    }

    const { error: deleteError } = await supabase
      .from("championships")
      .delete()
      .eq("id", title.id)
      .eq("user_id", user.id);
    if (deleteError) {
      console.error("Failed to delete championship:", deleteError);
      if (championOverrides?.length) {
        const { error: restoreError } = await supabase
          .from("user_championships")
          .upsert(championOverrides);
        if (restoreError) {
          console.error("Failed to restore title assignment:", restoreError);
        }
      }
      setLoadError("Could not delete this title.");
      return;
    }

    await fetchChampionsData();
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
    // Use this user's assigned champion.
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
                alt=""
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
                  alt=""
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
                    alt=""
                    className={styles.championImage}
                  />
                )}
                <p className={styles.championName}>{currentChampion.name}</p>
              </>
            ) : (
              <p className={styles.vacantText}>Vacant</p>
            )}
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button
            type="button"
            aria-label={`Change champion for ${title.title_name}`}
            onClick={() => setSelectedTitleToEdit(title)}
            className={styles.changeButton}
          >
            Change champion
          </button>

          <button
            type="button"
            aria-label={`Vacate ${title.title_name}`}
            onClick={() => handleVacateTitle(title.id)}
            className={styles.vacateButton}
          >
            Vacate title
          </button>
          {String(title.user_id) === String(user?.id) && (
            <button
              type="button"
              aria-label={`Delete ${title.title_name}`}
              className={styles.vacateButton}
              onClick={() => handleDeleteTitle(title)}
            >
              Delete title
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className={styles.container} aria-labelledby="champions-title">
      <h1 id="champions-title" className={styles.title}>
        CHAMPIONS
      </h1>

      {loadError && <p role="alert">{loadError}</p>}

      {titles.length === 0 && (
        <p style={{ textAlign: "center", color: "#888", marginTop: "2rem" }}>
          No championships have been added yet.
        </p>
      )}

      {sortedBrands.map((brand) => {
        const brandTitles = titles.filter(
          (t) => (t.brand_id || t.brand?.id) === brand.id,
        );

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
              <button
                type="button"
                className={styles.addTitleButton}
                aria-label={`Add a title for ${brand.name}`}
                onClick={() => setSelectedBrandToAddTitle(brand.id)}
              >
                + Add title
              </button>
            </div>

            <div className={styles.grid}>
              {brandTitles.map(renderTitleCard)}
            </div>
            {brandTitles.length === 0 && (
              <p>No titles for this brand yet.</p>
            )}
          </div>
        );
      })}

      {interbrandTitles.length > 0 && (
        <div className={styles.section}>
          <div className={styles.brandHeader}>
            <h3 className={styles.interbrandTitle}>
              {sortedBrands.length > 0 ? "Interbrand" : "All titles"} (
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
      {selectedBrandToAddTitle && (
        <CreateChampionTitleModal
          brands={brands}
          brandId={selectedBrandToAddTitle}
          onClose={() => setSelectedBrandToAddTitle(null)}
          onCreate={handleCreateTitle}
        />
      )}
    </section>
  );
}

export default Champions;
