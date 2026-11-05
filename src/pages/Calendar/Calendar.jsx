import { useCallback, useEffect, useState } from "react";
import styles from "./calendar.module.css";
import { supabase } from "../../lib/supabaseClient";
import { DAYS_IN_MONTH, MONTHS, WEEK_DAYS } from "./calendarConstants";
import { TiPlus } from "react-icons/ti";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import AddShowModal from "../../components/modals/addShowModal.jsx";
import ViewCardModal from "../../components/modals/viewCardModal.jsx";
import BookingModal from "../../components/modals/bookingModal.jsx";
import LoadingSpinner from "../../components/animations/LoadingSpinner.jsx";
import { useAuth } from "../../context/useAuth.js";

const formatWrestlers = (rosterWrestlers) =>
  rosterWrestlers
    .map((wrestler) => ({
      ...wrestler,
      id: wrestler.superstar_id || wrestler.id,
    }))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

function Calendar() {
  const daysArray = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1);
  const { user } = useAuth();

  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(null);

  const [shows, setShows] = useState([]);
  const [brands, setBrands] = useState([]);
  const [wrestlers, setWrestlers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeShow, setActiveShow] = useState(null);

  const [newBrandId, setNewBrandId] = useState("");
  const [newMatchesCount, setNewMatchesCount] = useState(3);

  const [matchesData, setMatchesData] = useState([]);
  const [segmentsData, setSegmentsData] = useState([]);

  const formatDateKey = (year, monthIdx, day) => {
    const formattedMonth = String(monthIdx + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  const fetchInitialData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const [showsRes, eventsRes, wrestlersRes] = await Promise.all([
        supabase.from("shows").select("*").eq("user_id", user.id),
        supabase.from("events").select("*"),
        supabase
          .from("user_superstars")
          .select("id, superstar_id, name, image_url")
          .eq("user_id", user.id),
      ]);

      const queryError =
        showsRes.error || eventsRes.error || wrestlersRes.error;
      if (queryError) {
        console.error("Failed to load calendar data:", queryError.message);
        setLoadError("Could not load all calendar data.");
      }

      if (eventsRes.data) {
        setBrands(eventsRes.data);
      }

      if (showsRes.data && eventsRes.data) {
        const formattedShows = showsRes.data.map((show) => {
          const eventId = show.brand_id || show.event_id;
          const matchedEvent = eventsRes.data.find(
            (e) => String(e.id) === String(eventId),
          );
          return {
            ...show,
            events: matchedEvent || null,
          };
        });
        setShows(formattedShows);
      }

      if (wrestlersRes.data) {
        setWrestlers(formatWrestlers(wrestlersRes.data));
      }
    } catch (error) {
      console.error("Unexpected error loading calendar:", error);
      setLoadError("Could not load calendar data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const prevMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(currentMonthIndex - 1);
    } else {
      setCurrentMonthIndex(MONTHS.length - 1);
      setCurrentYear((prevYear) => prevYear - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonthIndex < MONTHS.length - 1) {
      setCurrentMonthIndex(currentMonthIndex + 1);
    } else {
      setCurrentMonthIndex(0);
      setCurrentYear((prevYear) => prevYear + 1);
    }
    setSelectedDay(null);
  };

  const handleOpenAddModal = (dayNumber) => {
    setSelectedDay(dayNumber);
    setNewBrandId(brands[0]?.id || "");
    setNewMatchesCount(3);
    setShowAddModal(true);
  };

  const handleCreateShow = async (showPayload) => {
    const targetBrandId = showPayload?.brandId || newBrandId || brands[0]?.id;
    const targetMatches = showPayload?.matchesCount || newMatchesCount || 1;
    const targetDay = showPayload?.day || selectedDay;

    if (!targetDay || !targetBrandId || !user) return;

    const dateKey = formatDateKey(currentYear, currentMonthIndex, targetDay);

    const { data, error } = await supabase
      .from("shows")
      .insert([
        {
          date: dateKey,
          brand_id: Number(targetBrandId),
          matches_count: Number(targetMatches),
          is_booked: false,
          user_id: user.id,
        },
      ])
      .select("*");

    if (error) {
      alert("Could not create show: " + error.message);
    } else if (data && data.length > 0) {
      const selectedEvent = brands.find(
        (b) => String(b.id) === String(targetBrandId),
      );
      const newShowObj = {
        ...data[0],
        events: selectedEvent || null,
      };

      setShows((prevShows) => [...prevShows, newShowObj]);
      setShowAddModal(false);
    }
  };

  const handleDeleteShow = async (showId) => {
    const show = shows.find((item) => item.id === showId);
    const eventName = show?.events?.event_name || show?.events?.name || "this show";
    if (!window.confirm(`Delete ${eventName} on ${show?.date}?`)) return;

    const { error } = await supabase
      .from("shows")
      .delete()
      .eq("id", showId)
      .eq("user_id", user.id);
    if (error) {
      alert("Could not delete show: " + error.message);
    } else {
      setShows(shows.filter((s) => s.id !== showId));
    }
  };

  const mapWrestlersToTeams = (type, wrestlerIds = []) => {
    if (type.startsWith("rumble_")) {
      return { participants: wrestlerIds };
    }

    const teamSizes = {
      "1v1": [1, 1],
      "2v2": [2, 2],
      "3v3": [3, 3],
      "4v4": [4, 4],
      "1v2": [1, 2],
      "1v3": [1, 3],
      "2v3": [2, 3],
      "1v1v1": [1, 1, 1],
      "2v2v2": [2, 2, 2],
      "1v1v1v1": [1, 1, 1, 1],
      "2v2v2v2": [2, 2, 2, 2],
      "1v1v1v1v1": [1, 1, 1, 1, 1],
      "1v1v1v1v1v1": [1, 1, 1, 1, 1, 1],
    };

    const sizes = teamSizes[type] || [1, 1];
    const keys = ["team_a", "team_b", "team_c", "team_d", "team_e", "team_f"];
    const result = {};

    let index = 0;
    sizes.forEach((size, i) => {
      const key = keys[i];
      result[key] = wrestlerIds.slice(index, index + size);
      index += size;
    });

    return result;
  };

  const handleOpenBookingModal = async (show) => {
    if (!user) return;

    const { data: rosterWrestlers, error: wrestlersError } = await supabase
      .from("user_superstars")
      .select("id, superstar_id, name, image_url")
      .eq("user_id", user.id);

    if (wrestlersError) {
      console.error("Failed to refresh booking roster:", wrestlersError);
      alert("Could not load wrestlers: " + wrestlersError.message);
      return;
    }

    setWrestlers(formatWrestlers(rosterWrestlers || []));
    setActiveShow(show);

    if (show.is_booked) {
      const [matchesRes, segmentsRes] = await Promise.all([
        supabase
          .from("matches")
          .select("*")
          .eq("show_id", show.id)
          .order("match_number", { ascending: true }),
        supabase
          .from("segments")
          .select("*")
          .eq("show_id", show.id)
          .order("segment_number", { ascending: true }),
      ]);

      const cardError = matchesRes.error || segmentsRes.error;
      if (cardError) {
        console.error("Failed to load booking:", cardError.message);
        alert("Could not load matches and segments for this show.");
        return;
      }

      if (matchesRes.data && matchesRes.data.length > 0) {
        setMatchesData(
          matchesRes.data.map((m) => {
            const matchType = m.match_type || "1v1";
            const teamStructure = mapWrestlersToTeams(
              matchType,
              m.wrestler_ids || [],
            );
            return {
              match_number: m.match_number,
              stipulation: m.stipulation || "",
              match_type: matchType,
              ...teamStructure,
            };
          }),
        );
      } else {
        setMatchesData(
          Array.from({ length: show.matches_count }, (_, index) => ({
            match_number: index + 1,
            stipulation: "",
            match_type: "1v1",
            team_a: [""],
            team_b: [""],
          })),
        );
      }

      if (segmentsRes.data && segmentsRes.data.length > 0) {
        setSegmentsData(
          segmentsRes.data.map((s) => ({
            segment_number: s.segment_number,
            title: s.title || "",
            description: s.description || "",
            selected_wrestlers: s.wrestler_ids || [""],
          })),
        );
      } else {
        setSegmentsData([
          {
            segment_number: 1,
            title: "Open Promo",
            description: "",
            selected_wrestlers: [""],
          },
        ]);
      }
    } else {
      setMatchesData(
        Array.from({ length: show.matches_count }, (_, index) => ({
          match_number: index + 1,
          stipulation: "",
          match_type: "1v1",
          team_a: [""],
          team_b: [""],
        })),
      );

      setSegmentsData([
        {
          segment_number: 1,
          title: "Open Promo",
          description: "",
          selected_wrestlers: [""],
        },
      ]);
    }

    setShowBookingModal(true);
  };

  const handleOpenEditModal = (show) => {
    setShowViewModal(false);
    handleOpenBookingModal(show);
  };

  const handleAddMatch = () => {
    setMatchesData([
      ...matchesData,
      {
        match_number: matchesData.length + 1,
        stipulation: "",
        match_type: "1v1",
        team_a: [""],
        team_b: [""],
      },
    ]);
  };

  const handleRemoveMatch = (index) => {
    const updated = matchesData
      .filter((_, idx) => idx !== index)
      .map((m, idx) => ({ ...m, match_number: idx + 1 }));
    setMatchesData(updated);
  };

  const handleMatchChange = (index, field, value) => {
    const updated = [...matchesData];
    updated[index][field] = value;
    setMatchesData(updated);
  };

  const handleTeamWrestlerSelect = (
    matchIndex,
    teamKey,
    wrestlerIndex,
    wrestlerId,
  ) => {
    const updated = [...matchesData];
    const match = { ...updated[matchIndex] };
    const teamArray = match[teamKey] ? [...match[teamKey]] : [];

    teamArray[wrestlerIndex] = wrestlerId;
    match[teamKey] = teamArray;
    updated[matchIndex] = match;

    setMatchesData(updated);
  };

  const handleAddSegment = () => {
    setSegmentsData([
      ...segmentsData,
      {
        segment_number: segmentsData.length + 1,
        title: "",
        description: "",
        selected_wrestlers: [""],
      },
    ]);
  };

  const handleRemoveSegment = (index) => {
    const updated = segmentsData
      .filter((_, idx) => idx !== index)
      .map((s, idx) => ({ ...s, segment_number: idx + 1 }));
    setSegmentsData(updated);
  };

  const handleSegmentChange = (index, field, value) => {
    const updated = [...segmentsData];
    updated[index][field] = value;
    setSegmentsData(updated);
  };

  const handleSegmentWrestlerSelect = (
    segmentIndex,
    wrestlerIndex,
    wrestlerId,
  ) => {
    const updated = [...segmentsData];
    updated[segmentIndex].selected_wrestlers[wrestlerIndex] = wrestlerId;
    setSegmentsData(updated);
  };

  const handleAddWrestlerToSegment = (segmentIndex) => {
    const updated = [...segmentsData];
    updated[segmentIndex].selected_wrestlers.push("");
    setSegmentsData(updated);
  };

  const handleSaveBooking = async () => {
    if (!activeShow) return;

    if (activeShow.is_booked) {
      const [matchesDelete, segmentsDelete] = await Promise.all([
        supabase.from("matches").delete().eq("show_id", activeShow.id),
        supabase.from("segments").delete().eq("show_id", activeShow.id),
      ]);
      const deleteError = matchesDelete.error || segmentsDelete.error;
      if (deleteError) {
        console.error("Failed to replace show card:", deleteError.message);
        alert("Could not replace the card. Check the show before trying again.");
        return;
      }
    }

    const matchesPayload = matchesData.map((m, idx) => {
      const allWrestlerIds = m.participants
        ? m.participants
        : [
            ...(m.team_a || []),
            ...(m.team_b || []),
            ...(m.team_c || []),
            ...(m.team_d || []),
            ...(m.team_e || []),
            ...(m.team_f || []),
          ];

      return {
        show_id: activeShow.id,
        match_number: idx + 1,
        stipulation: m.stipulation || "",
        match_type: m.match_type || "1v1",
        wrestler_ids: allWrestlerIds.filter(Boolean),
        user_id: user.id,
      };
    });

    const segmentsPayload = segmentsData.map((s, idx) => ({
      show_id: activeShow.id,
      segment_number: idx + 1,
      title: s.title || "Segment",
      description: s.description || "",
      wrestler_ids: s.selected_wrestlers.filter(Boolean),
      user_id: user.id,
    }));

    if (matchesPayload.length > 0) {
      const { error: matchesError } = await supabase
        .from("matches")
        .insert(matchesPayload);

      if (matchesError) {
        alert("Could not save matches: " + matchesError.message);
        return;
      }
    }

    if (segmentsPayload.length > 0) {
      const { error: segmentsError } = await supabase
        .from("segments")
        .insert(segmentsPayload);

      if (segmentsError) {
        alert("Could not save segments: " + segmentsError.message);
        return;
      }
    }

    const { error: showUpdateError } = await supabase
      .from("shows")
      .update({
        is_booked: true,
        matches_count: matchesData.length,
      })
      .eq("id", activeShow.id);

    if (showUpdateError) {
      alert("Could not update show status: " + showUpdateError.message);
    } else {
      setShows(
        shows.map((s) =>
          s.id === activeShow.id
            ? { ...s, is_booked: true, matches_count: matchesData.length }
            : s,
        ),
      );
      setShowBookingModal(false);
    }
  };

  const handleOpenViewModal = async (show) => {
    setActiveShow(show);

    const [matchesRes, segmentsRes] = await Promise.all([
      supabase
        .from("matches")
        .select("*")
        .eq("show_id", show.id)
        .order("match_number", { ascending: true }),
      supabase
        .from("segments")
        .select("*")
        .eq("show_id", show.id)
        .order("segment_number", { ascending: true }),
    ]);

    const queryError = matchesRes.error || segmentsRes.error;
    if (queryError) {
      console.error("Failed to load show card:", queryError.message);
      alert("Could not load this show's card.");
      return;
    }

    if (matchesRes.data) {
      const formattedMatches = matchesRes.data.map((m) => {
        const matchType = m.match_type || "1v1";
        const teamStructure = mapWrestlersToTeams(
          matchType,
          m.wrestler_ids || [],
        );
        return {
          ...m,
          match_type: matchType,
          stipulation: m.stipulation || "",
          ...teamStructure,
        };
      });
      setMatchesData(formattedMatches);
    }

    if (segmentsRes.data) {
      setSegmentsData(segmentsRes.data);
    }

    setShowViewModal(true);
  };

  if (loading)
    return (
      <div aria-busy="true" style={{ textAlign: "center", padding: "2rem", color: "white" }}>
        <LoadingSpinner />
      </div>
    );

  return (
    <>
      <section
        className={styles.calendarContainer}
        aria-labelledby="calendar-title"
      >
        {loadError && (
          <p role="alert" className={styles.loadError}>
            {loadError}
          </p>
        )}
        <div className={styles.calendarHeader}>
          <button
            type="button"
            onClick={prevMonth}
            style={{ color: "white" }}
            aria-label="Previous month"
          >
            <IoIosArrowBack />
          </button>
          <h1 id="calendar-title" aria-live="polite">
            {MONTHS[currentMonthIndex]} {currentYear}
          </h1>
          <button
            type="button"
            onClick={nextMonth}
            style={{ color: "white" }}
            aria-label="Next month"
          >
            <IoIosArrowForward />
          </button>
        </div>

        <div className={styles.calendarWeekdays}>
          {WEEK_DAYS.map((day, index) => (
            <div key={index} className={styles.weekday}>
              {day}
            </div>
          ))}
        </div>

        <div className={styles.calendarDays}>
          {daysArray.map((dayNumber) => {
            const isSelected = selectedDay === dayNumber;
            const dateKey = formatDateKey(
              currentYear,
              currentMonthIndex,
              dayNumber,
            );
            const dayShow = shows.find((s) => s.date === dateKey);

            return (
              <div
                key={dayNumber}
                className={`${styles.dayCell} ${dayShow ? styles.hasShow : ""} ${
                  isSelected ? styles.selected : ""
                }`}
                role="group"
                aria-label={`Day ${dayNumber} of ${MONTHS[currentMonthIndex]}${dayShow ? ", show scheduled" : ""}`}
              >
                <div className={styles.dayHeader}>
                  <button
                    type="button"
                    className={styles.selectDay}
                    aria-label={`Select day ${dayNumber} of ${MONTHS[currentMonthIndex]}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedDay(dayNumber)}
                  >
                    {dayNumber}
                  </button>
                  {dayShow && (
                    <button
                      type="button"
                      className={styles.deleteCardBtn}
                      aria-label={`Delete show on day ${dayNumber}`}
                      onClick={() => {
                        handleDeleteShow(dayShow.id);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                {dayShow ? (
                  <div className={styles.showContent}>
                    {dayShow.events?.image_url && (
                      <img
                        src={dayShow.events.image_url}
                        alt={
                          dayShow.events.event_name ||
                          dayShow.events.name ||
                          "Event"
                        }
                        className={styles.brandIcon}
                      />
                    )}

                    <small
                      className={styles.matchesCount}
                      aria-label={`${dayShow.matches_count} matches`}
                    >
                      {dayShow.matches_count}{" "}
                      <span className={styles.matchesLabel}>MATCHES</span>
                    </small>

                    {dayShow.is_booked ? (
                      <div className={styles.actionGroup}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => {
                            handleOpenViewModal(dayShow);
                          }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                          onClick={() => {
                            handleOpenBookingModal(dayShow);
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => {
                          handleOpenBookingModal(dayShow);
                        }}
                      >
                        Book
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.addShow}
                    onClick={() => handleOpenAddModal(dayNumber)}
                    aria-label={`Add show on day ${dayNumber}`}
                  >
                    <TiPlus />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {selectedDay && (
          <div
            className={styles.selectedInfo}
            role="status"
            aria-live="polite"
            style={{ color: "rgb(201, 197, 197)" }}
          >
            Selected day:{" "}
            <strong>
              {selectedDay} {MONTHS[currentMonthIndex]}
            </strong>
          </div>
        )}
      </section>

      {showAddModal && (
        <AddShowModal
          selectedDay={selectedDay}
          brands={brands}
          newBrandId={newBrandId}
          setNewBrandId={setNewBrandId}
          newMatchesCount={newMatchesCount}
          setNewMatchesCount={setNewMatchesCount}
          onClose={() => setShowAddModal(false)}
          onCreate={handleCreateShow}
        />
      )}

      {showBookingModal && activeShow && (
        <BookingModal
          activeShow={activeShow}
          matchesData={matchesData}
          segmentsData={segmentsData}
          wrestlers={wrestlers}
          onClose={() => setShowBookingModal(false)}
          onSave={handleSaveBooking}
          onAddMatch={handleAddMatch}
          onRemoveMatch={handleRemoveMatch}
          onMatchChange={handleMatchChange}
          onTeamWrestlerSelect={handleTeamWrestlerSelect}
          onAddSegment={handleAddSegment}
          onRemoveSegment={handleRemoveSegment}
          onSegmentChange={handleSegmentChange}
          onSegmentWrestlerSelect={handleSegmentWrestlerSelect}
          onAddWrestlerToSegment={handleAddWrestlerToSegment}
        />
      )}

      {showViewModal && activeShow && (
        <ViewCardModal
          activeShow={activeShow}
          matchesData={matchesData}
          segmentsData={segmentsData}
          wrestlers={wrestlers}
          onClose={() => setShowViewModal(false)}
          onEdit={() => handleOpenEditModal(activeShow)}
        />
      )}
    </>
  );
}

export default Calendar;
