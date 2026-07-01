import Select from "react-select";
import DatePickerInput from "../common/DatePickerInput";

function AttendanceFilters({
  groupOptions,
  selectedGroupOption,
  selectedDate,
  isLoadingGroups,
  onGroupChange,
  onDateChange,
}) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Filteri</h5>

        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label">Grupa</label>
            <Select
              classNamePrefix="app-select"
              value={selectedGroupOption}
              onChange={onGroupChange}
              options={groupOptions}
              placeholder={isLoadingGroups ? "Učitavanje grupa..." : "Izaberi grupu..."}
              isDisabled={isLoadingGroups}
              isClearable
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Datum</label>
            <DatePickerInput
              name="date"
              value={selectedDate}
              onChange={onDateChange}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceFilters;
