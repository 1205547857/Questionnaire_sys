# API 地址修正更新

## 更新内容

根据最新的后端API信息，已修正问卷管理系统中的API请求地址。

## 主要修改

### 1. API基础URL修正

```typescript
// 修改前
const API_BASE_URL = ''

// 修改后
const API_BASE_URL = 'http://localhost:8081'
```

### 2. 获取所有问卷API端点修正

```typescript
// 修改前
const endpoint = '/questionnaire/list'

// 修改后
const endpoint = '/questionnaire/getAllQuestionnaire'
```

### 3. 完整API地址

现在获取所有问卷的完整请求地址为：

```
GET http://localhost:8081/questionnaire/getAllQuestionnaire
```

## 更新后的API端点列表

| 功能         | 方法   | 端点                                 | 完整地址                                                  |
| ------------ | ------ | ------------------------------------ | --------------------------------------------------------- |
| 获取所有问卷 | GET    | `/questionnaire/getAllQuestionnaire` | `http://localhost:8081/questionnaire/getAllQuestionnaire` |
| 搜索单个问卷 | GET    | `/questionnaire/search/{id}`         | `http://localhost:8081/questionnaire/search/{id}`         |
| 编辑问卷     | POST   | `/questionnaire/edit`                | `http://localhost:8081/questionnaire/edit`                |
| 删除问卷     | DELETE | `/questionnaire/delete/{id}`         | `http://localhost:8081/questionnaire/delete/{id}`         |
| 搜索模版     | GET    | `/model/search/{id}`                 | `http://localhost:8081/model/search/{id}`                 |
| 搜索问题     | GET    | `/question/search/{id}`              | `http://localhost:8081/question/search/{id}`              |
| 批量更新状态 | POST   | `/questionnaire/batch-update-status` | `http://localhost:8081/questionnaire/batch-update-status` |
| 批量删除问卷 | POST   | `/questionnaire/batch-delete`        | `http://localhost:8081/questionnaire/batch-delete`        |

## 调试日志增强

所有API调用现在都会在浏览器控制台显示详细信息：

```
API Call: GET /questionnaire/getAllQuestionnaire
API Response: /questionnaire/getAllQuestionnaire - Status: 200
Successfully fetched X questionnaires
```

## 验证步骤

1. 确保后端服务运行在 `localhost:8081`
2. 打开浏览器开发者工具的控制台
3. 访问问卷管理页面
4. 查看控制台中的API调用日志：
   - 应该显示对 `http://localhost:8081/questionnaire/getAllQuestionnaire` 的请求
   - 如果成功，会显示获取到的问卷数量
   - 如果失败，会显示错误信息并降级到模拟数据

## 错误处理

如果API调用失败（例如后端服务未启动），系统会：

1. 在控制台显示详细错误信息
2. 显示警告："Using mock data due to API failure"
3. 使用预定义的模拟数据继续运行
4. 在界面上显示相应的错误提示

## 后续注意事项

1. **确保后端服务启动**：在测试前确保后端服务运行在 `localhost:8081`
2. **CORS配置**：如果遇到跨域问题，需要在后端配置CORS
3. **生产环境**：在生产环境中需要将 `localhost:8081` 替换为实际的生产服务器地址
