<template>
  <footer class="Appfooter">
    <div class="container">
      <p>&copy; {{ year }} by.acye and shuimo</p>
    </div>
  </footer>
</template>

<script setup>
import { ref } from "vue";
const year = ref(new Date().getFullYear());
</script>

<style scoped>
.footer {
  background-color: "$color-secondary";
  color: white;
  text-align: center;
  padding: "$spacing-lg 0";
  margin-top: "auto";
}
</style>
