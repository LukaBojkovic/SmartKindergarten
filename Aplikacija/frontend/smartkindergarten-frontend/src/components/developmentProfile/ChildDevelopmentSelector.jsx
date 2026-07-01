import Select from "react-select";

function ChildDevelopmentSelector({
  childOptions,
  selectedChildOption,
  onChildChange,
  isLoading,
}) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Izbor deteta</h5>

        <Select
          classNamePrefix="app-select"
          value={selectedChildOption}
          onChange={onChildChange}
          options={childOptions}
          placeholder={
            isLoading ? "Učitavanje dece..." : "Izaberi dete..."
          }
          isDisabled={isLoading}
          isClearable
        />
      </div>
    </div>
  );
}

export default ChildDevelopmentSelector;
