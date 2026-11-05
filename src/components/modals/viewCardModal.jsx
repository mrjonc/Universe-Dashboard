import styles from "./CalendarModal.module.css";
import AccessibleDialog from "./AccessibleDialog.jsx";

export default function ViewCardModal({
  activeShow,
  matchesData = [],
  segmentsData = [],
  cardOrder = [],
  wrestlers = [],
  onClose,
  onEdit,
}) {
  // Resolve a wrestler name from its ID.
  const getWrestlerName = (wrestlerId, wrestlersList) => {
    if (!wrestlerId) return "";
    const w = wrestlersList?.find(
      (item) => String(item.id) === String(wrestlerId),
    );
    return w ? w.name : "Unknown";
  };

  // Render participants according to the stored match structure.
  const renderMatchParticipants = (match) => {
    const type = match.match_type || "1v1";

    // Royal Rumble / Battle Royal.
    if (type.startsWith("rumble_") || match.participants?.length > 0) {
      const parts = match.participants || match.wrestler_ids || [];
      return (
        <div>
          <strong>Entries:</strong>
          <ol style={{ marginTop: "5px", paddingLeft: "20px" }}>
            {parts.map((wId, i) => (
              <li key={i}>{getWrestlerName(wId, wrestlers) || "Empty"}</li>
            ))}
          </ol>
        </div>
      );
    }

    // Team-based match format.
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

    // Fallback for wrestlers saved without team assignments.
    if (match.wrestler_ids && match.wrestler_ids.length >= 2) {
      const w1 = getWrestlerName(match.wrestler_ids[0], wrestlers);
      const w2 = getWrestlerName(match.wrestler_ids[1], wrestlers);
      return (
        <span>
          {w1} vs {w2}
        </span>
      );
    }

    return <em>No wrestlers assigned</em>;
  };

  return (
    <AccessibleDialog
      overlayClassName={styles.modalOverlay}
      contentClassName={styles.modalContent}
      titleId="show-card-title"
      onClose={onClose}
    >
        <h3 id="show-card-title" style={{ display: "flex", justifyContent: "center" }}>
          {activeShow?.events?.event_name || "Show card"}
        </h3>

        <h4 style={{ display: "flex", justifyContent: "center" }}>SHOW CARD</h4>
        {cardOrder.length === 0 ? (
          <p>No matches or segments scheduled.</p>
        ) : (
          cardOrder.map((card, orderIndex) => {
            if (card.type === "match") {
              const match = matchesData[card.index];
              if (!match) return null;
              const matchNumber = cardOrder
                .slice(0, orderIndex + 1)
                .filter((item) => item.type === "match").length;

              return (
                <div key={`match-${card.index}`} className={styles.matchBox}>
                  <h5>
                    Match {matchNumber} ({match.match_type || "1v1"})
                  </h5>
                  {match.stipulation && (
                    <p>
                      <strong>Stipulation:</strong> {match.stipulation}
                    </p>
                  )}
                  <div>{renderMatchParticipants(match)}</div>
                </div>
              );
            }

            const segment = segmentsData[card.index];
            if (!segment) return null;
            const segmentNumber = cardOrder
              .slice(0, orderIndex + 1)
              .filter((item) => item.type === "segment").length;
            const segmentWrestlers =
              segment.selected_wrestlers || segment.wrestler_ids || [];

            return (
              <div key={`segment-${card.index}`} className={styles.matchBox}>
                <h5>{segment.title || `Segment ${segmentNumber}`}</h5>
                {segment.description && <p>{segment.description}</p>}
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
          {onEdit && <button type="button" onClick={onEdit}>Edit card</button>}
          <button type="button" onClick={onClose}>Close</button>
        </div>
    </AccessibleDialog>
  );
}
