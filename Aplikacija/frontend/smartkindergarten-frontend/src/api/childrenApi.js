import axiosClient from "./axiosClient";

const childrenApi = {
  getAll: async ({ search, groupId, isActive }) => {
    const params = {};

    if (search)
      params.search = search;

    if (groupId)
      params.groupId = groupId;

    if (isActive !== "")
      params.isActive = isActive;

    const response = await axiosClient.get("/children", { params });

    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/children/${id}`);

    return response.data;
  },

  create: async (childData) => {
    const response = await axiosClient.post("/children", childData);

    return response.data;
  },

  update: async (id, childData) => {
    const response = await axiosClient.put(`/children/${id}`, childData);

    return response.data;
  },

  deactivate: async (id) => {
    await axiosClient.delete(`/children/${id}`);
  },

  assignParent: async (childId, parentId) => {
  await axiosClient.post(`/children/${childId}/parents/${parentId}`);
  },

removeParent: async (childId, parentId) => {
  await axiosClient.delete(`/children/${childId}/parents/${parentId}`);
  },
  
};

export default childrenApi;