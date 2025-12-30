<!-- views/ProblemList.vue -->
<template>
  <div class="problem-list-page">
    <div class="page-header">
      <h1>题目列表</h1>
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索题目名称/标签"
          :prefix-icon="Search"
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearchClear"
        />
        <el-button
          type="primary"
          @click="handleSearch"
          style="margin-left: 12px"
        >
          搜索
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 题目列表 -->
    <div v-else class="problem-list-container">
      <div v-if="problemList.length === 0" class="empty-state">
        <el-empty description="暂无题目数据" />
      </div>

      <div v-else class="problem-items">
        <ProblemItem
          v-for="problem in problemList"
          :key="problem.id"
          :problem="problem"
          @click="goToDetail(problem)"
        />
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { problemApi } from "@/api/problem";
import ProblemItem from "@/components/problem/ProblemItem.vue";

const router = useRouter();
const loading = ref(false);
const searchKeyword = ref("");

// 分页参数
const pagination = reactive({
  pageNum: 1,
  size: 10,
  total: 0,
});

const problemList = ref([]);

// 获取题目列表
const fetchProblems = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: pagination.pageNum,
      size: pagination.size,
      keyword: searchKeyword.value.trim(),
    };

    const res = await problemApi.getProblemList(params);

    if (res.code === 1 && Array.isArray(res.data)) {
      problemList.value = res.data;
      pagination.total = res.data.length;
    } else if (res.code === 1 && res.data?.list) {
      problemList.value = res.data.list;
      pagination.total = res.data.total || res.data.list.length;
    } else if (Array.isArray(res)) {
      problemList.value = res;
      pagination.total = res.length;
    } else {
      problemList.value = [];
      pagination.total = 0;
    }

    if (problemList.value.length === 0 && searchKeyword.value.trim()) {
      ElMessage.info(`未找到包含"${searchKeyword.value}"的题目`);
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

// 搜索相关函数
const handleSearch = () => {
  pagination.pageNum = 1;
  fetchProblems();
};

const handleSearchClear = () => {
  pagination.pageNum = 1;
  fetchProblems();
};

// 分页相关函数
const handleSizeChange = (size) => {
  pagination.size = size;
  pagination.pageNum = 1;
  fetchProblems();
};

const handleCurrentChange = (pageNum) => {
  pagination.pageNum = pageNum;
  fetchProblems();
};

// 跳转到题目详情
const goToDetail = (problem) => {
  if (!problem.id) {
    ElMessage.warning("题目ID不存在");
    return;
  }
  router.push({
    name: "ProblemDetail",
    params: { id: problem.id },
  });
};

// 初始化加载
onMounted(() => {
  fetchProblems();
});
</script>

<style scoped>
.problem-list-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.search-bar {
  display: flex;
  align-items: center;
}

.loading-container {
  padding: 40px 0;
}

.problem-list-container {
  margin-top: 24px;
}

.problem-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  padding: 60px 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .problem-list-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-bar {
    flex-direction: column;
    gap: 12px;
  }

  .search-bar .el-input {
    width: 100% !important;
  }

  .search-bar .el-button {
    margin-left: 0 !important;
    width: 100%;
  }
}
</style>
