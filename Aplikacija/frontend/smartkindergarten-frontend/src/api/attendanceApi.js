import axiosClient from "./axiosClient";


const attendanceApi = {
  
  getByGroupAndDate: async (groupId, date) => {
    const response = await axiosClient.get(`/attendance/group/${groupId}`, {
      params: {
        date,
      },
    });

    return response.data;
  },

  getByChild: async (childId, { fromDate, toDate } = {}) => {
    const params = {};

    if (fromDate) {
      params.fromDate = fromDate;
    }

    if (toDate) {
      params.toDate = toDate;
    }

    const response = await axiosClient.get(`/attendance/child/${childId}`, {
      params,
    });

    return response.data;
  },

  create: async (attendanceData) => {
    const response = await axiosClient.post("/attendance", attendanceData);

    return response.data;
  },

  update: async (id, attendanceData) => {
    const response = await axiosClient.put(`/attendance/${id}`, attendanceData);

    return response.data;
  },

  delete: async (id) => {
    await axiosClient.delete(`/attendance/${id}`);
  },
};

export default attendanceApi;