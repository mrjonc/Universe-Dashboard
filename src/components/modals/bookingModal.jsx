import { Fragment, useMemo } from "react";
import styles from "./CalendarModal.module.css";
import AccessibleDialog from "./AccessibleDialog.jsx";
import WrestlerPicker from "./WrestlerPicker.jsx";

export default function BookingModal({
  activeShow,
  matchesData,
  segmentsData,
  cardOrder = [],
  wrestlers = [],
  onClose,
  onSave,
  onAddCard,
  onMoveCard,
  onRemoveMatch,
  onMatchChange,
  onTeamWrestlerSelect,
  onRemoveSegment,
  onSegmentChange,
  onSegmentWrestlerSelect,
  onAddWrestlerToSegment,
}) {
  const sortedWrestlers = useMemo(() => {
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
    <AccessibleDialog
      overlayClassName={styles.modalOverlay}
      contentClassName={styles.modalContent}
      titleId="booking-title"
      onClose={onClose}
    >
        <h3 id="booking-title">
          {activeShow.events?.name || activeShow.events?.event_name || "Booking"}
        </h3>

        <h4>SHOW CARD ORDER</h4>
        {cardOrder.map((card, cardIndex) => {
          const isMatch = card.type === "match";
          const match = isMatch ? matchesData[card.index] : null;
          const segment = isMatch ? null : segmentsData[card.index];
          if (!match && !segment) return null;

          const itemNumber = cardOrder
            .slice(0, cardIndex + 1)
            .filter((item) => item.type === card.type).length;
          const matchConfig = match
            ? getMatchTeams(match.match_type || "1v1")
            : null;

          return (
            <Fragment key={`${card.type}-${card.index}`}>
              <div className={styles.matchBox}>
                <div className={styles.cardItemHeader}>
                  <h5>{isMatch ? `Match ${itemNumber}` : `Segment ${itemNumber}`}</h5>
                  <div className={styles.cardItemControls}>
                    <button
                      type="button"
                      aria-label={`Move ${card.type} ${itemNumber} up`}
                      onClick={() => onMoveCard(cardIndex, -1)}
                      disabled={cardIndex === 0}
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${card.type} ${itemNumber} down`}
                      onClick={() => onMoveCard(cardIndex, 1)}
                      disabled={cardIndex === cardOrder.length - 1}
                    >
                      Move down
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${card.type} ${itemNumber}`}
                      onClick={() =>
                        isMatch
                          ? onRemoveMatch(card.index)
                          : onRemoveSegment(card.index)
                      }
                      disabled={isMatch && matchesData.length === 1}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {match && (
                  <>
                    <label htmlFor={`match-${card.index}-stipulation`}>Stipulation</label>
                    <input
                      id={`match-${card.index}-stipulation`}
                      type="text"
                      value={match.stipulation}
                      onChange={(event) =>
                        onMatchChange(card.index, "stipulation", event.target.value)
                      }
                    />

                    <label htmlFor={`match-${card.index}-type`}>Match type</label>
                    <select
                      id={`match-${card.index}-type`}
                      value={match.match_type || "1v1"}
                      onChange={(event) =>
                        onMatchChange(card.index, "match_type", event.target.value)
                      }
                    >
                      <option value="1v1">One-on-One Match</option>
                      <option value="2v2">Tag Team Match</option>
                      <option value="3v3">6-Man Tag Team Match</option>
                      <option value="4v4">8-Man Tag Team Match</option>
                      <option value="1v2">1-on-2 Handicap Match</option>
                      <option value="1v3">1-on-3 Handicap Match</option>
                      <option value="2v3">2-on-3 Handicap Match</option>
                      <option value="1v1v1">Triple Threat Match</option>
                      <option value="2v2v2">Triple Threat Tag Team Match</option>
                      <option value="1v1v1v1">Fatal 4-Way</option>
                      <option value="2v2v2v2">Fatal 4-Way Tag Team Match</option>
                      <option value="1v1v1v1v1">Fatal 5-Way Match</option>
                      <option value="1v1v1v1v1v1">Six Pack Match</option>
                      <optgroup label="ROYAL RUMBLE">
                        <option value="rumble_10">Royal Rumble (10-man)</option>
                        <option value="rumble_20">Royal Rumble (20-man)</option>
                        <option value="rumble_30">Royal Rumble (30-man)</option>
                      </optgroup>
                    </select>

                    {matchConfig.isRumble ? (
                      <div className={styles.rumbleParticipants}>
                        <strong>
                          Royal Rumble Entries ({matchConfig.size} Wrestlers)
                        </strong>
                        <div className={styles.rumbleGrid}>
                          {Array.from({ length: matchConfig.size }).map((_, wIdx) => (
                            <div key={wIdx} className={styles.rumbleEntry}>
                              <span>#{wIdx + 1}</span>
                              <WrestlerPicker
                                id={`match-${card.index}-participant-${wIdx}`}
                                label={`Wrestler ${wIdx + 1} in match ${itemNumber}`}
                                value={String((match.participants || [])[wIdx] || "")}
                                wrestlers={sortedWrestlers}
                                onChange={(wrestlerId) =>
                                  onTeamWrestlerSelect(
                                    card.index,
                                    "participants",
                                    wIdx,
                                    wrestlerId,
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={styles.matchTeams}>
                        {matchConfig.map((team, teamIndex) => (
                          <Fragment key={team.key}>
                            <div className={styles.matchTeam}>
                              <strong>{team.label}</strong>
                              {Array.from({ length: team.size }).map((_, wIdx) => (
                                <WrestlerPicker
                                  id={`match-${card.index}-${team.key}-wrestler-${wIdx}`}
                                  label={`${team.label}, wrestler ${wIdx + 1}, match ${itemNumber}`}
                                  key={wIdx}
                                  value={String(match[team.key]?.[wIdx] || "")}
                                  wrestlers={sortedWrestlers}
                                  onChange={(wrestlerId) =>
                                    onTeamWrestlerSelect(
                                      card.index,
                                      team.key,
                                      wIdx,
                                      wrestlerId,
                                    )
                                  }
                                />
                              ))}
                            </div>
                            {teamIndex < matchConfig.length - 1 && (
                              <span className={styles.versus}>VS</span>
                            )}
                          </Fragment>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {segment && (
                  <>
                    <label htmlFor={`segment-${card.index}-title`}>Segment title</label>
                    <input
                      id={`segment-${card.index}-title`}
                      type="text"
                      placeholder="e.g. Champion promo, backstage attack..."
                      value={segment.title}
                      onChange={(event) =>
                        onSegmentChange(card.index, "title", event.target.value)
                      }
                    />

                    <label htmlFor={`segment-${card.index}-description`}>Description</label>
                    <textarea
                      id={`segment-${card.index}-description`}
                      placeholder="Describe what happens in the scene..."
                      value={segment.description}
                      onChange={(event) =>
                        onSegmentChange(card.index, "description", event.target.value)
                      }
                    />

                    <span>Participants</span>
                    {segment.selected_wrestlers.map((wrestlerId, wrestlerIndex) => (
                      <WrestlerPicker
                        id={`segment-${card.index}-participant-${wrestlerIndex}`}
                        label={`Participant ${wrestlerIndex + 1} in segment ${itemNumber}`}
                        key={wrestlerIndex}
                        value={String(wrestlerId || "")}
                        wrestlers={sortedWrestlers}
                        onChange={(id) =>
                          onSegmentWrestlerSelect(card.index, wrestlerIndex, id)
                        }
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => onAddWrestlerToSegment(card.index)}
                    >
                      + Add participant
                    </button>
                  </>
                )}
              </div>
              <div className={styles.insertCardActions}>
                <button
                  type="button"
                  onClick={() => onAddCard("match", cardIndex)}
                >
                  + Add match below
                </button>
                <button
                  type="button"
                  onClick={() => onAddCard("segment", cardIndex)}
                >
                  + Add segment below
                </button>
              </div>
            </Fragment>
          );
        })}
        <div className={styles.insertCardActions}>
          <button type="button" onClick={() => onAddCard("match", cardOrder.length - 1)}>
            + Add match to card
          </button>
          <button type="button" onClick={() => onAddCard("segment", cardOrder.length - 1)}>
            + Add segment to card
          </button>
        </div>

        <div className={styles.modalActions} style={{ marginTop: "20px" }}>
          <button type="button" onClick={onClose} className={styles.btnCancel}>
            Cancel
          </button>
          <button type="button" onClick={onSave}>Save card</button>
        </div>
    </AccessibleDialog>
  );
}
