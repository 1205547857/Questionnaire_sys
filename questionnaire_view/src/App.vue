<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import siteList from './templates/siteList.vue'

const route = useRoute()

// 动态检测当前路由
const isStandalonePage = computed(() => route.path.startsWith('/form/'))
const isAdminPage = computed(() => route.path.startsWith('/admin'))

// 确保body类正确设置
document.body.classList.toggle('standalone-page', isStandalonePage.value)
</script>

<template>
  <!-- 条件渲染：完全不同的布局结构 -->
  <router-view v-if="isStandalonePage || isAdminPage" />

  <div v-else class="app-container">
    <siteList />
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
}

/* 独立模式：问卷填写页面 */
.app-container.standalone-mode {
  overflow: hidden;
  background: transparent;
}

/* 系统模式：正常布局 */
.app-container:not(.standalone-mode) {
  background: transparent;
}
</style>
