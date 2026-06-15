import Select from "react-select";

function GroupAssignments({
  group,
  childOptions,
  teacherOptions,
  selectedChildOption,
  selectedTeacherOption,
  canManage,
  onChildOptionChange,
  onTeacherOptionChange,
  onAssignChild,
  onAssignTeacher,
  onRemoveChild,
  onRemoveTeacher,
}) 
{
  if (!group) 
    {
    return (
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <div className="alert alert-info mb-0">
            Izaberi grupu iz tabele da vidiš decu i vaspitače.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body">
        <h5 className="card-title">Detalji grupe: {group.name}</h5>

        <div className="row g-4">
          <div className="col-lg-6">
            <h6>Deca u grupi</h6>

            {canManage && (
              <div className="d-flex gap-2 mb-3">
                <div className="flex-fill">
                  <Select
                    value={selectedChildOption}
                    onChange={onChildOptionChange}
                    options={childOptions}
                    placeholder="Izaberi dete..."
                    isClearable
                  />
                </div>

                <button
                  className="btn btn-primary"
                  onClick={onAssignChild}
                  disabled={!selectedChildOption}
                >
                  Dodaj
                </button>
              </div>
            )}

            <ul className="list-group">
              {group.children.length === 0 && (
                <li className="list-group-item text-muted">
                  Nema dece u ovoj grupi.
                </li>
              )}

              {group.children.map((child) => (
                <li
                  key={child.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>
                    {child.fullName}
                    {!child.isActive && (
                      <span className="badge bg-secondary ms-2">Neaktivno</span>
                    )}
                  </span>

                  {canManage && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onRemoveChild(child)}
                    >
                      Ukloni
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-6">
            <h6>Vaspitači u grupi</h6>

            {canManage && (
              <div className="d-flex gap-2 mb-3">
                <div className="flex-fill">
                  <Select
                    value={selectedTeacherOption}
                    onChange={onTeacherOptionChange}
                    options={teacherOptions}
                    placeholder="Izaberi vaspitača..."
                    isClearable
                  />
                </div>

                <button
                  className="btn btn-primary"
                  onClick={onAssignTeacher}
                  disabled={!selectedTeacherOption}
                >
                  Dodaj
                </button>
              </div>
            )}

            <ul className="list-group">
              {group.teachers.length === 0 && (
                <li className="list-group-item text-muted">
                  Nema dodeljenih vaspitača.
                </li>
              )}

              {group.teachers.map((teacher) => (
                <li
                  key={teacher.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>
                    {teacher.fullName}
                    <br />
                    <small className="text-muted">{teacher.email}</small>
                  </span>

                  {canManage && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onRemoveTeacher(teacher)}
                    >
                      Ukloni
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupAssignments;