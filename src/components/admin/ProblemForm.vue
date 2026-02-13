<template>
  <div class="problem-form">
    <el-card shadow="never">
      <el-form
        ref="formRef"
        :model="form"
        label-width="100px"
        :rules="rules"
        class="problem-form-content"
      >
        <!-- 题目名称 -->
        <el-form-item label="题目名称" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入题目名称（如：两数之和）"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <!-- 题目标签 -->
        <el-form-item label="题目标签" prop="label">
          <el-input
            v-model="form.label"
            placeholder="例如：数组,哈希表,简单（多个标签用逗号分隔）"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <!-- 题目描述 -->
        <el-form-item label="题目描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="6"
            placeholder="请输入题目描述（支持换行和Markdown）"
          />
        </el-form-item>

        <!-- 测试点列表 -->
        <el-form-item label="测试点配置">
          <div class="test-point-header">
            <span class="count-text"
              >测试点列表（共{{ form.testPointList.length }}个）</span
            >
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="addTestPoint"
              >新增测试点</el-button
            >
          </div>

          <div class="test-point-list">
            <div
              class="test-point-item"
              v-for="(item, index) in form.testPointList"
              :key="index"
              border
            >
              <el-form-item
                label="输入用例"
                :prop="`testPointList[${index}].input`"
                :rules="testPointRules.input"
              >
                <el-input
                  v-model="item.input"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入测试用例输入内容（如：1 2）"
                />
              </el-form-item>

              <el-form-item
                label="输出结果"
                :prop="`testPointList[${index}].output`"
                :rules="testPointRules.output"
              >
                <el-input
                  v-model="item.output"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入测试用例预期输出（如：3）"
                />
              </el-form-item>

              <el-form-item label="是否样例">
                <el-radio-group v-model="item.isSample">
                  <el-radio label="1">是（展示给用户）</el-radio>
                  <el-radio label="0">否（仅后台评测）</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="操作">
                <el-button
                  type="danger"
                  size="small"
                  icon="el-icon-delete"
                  @click="removeTestPoint(index)"
                  v-if="form.testPointList.length > 1"
                  >删除</el-button
                >
              </el-form-item>
            </div>
          </div>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item class="form-submit">
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="submitting"
            icon="el-icon-check"
            >{{ isEdit ? "更新题目" : "创建题目" }}</el-button
          >
          <el-button
            @click="handleReset"
            icon="el-icon-refresh"
            style="margin-left: 10px"
            >重置</el-button
          >
          <el-button
            @click="handleCancel"
            icon="el-icon-close"
            style="margin-left: 10px"
            >取消</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { problemAdminAPI } from "@/api/admin";

const router = useRouter();
const formRef = ref(null);
const submitting = ref(false);

// 接收父组件参数
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

// 触发父组件事件
const emit = defineEmits(["submit-success"]);

// 表单数据初始化
const form = reactive({
  id: "",
  title: "",
  label: "",
  description: "",
  testPointList: [{ input: "", output: "", isSample: "1" }],
  testPointNum: 1,
  ...props.initialData,
});

// 监听父组件数据变化（编辑模式下同步数据）
watch(
  () => props.initialData,
  (newVal) => {
    if (newVal.id) {
      // 兼容后端返回的测试点格式
      const testPointList = newVal.testPointList?.map((item) => ({
        input: item.input || "",
        output: item.output || "",
        isSample: String(item.isSample || "1"),
      })) || [{ input: "", output: "", isSample: "1" }];

      Object.assign(form, { ...newVal, testPointList });
      form.testPointNum = form.testPointList.length;
    }
  },
  { immediate: true, deep: true }
);

// 表单校验规则
const rules = {
  title: [
    { required: true, message: "请输入题目名称", trigger: "blur" },
    {
      min: 3,
      max: 100,
      message: "题目名称长度需在3-100字符之间",
      trigger: "blur",
    },
  ],
  label: [
    { required: true, message: "请输入题目标签", trigger: "blur" },
    { min: 2, max: 50, message: "标签长度需在2-50字符之间", trigger: "blur" },
  ],
  description: [
    { required: true, message: "请输入题目描述", trigger: "blur" },
    { min: 10, message: "题目描述至少10字符", trigger: "blur" },
  ],
};

// 测试点校验规则
const testPointRules = {
  input: [{ required: true, message: "请输入测试用例输入", trigger: "blur" }],
  output: [{ required: true, message: "请输入测试用例输出", trigger: "blur" }],
};

// 新增测试点
const addTestPoint = () => {
  form.testPointList.push({ input: "", output: "", isSample: "0" });
  form.testPointNum = form.testPointList.length;
};

// 删除测试点
const removeTestPoint = (index) => {
  form.testPointList.splice(index, 1);
  form.testPointNum = form.testPointList.length;
};

// 重置表单
const handleReset = () => {
  formRef.value.resetFields();
  // 重置测试点为初始状态
  form.testPointList = [{ input: "", output: "", isSample: "1" }];
  form.testPointNum = 1;
};

// 取消操作
const handleCancel = () => {
  router.push("/admin/problems");
};

// 提交表单 - 添加详细调试日志
const handleSubmit = async () => {
  console.log("=== 表单提交开始 ===");
  console.log("编辑模式:", props.isEdit);
  console.log("表单初始数据:", JSON.stringify(props.initialData, null, 2));
  console.log("当前表单数据:", JSON.stringify(form, null, 2));

  try {
    console.log("1. 开始表单验证...");
    // 先校验整个表单（包括测试点）
    await formRef.value.validate();
    console.log("✅ 表单验证通过");

    submitting.value = true;

    // 更新测试点数量
    form.testPointNum = form.testPointList.length;
    console.log("测试点数量:", form.testPointNum);

    // 准备提交数据
    const submitData = {
      ...form,
      testPointList: form.testPointList.map((item) => ({
        ...item,
        isSample: Number(item.isSample), // 确保是数字
      })),
    };

    console.log("2. 准备提交的数据:", JSON.stringify(submitData, null, 2));
    console.log("是否有id字段:", "id" in submitData, "id值:", submitData.id);

    console.log("3. 调用API接口...");
    console.log("API函数:", props.isEdit ? "updateProblem" : "addProblem");

    // 调用后端接口
    const res = props.isEdit
      ? await problemAdminAPI.updateProblem(submitData)
      : await problemAdminAPI.addProblem(submitData);

    console.log("4. API响应:", res);
    console.log("响应类型:", typeof res);
    console.log("响应是否数组:", Array.isArray(res));

    if (res) {
      // 🌟 核心修复：先判断res是否为非空普通对象，再执行对象操作
      const isValidObj =
        typeof res === "object" && res !== null && !Array.isArray(res);
      console.log(
        "响应对象属性:",
        isValidObj ? Object.keys(res) : "res非普通对象（字符串/数组等）"
      );
      console.log(
        "是否有code属性:",
        isValidObj ? "code" in res : "res非普通对象"
      );
      console.log("code值:", isValidObj ? res.code : "res非普通对象");
      console.log(
        "是否有message属性:",
        isValidObj ? "message" in res : "res非普通对象"
      );
      console.log("message值:", isValidObj ? res.message : "res非普通对象");
      console.log(
        "是否有data属性:",
        isValidObj ? "data" in res : "res非普通对象"
      );
      console.log("是否有id属性:", isValidObj ? "id" in res : "res非普通对象");
      console.log(
        "是否有title属性:",
        isValidObj ? "title" in res : "res非普通对象"
      );
    } else {
      console.warn("API响应为空或undefined");
    }

    console.log("5. 处理API响应...");
    // 🌟 兼容修复：支持字符串/对象/空值等多种响应格式
    let submitSuccess = false;
    // 场景1：标准对象响应（code=1）
    if (typeof res === "object" && res !== null && res.code === 1) {
      submitSuccess = true;
      console.log("✅ 操作成功 (code=1)");
    }
    // 场景2：直接返回题目对象（含id/title）
    else if (typeof res === "object" && res !== null && (res.id || res.title)) {
      submitSuccess = true;
      console.log("✅ 操作成功 (直接返回题目对象)");
    }
    // 场景3：空对象响应
    else if (
      typeof res === "object" &&
      res !== null &&
      Object.keys(res).length === 0
    ) {
      submitSuccess = true;
      console.log("✅ 操作成功 (空对象响应)");
    }
    // 场景4：字符串响应（含“成功”关键词）
    else if (typeof res === "string" && res.includes("成功")) {
      submitSuccess = true;
      console.log("✅ 操作成功 (字符串提示成功)");
    }
    // 场景5：无响应体
    else if (!res) {
      submitSuccess = true;
      console.log("✅ 操作成功 (无响应体)");
    }

    // 统一处理成功/失败
    if (submitSuccess) {
      emit("submit-success"); // 通知父组件跳转
    } else {
      console.error("❌ 操作失败");
      const errorMsg =
        res?.message || res?.msg || (props.isEdit ? "更新失败" : "创建失败");
      console.error("错误信息:", errorMsg);
      ElMessage.error(errorMsg);
    }
  } catch (err) {
    console.error("=== 表单提交异常 ===");
    console.error("错误类型:", err.constructor.name);
    console.error("错误消息:", err.message);
    console.error("错误堆栈:", err.stack);

    // 检查是否是表单验证错误
    if (err.fields) {
      console.error("验证失败字段:", Object.keys(err.fields));
      console.error("详细验证错误:", err.fields);
      ElMessage.error("表单校验失败，请检查必填项");
    } else if (err.message && err.message.includes("Network")) {
      console.error("网络错误");
      ElMessage.error("网络错误，请检查连接");
    } else {
      console.error("其他错误");
      ElMessage.error(`提交失败: ${err.message || "未知错误"}`);
    }
  } finally {
    submitting.value = false;
    console.log("=== 表单提交结束 ===");
  }
};
</script>

<style scoped>
.problem-form {
  padding: 0;
}

.problem-form-content {
  max-width: 800px;
  margin: 0 auto;
}

.test-point-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.count-text {
  color: #666;
  font-size: 14px;
}

.test-point-list {
  margin-top: 10px;
}

.test-point-item {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 10px;
}

.form-submit {
  text-align: center;
  margin-top: 20px;
}
</style>
