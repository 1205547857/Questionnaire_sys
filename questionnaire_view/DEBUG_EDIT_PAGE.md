## 编辑页面调试指南

### 🔍 当前问题诊断

页面卡在加载状态，可能的原因：

1. **API调用失败** - 检查网络请求
2. **认证问题** - Cookie中的authToken可能无效
3. **路由参数问题** - 问题ID可能没有正确传递
4. **组件加载问题** - 可能存在循环依赖或其他Vue问题

### 🛠️ 调试步骤

#### 1. 检查控制台日志

刷新页面后，查看控制台中的调试信息：

- "组件已挂载"
- "当前路由参数"
- "编辑模式"
- "问题ID"

#### 2. 检查网络请求

在开发者工具的Network标签页中查看：

- 是否有发送到 `http://localhost:8081/question/{id}` 的请求
- 请求状态码是什么（200, 404, 500等）
- 响应内容是什么

#### 3. 检查认证状态

在控制台中运行：

```javascript
document.cookie
```

查看是否有 `authToken` Cookie

#### 4. 手动测试API

可以在控制台中手动测试API：

```javascript
fetch('http://localhost:8081/question/12f7241-f234-4c20-bba4-ba7e0c8e1bf8', {
  headers: {
    Authorization: 'Bearer ' + document.cookie.split('authToken=')[1]?.split(';')[0],
  },
})
  .then((r) => r.json())
  .then(console.log)
```

### 🔧 可能的修复方案

1. **如果是认证问题**：重新登录获取新的token
2. **如果是API问题**：检查后端服务是否正常运行
3. **如果是路由问题**：确认URL格式正确

### 📝 调试信息收集

请检查以上步骤并提供：

1. 控制台中显示的调试日志
2. Network标签页中的请求情况
3. Cookie中的authToken状态
