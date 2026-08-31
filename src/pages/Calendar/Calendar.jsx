import React, { useEffect, useState } from "react";
import styles from "./calendar.module.css";
import { supabase } from "../../lib/supabaseClient";
import { DAYS_IN_MONTH, MONTHS, WEEK_DAYS } from "./calendarConstants";
import { TiPlus } from "react-icons/ti";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import AddShowModal from "../../components/modals/addShowModal.jsx";
import ViewCardModal from "../../components/modals/viewCardModal.jsx";
import BookingModal from "../../components/modals/bookingModal.jsx";
import LoadingSpinner from "../../components/animations/LoadingSpinner.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

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

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeShow, setActiveShow] = useState(null);

  const [newBrandId, setNewBrandId] = useState("");
  const [newMatchesCount, setNewMatchesCount] = useState(3);

  const [matchesData, setMatchesData] = useState([]);
  const [segmentsData, setSegmentsData] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const formatDateKey = (year, monthIdx, day) => {
    const formattedMonth = String(monthIdx + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  async function fetchInitialData() {
    if (!user) return;
    setLoading(true);

    const [showsRes, eventsRes, superstarsRes] = await Promise.all([
      supabase.from("shows").select("*").eq("user_id", user.id),
      supabase.from("events").select("*"),
      supabase.from("superstars").select("*"),
    ]);

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

    if (superstarsRes.data) {
      const sorted = [...superstarsRes.data].sort((a, b) =>
        (a.name || "").localeCompare(b.name || ""),
      );
      setWrestlers(sorted);
    }

    setLoading(false);
  }

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
      alert("Erro ao criar show: " + error.message);
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
    const { error } = await supabase.from("shows").delete().eq("id", showId);
    if (error) {
      alert("Erro ao excluir: " + error.message);
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

    teamArray[wrestlerIndex] = wrestlerId ? Number(wrestlerId) : "";
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
    updated[segmentIndex].selected_wrestlers[wrestlerIndex] = wrestlerId
      ? Number(wrestlerId)
      : "";
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
      await supabase.from("matches").delete().eq("show_id", activeShow.id);
      await supabase.from("segments").delete().eq("show_id", activeShow.id);
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
      title: s.title || "Segmento",
      description: s.description || "",
      wrestler_ids: s.selected_wrestlers.filter(Boolean),
      user_id: user.id,
    }));

    if (matchesPayload.length > 0) {
      const { error: matchesError } = await supabase
        .from("matches")
        .insert(matchesPayload);

      if (matchesError) {
        alert("Erro ao salvar lutas: " + matchesError.message);
        return;
      }
    }

    if (segmentsPayload.length > 0) {
      const { error: segmentsError } = await supabase
        .from("segments")
        .insert(segmentsPayload);

      if (segmentsError) {
        alert("Erro ao salvar segmentos: " + segmentsError.message);
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
      alert("Erro ao atualizar status do show: " + showUpdateError.message);
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
      <div style={{ textAlign: "center", padding: "2rem", color: "white" }}>
        <LoadingSpinner />
      </div>
    );

  return (
    <>
      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
          <button onClick={prevMonth} style={{ color: "white" }}>
            <IoIosArrowBack />
          </button>
          <h2>
            {MONTHS[currentMonthIndex]} {currentYear}
          </h2>
          <button onClick={nextMonth} style={{ color: "white" }}>
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
                onClick={() => setSelectedDay(dayNumber)}
              >
                <div className={styles.dayHeader}>
                  <span className={styles.dayNumber}>{dayNumber}</span>
                  {dayShow && (
                    <button
                      className={styles.deleteCardBtn}
                      title="Excluir Show"
                      onClick={(e) => {
                        e.stopPropagation();
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

                    <small className={styles.matchesCount}>
                      {dayShow.matches_count} LUTAS
                    </small>

                    {dayShow.is_booked ? (
                      <div className={styles.actionGroup}>
                        <button
                          className={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenViewModal(dayShow);
                          }}
                        >
                          Exibition
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBookingModal(dayShow);
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <button
                        className={styles.actionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenBookingModal(dayShow);
                        }}
                      >
                        Bookar
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    className={styles.addShow}
                    onClick={() => handleOpenAddModal(dayNumber)}
                    title="Adicionar Show"
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
            style={{ color: "rgb(201, 197, 197)" }}
          >
            Dia selecionado:{" "}
            <strong>
              {selectedDay} de {MONTHS[currentMonthIndex]}
            </strong>
          </div>
        )}
      </div>

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
