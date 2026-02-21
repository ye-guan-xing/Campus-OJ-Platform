import request from "@/utils/request";
import { mockStorage } from "@/utils/mockData";

//启用模拟数据
const USE_MOCK = true;
//模拟延迟
const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const problemAdminAPI = {
  //添加题目
  addProblem: async function (data) {
    if (USE_MOCK) {
      await mockDelay();
      try {
        const result = mockStorage.addProblem(data);
        return {
          code: 1,
          data: result,
          message: "添加成功",
        };
      } catch (error) {
        return {
          code: 0,
          message: "添加失败: " + error.message,
        };
      }
    }
    return request({
      url: "/testQuestion/addTestQuestion",
      method: "POST",
      data,
    });
  },
  //删除题目
  deleteProblem: async (id) => {
    if (USE_MOCK) {
      await mockDelay();
      try {
        const success = mockStorage.deleteProblem(id);
        return success
          ? { code: 1, data: null, message: "删除成功" }
          : { code: 0, message: "删除失败，题目不存在" };
      } catch (error) {
        return { code: 0, message: "删除失败" };
      }
    }
    return request({
      url: "/testQuestion/deleteTestQuestionById",
      method: "DELETE",
      params: { id: id.toString() }, // 必须用params传query参数+
    });
  },

  //更新题目
  updateProblem: async (data) => {
    if (USE_MOCK) {
      await mockDelay();
      try {
        const success = mockStorage.updateProblem(data);
        return success
          ? { code: 1, data: null, message: "更新成功" }
          : { code: 0, message: "更新失败，题目不存在" };
      } catch (error) {
        return { code: 0, message: "更新失败" };
      }
    }
    request({
      url: "/testQuestion/updateTestQuestion",
      method: "POST",
      data: data,
    });
  },
  // 题目分页查询 - 最终修正版
  getProblemsByPage: async (params) => {
    if (USE_MOCK) {
      await mockDelay(300);
      try {
        const { pageNum = 1, size = 10, keyword } = params;

        // 获取所有题目
        let problems = mockStorage.getProblems();

        // 关键词过滤
        if (keyword && keyword.trim()) {
          const keywordLower = keyword.toLowerCase();
          problems = problems.filter(
            (p) =>
              p.title?.toLowerCase().includes(keywordLower) ||
              p.label?.toLowerCase().includes(keywordLower)
          );
        }

        // 手动分页
        const start = (pageNum - 1) * size;
        const end = start + size;
        const pageData = problems.slice(start, end);

        // 返回前端期望的格式
        return {
          code: 1,
          data: {
            list: pageData,
            total: problems.length,
            pageNum: pageNum,
            size: size,
          },
          message: "查询成功",
        };
      } catch (error) {
        console.error("Mock数据查询失败:", error);
        return {
          code: 0,
          data: { list: [], total: 0 },
          message: "查询失败",
        };
      }
    }

    // 真实后端请求
    return request({
      url: "/testQuestion/getTestQuestionByPage",
      method: "GET",
      params: {
        pageNum: params.pageNum,
        size: params.size,
        keyword: params.keyword || "",
      },
    });
  },

  // 根据ID查询题目
  getProblemById: async (id) => {
    if (USE_MOCK) {
      await mockDelay();
      try {
        const problem = mockStorage.getProblemById(id);
        return problem
          ? { code: 1, data: problem, message: "查询成功" }
          : { code: 0, message: "题目不存在" };
      } catch (error) {
        return { code: 0, message: "查询失败" };
      }
    }

    return request({
      url: "/testQuestion/getTestQuestionById",
      method: "GET",
      params: { id },
    });
  },
};
