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
import { ref, onMounted, computed, watch } from "vue";
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
    console.log("【加载详情】要加载的题目ID:", problemId);

    if (!problemId) {
      ElMessage.error("无效的题目ID");
      router.push("/admin/problems");
      return;
    }

    // 调用API获取响应
    console.log("【加载详情】开始调用 getProblemById...");
    const res = await problemAdminAPI.getProblemById(problemId);

    // 🌟 详细的调试信息
    console.log("【加载详情】完整响应:", res);
    console.log("【加载详情】响应类型:", typeof res);
    console.log("【加载详情】响应是否为null:", res === null);
    console.log("【加载详情】响应是否为undefined:", res === undefined);
    console.log("【加载详情】响应是否为对象:", typeof res === "object");
    console.log("【加载详情】响应是否为数组:", Array.isArray(res));

    if (res) {
      console.log("【加载详情】响应有哪些属性:", Object.keys(res));
      console.log("【加载详情】是否有code属性:", "code" in res);
      console.log("【加载详情】code值:", res.code);
      console.log("【加载详情】是否有data属性:", "data" in res);
      console.log("【加载详情】data值:", res.data);
      console.log("【加载详情】是否有id属性:", "id" in res);
      console.log("【加载详情】是否有title属性:", "title" in res);
      console.log("【加载详情】JSON字符串:", JSON.stringify(res, null, 2));
    }

    // 🌟 核心修改：不再假设一定有 code 字段
    let problem = null;

    // 情况1：返回 { code: 1, data: {...} }
    if (res && res.code === 1 && res.data) {
      console.log("【加载详情】格式1: 标准格式 {code: 1, data: {...}}");
      problem = res.data;
    }
    // 情况2：直接返回题目对象（后端可能直接返回）
    else if (res && (res.id !== undefined || res.title !== undefined)) {
      console.log("【加载详情】格式2: 直接返回题目对象");
      problem = res;
    }
    // 情况3：返回 { data: {...} } 但没有 code
    else if (
      res &&
      res.data &&
      (res.data.id !== undefined || res.data.title !== undefined)
    ) {
      console.log("【加载详情】格式3: 返回 {data: 题目对象}");
      problem = res.data;
    }
    // 情况4：返回空对象或 null
    else if (!res || Object.keys(res).length === 0) {
      console.log("【加载详情】格式4: 返回空对象或null");
      ElMessage.error("题目不存在或已被删除");
      router.push("/admin/problems");
      return;
    }
    // 情况5：未知格式，尝试直接使用
    else {
      console.warn("【加载详情】格式5: 未知格式，尝试直接使用");
      problem = res;
    }

    console.log("【加载详情】提取的题目数据:", problem);

    // 判断题目数据是否有效（更宽松的判断）
    if (!problem || (problem.id === undefined && problem.title === undefined)) {
      console.error("【加载详情】数据无效:", problem);

      // 尝试获取错误信息
      let errorMsg = "获取题目详情失败";
      if (res && res.message) errorMsg = res.message;
      else if (res && res.msg) errorMsg = res.msg;
      else if (res && res.error) errorMsg = res.error;

      ElMessage.error(errorMsg);
      router.push("/admin/problems");
      return;
    }
    console.log("【加载详情】原始testPointList:", problem.testPointList);
    console.log(
      "【加载详情】原始testPointList长度:",
      problem.testPointList?.length
    );
    // 数据有效，正常赋值
    problemData.value = {
      ...problem,
      testPointList: (problem.testPointList || []).map((item) => ({
        input: item.input || "",
        output: item.output || "",
        isSample: String(item.isSample || "1"),
      })),
    };

    console.log("【加载详情】最终数据:", problemData.value);
    ElMessage.success("题目数据加载成功");
  } catch (err) {
    console.error("【加载详情异常】错误对象:", err);
    console.error("【加载详情异常】错误堆栈:", err.stack);
    ElMessage.error(`网络错误: ${err.message}`);
    router.push("/admin/problems");
  } finally {
    loading.value = false;
    console.log("【加载详情】函数执行完成");
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
