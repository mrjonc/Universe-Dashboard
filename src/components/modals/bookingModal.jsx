import React from "react";
// import styles from "./calendar.module.css";
import styles from "./CalendarModal.module.css";

export default function BookingModal({
  activeShow,
  matchesData,
  segmentsData,
  wrestlers = [],
  onClose,
  onSave,
  onAddMatch,
  onRemoveMatch,
  onMatchChange,
  onTeamWrestlerSelect,
  onAddSegment,
  onRemoveSegment,
  onSegmentChange,
  onSegmentWrestlerSelect,
  onAddWrestlerToSegment,
}) {
  const sortedWrestlers = React.useMemo(() => {
    return [...wrestlers].sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
  }, [wrestlers]);

  const getMatchTeams = (type) => {
    if (type.startsWith("rumble_")) {
      const size = parseInt(type.split("_")[1], 10);
      return { isRumble: true, size };
    }

    switch (type) {
      case "1v1":
        return [
          { key: "team_a", label: "Side A / Team 1", size: 1 },
          { key: "team_b", label: "Side B / Team 2", size: 1 },
        ];
      case "2v2":
        return [
          { key: "team_a", label: "Side A / Team 1", size: 2 },
          { key: "team_b", label: "Side B / Team 2", size: 2 },
        ];
      case "3v3":
        return [
          { key: "team_a", label: "Side A / Team 1", size: 3 },
          { key: "team_b", label: "Side B / Team 2", size: 3 },
        ];
      case "4v4":
        return [
          { key: "team_a", label: "Side A / Team 1", size: 4 },
          { key: "team_b", label: "Side B / Team 2", size: 4 },
        ];
      case "1v2":
        return [
          { key: "team_a", label: "Side A / Team 1", size: 1 },
          { key: "team_b", label: "Side B / Team 2", size: 2 },
        ];
      case "1v3":
        return [
          { key: "team_a", label: "Side A / Team 1", size: 1 },
          { key: "team_b", label: "Side B / Team 2", size: 3 },
        ];
      case "2v3":
        return [
          { key: "team_a", label: "Side A / Team 1", size: 2 },
          { key: "team_b", label: "Side B / Team 2", size: 3 },
        ];
      case "1v1v1":
        return [
          { key: "team_a", label: "Side A / Team 1", size: 1 },
          { key: "team_b", label: "Side B / Team 2", size: 1 },
          { key: "team_c", label: "Side C / Team 3", size: 1 },
        ];
      case "2v2v2":
        return [
          { key: "team_a", label: "Side A / Team 1", size: 2 },
          { key: "team_b", label: "Side B / Team 2", size: 2 },
          { key: "team_c", label: "Side C / Team 3", size: 2 },
        ];
      case "1v1v1v1":
        return [
          { key: "team_a", label: "Side A / Team 1", size: 1 },
          { key: "team_b", label: "Side B / Team 2", size: 1 },
          { key: "team_c", label: "Side C / Team 3", size: 1 },
          { key: "team_d", label: "Side D / Team 4", size: 1 },
        ];
      case "2v2v2v2":
        return [
          { key: "team_a", label: "Side A / Team 1", size: 2 },
          { key: "team_b", label: "Side B / Team 2", size: 2 },
          { key: "team_c", label: "Side C / Team 3", size: 2 },
          { key: "team_d", label: "Side D / Team 4", size: 2 },
        ];
      case "1v1v1v1v1":
        return [
          { key: "team_a", label: "Side A / Team 1", size: 1 },
          { key: "team_b", label: "Side B / Team 2", size: 1 },
          { key: "team_c", label: "Side C / Team 3", size: 1 },
          { key: "team_d", label: "Side D / Team 4", size: 1 },
          { key: "team_e", label: "Side E / Team 5", size: 1 },
        ];
      case "1v1v1v1v1v1":
        return [
          { key: "team_a", label: "Side A / Team 1", size: 1 },
          { key: "team_b", label: "Side B / Team 2", size: 1 },
          { key: "team_c", label: "Side C / Team 3", size: 1 },
          { key: "team_d", label: "Side D / Team 4", size: 1 },
          { key: "team_e", label: "Side E / Team 5", size: 1 },
          { key: "team_f", label: "Side F / Team 6", size: 1 },
        ];
      default:
        return [
          { key: "team_a", label: "Side A / Team 1", size: 1 },
          { key: "team_b", label: "Side B / Team 2", size: 1 },
        ];
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div
        className={styles.modalContent}
        style={{
          backgroundColor: "rgb(56, 53, 53)",
          color: "white",
        }}
      >
        <h3>{activeShow.events?.name || activeShow.events?.event_name}</h3>

        <h4>--- MATCHES ---</h4>
        {matchesData.map((match, idx) => (
          <div key={idx} className={styles.matchBox}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h5>Match {idx + 1}</h5>
              {matchesData.length > 1 && (
                <button onClick={() => onRemoveMatch(idx)}>Delete Match</button>
              )}
            </div>

            <label>Stipulation</label>
            <input
              type="text"
              value={match.stipulation}
              onChange={(e) =>
                onMatchChange(idx, "stipulation", e.target.value)
              }
            />

            <label>Match Type</label>
            <select
              value={match.match_type || "1v1"}
              onChange={(e) => onMatchChange(idx, "match_type", e.target.value)}
              style={{ marginBottom: "10px" }}
            >
              <option value="1v1">(One-on-One Match)</option>
              <option value="2v2">(Tag Team Match)</option>
              <option value="3v3">(6-Man Tag Team Match)</option>
              <option value="4v4">(8-Man Tag Team Match)</option>
              <option value="1v2">(1-on-2 Handicap Match)</option>
              <option value="1v3">(1-on-3 Handicap Match)</option>
              <option value="2v3">(2-on-3 Handicap Match)</option>
              <option value="1v1v1">(Triple Threat Match)</option>
              <option value="2v2v2">(Triple Threat Tag Team Match)</option>
              <option value="1v1v1v1">(Fatal 4-Way Match)</option>
              <option value="2v2v2v2">(Fatal 4-Way Tag Team Match)</option>
              <option value="1v1v1v1v1">(Fatal 5-Way Match)</option>
              <option value="1v1v1v1v1v1">(Six Pack Match)</option>
              <optgroup label="ROYAL RUMBLE">
                <option value="rumble_10">Royal Rumble (10-man)</option>
                <option value="rumble_20">Royal Rumble (20-man)</option>
                <option value="rumble_30">Royal Rumble (30-man)</option>
              </optgroup>
            </select>

            {(() => {
              const matchConfig = getMatchTeams(match.match_type || "1v1");

              if (matchConfig.isRumble) {
                const participants = match.participants || [];

                return (
                  <div
                    style={{
                      marginTop: "10px",
                      backgroundColor: "#2a2a2a",
                      padding: "10px",
                      borderRadius: "4px",
                    }}
                  >
                    <strong>
                      Royal Rumble Entries ({matchConfig.size} Wrestlers)
                    </strong>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                        marginTop: "10px",
                      }}
                    >
                      {Array.from({ length: matchConfig.size }).map(
                        (_, wIdx) => (
                          <div
                            key={wIdx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <span
                              style={{ fontSize: "12px", minWidth: "25px" }}
                            >
                              #{wIdx + 1}
                            </span>
                            <select
                              value={participants[wIdx] || ""}
                              onChange={(e) =>
                                onTeamWrestlerSelect(
                                  idx,
                                  "participants",
                                  wIdx,
                                  e.target.value,
                                )
                              }
                              style={{ width: "100%" }}
                            >
                              <option value="">-- Selecione --</option>
                              {sortedWrestlers.map((w) => (
                                <option key={w.id} value={w.id}>
                                  {w.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    marginTop: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  {matchConfig.map((team, tIdx) => (
                    <React.Fragment key={team.key}>
                      <div
                        style={{
                          flex: 1,
                          minWidth: "150px",
                          backgroundColor: "#2a2a2a",
                          padding: "8px",
                          borderRadius: "4px",
                        }}
                      >
                        <strong>{team.label}</strong>
                        {Array.from({ length: team.size }).map((_, wIdx) => (
                          <select
                            key={wIdx}
                            value={match[team.key]?.[wIdx] || ""}
                            onChange={(e) =>
                              onTeamWrestlerSelect(
                                idx,
                                team.key,
                                wIdx,
                                e.target.value,
                              )
                            }
                            style={{ width: "100%", marginTop: "5px" }}
                          >
                            <option value="">-- Selecione o Lutador --</option>
                            {sortedWrestlers.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name}
                              </option>
                            ))}
                          </select>
                        ))}
                      </div>

                      {tIdx < matchConfig.length - 1 && (
                        <div
                          style={{ alignSelf: "center", fontWeight: "bold" }}
                        >
                          VS
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              );
            })()}
          </div>
        ))}

        <button
          type="button"
          className={styles.addShow}
          onClick={onAddMatch}
          style={{ marginTop: "10px", width: "100%" }}
        >
          + Add new match
        </button>

        <h4>--- SEGMENTS ---</h4>
        {segmentsData.map((seg, sIdx) => (
          <div key={sIdx} className={styles.matchBox}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h5>Segment {sIdx + 1}</h5>
              <button onClick={() => onRemoveSegment(sIdx)}>Delete</button>
            </div>

            <label>Segment title:</label>
            <input
              type="text"
              placeholder="Ex: Promo do Campeão, Ataque Backstage..."
              value={seg.title}
              onChange={(e) => onSegmentChange(sIdx, "title", e.target.value)}
            />

            <label>Description</label>
            <textarea
              placeholder="Detalhes do que acontece na cena..."
              value={seg.description}
              onChange={(e) =>
                onSegmentChange(sIdx, "description", e.target.value)
              }
            />

            <label>Participants:</label>
            {seg.selected_wrestlers.map((wId, wIdx) => (
              <select
                key={wIdx}
                value={wId || ""}
                onChange={(e) =>
                  onSegmentWrestlerSelect(sIdx, wIdx, e.target.value)
                }
              >
                <option value="">-- Select the participant --</option>
                {sortedWrestlers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            ))}
            <button type="button" onClick={() => onAddWrestlerToSegment(sIdx)}>
              + Add Participant
            </button>
          </div>
        ))}

        <button
          type="button"
          className={styles.addShow}
          onClick={onAddSegment}
          style={{ marginTop: "10px", width: "100%" }}
        >
          + Add new segment
        </button>

        <div className={styles.modalActions} style={{ marginTop: "20px" }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onSave}>Save Card</button>
        </div>
      </div>
    </div>
  );
}
