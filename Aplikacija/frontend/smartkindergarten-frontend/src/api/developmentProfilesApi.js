import axiosClient from "./axiosClient";

const developmentProfilesApi = {
  getNotes: async (childId) => {
    const response = await axiosClient.get(
      `/developmentprofiles/children/${childId}/notes`
    );

    return response.data;
  },

  createNote: async (childId, noteData) => {
    const response = await axiosClient.post(
      `/developmentprofiles/children/${childId}/notes`,
      noteData
    );

    return response.data;
  },

  updateNote: async (noteId, noteData) => {
    const response = await axiosClient.put(
      `/developmentprofiles/notes/${noteId}`,
      noteData
    );

    return response.data;
  },

  deleteNote: async (noteId) => {
    await axiosClient.delete(`/developmentprofiles/notes/${noteId}`);
  },

  getAssessments: async (childId, area) => {
    const params = {};

    if (area) {
      params.area = area;
    }

    const response = await axiosClient.get(
      `/developmentprofiles/children/${childId}/assessments`,
      { params }
    );

    return response.data;
  },

  createAssessment: async (childId, assessmentData) => {
    const response = await axiosClient.post(
      `/developmentprofiles/children/${childId}/assessments`,
      assessmentData
    );

    return response.data;
  },

  updateAssessment: async (assessmentId, assessmentData) => {
    const response = await axiosClient.put(
      `/developmentprofiles/assessments/${assessmentId}`,
      assessmentData
    );

    return response.data;
  },

  deleteAssessment: async (assessmentId) => {
    await axiosClient.delete(`/developmentprofiles/assessments/${assessmentId}`);
  },

  getProgress: async (childId, area) => {
    const params = {};

    if (area) {
      params.area = area;
    }

    const response = await axiosClient.get(
      `/developmentprofiles/children/${childId}/progress`,
      { params }
    );

    return response.data;
  },
};

export default developmentProfilesApi;