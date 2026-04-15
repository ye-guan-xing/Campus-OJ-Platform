import request from "@/utils/request";

export const competitionAPI = {
  getCompetitionsByPage(params) {
    return request({
      url: "/competition/getCompetition",
      method: "get",
      params,
    });
  },

  getCompetitionCount(keyword) {
    return request({
      url: "/competition/getCompetitionCount",
      method: "get",
      params: { keyword },
    });
  },

  getCompetitionById(id) {
    return request({
      url: "/competition/getCompetitionById",
      method: "get",
      params: { id },
    });
  },

  addCompetition(data) {
    return request({
      url: "/competition/addCompetition",
      method: "post",
      data,
    });
  },

  updateCompetition(data) {
    return request({
      url: "/competition/updateCompetition",
      method: "post",
      data,
    });
  },

  deleteCompetitionById(id) {
    return request({
      url: "/competition/deleteCompetitionById",
      method: "delete",
      params: { id },
    });
  },
};
