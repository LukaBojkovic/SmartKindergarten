import axiosClient from "./axiosClient";

const usersApi =
 {
  getAll: async ({ role, isActive }) => {
    const params = {};

    if (role)
      params.role = role;

    if (isActive !== "")
      params.isActive = isActive;

    const response = await axiosClient.get("/users", { params });

    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/users/${id}`);

    return response.data;
  },

  create: async (userData) => {
    const response = await axiosClient.post("/users", userData);

    return response.data;
  },

  update: async (id, userData) => {
    const response = await axiosClient.put(`/users/${id}`, userData);

    return response.data;
  },

  deactivate: async (id) => {
    await axiosClient.delete(`/users/${id}`);
  },
};

export default usersApi;