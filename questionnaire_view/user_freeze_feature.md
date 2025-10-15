## 用户冻结功能实现说明

### 实现的功能

1. **用户状态管理**
   - 支持 `userStatus` 字段：`active`（正常）、`frozen`（已冻结）
   - 更新用户界面显示对应的状态标识

2. **操作按钮**
   - **冻结/解冻按钮**：蓝色锁图标，支持冻结和解冻用户
   - 按钮会根据当前状态显示不同的图标和颜色

3. **API流程**
   - 使用现有的后端API实现状态更改
   - 流程：点击按钮 → 查询用户完整数据(`GET /user/search/{id}`) → 修改userStatus → 更新用户(`POST /user/edit`)

4. **用户界面改进**
   - 筛选器支持按状态筛选（正常/已冻结）
   - 状态显示使用不同颜色标识
   - 编辑用户模态框增加状态选择

### 操作流程

**A → B:** 点击状态更改按钮（冻结等）
**B → C:** 向后端发送用户查询请求（`GET /user/search/{id}`）
**C → D:** 收到用户完整数据体
**D → E:** 修改用户数据体的userStatus字段
**E → F:** 向后端发送完整用户数据更新请求（`POST /user/edit`）

### 使用说明

1. **冻结用户**：点击蓝色锁图标，确认后系统会：
   - 查询用户完整数据
   - 修改userStatus为"frozen"
   - 提交更新请求
2. **解冻用户**：对已冻结用户点击蓝色解锁图标
3. **编辑用户**：在编辑模态框中可以直接修改用户状态

### 后端API使用

使用现有的后端接口：

1. **用户查询接口**：

```
GET /user/search/{id}
Content-Type: application/x-www-form-urlencoded
```

2. **用户编辑接口**：

```
POST /user/edit
Content-Type: application/json

{
  "userId": "用户ID",
  "userEmail": "邮箱",
  "userName": "用户名",
  "userPw": "密码",
  "userData": "用户数据",
  "role": "角色",
  "userStatus": "active|frozen"
}
```

### 状态说明

- **正常 (active)**：用户可以正常使用系统
- **已冻结 (frozen)**：用户账户被临时冻结，可能限制部分功能

### 技术实现

采用现有API组合的方式实现用户状态管理，无需新增专门的状态更新接口，确保了与现有后端系统的兼容性。
