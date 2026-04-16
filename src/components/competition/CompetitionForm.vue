<template>
  <div class="competition-form">
    <h2>{{ isEdit ? "编辑竞赛" : "发布竞赛" }}</h2>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="竞赛名称" prop="competitionName">
        <el-input v-model="form.competitionName" placeholder="请输入竞赛名称" />
      </el-form-item>

      <el-form-item label="开始时间" prop="startDatetime">
        <el-date-picker
          v-model="form.startDatetime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择开始日期"
        />
      </el-form-item>

      <el-form-item label="结束时间" prop="endDatetime">
        <el-date-picker
          v-model="form.endDatetime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择结束日期"
        />
      </el-form-item>

      <el-form-item label="发布者" prop="publisher">
        <el-input v-model="form.publisher" placeholder="请输入发布者" />
      </el-form-item>

      <el-form-item label="竞赛描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入竞赛描述"
        />
      </el-form-item>

      <el-form-item label="题目ids" prop="questionIds">
        <el-input v-model="form.questionIds" placeholder="请输入题目ids,逗号分隔,如:  '1,2,3'" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? "保存" : "发布" }}
        </el-button>
        <el-button @click="goBack">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { competitionAPI } from "@/api/competition";

const route = useRoute();
const router = useRouter();
const store = useStore();
const formRef = ref();
const submitting = ref(false);

const isEdit = computed(() => !!route.params.id);

const form = reactive({
  id: undefined,
  competitionName: "",
  startDatetime: "",
  endDatetime: "",
  publisher: "",
  description: "",
});

const validateEndDatetime = (_, value, callback) => {
  if (!value) {
    callback(new Error("请选择结束时间"));
    return;
  }
  if (form.startDatetime && value < form.startDatetime) {
    callback(new Error("结束时间不能早于开始时间"));
    return;
  }
  callback();
};

const rules = {
  competitionName: [{ required: true, message: "请输入竞赛名称", trigger: "blur" }],
  startDatetime: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  endDatetime: [{ validator: validateEndDatetime, trigger: "change" }],
  publisher: [{ required: true, message: "请输入发布者", trigger: "blur" }],
  description: [{ required: true, message: "请输入竞赛描述", trigger: "blur" }],
};

const fillPublisher = () => {
  if (!form.publisher) {
    form.publisher = store.state.user.userInfo?.username || "";
  }
};

const loadDetail = async () => {
  if (!isEdit.value) return;
  const id = Number(route.params.id);
  if (!id) return;
  const res = await competitionAPI.getCompetitionById(id);
  if (!res.data) {
    ElMessage.error("比赛不存在");
    router.push({ name: "CompetitionManagement" });
    return;
  }
  form.id = res.data.id;
  form.competitionName = res.data.competitionName || "";
  form.startDatetime = res.data.startDatetime || "";
  form.endDatetime = res.data.endDatetime || "";
  form.publisher = res.data.publisher || "";
  form.description = res.data.description || "";
  form.questionIds = res.data.questionIds || "";
};

const handleSubmit = async () => {
  await formRef.value.validate();
  submitting.value = true;
  try {
    const payload = {
      competitionName: form.competitionName.trim(),
      startDatetime: form.startDatetime,
      endDatetime: form.endDatetime,
      publisher: form.publisher.trim(),
      description: form.description.trim(),
      questionIds: form.questionIds.trim(),
    };
    console.log("前端传给后端的参数：", payload);
    if (isEdit.value) {
      await competitionAPI.updateCompetition({
        id: form.id || Number(route.params.id),
        ...payload,
      });
      ElMessage.success("更新成功");
    } else {
      await competitionAPI.addCompetition(payload);
      ElMessage.success("发布成功");
    }
    router.push({ name: "CompetitionManagement" });
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.push({ name: "CompetitionManagement" });
};

onMounted(async () => {
  fillPublisher();
  await loadDetail();
});
</script>

<style scoped>
.competition-form {
  padding: 20px;
}
</style>
