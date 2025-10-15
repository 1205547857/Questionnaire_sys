# 问卷管理系统 - 管理员问卷列表功能

## 功能概述

`admin_questionnaire_list.vue` 是问卷管理系统的核心管理页面，提供了完整的问卷管理功能，包括查看、搜索、状态管理、删除和预览等功能。

## 主要功能

### 1. 问卷列表显示

- 显示所有系统中的问卷
- 表格形式展示问卷基本信息：
  - 问卷ID
  - 问卷标题
  - 模版ID
  - 审核状态
  - 状态详情

### 2. 统计信息面板

- 总问卷数量统计
- 按审核状态分类统计：
  - 已通过 (pass)
  - 待审核 (uncensor)
  - 已阻止 (block)

### 3. 搜索和筛选功能

- **关键词搜索**：支持按问卷标题或问卷ID搜索
- **状态筛选**：按审核状态筛选问卷
- **刷新功能**：手动刷新问卷列表

### 4. 问卷状态管理

- **审核状态修改**：
  - 通过：将问卷标记为已通过审核
  - 待审核：将问卷标记为待审核状态
  - 阻止：将问卷标记为被阻止状态
- **确认机制**：状态修改前需要用户确认
- **实时更新**：状态修改后立即更新界面显示

### 5. 问卷删除功能

- 支持单个问卷删除
- 删除前有确认提示
- 删除后自动更新列表

### 6. 问卷预览功能

- **完整预览链路**：问卷数据 → 模版数据 → 问题具体数据
- **预览模态框**：
  - 显示问卷基本信息
  - 展示所有问题列表
  - 显示问题类型和选项
- **加载状态**：预览加载时显示加载动画
- **错误处理**：预览失败时显示错误信息

## 技术实现

### API 集成

使用 `adminQuestionnaireApi.ts` 统一管理所有API调用：

```typescript
// 主要API函数
- getAllQuestionnaires(): 获取所有问卷
- editQuestionnaire(): 编辑问卷信息
- deleteQuestionnaire(): 删除问卷
- searchModel(): 根据模版ID获取模版信息
- searchQuestion(): 根据问题ID获取问题详情
```

### 预览功能实现流程

1. **获取问卷数据**：用户点击预览按钮
2. **获取模版数据**：根据问卷的 `modelId` 调用 `searchModel()` API
3. **解析问题ID列表**：从模版的 `questionsArray` 字段解析问题ID数组
4. **获取问题详情**：并行调用 `searchQuestion()` 获取每个问题的详细信息
5. **渲染预览**：在模态框中展示完整的问卷预览

### 状态管理

- 使用 Vue 3 Composition API
- 响应式数据管理
- 计算属性用于数据过滤和统计

### 错误处理

- API调用异常处理
- 用户友好的错误消息提示
- 加载状态管理

## 用户界面

### 设计特点

- 现代化的卡片式布局
- 响应式设计，支持移动端
- 直观的状态标识（颜色编码）
- 流畅的交互动画

### 状态标识

- **已通过**：绿色，✓ 图标
- **待审核**：橙色，⏰ 图标
- **已阻止**：红色，🚫 图标

### 操作按钮

- **预览**：蓝色，👁 图标
- **通过/待审核/阻止**：对应状态色彩
- **删除**：红色，🗑 图标

## 数据结构

### 问卷对象 (Questionnaire)

```typescript
interface Questionnaire {
  questionnaireId: string // 问卷ID
  questionnaireStatus: string // 问卷状态JSON
  modelId: string // 模版ID
  canDelete: number // 是否可删除
  questionnaireTitle: string // 问卷标题
  questionnaireCensor: string // 审核状态
}
```

### 模版对象 (QuestionnaireModel)

```typescript
interface QuestionnaireModel {
  modelId: string // 模版ID
  questionsArray: string // 问题ID数组JSON
  canDelete: number // 是否可删除
  modelTitle: string // 模版标题
  modelDesc: string // 模版描述
}
```

### 问题对象 (Question)

```typescript
interface Question {
  questionId: string // 问题ID
  questionType: string // 问题类型
  questionOptions: string // 问题选项JSON
  canDelete: number // 是否可删除
  questionTitle: string // 问题标题
  questionTxt: string // 问题描述
  shared: number // 是否共享
}
```

## 扩展性

### 批量操作支持

API文件中已预留批量操作接口：

- `batchUpdateQuestionnaireStatus()`: 批量更新状态
- `batchDeleteQuestionnaires()`: 批量删除

### 分页支持

界面预留了分页功能位置，可根据需要添加分页逻辑。

### 高级筛选

可扩展更多筛选条件，如创建时间、模版类型等。

## 使用说明

1. **查看问卷**：页面加载后自动显示所有问卷
2. **搜索问卷**：在搜索框输入关键词进行搜索
3. **筛选问卷**：使用状态下拉框筛选特定状态的问卷
4. **预览问卷**：点击"预览"按钮查看问卷详细内容
5. **修改状态**：点击相应的状态按钮修改问卷审核状态
6. **删除问卷**：点击"删除"按钮删除问卷（需要确认）
7. **刷新数据**：点击"刷新"按钮重新加载最新数据

## 注意事项

1. **权限控制**：建议在实际部署时添加管理员权限验证
2. **数据备份**：删除操作不可恢复，建议添加数据备份机制
3. **API兼容性**：部分API使用了模拟数据，实际部署时需要对接真实后端接口
4. **性能优化**：大量问卷时建议实现分页加载
