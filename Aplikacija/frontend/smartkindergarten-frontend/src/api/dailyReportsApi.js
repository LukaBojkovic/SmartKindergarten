import axiosClient from "./axiosClient";


const dailyReportsApi = {
  getAll: async () => {
    const response = await axiosClient.get("/dailyreports");

    return response.data;
  },

  getByGroup: async (groupId) => {
    const response = await axiosClient.get(`/dailyreports/group/${groupId}`);

    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/dailyreports/${id}`);

    return response.data;
  },

  create: async (reportData) => {
    const response = await axiosClient.post("/dailyreports", reportData);

    return response.data;
  },

  update: async (id, reportData) => {
    const response = await axiosClient.put(`/dailyreports/${id}`, reportData);

    return response.data;
  },

  delete: async (id) => {
    await axiosClient.delete(`/dailyreports/${id}`);
  },
};

export default dailyReportsApi;