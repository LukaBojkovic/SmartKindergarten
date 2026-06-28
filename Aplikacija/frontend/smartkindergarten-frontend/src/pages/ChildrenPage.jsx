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
import { toast } from "react-toastify";
import { useConfirm } from "../hooks/useConfirm";
import { USER_ROLES } from "../constants/userRoles";
import { toDateInputValue, toUtcIsoDate } from "../utils/dateUtils";

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
  const confirm = useConfirm();

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

  const [parents, setParents] = useState([]);
  const [selectedChildForParents, setSelectedChildForParents] = useState(null);
  const [selectedParentOption, setSelectedParentOption] = useState(null);
  const [isParentSaving, setIsParentSaving] = useState(false);

  const canManage = user?.role === USER_ROLES.ADMINISTRATOR;
  const pageDescription = getPageDescription(user?.role);

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
    .getAll({ role: USER_ROLES.PARENT, isActive: "true" })
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

    try
     {
      await childrenApi.create({
        ...createForm,
        groupId: createForm.groupId ? Number(createForm.groupId) : null,
        dateOfBirth: toUtcIsoDate(createForm.dateOfBirth),
      });

      setCreateForm(initialCreateForm);
      toast.success("Dete je uspešno kreirano.");

      await loadChildren();
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

    try 
    {
      await childrenApi.update(editingChildId, {
        ...editForm,
        groupId: editForm.groupId ? Number(editForm.groupId) : null,
        dateOfBirth: toUtcIsoDate(editForm.dateOfBirth),
      });

      setEditingChildId(null);
      setEditForm(initialEditForm);
      toast.success("Podaci o detetu su uspešno ažurirani.");

      await loadChildren();
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

  const handleDeactivate = async (child) => {
    const confirmed = await confirm({
      title: "Deaktivacija deteta",
      message: `Da li sigurno želiš da deaktiviraš dete ${child.firstName} ${child.lastName}?`,
      confirmText: "Deaktiviraj",
    });

    if (!confirmed)
      return;

    setError("");

    try 
    {
      await childrenApi.deactivate(child.id);

      toast.success("Dete je deaktivirano.");
      await loadChildren();
    } 
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
    }
  };

  const handleManageParents = (child) => {
  setSelectedChildForParents(child);
  setSelectedParentOption(null);
  setError("");

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

  try 
  {
    await childrenApi
    .assignParent(selectedChildForParents.id,
      selectedParentOption.value);

    setSelectedParentOption(null);
    toast.success("Roditelj je uspešno povezan sa detetom.");

    await loadChildren();
  } 
  catch (requestError) 
  {
    toast.error(getErrorMessage(requestError));
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

  const confirmed = await confirm({
    title: "Uklanjanje roditelja",
    message: `Da li sigurno želiš da ukloniš roditelja ${parent.fullName} za ovo dete?`,
    confirmText: "Ukloni",
  });

  if (!confirmed)
    return;

  setIsParentSaving(true);
  setError("");

  try 
  {
    await childrenApi.removeParent(selectedChildForParents.id, parentId);

    toast.success("Roditelj je uklonjen sa deteta.");

    await loadChildren();
  } 
  catch (requestError) 
  {
    toast.error(getErrorMessage(requestError));
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
          <p className="text-muted mb-0">{pageDescription}</p>
        </div>

        <button className="btn btn-outline-primary" onClick={loadChildren}>
          <FaSyncAlt className="me-2" />
          Osveži
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

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

function getErrorMessage(error) 
{
  if (typeof error.response?.data === "string")
    return error.response.data;


  if (error.response?.data?.message)
    return error.response.data.message;

  return "Došlo je do greške. Proveri da li backend radi i da li imaš dozvolu.";
}

function getPageDescription(role) {
  if (role === USER_ROLES.TEACHER) {
    return "Deca iz vaših grupa, osnovni podaci i roditelji za komunikaciju.";
  }

  if (role === USER_ROLES.ADMINISTRATIVE_STAFF) {
    return "Podaci o deci, grupama i roditeljima za komunikaciju i finansije.";
  }

  return "Podaci o deci, grupama i roditeljima na jednom mestu.";
}

export default ChildrenPage;
