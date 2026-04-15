<template>
  <div class="competition-management">
    <h2>竞赛管理</h2>
    <div class="header-actions">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索竞赛名称"
        style="width: 240px"
        @keyup.enter="handleSearch"
        clearable
        @clear="handleSearch"
      />
      <el-button type="primary" @click="handleSearch" style="margin-left: 10px">
        搜索
      </el-button>
      <el-button type="success" @click="goToCreateCompetition" style="margin-left: 10px">
        发布竞赛
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="competitionList"
      border
      stripe
      style="width: 100%; margin-top: 15px"
      empty-text="暂无竞赛数据"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="competitionName" label="竞赛名称" min-width="200" />
      <el-table-column
        prop="description"
        label="竞赛描述"
        min-width="300"
        align="center"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span class="description-text">{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="startDatetime" label="开始时间" width="180" align="center" />
      <el-table-column prop="endDatetime" label="结束时间" width="180" align="center" />
      <el-table-column prop="publisher" label="发布者" width="120" align="center" />

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
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { competitionAPI } from "@/api/competition";

const router = useRouter();
const loading = ref(false);
const searchKeyword = ref("");
const competitionList = ref([]);

const pagination = reactive({
  pageNum: 1,
  size: 10,
  total: 0,
});

const fetchCompetitions = async () => {
  loading.value = true;
  try {
    const keyword = searchKeyword.value.trim();
    const [listRes, countRes] = await Promise.all([
      competitionAPI.getCompetitionsByPage({
        pageNum: pagination.pageNum,
        size: pagination.size,
        keyword,
      }),
      competitionAPI.getCompetitionCount(keyword),
    ]);

    competitionList.value = Array.isArray(listRes.data) ? listRes.data : [];
    pagination.total =
      countRes && typeof countRes.data === "number"
        ? countRes.data
        : competitionList.value.length;
  } catch (error) {
    competitionList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const goToCreateCompetition = () => {
  router.push({ name: "CompetitionCreate" });
};

const goToEdit = (row) => {
  if (!row.id) {
    ElMessage.warning("比赛ID不存在");
    return;
  }
  router.push({ name: "CompetitionEdit", params: { id: row.id } });
};

const handleDelete = async (id) => {
  if (!id) {
    ElMessage.warning("比赛ID不存在");
    return;
  }
  try {
    await ElMessageBox.confirm("确定删除该比赛吗？删除后不可恢复。", "提示", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    });
    await competitionAPI.deleteCompetitionById(id);
    ElMessage.success("删除成功");
    if (competitionList.value.length === 1 && pagination.pageNum > 1) {
      pagination.pageNum -= 1;
    }
    fetchCompetitions();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleSearch = () => {
  pagination.pageNum = 1;
  fetchCompetitions();
};

const handleSizeChange = (size) => {
  pagination.size = size;
  pagination.pageNum = 1;
  fetchCompetitions();
};

const handleCurrentChange = (pageNum) => {
  pagination.pageNum = pageNum;
  fetchCompetitions();
};

onMounted(() => {
  fetchCompetitions();
});
</script>

<style scoped>
.competition-management {
  padding: 20px;
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
</style>
