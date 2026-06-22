import axiosClient from "./axiosClient";

const paymentsApi = {
  getAll: async () => {
    const response = await axiosClient.get("/payments");

    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/payments/${id}`);

    return response.data;
  },

  getByChild: async (childId) => {
    const response = await axiosClient.get(`/payments/child/${childId}`);

    return response.data;
  },

  getChildStatus: async (childId, expectedAmount) => {
    const params = {};

    if (
      expectedAmount !== "" &&
      expectedAmount !== null &&
      expectedAmount !== undefined
    ) {
      params.expectedAmount = expectedAmount;
    }

    const response = await axiosClient.get(
      `/payments/child/${childId}/status`,
      { params }
    );

    return response.data;
  },

  create: async (paymentData) => {
    const response = await axiosClient.post("/payments", paymentData);

    return response.data;
  },

  update: async (id, paymentData) => {
    const response = await axiosClient.put(`/payments/${id}`, paymentData);

    return response.data;
  },

  delete: async (id) => {
    await axiosClient.delete(`/payments/${id}`);
  },
};

export default paymentsApi;