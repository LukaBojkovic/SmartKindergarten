import axiosClient from "./axiosClient";

const groupsApi = {
  getAll: async ({ search } = {}) => {
    const params = {};

    if (search)
      params.search = search;

    const response = await axiosClient.get("/groups", { params });

    return response.data;
  },
};

export default groupsApi;