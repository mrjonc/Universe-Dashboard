import { useEffect, useState } from "react";
import styles from "./CalendarModal.module.css";

export default function WrestlerPicker({
  id,
  label,
  value,
  wrestlers,
  onChange,
}) {
  const selectedWrestler = wrestlers.find(
    (wrestler) => String(wrestler.id) === String(value || ""),
  );
  const [typedName, setTypedName] = useState(selectedWrestler?.name || "");

  useEffect(() => {
    setTypedName(selectedWrestler?.name || "");
  }, [selectedWrestler?.id, selectedWrestler?.name]);

  const handleNameChange = (event) => {
    const name = event.target.value;
    setTypedName(name);
    const selected = wrestlers.find(
      (wrestler) =>
        wrestler.name?.toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
    );
    if (selected) onChange(String(selected.id));
  };

  const handleNameBlur = () => {
    const selected = wrestlers.find(
      (wrestler) =>
        wrestler.name?.toLocaleLowerCase() ===
        typedName.trim().toLocaleLowerCase(),
    );
    if (!selected) onChange("");
  };

  return (
    <>
      <select
        className={styles.desktopWrestlerSelect}
        aria-label={label}
        value={String(value || "")}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">-- Select a wrestler --</option>
        {wrestlers.map((wrestler) => (
          <option key={wrestler.id} value={String(wrestler.id)}>
            {wrestler.name}
          </option>
        ))}
      </select>
      <input
        id={id}
        className={styles.mobileWrestlerInput}
        type="text"
        autoComplete="off"
        list={`${id}-wrestlers`}
        aria-label={label}
        placeholder="Type a wrestler name"
        value={typedName}
        onChange={handleNameChange}
        onBlur={handleNameBlur}
      />
      <datalist id={`${id}-wrestlers`}>
        {wrestlers.map((wrestler) => (
          <option key={wrestler.id} value={wrestler.name} />
        ))}
      </datalist>
    </>
  );
}
