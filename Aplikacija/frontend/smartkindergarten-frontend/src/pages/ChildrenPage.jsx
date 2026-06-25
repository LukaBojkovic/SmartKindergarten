/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import childrenApi from "../api/childrenApi";
import groupsApi from "../api/groupsApi";
import ChildForm from "../components/children/ChildForm";
import ChildrenFilters from "../components/children/ChildrenFilters";
import ChildrenTable from "../components/children/ChildrenTable";
import { useAuth } from "../hooks/useAuth";
import usersApi from "../api/usersApi";
import ChildParentsManager from "../components/children/ChildParentsManager";
import { FaSyncAlt } from "react-icons/fa";

const initialCreateForm = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  notes: "",
  groupId: "",
};

const initialEditForm = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  notes: "",
  groupId: "",
  isActive: true,
};

function ChildrenPage() {
  const { user } = useAuth();

  const [childrenList, setChildrenList] = useState([]);
  const [groups, setGroups] = useState([]);

  const [searchFilter, setSearchFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("true");

  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editingChildId, setEditingChildId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [parents, setParents] = useState([]);
  const [selectedChildForParents, setSelectedChildForParents] = useState(null);
  const [selectedParentOption, setSelectedParentOption] = useState(null);
  const [isParentSaving, setIsParentSaving] = useState(false);

  const canManage = user?.role === "Administrator";

  useEffect(() => {
    let isCancelled = false;

    setIsGroupsLoading(true);

    groupsApi
      .getAll()
      .then((data) => {
        if (!isCancelled) {
          setGroups(data);
        }
      })
      .catch((requestError) => {
        if (!isCancelled) {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsGroupsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);


  useEffect(() => {
  if (!canManage)
    return;

  let isCancelled = false;

  usersApi
    .getAll({ role: "Parent", isActive: "true" })
    .then((data) => {
      if (!isCancelled) {
        setParents(data);
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

  useEffect(() => {
    let isCancelled = false;

    setIsLoading(true);

    childrenApi
      .getAll({
        search: searchFilter,
        groupId: groupFilter,
        isActive: activeFilter,
      })
      .then((data) => {
        if (!isCancelled)
        {
          setChildrenList(data);
          setError("");

          setSelectedChildForParents((previousSelectedChild) => {
          if (!previousSelectedChild)
              return null;

          const updatedChild = data
          .find((child) => child.id === previousSelectedChild.id);

          return updatedChild || null;
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
  }, [searchFilter, groupFilter, activeFilter]);

  const loadChildren = async () => {
    setIsLoading(true);
    setError("");

    try 
    {
      const data = await childrenApi.getAll({
        search: searchFilter,
        groupId: groupFilter,
        isActive: activeFilter,
      });

      setChildrenList(data);

      setSelectedChildForParents((previousSelectedChild) => {
      if (!previousSelectedChild)
         return null;

      const updatedChild = data
      .find((child) => child.id === previousSelectedChild.id);

  return updatedChild || null;
});
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
    const { name, value, type, checked } = event.target;

    setEditForm((previousForm) => ({
      ...previousForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try
     {
      await childrenApi.create({
        ...createForm,
        groupId: createForm.groupId ? Number(createForm.groupId) : null,
        dateOfBirth: toUtcIsoDate(createForm.dateOfBirth),
      });

      setCreateForm(initialCreateForm);
      setSuccessMessage("Dete je uspešno kreirano.");

      await loadChildren();
    }
     catch (requestError) 
    {
      setError(getErrorMessage(requestError));
    } 
    finally 
    {
      setIsSaving(false);
    }
  };

  const startEdit = (child) => {
    setEditingChildId(child.id);
    setEditForm({
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: toDateInputValue(child.dateOfBirth),
      notes: child.notes || "",
      groupId: child.groupId || "",
      isActive: child.isActive,
    });

    setError("");
    setSuccessMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingChildId(null);
    setEditForm(initialEditForm);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editingChildId)
      return;

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try 
    {
      await childrenApi.update(editingChildId, {
        ...editForm,
        groupId: editForm.groupId ? Number(editForm.groupId) : null,
        dateOfBirth: toUtcIsoDate(editForm.dateOfBirth),
      });

      setEditingChildId(null);
      setEditForm(initialEditForm);
      setSuccessMessage("Podaci o detetu su uspešno ažurirani.");

      await loadChildren();
    } 
    catch (requestError)
    {
      setError(getErrorMessage(requestError));
    } 
    finally 
    {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (child) => {
    const confirmed = window.confirm(
      `Da li sigurno želiš da deaktiviraš dete ${child.firstName} ${child.lastName}?`
    );

    if (!confirmed)
      return;

    setError("");
    setSuccessMessage("");

    try 
    {
      await childrenApi.deactivate(child.id);

      setSuccessMessage("Dete je deaktivirano.");
      await loadChildren();
    } 
    catch (requestError) 
    {
      setError(getErrorMessage(requestError));
    }
  };

  const handleManageParents = (child) => {
  setSelectedChildForParents(child);
  setSelectedParentOption(null);
  setError("");
  setSuccessMessage("");

  setTimeout(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, 100);
};

const handleAssignParent = async () => {
  if (!selectedChildForParents || !selectedParentOption)
    return;

  setIsParentSaving(true);
  setError("");
  setSuccessMessage("");

  try 
  {
    await childrenApi
    .assignParent(selectedChildForParents.id,
      selectedParentOption.value);

    setSelectedParentOption(null);
    setSuccessMessage("Roditelj je uspešno povezan sa detetom.");

    await loadChildren();
  } 
  catch (requestError) 
  {
    setError(getErrorMessage(requestError));
  } 
  finally 
  {
    setIsParentSaving(false);
  }
};

const handleRemoveParent = async (parent) => {
  if (!selectedChildForParents)
    return;

  const parentId = parent.id ?? parent.parentId;

  const confirmed = window.confirm(
    `Da li sigurno želiš da ukloniš roditelja ${parent.fullName} za ovo dete?`
  );

  if (!confirmed)
    return;

  setIsParentSaving(true);
  setError("");
  setSuccessMessage("");

  try 
  {
    await childrenApi.removeParent(selectedChildForParents.id, parentId);

    setSuccessMessage("Roditelj je uklonjen sa deteta.");

    await loadChildren();
  } 
  catch (requestError) 
  {
    setError(getErrorMessage(requestError));
  } 
  finally 
  {
    setIsParentSaving(false);
  }
};

const assignedParentIds =
  selectedChildForParents?.parents?.map(
    (parent) => parent.id ?? parent.parentId
  ) ?? [];

const parentOptions = parents
  .filter((parent) => !assignedParentIds.includes(parent.id))
  .map((parent) => ({
    value: parent.id,
    label: `${parent.firstName} ${parent.lastName} - ${parent.email}`,
  }));

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1>Deca</h1>
          <p className="text-muted mb-0">
            Pregled i upravljanje podacima o deci.
          </p>
        </div>

        <button className="btn btn-outline-primary" onClick={loadChildren}>
          <FaSyncAlt className="me-2" />
          Osveži
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {isGroupsLoading && (
        <div className="alert alert-info">Učitavanje grupa...</div>
      )}

      <div className="row g-4">
        {canManage && (
          <div className="col-lg-4">
            <ChildForm
              groups={groups}
              editingChildId={editingChildId}
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
              <ChildrenFilters
                groups={groups}
                searchFilter={searchFilter}
                groupFilter={groupFilter}
                activeFilter={activeFilter}
                onSearchFilterChange={setSearchFilter}
                onGroupFilterChange={setGroupFilter}
                onActiveFilterChange={setActiveFilter}
              />

              <ChildrenTable
                childrenList={childrenList}
                isLoading={isLoading}
                canManage={canManage}
                selectedChildId={selectedChildForParents?.id}
                onEdit={startEdit}
                onDeactivate={handleDeactivate}
                onManageParents={handleManageParents}
              />
            </div>
          </div>

            {canManage && (
              <ChildParentsManager
                selectedChild={selectedChildForParents}
                parentOptions={parentOptions}
                selectedParentOption={selectedParentOption}
                isSaving={isParentSaving}
                onParentOptionChange={setSelectedParentOption}
                onAssignParent={handleAssignParent}
                onRemoveParent={handleRemoveParent}
              />
            )}
        </div>
      </div>
    </div>
  );
}

function toUtcIsoDate(dateInputValue)
{
  return `${dateInputValue}T00:00:00Z`;
}

function toDateInputValue(dateValue) 
{
  if (!dateValue)
    return "";

  return dateValue.substring(0, 10);
}

function getErrorMessage(error) 
{
  if (typeof error.response?.data === "string")
    return error.response.data;


  if (error.response?.data?.message)
    return error.response.data.message;

  return "Došlo je do greške. Proveri da li backend radi i da li imaš dozvolu.";
}

export default ChildrenPage;