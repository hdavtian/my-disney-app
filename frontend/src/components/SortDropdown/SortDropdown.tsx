import "./SortDropdown.scss";

export interface SortOption {
  key: string;
  label: string;
  icon?: string;
}

export interface SortDropdownProps {
  options: SortOption[];
  value?: string | null;
  onChange: (sortKey: string | null) => void;
  className?: string;
  label?: string;
}

export const SortDropdown = ({
  options,
  value,
  onChange,
  className = "",
  label = "Sort by",
}: SortDropdownProps) => {
  return (
    <div className={`sort-dropdown ${className}`}>
      <label htmlFor="sort-select" className="sort-dropdown__label">
        {label}
      </label>
      <select
        id="sort-select"
        className="sort-dropdown__select"
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">Sorting</option>
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.icon && <span>{option.icon} </span>}
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
