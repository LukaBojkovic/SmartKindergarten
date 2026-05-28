import axiosClient from "./axiosClient";

const authApi = {
  login: async (username, password) => {
    const response = await axiosClient.post("/auth/login", {
      username,
      password,
    });

    return response.data;
  },

  getMe: async () => {
    const response = await axiosClient.get("/auth/me");

    return response.data;
  },
};

export default authApi;