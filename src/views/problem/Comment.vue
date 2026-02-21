<template>
  <div class="comment-page">
    <div class="header">
      <el-button @click="goBack" :icon="ArrowLeft" link>返回题目</el-button>
      <h2>题目评论</h2>
    </div>

    <div class="comment-list-wrapper">
      <CommentList
        :comments="comments"
        :loading="loading"
        :loading-more="loadingMore"
        :has-more="hasMore"
        :current-user-id="currentUserId"
        @reply="handleReply"
        @delete="handleDelete"
        @like-change="handleLikeChange"
        @load-more="loadMore"
      />
    </div>

    <div class="comment-input-fixed">
      <CommentInput
        ref="commentInput"
        :reply-to="replyToComment"
        :submitting="submitting"
        @submit="handleSubmit"
        @cancel-reply="cancelReply"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { commentApi } from '@/api/comment';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import CommentList from '@/components/comment/CommentList.vue';
import CommentInput from '@/components/comment/CommentInput.vue';

const route = useRoute();
const router = useRouter();
const store = useStore();

const problemId = route.params.id;
const comments = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const submitting = ref(false);
const hasMore = ref(true);
const pageNum = ref(1);
const pageSize = 10;
const replyToComment = ref(null);
const commentInput = ref(null);

const currentUserId = computed(() => store.getters.userInfo?.id);
// 获取用户的id



const fetchComments = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }

  try {
    const res = await commentApi.getComments({
      questionId: problemId,
      pageNum: pageNum.value,
      pageSize: pageSize,
      userId: currentUserId.value
    });

    if (res.code === 1) {
      const newComments = res.data || [];
      if (isLoadMore) {
        comments.value.push(...newComments);
      } else {
        comments.value = newComments;
      }
      
      hasMore.value = newComments.length === pageSize;
      if (hasMore.value) pageNum.value++;
    } else {
      ElMessage.error(res.message || '加载评论失败');
    }
  } catch (error) {
    ElMessage.error('网络错误，无法加载评论');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const handleReply = (comment) => {
  replyToComment.value = comment;
  // 聚焦输入框
  const inputEl = document.querySelector('.comment-input-area textarea');
  if (inputEl) inputEl.focus();
};

const cancelReply = () => {
  replyToComment.value = null;
};

const handleSubmit = async (content) => {
  console.log('currentUserId.value:', currentUserId.value);
  // if (!currentUserId.value) {
  //   ElMessage.warning('请先登录');
  //   router.push(`/login?redirect=${route.fullPath}`);
  //   return;
  // }

  submitting.value = true;
  try {
    const res = await commentApi.addComment({
      userId: currentUserId.value,
      content: content,
      questionId: problemId,
      parentCommentId: replyToComment.value ? replyToComment.value.id : null
    });

    if (res.code === 1) {
      ElMessage.success('评论发表成功');
      cancelReply();
      // 刷新列表
      pageNum.value = 1;
      fetchComments();
    } else {
      ElMessage.error(res.message || '发表失败');
    }
  } catch (error) {
    ElMessage.error('网络错误');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = (commentId) => {
  ElMessageBox.confirm('确定删除这条评论吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await commentApi.deleteComment(commentId);
      if (res.code === 1) {
        ElMessage.success('删除成功');
        // 刷新列表（简单处理，也可局部删除）
        pageNum.value = 1;
        fetchComments();
      } else {
        ElMessage.error(res.message || '删除失败');
      }
    } catch (error) {
      ElMessage.error('网络错误');
    }
  });
};

const handleLikeChange = async ({ commentId, isLiked }) => {
  if (!currentUserId.value) {
    ElMessage.warning('请先登录');
    return;
  }

  try {
    const api = isLiked ? commentApi.addCommentLike : commentApi.cancelCommentLike;
    const res = await api({
      userId: currentUserId.value,
      commentId: commentId
    });

    if (res.code === 1) {
      // 局部更新状态
      updateCommentLikeState(comments.value, commentId, isLiked);
    } else {
      ElMessage.error(res.message || '操作失败');
    }
  } catch (error) {
    ElMessage.error('网络错误');
  }
};

// 递归更新点赞状态
const updateCommentLikeState = (list, targetId, isLiked) => {
  for (let item of list) {
    if (item.id === targetId) {
      item.isLiked = isLiked;
      item.likeCount += isLiked ? 1 : -1;
      return true;
    }
    if (item.childComments && item.childComments.length > 0) {
      if (updateCommentLikeState(item.childComments, targetId, isLiked)) return true;
    }
  }
  return false;
};

const loadMore = () => {
  if (hasMore.value && !loadingMore.value) {
    fetchComments(true);
  }
};

const goBack = () => {
  router.push(`/problems/${problemId}`);
};

onMounted(() => {
  fetchComments();
});
</script>

<style scoped>
.comment-page {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 120px; /* 为底部输入框留出空间 */
  min-height: 100vh;
  background: #fff;
}

.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 16px;
}

.comment-list-wrapper {
  padding: 0 16px;
}

.comment-input-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}
</style>
