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
      :data="paginatedProblemList"
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
      :total="filteredProblemList.length"
      :page-sizes="[5, 10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 15px; text-align: right"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { problemAdminAPI } from "@/api/admin";

const router = useRouter();
const loading = ref(false);
const searchKeyword = ref("");
const problemList = ref([]);

// 分页参数
const pagination = reactive({
  pageNum: 1,
  size: 10,
});

// 计算属性：过滤后的数据
const filteredProblemList = computed(() => {
  if (!searchKeyword.value.trim()) {
    return problemList.value;
  }

  const keyword = searchKeyword.value.trim().toLowerCase();
  return problemList.value.filter((item) => {
    return (
      item.title?.toLowerCase().includes(keyword) ||
      item.label?.toLowerCase().includes(keyword) ||
      item.description?.toLowerCase().includes(keyword) ||
      item.id?.toString().includes(keyword)
    );
  });
});

// 计算属性：分页后的数据
const paginatedProblemList = computed(() => {
  const start = (pagination.pageNum - 1) * pagination.size;
  const end = start + pagination.size;
  return filteredProblemList.value.slice(start, end);
});

// 初始化加载题目列表
onMounted(() => {
  fetchProblems();
});

// 获取题目列表
const fetchProblems = async () => {
  loading.value = true;
  try {
    console.log("开始请求题目数据...");

    const requestParams = {
      pageNum: 1,
      size: 1000,
    };

    console.log("请求参数:", requestParams);

    const res = await problemAdminAPI.getProblemsByPage(requestParams);

    console.log("API响应完整对象:", res);

    // 🌟 关键修改：API直接返回数组，无需解析code/data
    if (Array.isArray(res)) {
      console.log("API返回数组，长度:", res.length);
      problemList.value = res;
      pagination.pageNum = 1;
    } else if (res?.code === 1) {
      // 兼容可能的包装对象格式（备用）
      problemList.value = res.data?.records || res.data || [];
      pagination.pageNum = 1;
    } else {
      console.warn("API返回非预期格式:", res);
      problemList.value = [];
      ElMessage.warning(res?.message || "数据格式异常");
    }

    console.log("最终处理后的数据:", problemList.value);
    console.log("数据条数:", problemList.value.length);
  } catch (err) {
    console.error("请求异常详情:", err);
    ElMessage.error(err.message || "网络错误，请重试");
    problemList.value = [];
  } finally {
    loading.value = false;
    console.log("请求完成");
  }
};

// 搜索输入处理
const handleSearchInput = () => {
  pagination.pageNum = 1;
};

// 搜索按钮点击
const handleSearch = () => {
  pagination.pageNum = 1;
};

// 清除搜索
const handleSearchClear = () => {
  pagination.pageNum = 1;
};

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.size = size;
  pagination.pageNum = 1;
};

// 页码变化
const handleCurrentChange = (pageNum) => {
  pagination.pageNum = pageNum;
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

// 删除题目
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

    // 兼容多种成功标识：code===1 / success===true / 空对象（后端返回200但无数据）
    const isSuccess =
      res?.code === 1 || res?.success || Object.keys(res || {}).length === 0;

    if (isSuccess) {
      ElMessage.success(res?.message || res?.msg || "删除成功");
      fetchProblems();
    } else {
      ElMessage.error(res?.message || res?.msg || "删除失败");
    }
  } catch (err) {
    if (err !== "cancel") {
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
