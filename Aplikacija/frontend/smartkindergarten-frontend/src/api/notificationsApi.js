import axiosClient from "./axiosClient";

const notificationsApi = {
  getAll: async () => {
    const response = await axiosClient.get("/notifications");

    return response.data;
  },

  getMy: async () => {
    const response = await axiosClient.get("/notifications/my");

    return response.data;
  },

  getUnread: async () => {
    const response = await axiosClient.get("/notifications/unread");

    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/notifications/${id}`);

    return response.data;
  },

  create: async (notificationData) => {
    const response = await axiosClient.post("/notifications", notificationData);

    return response.data;
  },

  update: async (id, notificationData) => {
    const response = await axiosClient.put(
      `/notifications/${id}`,
      notificationData
    );

    return response.data;
  },

  markAsRead: async (id) => {
    await axiosClient.put(`/notifications/${id}/read`);
  },

  delete: async (id) => {
    await axiosClient.delete(`/notifications/${id}`);
  },
};

export default notificationsApi;