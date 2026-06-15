import axiosClient from "./axiosClient";

const groupsApi = {
  getAll: async ({ search } = {}) => {
    const params = {};

    if (search)
      params.search = search;

    const response = await axiosClient.get("/groups", { params });

    return response.data;
  },


  getById: async (id) => {
    const response = await axiosClient.get(`/groups/${id}`);

    return response.data;
  },


  create: async (groupData) => {
    const response = await axiosClient.post("/groups", groupData);

    return response.data;
  },


  update: async (id, groupData) => {
    const response = await axiosClient.put(`/groups/${id}`, groupData);

    return response.data;
  },


  delete: async (id) => {
    await axiosClient.delete(`/groups/${id}`);
  },


  assignChild: async (groupId, childId) => {
    await axiosClient.post(`/groups/${groupId}/children/${childId}`);
  },


  removeChild: async (groupId, childId) => {
    await axiosClient.delete(`/groups/${groupId}/children/${childId}`);
  },


  assignTeacher: async (groupId, teacherId) => {
    await axiosClient.post(`/groups/${groupId}/teachers/${teacherId}`);
  },


  removeTeacher: async (groupId, teacherId) => {
    await axiosClient.delete(`/groups/${groupId}/teachers/${teacherId}`);
  },
};

export default groupsApi;