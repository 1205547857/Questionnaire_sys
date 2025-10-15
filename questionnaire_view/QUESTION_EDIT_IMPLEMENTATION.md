# 问题组件编辑功能实现文档

## 🎯 功能概述

基于 `question_center_create.vue` 创建了通用的问题编辑页面 `question_center_edit.vue`，支持创建和编辑两种模式。

## 📋 实现的功能

### ✅ 1. 通用编辑页面

- **路径**: `/page/question_center_edit/:id`
- **组件**: `src/templates/page/question_center_edit.vue`
- **功能**: 根据路由参数自动识别创建/编辑模式

### ✅ 2. 编辑模式特性

- **自动加载**: 根据问题ID自动加载问题详情
- **数据回填**: 将问题数据回填到表单中
- **选项解析**: 正确解析复杂的选项结构（包括嵌套选项）
- **状态管理**: 保留原始数据用于重置功能

### ✅ 3. API集成

- **获取问题**: `GET /question/{id}` - 获取问题详情
- **更新问题**: `POST /question/edit` - 更新问题信息
- **参数结构**: 根据后端API规范传递正确参数

## 🔧 技术实现

### 1. API脚本 (`src/scripts/questionEdit.ts`)

```typescript
// 主要函数
- getQuestionById(questionId: string)     // 获取问题详情
- updateQuestion(questionData: EditQuestionRequest)  // 更新问题
- parseQuestionOptionsForEdit(optionsString: string) // 解析选项
- convertOptionsForEdit(options: string[], isNested: boolean) // 转换选项格式
```

### 2. 路由配置

```typescript
{
  name: 'question_center_edit',
  path: '/page/question_center_edit/:id',
  component: () => import('../templates/page/question_center_edit.vue'),
}
```

### 3. 编辑入口

在 `question_center_my.vue` 中的编辑按钮：

```typescript
function editQuestion(question: Question) {
  router.push(`/page/question_center_edit/${question.questionId}`)
}
```

## 📊 数据流程

### 编辑模式流程：

1. **路由跳转**: 点击编辑按钮 → `/page/question_center_edit/{id}`
2. **加载数据**: 组件挂载 → 调用 `getQuestionById()` → 获取问题详情
3. **数据回填**: 解析问题数据 → 转换选项格式 → 填充表单
4. **用户编辑**: 修改表单数据 → 实时预览更新
5. **保存更新**: 提交表单 → 调用 `updateQuestion()` → 返回列表页

### 创建模式流程：

1. **直接访问**: `/page/question_center_edit` (无ID参数)
2. **初始化**: 空白表单初始化
3. **用户创建**: 填写表单数据
4. **保存创建**: 调用 `create_question()` → 创建新问题

## 🎨 UI特性

### 1. 智能标题切换

```vue
<h1 class="page-title">
  <i class="fas fa-edit"></i>
  {{ isEditMode ? '编辑问题' : '创建问题' }}
</h1>
```

### 2. 加载状态管理

- **加载中**: 显示加载动画
- **错误状态**: 显示错误信息和返回按钮
- **正常状态**: 显示完整编辑表单

### 3. 按钮状态切换

```vue
<button type="submit" :disabled="!isFormValid || saving">
  {{ saving ? '保存中...' : (isEditMode ? '保存修改' : '创建问题') }}
</button>
```

## 🔄 选项解析机制

### 简单选项

```json
["选项1", "选项2", "选项3"]
```

### 嵌套选项 (下拉列表)

```json
["中国 > 江西省", "中国 > 广东省", "美国 > 加州"]
```

### 解析逻辑

1. **检测嵌套**: 判断选项中是否包含 `>` 分隔符
2. **分组处理**: 将嵌套选项按父选项分组
3. **结构转换**: 转换为编辑表单需要的嵌套结构

## 📱 响应式设计

- **桌面端**: 完整功能布局
- **平板端**: 自适应网格调整
- **移动端**: 单列布局，优化触摸操作

## 🚀 使用示例

### 从列表页编辑问题

```typescript
// 在 question_center_my.vue 中
function editQuestion(question: Question) {
  router.push(`/page/question_center_edit/${question.questionId}`)
}
```

### 直接创建新问题

```typescript
// 可以直接访问创建模式
router.push('/page/question_center_edit')
```

## ⚡ 性能优化

1. **懒加载**: 编辑页面按需加载
2. **数据缓存**: 保留原始数据用于快速重置
3. **防抖处理**: 避免重复保存操作
4. **智能预览**: 实时更新预览内容

## 🔒 错误处理

- **网络错误**: 友好的错误提示
- **数据验证**: 表单完整性检查
- **权限控制**: 通过Cookie验证用户身份
- **异常恢复**: 提供重试和返回选项

---

**实现完成时间**: ${new Date().toLocaleString('zh-CN')}  
**状态**: ✅ **编辑功能完全就绪**
