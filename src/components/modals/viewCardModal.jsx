import React from "react";
// import styles from "./calendar.module.css";
import styles from "./CalendarModal.module.css";

export default function ViewCardModal({
  activeShow,
  matchesData = [],
  segmentsData = [],
  wrestlers = [],
  onClose,
  onEdit,
}) {
  // Helper para buscar nome do lutador por ID
  const getWrestlerName = (wrestlerId, wrestlersList) => {
    if (!wrestlerId) return "";
    const w = wrestlersList?.find(
      (item) => String(item.id) === String(wrestlerId),
    );
    return w ? w.name : "Desconhecido";
  };

  // Renderiza os participantes da luta de acordo com a estrutura do banco/estado
  const renderMatchParticipants = (match) => {
    const type = match.match_type || "1v1";

    // Caso 1: Royal Rumble / Battle Royal
    if (type.startsWith("rumble_") || match.participants?.length > 0) {
      const parts = match.participants || match.wrestler_ids || [];
      return (
        <div>
          <strong>Entradas:</strong>
          <ol style={{ marginTop: "5px", paddingLeft: "20px" }}>
            {parts.map((wId, i) => (
              <li key={i}>{getWrestlerName(wId, wrestlers) || "Vazio"}</li>
            ))}
          </ol>
        </div>
      );
    }

    // Caso 2: Lutas por Lados (team_a, team_b, team_c, team_d, team_e, team_f)
    const teamsKeys = [
      "team_a",
      "team_b",
      "team_c",
      "team_d",
      "team_e",
      "team_f",
    ];
    const activeTeams = teamsKeys
      .map((key) => {
        const teamMembers = match[key] || [];
        if (!teamMembers || teamMembers.length === 0) return null;

        const names = teamMembers
          .map((id) => getWrestlerName(id, wrestlers))
          .filter(Boolean);

        return names.length > 0 ? names.join(" & ") : null;
      })
      .filter(Boolean);

    if (activeTeams.length > 0) {
      return <span>{activeTeams.join(" vs ")}</span>;
    }

    // Fallback: se houver wrestler_ids sem divisão de time (ex: 1v1 salvo direto)
    if (match.wrestler_ids && match.wrestler_ids.length >= 2) {
      const w1 = getWrestlerName(match.wrestler_ids[0], wrestlers);
      const w2 = getWrestlerName(match.wrestler_ids[1], wrestlers);
      return (
        <span>
          {w1} vs {w2}
        </span>
      );
    }

    return <em>Sem lutadores definidos</em>;
  };

  return (
    <div className={styles.modalOverlay}>
      <div
        className={styles.modalContent}
        style={{
          backgroundColor: "#383535",
          color: "white",
        }}
      >
        <h3 style={{ display: "flex", justifyContent: "center" }}>
          {activeShow?.events?.event_name || "Card do Show"}
        </h3>

        <h4 style={{ display: "flex", justifyContent: "center" }}>
          ---------- MATCHES ----------
        </h4>
        {matchesData && matchesData.length > 0 ? (
          matchesData.map((match, idx) => (
            <div
              key={idx}
              className={styles.matchBox}
              style={{
                backgroundColor: "#2a2a2a",
                margin: "10px 0",
                padding: "10px",
              }}
            >
              <h5>
                Match {idx + 1} ({match.match_type || "1v1"})
              </h5>
              {match.stipulation && (
                <p>
                  <strong>Stipulation:</strong> {match.stipulation}
                </p>
              )}
              <div>{renderMatchParticipants(match)}</div>
            </div>
          ))
        ) : (
          <p>No matches scheduled</p>
        )}

        <h4>--- SEGMENTS ---</h4>
        {segmentsData && segmentsData.length > 0 ? (
          segmentsData.map((seg, idx) => {
            const segmentWrestlers =
              seg.selected_wrestlers || seg.wrestler_ids || [];

            return (
              <div
                key={idx}
                className={styles.matchBox}
                style={{
                  backgroundColor: "#2a2a2a",
                  margin: "10px 0",
                  padding: "10px",
                }}
              >
                <h5>{seg.title || `Segmento ${idx + 1}`}</h5>
                {seg.description && <p>{seg.description}</p>}
                {segmentWrestlers.length > 0 && (
                  <p>
                    <strong>Participants:</strong>{" "}
                    {segmentWrestlers
                      .map((id) => getWrestlerName(id, wrestlers))
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <p>No segments scheduled.</p>
        )}

        <div
          className={styles.modalActions}
          style={{
            marginTop: "20px",
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
          }}
        >
          {onEdit && <button onClick={onEdit}>Edit Card</button>}
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
