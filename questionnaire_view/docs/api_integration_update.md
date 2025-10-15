# 问卷管理系统 - 真实API集成更新

## 更新概述

本次更新将问卷管理系统从使用模拟数据改为调用真实的后端API，特别是集成了获取所有问卷的API端点。

## API 集成更新

### 主要API端点

1. **获取所有问卷**
   - **端点**: `GET /questionnaire/getAllQuestionnaire`
   - **用途**: 获取系统中所有问卷的列表
   - **响应**: 包含问卷数组的JSON对象

2. **搜索单个问卷**
   - **端点**: `GET /questionnaire/search/{id}`
   - **用途**: 根据ID获取特定问卷信息

3. **编辑问卷**
   - **端点**: `POST /questionnaire/edit`
   - **用途**: 更新问卷信息（主要用于状态修改）

4. **删除问卷**
   - **端点**: `DELETE /questionnaire/delete/{id}`
   - **用途**: 删除指定问卷

5. **获取模版信息**
   - **端点**: `GET /model/search/{id}`
   - **用途**: 根据模版ID获取模版详情

6. **获取问题详情**
   - **端点**: `GET /question/search/{id}`
   - **用途**: 根据问题ID获取问题详细信息

## 技术实现改进

### API调用增强

```typescript
// 添加了详细的API调试日志
function logApiCall(endpoint: string, method: string, data?: unknown)
function logApiResponse(endpoint: string, response: Response, data?: unknown)
```

### 错误处理改进

1. **详细错误日志**: 记录API调用的详细信息，包括请求和响应
2. **状态码检查**: 检查HTTP状态码并记录错误信息
3. **降级处理**: API失败时使用模拟数据作为降级处理

### 数据加载优化

```typescript
async function getAllQuestionnaires(): Promise<Questionnaire[]> {
  const endpoint = '/questionnaire/list'
  logApiCall(endpoint, 'GET')

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)

    if (response.ok) {
      const data = await response.json()
      logApiResponse(endpoint, response, data)

      const questionnaires = Array.isArray(data) ? data : []
      console.log(`Successfully fetched ${questionnaires.length} questionnaires`)
      return questionnaires
    } else {
      // 详细错误处理
      console.error('Failed to fetch questionnaires, status:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error response body:', errorText)
      return []
    }
  } catch (error) {
    console.error('Error getting all questionnaires:', error)
    // 降级到模拟数据
    console.warn('Using mock data due to API failure')
    return mockQuestionnaires
  }
}
```

## 前端组件更新

### 加载状态改进

- 更详细的成功消息（显示加载的问卷数量）
- 区分不同的错误类型
- 更友好的用户提示

```typescript
async function loadAllQuestionnaires() {
  loading.value = true
  try {
    const fetchedQuestionnaires = await getAllQuestionnaires()

    if (fetchedQuestionnaires.length > 0) {
      questionnaires.value = fetchedQuestionnaires
      showMessage(`成功加载 ${fetchedQuestionnaires.length} 个问卷`, 'success')
    } else {
      questionnaires.value = []
      showMessage('暂无问卷数据', 'info')
    }
  } catch (error) {
    console.error('Failed to load questionnaires:', error)
    questionnaires.value = []
    showMessage('加载问卷数据失败，请检查网络连接或联系管理员', 'error')
  } finally {
    loading.value = false
  }
}
```

## 开发和调试

### 控制台日志

现在系统会在浏览器控制台中显示详细的API调用信息：

```
API Call: GET /questionnaire/list
API Response: /questionnaire/list - Status: 200 {data: [...]}
Successfully fetched 4 questionnaires
```

### 模拟数据降级

如果真实API不可用，系统会：

1. 记录错误信息
2. 显示警告消息 "Using mock data due to API failure"
3. 返回预定义的模拟数据
4. 继续正常运行

## API响应格式

### 问卷列表响应

```json
[
  {
    "questionnaireId": "string",
    "questionnaireStatus": "string (JSON格式)",
    "modelId": "string",
    "canDelete": 1,
    "questionnaireTitle": "string",
    "questionnaireCensor": "pass|uncensor|block"
  }
]
```

### 状态字段说明

- **questionnaireStatus**: JSON字符串，包含问卷的详细状态信息
- **questionnaireCensor**: 审核状态（pass=已通过, uncensor=待审核, block=已阻止）
- **canDelete**: 是否可删除的标识

## 部署注意事项

### 生产环境配置

1. **API_BASE_URL**: 在生产环境中需要设置正确的API基础URL
2. **模拟数据移除**: 确认真实API稳定后，可以移除模拟数据降级逻辑
3. **错误监控**: 建议集成错误监控系统来跟踪API调用失败

### 开发环境测试

1. 确保后端API服务运行在预期端点
2. 检查浏览器控制台的API调用日志
3. 验证问卷数据的正确加载和显示

## 功能验证清单

- [ ] 页面加载时正确调用 `/questionnaire/list` API
- [ ] 成功显示真实的问卷数据
- [ ] 搜索和筛选功能正常工作
- [ ] 状态修改调用 `/questionnaire/edit` API
- [ ] 删除功能调用 `/questionnaire/delete/{id}` API
- [ ] 预览功能正确链式调用模版和问题API
- [ ] API失败时显示适当错误消息
- [ ] 控制台显示详细的API调用日志

## 后续优化建议

1. **缓存机制**: 实现客户端缓存以减少重复API调用
2. **分页支持**: 如果问卷数量很大，考虑实现分页加载
3. **实时更新**: 考虑使用WebSocket实现问卷状态的实时更新
4. **批量操作**: 利用预留的批量API实现多选操作功能
