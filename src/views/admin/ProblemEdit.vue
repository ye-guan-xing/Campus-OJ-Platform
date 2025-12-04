<template>
  <div class="admin-problem-edit">
    <h2>{{ isEdit ? "编辑题目" : "创建题目" }}</h2>
    <ProblemForm
      ref="formRef"
      :initial-data="problemData"
      :is-edit="isEdit"
      @submit-success="handleSubmitSuccess"
    ></ProblemForm>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"; // 把watch也合并到顶部导入，更规范
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import ProblemForm from "@/components/admin/ProblemForm.vue";
import { problemAdminAPI } from "@/api/admin";

const router = useRouter();
const route = useRoute();
const formRef = ref(null);
const problemData = ref({});
const loading = ref(false);

// 根据路由params判断是否为编辑模式 —— 增加调试
const isEdit = computed(() => {
  const id = route.params.id;
  // 调试：打印路由参数和编辑模式结果
  console.log("【编辑模式判断】route.params.id:", id, "类型:", typeof id);
  console.log("【编辑模式判断】isEdit结果:", !!id && !isNaN(Number(id)));
  return !!id && !isNaN(Number(id));
});

const loadProblemDetail = async () => {
  if (!isEdit.value) return;
  loading.value = true;

  try {
    const problemId = Number(route.params.id);
    console.log(
      "【加载详情】转换后的problemId:",
      problemId,
      "是否有效:",
      !isNaN(problemId)
    );

    if (!problemId) {
      ElMessage.error("无效的题目ID");
      router.push("/admin/problems");
      return;
    }

    // 调用API获取响应
    const res = await problemAdminAPI.getProblemById(problemId);
    console.log("【加载详情】getProblemById接口响应:", res);

    // 第一步：判断接口调用是否成功（根据code）
    if (res.code !== 1) {
      ElMessage.error(`获取题目失败：${res.message || "未知错误"}`);
      router.push("/admin/problems");
      return;
    }

    // 第二步：提取题目数据（res.data）
    const problem = res.data;
    console.log("【加载详情】提取的题目数据:", problem);

    // 第三步：判断题目数据是否有效（含id）
    if (!problem || !problem.id) {
      ElMessage.error("获取题目详情失败：无有效题目数据");
      router.push("/admin/problems");
      return;
    }

    // 数据有效，正常赋值
    problemData.value = {
      ...problem,
      testPointList: (problem.testPointList || []).map((item) => ({
        ...item,
        isSample: String(item.isSample || "1"),
      })),
    };
    console.log("【加载详情】赋值后的problemData:", problemData.value);
  } catch (err) {
    console.error("【加载详情异常】错误对象:", err);
    ElMessage.error("网络错误或题目不存在");
    router.push("/admin/problems");
  } finally {
    loading.value = false;
  }
};

// 页面挂载时执行加载（使用onMounted，解决未使用的报错）
onMounted(() => {
  if (isEdit.value) {
    console.log("【页面挂载】开始执行loadProblemDetail");
    loadProblemDetail();
  }
});

// 监听路由变化 —— 增加调试
watch(
  () => route.params.id,
  (newId) => {
    // 调试：打印路由参数变化
    console.log("【路由变化】新的id参数:", newId);
    if (newId) {
      loadProblemDetail();
    }
  }
);

// 子组件提交成功后的回调 —— 增加调试
const handleSubmitSuccess = () => {
  console.log("【提交成功】触发handleSubmitSuccess回调");
  ElMessage.success(isEdit.value ? "题目编辑成功" : "题目创建成功");
  router.push("/admin/problems");
};
</script>

<style scoped>
.admin-problem-edit {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 60px);
}

h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}
</style>
