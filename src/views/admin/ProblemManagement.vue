<template>
  <div class="admin-problem-management">
    <h2>题目管理</h2>

    <!-- 搜索+新增按钮 -->
    <div class="header-actions">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索题目名称/标签"
        style="width: 240px"
        @input="handleSearchInput"
        clearable
        @clear="handleSearchClear"
      />
      <el-button type="primary" @click="handleSearch" style="margin-left: 10px">
        搜索
      </el-button>
      <el-button type="success" @click="goToCreate" style="margin-left: 10px">
        新增题目
      </el-button>
    </div>

    <!-- 题目列表表格 -->
    <el-table
      v-loading="loading"
      :data="problemList"
      border
      stripe
      style="width: 100%; margin-top: 15px"
      empty-text="暂无题目数据"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="title" label="题目名称" min-width="200" />
      <el-table-column prop="label" label="标签" min-width="150" />
      <el-table-column
        prop="testPointNum"
        label="测试点数量"
        width="120"
        align="center"
      />
      <el-table-column
        prop="description"
        label="描述"
        min-width="300"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span class="description-text">{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="goToEdit(scope.row)">
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope.row.id)"
            style="margin-left: 5px"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.pageNum"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      :page-sizes="[5, 10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 15px; text-align: right"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"; // 🌟 移除了不需要的computed
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { problemAdminAPI } from "@/api/admin";

const router = useRouter();
const loading = ref(false);
const searchKeyword = ref("");
const problemList = ref([]); // 存储后端返回的数据（当前页）

// 分页参数
const pagination = reactive({
  pageNum: 1,
  size: 10,
  total: 0, // 不再从后端获取，我们自己统计
});

// 🌟 修正：添加onMounted调用
onMounted(() => {
  fetchProblems();
});

// 获取题目列表 - 不再关心total
const fetchProblems = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: pagination.pageNum,
      size: pagination.size,
      keyword: searchKeyword.value.trim(),
    };

    console.log("请求参数:", params);

    const res = await problemAdminAPI.getProblemsByPage(params);
    console.log("API 返回结果（原始）:", res);
    console.log("返回数据类型:", typeof res);

    // 🌟 核心修改：后端直接返回数组，我们需要适应这种格式
    let dataArray = [];

    // 情况1：直接返回数组（当前实际情况）
    if (Array.isArray(res)) {
      dataArray = res;
      pagination.total = res.length; // 数组长度就是总数
      console.log("后端返回数组，长度:", dataArray.length);
    }
    // 情况2：返回 { code, data } 格式（Mock格式）
    else if (res.code === 1) {
      // 处理各种可能的data格式
      if (Array.isArray(res.data)) {
        dataArray = res.data;
        pagination.total = res.data.length;
      } else if (res.data && Array.isArray(res.data.list)) {
        dataArray = res.data.list;
        pagination.total = res.data.total || res.data.list.length;
      } else if (res.data && Array.isArray(res.data.records)) {
        dataArray = res.data.records;
        pagination.total = res.data.total || res.data.records.length;
      }
    }
    // 情况3：其他格式
    else {
      console.warn("未知返回格式，尝试解析:", res);
      // 尝试当作数组处理
      dataArray = Array.isArray(res) ? res : [];
      pagination.total = dataArray.length;
    }

    // 🌟 直接使用后端返回的数据
    problemList.value = dataArray;

    console.log("最终数据:", problemList.value);
    console.log("总条数:", pagination.total);

    if (problemList.value.length === 0) {
      if (searchKeyword.value.trim()) {
        ElMessage.info(`未找到包含"${searchKeyword.value}"的题目`);
      } else {
        ElMessage.info("暂无题目数据");
      }
    }
  } catch (err) {
    console.error("获取题目列表失败:", err);
    ElMessage.error(err.message || "网络错误");
    problemList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 🌟 修正：需要调用fetchProblems
const handleSearchInput = () => {
  pagination.pageNum = 1;
  fetchProblems();
};

// 🌟 修正：需要调用fetchProblems
const handleSearch = () => {
  pagination.pageNum = 1;
  fetchProblems(); // 🌟 添加：搜索按钮点击时重新获取数据
};

// 🌟 修正：需要调用fetchProblems
const handleSearchClear = () => {
  pagination.pageNum = 1;
  fetchProblems(); // 🌟 添加：清空搜索时重新获取数据
};

// 🌟 修正：需要调用fetchProblems
const handleSizeChange = (size) => {
  pagination.size = size;
  pagination.pageNum = 1;
  fetchProblems(); // 🌟 添加：分页大小变化时重新获取数据
};

// 🌟 修正：需要调用fetchProblems
const handleCurrentChange = (pageNum) => {
  pagination.pageNum = pageNum;
  fetchProblems(); // 🌟 添加：页码变化时重新获取数据
};

// 跳转到新增题目页
const goToCreate = () => {
  router.push({
    name: "AdminProblemCreate",
  });
};

// 跳转到编辑题目页
const goToEdit = (row) => {
  if (!row.id) {
    ElMessage.warning("题目ID不存在");
    return;
  }
  router.push({
    name: "AdminProblemEdit",
    params: { id: row.id },
  });
};

// 删除题目 - 兼容多种返回格式
const handleDelete = async (id) => {
  if (!id) {
    ElMessage.warning("题目ID不存在");
    return;
  }

  try {
    await ElMessageBox.confirm("确定删除该题目吗？删除后不可恢复。", "提示", {
      type: "warning",
    });

    const res = await problemAdminAPI.deleteProblem(id);
    console.log("删除接口返回:", res);
    console.log("导入的 problemAdminAPI:", problemAdminAPI);
    console.log("deleteProblem 是否存在:", problemAdminAPI.deleteProblem);
    console.log("deleteProblem 类型:", typeof problemAdminAPI.deleteProblem);
    console.log("problemAdminAPI 的所有方法:", Object.keys(problemAdminAPI));
    // 🌟 兼容多种返回格式
    let isSuccess = false;
    let successMessage = "删除成功";

    // 情况1：返回 { code: 1, message: "..." }
    if (res && res.code === 1) {
      isSuccess = true;
      successMessage = res.message || "删除成功";
    }
    // 情况2：直接返回空对象（表示成功）
    else if (res && Object.keys(res).length === 0) {
      isSuccess = true;
      successMessage = "删除成功";
    }
    // 情况3：返回 { success: true } 或其他成功标记
    else if (res && (res.success === true || res.msg === "success")) {
      isSuccess = true;
      successMessage = res.message || res.msg || "删除成功";
    }
    // 情况4：HTTP状态码200但无响应体
    else if (!res) {
      isSuccess = true;
      successMessage = "删除成功";
    }

    if (isSuccess) {
      ElMessage.success(successMessage);
      fetchProblems(); // 刷新列表
    } else {
      const errorMsg = res?.message || res?.msg || res?.error || "删除失败";
      ElMessage.error(errorMsg);
    }
  } catch (err) {
    if (err !== "cancel") {
      console.error("删除失败:", err);
      ElMessage.error("删除失败：" + (err.message || "接口请求错误"));
    }
  }
};
</script>

<style scoped>
.admin-problem-management {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 60px);
}

.header-actions {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.description-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.header-actions .el-input {
  margin-right: 10px;
}

.header-actions .el-button {
  margin-left: 10px;
}
</style>
