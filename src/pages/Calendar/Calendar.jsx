import React, { useEffect, useState } from "react";
import styles from "./calendar.module.css";
import { supabase } from "../../lib/supabaseClient";

function Calendar() {
  const daysInMonth = 28;

  const months = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO",
  ];

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Mês e ano
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(null);

  // Supabase
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

  // Lutas e Segmentos
  const [matchesData, setMatchesData] = useState([]);
  const [segmentsData, setSegmentsData] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    const [showsRes, brandsRes, superstarsRes] = await Promise.all([
      supabase.from("shows").select(`*, brands (name, image_url)`),
      supabase.from("brands").select("*"),
      supabase.from("superstars").select("*"),
    ]);

    if (showsRes.data) setShows(showsRes.data);
    if (brandsRes.data) setBrands(brandsRes.data);
    if (superstarsRes.data) setWrestlers(superstarsRes.data);
    setLoading(false);
  }

  const prevMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(currentMonthIndex - 1);
    } else {
      setCurrentMonthIndex(months.length - 1);
      setCurrentYear((prevYear) => prevYear - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonthIndex < months.length - 1) {
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

  const handleCreateShow = async () => {
    if (!selectedDay || !newBrandId) return;

    const dateKey = `${currentYear}-${currentMonthIndex + 1}-${selectedDay}`;

    const { data, error } = await supabase
      .from("shows")
      .insert([
        {
          date: dateKey,
          brand_id: newBrandId,
          matches_count: Number(newMatchesCount),
          is_booked: false,
        },
      ])
      .select(`*, brands (name, image_url)`);

    if (error) {
      alert("Erro ao criar show: " + error.message);
    } else {
      setShows([...shows, data[0]]);
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
          matchesRes.data.map((m) => ({
            match_number: m.match_number,
            stipulation: m.stipulation,
            wrestlers_count: m.wrestler_ids ? m.wrestler_ids.length : 2,
            selected_wrestlers: m.wrestler_ids || ["", ""],
          })),
        );
      } else {
        setMatchesData(
          Array.from({ length: show.matches_count }, (_, index) => ({
            match_number: index + 1,
            stipulation: "Singles Match",
            wrestlers_count: 2,
            selected_wrestlers: ["", ""],
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
            title: "Promo de Abertura",
            description: "",
            selected_wrestlers: [""],
          },
        ]);
      }
    } else {
      const initialMatches = Array.from(
        { length: show.matches_count },
        (_, index) => ({
          match_number: index + 1,
          stipulation: "Singles Match",
          wrestlers_count: 2,
          selected_wrestlers: ["", ""],
        }),
      );

      const initialSegments = [
        {
          segment_number: 1,
          title: "Promo de Abertura",
          description: "",
          selected_wrestlers: [""],
        },
      ];

      setMatchesData(initialMatches);
      setSegmentsData(initialSegments);
    }

    setShowBookingModal(true);
  };

  // Funções para manipular LUTAS
  const handleAddMatch = () => {
    setMatchesData([
      ...matchesData,
      {
        match_number: matchesData.length + 1,
        stipulation: "Singles Match",
        wrestlers_count: 2,
        selected_wrestlers: ["", ""],
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

    if (field === "wrestlers_count") {
      const count = Number(value);
      const currentSelected = updated[index].selected_wrestlers;
      if (count > currentSelected.length) {
        while (currentSelected.length < count) currentSelected.push("");
      } else {
        updated[index].selected_wrestlers = currentSelected.slice(0, count);
      }
    }
    setMatchesData(updated);
  };

  const handleWrestlerSelect = (matchIndex, wrestleIndex, wrestlerId) => {
    const updated = [...matchesData];
    updated[matchIndex].selected_wrestlers[wrestleIndex] = wrestlerId
      ? Number(wrestlerId)
      : "";
    setMatchesData(updated);
  };

  // Funções para manipular SEGMENTOS
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

  // Salvar Booking (Lutas + Segmentos)
  const handleSaveBooking = async () => {
    if (!activeShow) return;

    if (activeShow.is_booked) {
      await supabase.from("matches").delete().eq("show_id", activeShow.id);
      await supabase.from("segments").delete().eq("show_id", activeShow.id);
    }

    const matchesPayload = matchesData.map((m, idx) => ({
      show_id: activeShow.id,
      match_number: idx + 1,
      stipulation: m.stipulation,
      wrestler_ids: m.selected_wrestlers.filter(Boolean),
    }));

    const segmentsPayload = segmentsData.map((s, idx) => ({
      show_id: activeShow.id,
      segment_number: idx + 1,
      title: s.title || "Segmento",
      description: s.description || "",
      wrestler_ids: s.selected_wrestlers.filter(Boolean),
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

    if (matchesRes.data) setMatchesData(matchesRes.data);
    if (segmentsRes.data) setSegmentsData(segmentsRes.data);

    setShowViewModal(true);
  };

  if (loading) return <p>Carregando calendário...</p>;

  return (
    <>
      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
          <button onClick={prevMonth}>&lt;</button>
          <h2>
            {months[currentMonthIndex]} {currentYear}
          </h2>
          <button onClick={nextMonth}>&gt;</button>
        </div>

        <div className={styles.calendarWeekdays}>
          {weekDays.map((day, index) => (
            <div key={index} className={styles.weekday}>
              {day}
            </div>
          ))}
        </div>

        <div className={styles.calendarDays}>
          {daysArray.map((dayNumber) => {
            const isSelected = selectedDay === dayNumber;
            const dateKey = `${currentYear}-${currentMonthIndex + 1}-${dayNumber}`;
            const dayShow = shows.find((s) => s.date === dateKey);

            return (
              <div
                key={dayNumber}
                className={`${styles.dayCell} ${isSelected ? styles.selected : ""}`}
                onClick={() => setSelectedDay(dayNumber)}
              >
                <span>{dayNumber}</span>

                {dayShow ? (
                  <div className={styles.showContent}>
                    {dayShow.brands?.image_url && (
                      <img
                        src={dayShow.brands.image_url}
                        alt={dayShow.brands.name}
                        className={styles.brandIcon}
                      />
                    )}

                    <small>Lutas: {dayShow.matches_count}</small>

                    {dayShow.is_booked ? (
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleOpenViewModal(dayShow)}
                        >
                          Exibir
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleOpenBookingModal(dayShow)}
                        >
                          Editar Book
                        </button>
                      </div>
                    ) : (
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleOpenBookingModal(dayShow)}
                      >
                        Bookar
                      </button>
                    )}

                    <div className={styles.showControls}>
                      <button onClick={() => handleOpenBookingModal(dayShow)}>
                        Editar
                      </button>
                      <button onClick={() => handleDeleteShow(dayShow.id)}>
                        Excluir
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className={styles.addShow}
                    onClick={() => handleOpenAddModal(dayNumber)}
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {selectedDay && (
          <div className={styles.selectedInfo}>
            Dia selecionado:{" "}
            <strong>
              {selectedDay} de {months[currentMonthIndex]}
            </strong>
          </div>
        )}
      </div>

      {/* MODAL: CRIAR SHOW */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Adicionar Show - Dia {selectedDay}</h3>

            <label>Brand:</label>
            <select
              value={newBrandId}
              onChange={(e) => setNewBrandId(e.target.value)}
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <label>Qtd. de Lutas:</label>
            <input
              type="number"
              min="1"
              value={newMatchesCount}
              onChange={(e) => setNewMatchesCount(e.target.value)}
            />

            <div className={styles.modalActions}>
              <button onClick={() => setShowAddModal(false)}>Cancelar</button>
              <button onClick={handleCreateShow}>Criar Show</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BOOKAR/EDITAR SHOW (LUTAS + SEGMENTOS) */}
      {showBookingModal && activeShow && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Bookar Evento ({activeShow.brands?.name})</h3>

            {/* SEÇÃO DE LUTAS */}
            <h4>--- LUTAS ---</h4>
            {matchesData.map((match, idx) => (
              <div key={idx} className={styles.matchBox}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h5>Luta {idx + 1}</h5>
                  {matchesData.length > 1 && (
                    <button onClick={() => handleRemoveMatch(idx)}>
                      Excluir Luta
                    </button>
                  )}
                </div>

                <label>Estipulação:</label>
                <input
                  type="text"
                  value={match.stipulation}
                  onChange={(e) =>
                    handleMatchChange(idx, "stipulation", e.target.value)
                  }
                />

                <label>Qtd. de Lutadores:</label>
                <input
                  type="number"
                  min="2"
                  value={match.wrestlers_count}
                  onChange={(e) =>
                    handleMatchChange(idx, "wrestlers_count", e.target.value)
                  }
                />

                <label>Lutadores:</label>
                {Array.from({ length: match.wrestlers_count }).map(
                  (_, wIdx) => (
                    <select
                      key={wIdx}
                      value={match.selected_wrestlers[wIdx] || ""}
                      onChange={(e) =>
                        handleWrestlerSelect(idx, wIdx, e.target.value)
                      }
                    >
                      <option value="">-- Selecione o Lutador --</option>
                      {wrestlers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  ),
                )}
              </div>
            ))}

            <button
              type="button"
              className={styles.addShow}
              onClick={handleAddMatch}
              style={{ marginTop: "10px", width: "100%" }}
            >
              + Adicionar Nova Luta
            </button>

            {/* SEÇÃO DE SEGMENTOS */}
            <h4>--- SEGMENTOS ---</h4>
            {segmentsData.map((seg, sIdx) => (
              <div key={sIdx} className={styles.matchBox}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h5>Segmento {sIdx + 1}</h5>
                  <button onClick={() => handleRemoveSegment(sIdx)}>
                    Excluir
                  </button>
                </div>

                <label>Título do Segmento:</label>
                <input
                  type="text"
                  placeholder="Ex: Promo do Campeão, Ataque Backstage..."
                  value={seg.title}
                  onChange={(e) =>
                    handleSegmentChange(sIdx, "title", e.target.value)
                  }
                />

                <label>Descrição / Roteiro:</label>
                <textarea
                  placeholder="Detalhes do que acontece na cena..."
                  value={seg.description}
                  onChange={(e) =>
                    handleSegmentChange(sIdx, "description", e.target.value)
                  }
                />

                <label>Participantes:</label>
                {seg.selected_wrestlers.map((wId, wIdx) => (
                  <select
                    key={wIdx}
                    value={wId || ""}
                    onChange={(e) =>
                      handleSegmentWrestlerSelect(sIdx, wIdx, e.target.value)
                    }
                  >
                    <option value="">-- Selecione o Participante --</option>
                    {wrestlers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddWrestlerToSegment(sIdx)}
                >
                  + Adicionar Participante
                </button>
              </div>
            ))}

            <button
              type="button"
              className={styles.addShow}
              onClick={handleAddSegment}
              style={{ marginTop: "10px", width: "100%" }}
            >
              + Adicionar Novo Segmento
            </button>

            <div className={styles.modalActions} style={{ marginTop: "20px" }}>
              <button onClick={() => setShowBookingModal(false)}>
                Cancelar
              </button>
              <button onClick={handleSaveBooking}>Salvar Card</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXIBIR CARD (LUTAS E SEGMENTOS) */}
      {showViewModal && activeShow && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Match Card - {activeShow.brands?.name}</h3>

            {/* LISTA DE LUTAS */}
            <h4>Lutas</h4>
            {matchesData.length === 0 && <p>Nenhuma luta cadastrada.</p>}
            {matchesData.map((m) => (
              <div key={m.id || m.match_number} className={styles.cardDetail}>
                <strong>
                  Luta {m.match_number}: {m.stipulation}
                </strong>
                <ul>
                  {m.wrestler_ids?.map((wId, i) => {
                    const wrestler = wrestlers.find((w) => w.id == wId);
                    return (
                      <li key={i}>
                        {wrestler ? wrestler.name : "Não definido"}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {/* LISTA DE SEGMENTOS */}
            <h4>Segmentos</h4>
            {segmentsData.length === 0 && <p>Nenhum segmento cadastrado.</p>}
            {segmentsData.map((s) => (
              <div key={s.id || s.segment_number} className={styles.cardDetail}>
                <strong>
                  Segmento {s.segment_number}: {s.title}
                </strong>
                {s.description && <p>{s.description}</p>}
                <ul>
                  {s.wrestler_ids?.map((wId, i) => {
                    const wrestler = wrestlers.find((w) => w.id == wId);
                    return (
                      <li key={i}>
                        {wrestler ? wrestler.name : "Não definido"}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <div className={styles.modalActions}>
              <button onClick={() => setShowViewModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Calendar;
