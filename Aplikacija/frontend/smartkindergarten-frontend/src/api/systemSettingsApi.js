import axiosClient from "./axiosClient";

const systemSettingsApi = {
  getAll: async () => {
    const response = await axiosClient.get("/systemsettings");

    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/systemsettings/${id}`);

    return response.data;
  },

  getByKey: async (key) => {
    const response = await axiosClient.get(`/systemsettings/key/${key}`);

    return response.data;
  },

  create: async (settingData) => {
    const response = await axiosClient.post("/systemsettings", settingData);

    return response.data;
  },

  update: async (id, settingData) => {
    const response = await axiosClient.put(
      `/systemsettings/${id}`,
      settingData
    );

    return response.data;
  },

  delete: async (id) => {
    await axiosClient.delete(`/systemsettings/${id}`);
  },
};

export default systemSettingsApi;