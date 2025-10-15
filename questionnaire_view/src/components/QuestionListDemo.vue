<template>
  <div class="question-demo">
    <div class="demo-card">
      <h3>
        <i class="fas fa-clipboard-list"></i>
        我的问题组件 - 功能演示
      </h3>

      <div class="demo-info">
        <div class="info-section">
          <h4>页面功能：</h4>
          <ul class="feature-list">
            <li><i class="fas fa-eye"></i> 展示用户拥有的所有问题组件</li>
            <li><i class="fas fa-chart-bar"></i> 显示问题统计信息（总数、类型分布）</li>
            <li><i class="fas fa-search"></i> 搜索问题标题和内容</li>
            <li><i class="fas fa-filter"></i> 按问题类型筛选</li>
            <li><i class="fas fa-edit"></i> 编辑问题组件</li>
            <li><i class="fas fa-trash"></i> 删除可删除的问题</li>
          </ul>
        </div>

        <div class="info-section">
          <h4>数据源：</h4>
          <p>从 <code>userStore.userData.question_ids</code> 获取问题ID列表</p>
          <p>调用 <code>GET /question/search/{id}</code> 获取问题详情</p>
        </div>

        <div class="info-section">
          <h4>当前状态：</h4>
          <div class="status-info">
            <p><strong>登录状态:</strong>
              <span :class="userStore.isLoggedIn ? 'status-success' : 'status-error'">
                {{ userStore.isLoggedIn ? '已登录' : '未登录' }}
              </span>
            </p>
            <p><strong>问题数量:</strong>
              <span class="status-info-value">{{ userStore.userData.question_ids.length }}</span>
            </p>
            <p><strong>问题ID列表:</strong></p>
            <div class="id-list">
              <span v-for="id in userStore.userData.question_ids" :key="id" class="id-tag">
                {{ id }}
              </span>
              <span v-if="userStore.userData.question_ids.length === 0" class="no-data">
                暂无问题ID
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-actions">
        <button @click="addTestQuestion" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          添加测试问题ID
        </button>

        <button @click="clearTestQuestions" class="btn btn-warning">
          <i class="fas fa-trash"></i>
          清除测试数据
        </button>

        <router-link to="/question-my" class="btn btn-success">
          <i class="fas fa-eye"></i>
          查看问题列表页面
        </router-link>
      </div>

      <div class="demo-note">
        <p><i class="fas fa-info-circle"></i>
          注意：添加的测试问题ID可能在实际API中不存在，页面会自动过滤掉无效的问题。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

// 生成测试问题ID
function generateTestQuestionId(): string {
  return `test_question_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
}

// 添加测试问题ID
function addTestQuestion() {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }

  const testId = generateTestQuestionId()
  userStore.addQuestionId(testId)
  console.log('Added test question ID:', testId)
}

// 清除测试问题
function clearTestQuestions() {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }

  const questionIds = [...userStore.userData.question_ids]
  questionIds.forEach(id => {
    if (id.startsWith('test_question_')) {
      userStore.removeQuestionId(id)
    }
  })

  console.log('Cleared test questions')
}
</script>

<style scoped>
.question-demo {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.demo-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2rem;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.demo-card h3 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.5rem;
}

.demo-card h3 i {
  margin-right: 0.5rem;
}

.demo-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
}

.info-section {
  margin-bottom: 1.5rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h4 {
  margin-bottom: 0.8rem;
  color: #fbbf24;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 0.3rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.feature-list i {
  color: #4ade80;
  width: 16px;
}

.status-info {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 1rem;
}

.status-info p {
  margin: 0.5rem 0;
}

.status-success {
  color: #4ade80;
  font-weight: bold;
}

.status-error {
  color: #f87171;
  font-weight: bold;
}

.status-info-value {
  color: #60a5fa;
  font-weight: bold;
}

.id-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.id-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-family: monospace;
}

.no-data {
  color: #9ca3af;
  font-style: italic;
}

.demo-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-warning {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-success {
  background: linear-gradient(45deg, #a8edea 0%, #fed6e3 100%);
  color: #333;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.demo-note {
  background: rgba(251, 191, 36, 0.2);
  border-radius: 10px;
  padding: 1rem;
  border-left: 4px solid #fbbf24;
}

.demo-note p {
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.demo-note i {
  color: #fbbf24;
  margin-top: 0.2rem;
}

code {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  color: #60a5fa;
}

@media (max-width: 768px) {
  .question-demo {
    padding: 1rem;
  }

  .demo-actions {
    flex-direction: column;
  }

  .id-list {
    flex-direction: column;
  }
}
</style>
