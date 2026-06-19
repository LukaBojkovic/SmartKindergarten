import Select from "react-select";

function ChildParentsManager({
  selectedChild,
  parentOptions,
  selectedParentOption,
  isSaving,
  onParentOptionChange,
  onAssignParent,
  onRemoveParent,
}) {
  if (!selectedChild) 
    {
    return (
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <div className="alert alert-info mb-0">
            Izaberi dete iz tabele da upravljaš njegovim roditeljima.
          </div>
        </div>
      </div>
    );
    }

  const parents = selectedChild.parents || [];

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body">
        <h5 className="card-title">
          Roditelji deteta: {selectedChild.firstName} {selectedChild.lastName}
        </h5>

        <div className="d-flex gap-2 mb-3">
          <div className="flex-fill">
            <Select
              value={selectedParentOption}
              onChange={onParentOptionChange}
              options={parentOptions}
              placeholder="Izaberi roditelja..."
              isClearable
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={onAssignParent}
            disabled={!selectedParentOption || isSaving}
          >
            Poveži roditelja
          </button>
        </div>

        <h6>Trenutno povezani roditelji</h6>

        <ul className="list-group">
          {parents.length === 0 && (
            <li className="list-group-item text-muted">
              Ovo dete trenutno nema povezanog roditelja.
            </li>
          )}

          {parents.map((parent) => (
            <li
              key={getParentId(parent)}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>
                {parent.fullName}
                {parent.email && (
                  <>
                    <br />
                    <small className="text-muted">{parent.email}</small>
                  </>
                )}
              </span>

              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => onRemoveParent(parent)}
                disabled={isSaving}
              >
                Ukloni
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function getParentId(parent) 
{
  return parent.id ?? parent.parentId;
}

export default ChildParentsManager;