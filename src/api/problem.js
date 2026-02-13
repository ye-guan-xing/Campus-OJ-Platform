import request from "@/utils/request";

export const problemApi = {
  // 获取题目列表（分页查询）- 用户端
  getProblemList(params) {
    return request({
      url: "/user/testQuestion/getTestQuestionByPage",
      method: "get",
      params, // 包含 pageNum, size, keyword（如果支持搜索）
    });
  },

  // 获取题目总数 - 用户端
  getProblemCount(keyword = "") {
    return request({
      url: "/testQuestion/getTestQuestionCount",
      method: "get",
      params: { keyword },
    });
  },

  // 获取题目详情（根据ID查询）- 用户端
  getProblemDetail(id) {
    return request({
      url: "/user/testQuestion/getTestQuestionById",
      method: "get",
      params: { id },
    });
  },

  // 获取题目的测试点列表 - 用户端
  getTestPointsByQuestionId(id) {
    return request({
      url: "/user/testQuestion/getTestPointsListByQuestionId",
      method: "get",
      params: { id },
    });
  },

  // 提交代码 - 用户端
  submitSolution(data) {
    return request({
      url: "/user/testQuestion/submitTestQuestion",
      method: "post",
      data,
    });
  },
};
