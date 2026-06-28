/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import childrenApi from "../api/childrenApi";
import groupsApi from "../api/groupsApi";
import usersApi from "../api/usersApi";
import GroupAssignments from "../components/groups/GroupAssignments";
import GroupForm from "../components/groups/GroupForm";
import GroupsTable from "../components/groups/GroupsTable";
import { useAuth } from "../hooks/useAuth";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useConfirm } from "../hooks/useConfirm";
import { USER_ROLES } from "../constants/userRoles";

const initialCreateForm = {
  name: "",
  description: "",
};

const initialEditForm = {
  name: "",
  description: "",
};

function GroupsPage() 
{
  const { user } = useAuth();
  const confirm = useConfirm();

  const [groups, setGroups] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [searchFilter, setSearchFilter] = useState("");

  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editingGroupId, setEditingGroupId] = useState(null);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedChildOption, setSelectedChildOption] = useState(null);
  const [selectedTeacherOption, setSelectedTeacherOption] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const canManage = user?.role === USER_ROLES.ADMINISTRATOR;

  useEffect(() => {
    let isCancelled = false;

    setIsLoading(true);

    groupsApi
      .getAll({ search: searchFilter })
      .then((data) => {
        if (!isCancelled) {
            setGroups(data);
            setError("");

            setSelectedGroup((previousSelectedGroup) =>{
                if (!previousSelectedGroup)
                    return null;
        const updatedSelectedGroup = data.find(
        (group) => group.id === previousSelectedGroup.id
      );

      return updatedSelectedGroup || null;
    });
  }
})
      .catch((requestError) => {
        if (!isCancelled)
          setError(getErrorMessage(requestError));
      })
      .finally(() => {
        
        if (!isCancelled)
          setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [searchFilter]);

  useEffect(() => {
    
    if (!canManage)
      return;

    let isCancelled = false;

    Promise.all([
      childrenApi.getAll({ search: "", groupId: "", isActive: "true" }),
      usersApi.getAll({ role: USER_ROLES.TEACHER, isActive: "true" }),
    ])
      .then(([childrenData, teachersData]) => {
        if (!isCancelled) {
          setChildrenList(childrenData);
          setTeachers(teachersData);
        }
      })
      .catch((requestError) => {
        if (!isCancelled) {
          setError(getErrorMessage(requestError));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [canManage]);

  const loadGroups = async () => {
    setIsLoading(true);
    setError("");

    try 
    {
      const data = await groupsApi.getAll({ search: searchFilter });

      setGroups(data);

      if (selectedGroup) {
        const updatedSelectedGroup = data.find(
          (group) => group.id === selectedGroup.id
        );

        setSelectedGroup(updatedSelectedGroup || null);
      }
    } 
    catch (requestError) 
    {
      setError(getErrorMessage(requestError));
    } 
    finally 
    {
      setIsLoading(false);
    }
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    setIsSaving(true);
    setError("");

    try 
    {
      await groupsApi.create(createForm);

      setCreateForm(initialCreateForm);
      toast.success("Grupa je uspešno kreirana.");

      await loadGroups();
    } 
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
    } 
    finally 
    {
      setIsSaving(false);
    }
  };

  const startEdit = (group) => {
    setEditingGroupId(group.id);
    setEditForm({
      name: group.name,
      description: group.description || "",
    });

    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingGroupId(null);
    setEditForm(initialEditForm);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editingGroupId)
      return;

    setIsSaving(true);
    setError("");

    try 
    {
      await groupsApi.update(editingGroupId, editForm);

      setEditingGroupId(null);
      setEditForm(initialEditForm);
      toast.success("Grupa je uspešno ažurirana.");

      await loadGroups();
    } 
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
    } 
    finally 
    {
      setIsSaving(false);
    }
  };

  const handleDelete = async (group) => {
    const confirmed = await confirm({
      title: "Brisanje grupe",
      message: `Da li sigurno želiš da obrišeš grupu ${group.name}?`,
      confirmText: "Obriši",
    });

    if (!confirmed)
      return;

    setError("");

    try 
    {
      await groupsApi.delete(group.id);

      if (selectedGroup?.id === group.id)
        setSelectedGroup(null);

      toast.success("Grupa je uspešno obrisana.");
      await loadGroups();
    } 
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
    }
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedChildOption(null);
    setSelectedTeacherOption(null);

    setError("");

  setTimeout(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, 100);
  };

  const handleAssignChild = async () => {
    if (!selectedGroup || !selectedChildOption)
      return;

    setError("");

    try 
    {
      await groupsApi.assignChild(selectedGroup.id, selectedChildOption.value);

      setSelectedChildOption(null);
      toast.success("Dete je dodeljeno grupi.");

      await loadGroups();
    }
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedGroup || !selectedTeacherOption)
      return;

    setError("");

    try 
    {
      await groupsApi.assignTeacher(selectedGroup.id, selectedTeacherOption.value);

      setSelectedTeacherOption(null);
      toast.success("Vaspitač je dodeljen grupi.");

      await loadGroups();
    } 
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
    }
  };

  const handleRemoveChild = async (child) => {
    if (!selectedGroup)
      return;

    const confirmed = await confirm({
      title: "Uklanjanje deteta",
      message: `Da li sigurno želiš da ukloniš dete ${child.fullName} iz grupe?`,
      confirmText: "Ukloni",
    });

    if (!confirmed)
      return;

    setError("");

    try 
    {
      await groupsApi.removeChild(selectedGroup.id, child.id);

      toast.success("Dete je uklonjeno iz grupe.");
      await loadGroups();
    } 
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
    }
  };

  const handleRemoveAllChildren = async () => {
    if (!selectedGroup || selectedGroup.children.length === 0)
      return;

    const confirmed = await confirm({
      title: "Pražnjenje grupe",
      message:
        "Da li sigurno želiš da ukloniš svu decu iz trenutne grupe?",
      confirmText: "Isprazni grupu",
    });

    if (!confirmed)
      return;

    setError("");

    try 
    {
      await Promise.all(
        selectedGroup.children.map((child) =>
          groupsApi.removeChild(selectedGroup.id, child.id)
        )
      );

      toast.success("Sva deca su uklonjena iz grupe.");
      await loadGroups();
    } 
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
    }
  };

  const handleRemoveTeacher = async (teacher) => {
    if (!selectedGroup)
      return;

    const confirmed = await confirm({
      title: "Uklanjanje vaspitača",
      message: `Da li sigurno želiš da ukloniš vaspitača ${teacher.fullName} iz grupe?`,
      confirmText: "Ukloni",
    });

    if (!confirmed)
      return;

    setError("");

    try
    {
      await groupsApi.removeTeacher(selectedGroup.id, teacher.id);

      toast.success("Vaspitač je uklonjen iz grupe.");
      await loadGroups();
    } 
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
    }
  };

  const childOptions = childrenList.map((child) => ({
    value: child.id,
    label: `${child.firstName} ${child.lastName} (${child.groupName || "bez grupe"})`,
  }));

  const teacherOptions = teachers.map((teacher) => ({
    value: teacher.id,
    label: `${teacher.firstName} ${teacher.lastName} - ${teacher.email}`,
  }));

  const pageDescription = canManage
    ? "Vrtićke grupe, deca i vaspitači na jednom mestu."
    : "Grupe u kojima radite, sa osnovnim podacima o deci i vaspitačima.";

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1>Grupe</h1>
          <p className="text-muted mb-0">{pageDescription}</p>
        </div>

        <button className="btn btn-outline-primary" onClick={loadGroups}>
          <FaSyncAlt className="me-2" />
          Osveži
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {canManage && (
          <div className="col-lg-4">
            <GroupForm
              editingGroupId={editingGroupId}
              createForm={createForm}
              editForm={editForm}
              isSaving={isSaving}
              onCreateChange={handleCreateChange}
              onEditChange={handleEditChange}
              onCreateSubmit={handleCreateSubmit}
              onEditSubmit={handleEditSubmit}
              onCancelEdit={cancelEdit}
            />
          </div>
        )}

        <div className={canManage ? "col-lg-8" : "col-lg-12"}>
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Pretraga grupa</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <input
                    className="form-control"
                    value={searchFilter}
                    onChange={(event) => setSearchFilter(event.target.value)}
                    placeholder="Naziv grupe"
                  />
                </div>
              </div>

              <GroupsTable
                groups={groups}
                isLoading={isLoading}
                canManage={canManage}
                selectedGroupId={selectedGroup?.id}
                onSelect={handleSelectGroup}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>

          <GroupAssignments
            group={selectedGroup}
            childOptions={childOptions}
            teacherOptions={teacherOptions}
            selectedChildOption={selectedChildOption}
            selectedTeacherOption={selectedTeacherOption}
            canManage={canManage}
            onChildOptionChange={setSelectedChildOption}
            onTeacherOptionChange={setSelectedTeacherOption}
            onAssignChild={handleAssignChild}
            onAssignTeacher={handleAssignTeacher}
            onRemoveChild={handleRemoveChild}
            onRemoveAllChildren={handleRemoveAllChildren}
            onRemoveTeacher={handleRemoveTeacher}
          />
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(error) 
{

  if (typeof error.response?.data === "string")
    return error.response.data;

  if (error.response?.data?.message)
    return error.response.data.message;

  return "Došlo je do greške. Proveri da li backend radi i da li imaš dozvolu.";
}

export default GroupsPage;
