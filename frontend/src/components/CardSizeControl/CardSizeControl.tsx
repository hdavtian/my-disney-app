import { useCallback } from "react";
import "./CardSizeControl.scss";

export interface CardSizeControlProps {
  currentColumns: number;
  minColumns: number;
  maxColumns: number;
  defaultColumns: number;
  onChange: (columns: number) => void;
  labels?: string[];
}

export const CardSizeControl = ({
  currentColumns,
  minColumns,
  maxColumns,
  defaultColumns,
  onChange,
}: CardSizeControlProps) => {
  // Use default if current is 0 or out of bounds
  const activeColumns =
    currentColumns === 0 ||
    currentColumns < minColumns ||
    currentColumns > maxColumns
      ? defaultColumns
      : currentColumns;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(event.target.value));
    },
    [onChange]
  );

  const columnValues = Array.from(
    { length: maxColumns - minColumns + 1 },
    (_, i) => minColumns + i
  );

  return (
    <div className="card-size-control">
      <label htmlFor="grid-size-slider" className="card-size-control__label">
        Grid Size
      </label>
      <div className="card-size-control__slider-container">
        <input
          id="grid-size-slider"
          type="range"
          min={minColumns}
          max={maxColumns}
          step={1}
          value={activeColumns}
          onChange={handleChange}
          className="card-size-control__slider"
          aria-label="Adjust grid size"
          aria-valuemin={minColumns}
          aria-valuemax={maxColumns}
          aria-valuenow={activeColumns}
          aria-valuetext={`${activeColumns} columns`}
        />
        <div className="card-size-control__labels">
          {columnValues.map((value) => (
            <span
              key={value}
              className="card-size-control__tick"
              data-value={value}
            >
              {value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
