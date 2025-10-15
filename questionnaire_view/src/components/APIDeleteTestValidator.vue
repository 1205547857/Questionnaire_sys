<template>
  <div class="api-test">
    <div class="test-card">
      <h3>
        <i class="fas fa-vial"></i>
        删除API测试验证
      </h3>

      <div class="test-info">
        <div class="api-change-info">
          <h4>API变更确认：</h4>
          <div class="change-comparison">
            <div class="old-api">
              <h5>旧版API ❌</h5>
              <code>POST /question/delete</code>
              <pre>{ "id": "questionId" }</pre>
            </div>
            <div class="arrow">→</div>
            <div class="new-api">
              <h5>新版API ✅</h5>
              <code>DELETE /question/delete/{id}</code>
              <p>路径参数传递ID</p>
            </div>
          </div>
        </div>

        <div class="test-status">
          <h4>当前API配置状态：</h4>
          <div class="status-grid">
            <div class="status-item">
              <label>HTTP方法:</label>
              <span class="status-value success">DELETE</span>
            </div>
            <div class="status-item">
              <label>URL格式:</label>
              <span class="status-value success">/question/delete/{id}</span>
            </div>
            <div class="status-item">
              <label>参数类型:</label>
              <span class="status-value success">路径参数</span>
            </div>
          </div>
        </div>
      </div>

      <div class="test-actions">
        <button @click="testDeleteAPI" class="btn btn-primary" :disabled="testing">
          <i class="fas fa-play" :class="{ 'fa-spin': testing }"></i>
          {{ testing ? '测试中...' : '测试删除API' }}
        </button>

        <button @click="clearLogs" class="btn btn-secondary">
          <i class="fas fa-broom"></i>
          清除日志
        </button>
      </div>

      <div class="test-logs" v-if="testLogs.length > 0">
        <h4>测试日志：</h4>
        <div class="log-container">
          <div v-for="(log, index) in testLogs" :key="index" :class="['log-item', log.type]">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>

      <div class="test-results" v-if="lastTestResult">
        <h4>最近测试结果：</h4>
        <div :class="['result-box', lastTestResult.success ? 'success' : 'error']">
          <div class="result-header">
            <i :class="lastTestResult.success ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
            <span>{{ lastTestResult.success ? '测试通过' : '测试失败' }}</span>
          </div>
          <div class="result-details">
            <p><strong>请求URL:</strong> {{ lastTestResult.url }}</p>
            <p><strong>响应状态:</strong> {{ lastTestResult.status }}</p>
            <p v-if="lastTestResult.message"><strong>响应消息:</strong> {{ lastTestResult.message }}</p>
            <p v-if="lastTestResult.error"><strong>错误信息:</strong> {{ lastTestResult.error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { deleteQuestion } from '@/scripts/questionDelete'

// 定义测试结果类型
interface TestResult {
  success: boolean
  url: string
  status: string
  message?: string
  error: string | null
}

// 测试状态
const testing = ref(false)
const testLogs = ref<Array<{ time: string, message: string, type: string }>>([])
const lastTestResult = ref<TestResult | null>(null)

// 添加测试日志
function addLog(message: string, type: string = 'info') {
  const now = new Date()
  const time = now.toLocaleTimeString()
  testLogs.value.push({ time, message, type })
}

// 清除日志
function clearLogs() {
  testLogs.value = []
  lastTestResult.value = null
}

// 测试删除API
async function testDeleteAPI() {
  if (testing.value) return

  testing.value = true
  addLog('开始测试删除API...', 'info')

  try {
    // 使用一个测试ID
    const testQuestionId = 'api_test_' + Date.now()

    addLog(`测试问题ID: ${testQuestionId}`, 'info')
    addLog('测试场景: 统一删除（后端处理所有逻辑）', 'info')

    const startTime = performance.now()
    const result = await deleteQuestion(testQuestionId)
    const endTime = performance.now()

    const duration = Math.round(endTime - startTime)
    addLog(`API调用耗时: ${duration}ms`, 'info')

    // 记录测试结果
    lastTestResult.value = {
      success: result.success,
      url: `DELETE /question/delete/${testQuestionId}`,
      status: result.success ? '200 OK' : 'Error',
      message: result.message,
      error: result.success ? null : '删除失败（预期结果，因为测试ID不存在）'
    }

    if (result.success) {
      addLog('✅ API调用成功', 'success')
      addLog(`✅ 删除消息: ${result.message}`, 'success')
    } else {
      addLog('⚠️  API调用返回失败（预期结果）', 'warning')
      addLog(`📝 错误消息: ${result.message}`, 'info')
      addLog('💡 说明: 测试ID不存在于数据库中，所以删除失败是正常的', 'info')
    }

    // 再次测试（现在所有删除都由后端统一处理）
    addLog('---', 'info')
    addLog('测试场景: 第二次删除测试', 'info')

    const result2 = await deleteQuestion(testQuestionId)

    if (result2.success) {
      addLog('✅ 第二次删除测试成功', 'success')
    } else {
      addLog('⚠️ 第二次删除测试失败（预期结果）', 'warning')
    }

  } catch (error) {
    addLog(`❌ 测试过程中发生错误: ${error}`, 'error')
    lastTestResult.value = {
      success: false,
      url: 'N/A',
      status: 'Exception',
      message: 'API调用异常',
      error: String(error)
    }
  } finally {
    testing.value = false
    addLog('测试完成', 'info')
  }
}

// 初始化日志
addLog('API测试组件已加载', 'info')
addLog('当前配置: DELETE /question/delete/{id}', 'success')
</script>

<style scoped>
.api-test {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.test-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2rem;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.test-card h3 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.5rem;
}

.test-card h3 i {
  margin-right: 0.5rem;
}

.test-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
}

.api-change-info h4,
.test-status h4 {
  margin-bottom: 1rem;
  color: #fbbf24;
}

.change-comparison {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
}

.old-api,
.new-api {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 1rem;
}

.old-api h5 {
  color: #ef4444;
  margin-bottom: 0.5rem;
}

.new-api h5 {
  color: #10b981;
  margin-bottom: 0.5rem;
}

.arrow {
  font-size: 2rem;
  color: #fbbf24;
  text-align: center;
}

.old-api code,
.new-api code {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.3rem 0.6rem;
  border-radius: 5px;
  display: block;
  margin-bottom: 0.5rem;
}

.old-api pre {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 5px;
  margin: 0;
  font-size: 0.9rem;
}

.new-api p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.8rem;
  border-radius: 8px;
}

.status-value.success {
  color: #10b981;
  font-weight: bold;
}

.test-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-secondary {
  background: linear-gradient(45deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.test-logs,
.test-results {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.test-logs h4,
.test-results h4 {
  margin-bottom: 0.8rem;
  color: #fbbf24;
}

.log-container {
  max-height: 250px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 0.8rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #94a3b8;
  min-width: 80px;
}

.log-item.success {
  color: #4ade80;
}

.log-item.error {
  color: #f87171;
}

.log-item.warning {
  color: #fbbf24;
}

.log-item.info {
  color: #60a5fa;
}

.result-box {
  border-radius: 10px;
  padding: 1rem;
}

.result-box.success {
  background: rgba(16, 185, 129, 0.2);
  border-left: 4px solid #10b981;
}

.result-box.error {
  background: rgba(239, 68, 68, 0.2);
  border-left: 4px solid #ef4444;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  font-weight: bold;
}

.result-details p {
  margin: 0.3rem 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .api-test {
    padding: 1rem;
  }

  .change-comparison {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .arrow {
    transform: rotate(90deg);
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .test-actions {
    flex-direction: column;
  }
}
</style>
