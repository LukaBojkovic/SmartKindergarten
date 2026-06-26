/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import childrenApi from "../api/childrenApi";
import developmentProfilesApi from "../api/developmentProfilesApi";
import ChildDevelopmentSelector from "../components/developmentProfile/ChildDevelopmentSelector";
import DevelopmentAssessmentsSection from "../components/developmentProfile/DevelopmentAssessmentsSection";
import DevelopmentNotesSection from "../components/developmentProfile/DevelopmentNotesSection";
import DevelopmentProgressChart from "../components/developmentProfile/DevelopmentProgressChart";
import { developmentAreas } from "../constants/developmentAreas";
import { useAuth } from "../hooks/useAuth";
import { FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useConfirm } from "../hooks/useConfirm";

const initialNoteForm = {
  content: "",
};

const initialAssessmentForm = {
  area: "SocialSkills",
  score: "3",
  comment: "",
  assessmentDate: getTodayDateInputValue(),
};

function DevelopmentProfilePage()
{
  const { user } = useAuth();
  const confirm = useConfirm();

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildOption, setSelectedChildOption] = useState(null);

  const [notes, setNotes] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [progressPoints, setProgressPoints] = useState([]);

  const [selectedArea, setSelectedArea] = useState(developmentAreas[0].value);

  const [noteForm, setNoteForm] = useState(initialNoteForm);
  const [editingNoteId, setEditingNoteId] = useState(null);

  const [assessmentForm, setAssessmentForm] = useState(initialAssessmentForm);
  const [editingAssessmentId, setEditingAssessmentId] = useState(null);

  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  const canManage = user?.role === "Teacher";
  const selectedChildId = selectedChildOption?.value;

  useEffect(() => {
    let isCancelled = false;

    setIsLoadingChildren(true);

    childrenApi
      .getAll({ search: "", groupId: "", isActive: "true" })
      .then((data) => {
        if (!isCancelled) 
        {
          setChildrenList(data);
          setError("");

          setSelectedChildOption((previousSelectedChild) => {
            if (previousSelectedChild && 
                data.some((child) => child.id === previousSelectedChild.value))
              return previousSelectedChild;
            
            if (data.length === 0)
              return null;

            const firstChild = data[0];

            return {
              value: firstChild.id,
              label: getChildLabel(firstChild),
            };
          });
        }
      })
      .catch((requestError) => {
        if (!isCancelled) {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingChildren(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedChildId) {
      setNotes([]);
      setAssessments([]);
      setProgressPoints([]);
      return;
    }

    let isCancelled = false;

    setIsLoadingProfile(true);

    Promise.all([
      developmentProfilesApi.getNotes(selectedChildId),
      developmentProfilesApi.getAssessments(selectedChildId, selectedArea),
      developmentProfilesApi.getProgress(selectedChildId, selectedArea),
    ])
      .then(([notesData, assessmentsData, progressData]) => {
        if (!isCancelled) 
        {
          setNotes(notesData);
          setAssessments(assessmentsData);
          setProgressPoints(progressData);
          setError("");
        }
      })
      .catch((requestError) => {
        if (!isCancelled)
          setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (!isCancelled)
          setIsLoadingProfile(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedChildId, selectedArea]);

  const childOptions = childrenList.map((child) => ({
    value: child.id,
    label: getChildLabel(child),
  }));

  const loadProfile = async () => {
    if (!selectedChildId)
      return;

    setIsLoadingProfile(true);
    setError("");

    try 
    {
      const [notesData, assessmentsData, progressData] = await Promise.all([
        developmentProfilesApi.getNotes(selectedChildId),
        developmentProfilesApi.getAssessments(selectedChildId, selectedArea),
        developmentProfilesApi.getProgress(selectedChildId, selectedArea),
      ]);

      setNotes(notesData);
      setAssessments(assessmentsData);
      setProgressPoints(progressData);
    } 
    catch (requestError) 
    {
      setError(getErrorMessage(requestError));
    } 
    finally 
    {
      setIsLoadingProfile(false);
    }
  };

  const handleNoteChange = (event) => {
    const { name, value } = event.target;

    setNoteForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleNoteSubmit = async (event) => {
    event.preventDefault();

    if (!selectedChildId)
      return;

    setIsSaving(true);
    setError("");

    try 
    {
      if (editingNoteId) 
        {
        await developmentProfilesApi.updateNote(editingNoteId, noteForm);
        toast.success("Beleška je uspešno izmenjena.");
        } 
      else 
        {
        await developmentProfilesApi.createNote(selectedChildId, noteForm);
        toast.success("Beleška je uspešno dodata.");
        }

      setNoteForm(initialNoteForm);
      setEditingNoteId(null);

      await loadProfile();
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

  const startEditNote = (note) => {
    setEditingNoteId(note.id);
    setNoteForm({
      content: note.content,
    });

    setError("");
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setNoteForm(initialNoteForm);
  };

  const deleteNote = async (note) => {
    const confirmed = await confirm({
      title: "Brisanje beleške",
      message: "Da li sigurno želiš da obrišeš belešku?",
      confirmText: "Obriši",
    });

    if (!confirmed)
      return;

    setError("");

    try 
    {
      await developmentProfilesApi.deleteNote(note.id);

      toast.success("Beleška je obrisana.");
      await loadProfile();
    } 
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
    }
  };

  const handleAssessmentChange = (event) => {
    const { name, value } = event.target;

    setAssessmentForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleAreaFilterChange = (area) => {
    setSelectedArea(area);

    setAssessmentForm((previousForm) => ({
      ...previousForm,
      area,
    }));

    setEditingAssessmentId(null);
  };

  const handleAssessmentSubmit = async (event) => {
    event.preventDefault();

    if (!selectedChildId)
      return;

    const assessmentData = {
      area: assessmentForm.area,
      score: Number(assessmentForm.score),
      comment: assessmentForm.comment,
      assessmentDate: toUtcIsoDate(assessmentForm.assessmentDate),
    };

    setIsSaving(true);
    setError("");

    try 
    {
      if (editingAssessmentId) 
        {
        await developmentProfilesApi
        .updateAssessment(editingAssessmentId,assessmentData);

        toast.success("Procena je uspešno izmenjena.");
        } 
      else 
        {
        await developmentProfilesApi
        .createAssessment(selectedChildId, assessmentData);

        toast.success("Procena je uspešno dodata.");
        }

      setAssessmentForm({
        ...initialAssessmentForm,
        area: selectedArea,
        assessmentDate: getTodayDateInputValue(),
      });
      setEditingAssessmentId(null);

      await loadProfile();
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

  const startEditAssessment = (assessment) => {
    setEditingAssessmentId(assessment.id);
    setAssessmentForm({
      area: assessment.area,
      score: String(assessment.score),
      comment: assessment.comment || "",
      assessmentDate: toDateInputValue(assessment.assessmentDate),
    });

    setSelectedArea(assessment.area);
    setError("");
  };

  const cancelEditAssessment = () => {
    setEditingAssessmentId(null);
    setAssessmentForm({
      ...initialAssessmentForm,
      area: selectedArea,
      assessmentDate: getTodayDateInputValue(),
    });
  };

  const deleteAssessment = async (assessment) => {
    const confirmed = await confirm({
      title: "Brisanje procene razvoja",
      message: "Da li sigurno želiš da obrišeš procenu razvoja?",
      confirmText: "Obriši",
    });

    if (!confirmed)
      return;

    setError("");

    try 
    {
      await developmentProfilesApi.deleteAssessment(assessment.id);

      toast.success("Procena je obrisana.");
      await loadProfile();
    } 
    catch (requestError) 
    {
      toast.error(getErrorMessage(requestError));
    }
  };

  const pageDescription = canManage
    ? "Vođenje razvojnih beleški, procena i grafički prikaz napretka deteta."
    : "Pregled razvojnih beleški, procena i napretka deteta.";

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1>Razvojni profil</h1>
          <p className="text-muted mb-0">{pageDescription}</p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadProfile}
          disabled={!selectedChildId || isLoadingProfile}
        >
          <FaSyncAlt className="me-2" />
          Osveži
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <ChildDevelopmentSelector
        childOptions={childOptions}
        selectedChildOption={selectedChildOption}
        onChildChange={setSelectedChildOption}
        isLoading={isLoadingChildren}
      />

      {!selectedChildId && !isLoadingChildren && (
        <div className="alert alert-info">
          Nema dece dostupne za prikaz razvojnog profila.
        </div>
      )}

      {selectedChildId && (
        <>
          {isLoadingProfile && (
            <div className="alert alert-info">
              Učitavanje razvojnog profila...
            </div>
          )}

          <DevelopmentProgressChart
            progressPoints={progressPoints}
            selectedArea={selectedArea}
          />

          <DevelopmentAssessmentsSection
            assessments={assessments}
            selectedArea={selectedArea}
            assessmentForm={assessmentForm}
            editingAssessmentId={editingAssessmentId}
            canManage={canManage}
            isSaving={isSaving}
            onAreaFilterChange={handleAreaFilterChange}
            onAssessmentChange={handleAssessmentChange}
            onAssessmentSubmit={handleAssessmentSubmit}
            onCancelEditAssessment={cancelEditAssessment}
            onStartEditAssessment={startEditAssessment}
            onDeleteAssessment={deleteAssessment}
          />

          <DevelopmentNotesSection
            notes={notes}
            canManage={canManage}
            noteForm={noteForm}
            editingNoteId={editingNoteId}
            isSaving={isSaving}
            onNoteChange={handleNoteChange}
            onNoteSubmit={handleNoteSubmit}
            onCancelEditNote={cancelEditNote}
            onStartEditNote={startEditNote}
            onDeleteNote={deleteNote}
          />
        </>
      )}
    </div>
  );
}

function getChildLabel(child)
{
  const groupPart = child.groupName ? ` - ${child.groupName}` : " - bez grupe";

  return `${child.firstName} ${child.lastName}${groupPart}`;
}

function getTodayDateInputValue() 
{
  return new Date().toISOString().substring(0, 10);
}

function toDateInputValue(value) 
{
  if (!value)
    return "";

  return value.substring(0, 10);
}

function toUtcIsoDate(value) 
{
  if (!value)
    return null;

  return `${value}T00:00:00Z`;
}

function getErrorMessage(error) 
{
  if (typeof error.response?.data === "string")
    return error.response.data;

  if (error.response?.data?.message)
    return error.response.data.message;

  return "Došlo je do greške. Proveri da li backend radi i da li imaš dozvolu.";
}

export default DevelopmentProfilePage;
