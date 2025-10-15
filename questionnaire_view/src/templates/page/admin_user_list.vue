<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AdminSiteList from '../admin_siteList.vue'
import { getAllUsers, searchUserById, editUser as editUserApi, registerUser, deleteUser as deleteUserApi, type User } from '@/scripts/adminApi'

// 用户数据类型（扩展以支持UI需要的字段）
interface UserDisplay extends User {
  registrationDate?: string
  lastLogin?: string
  status?: 'active' | 'frozen'  // 移除banned状态
  questionnaireCount?: number
}

// 响应式数据
const users = ref<UserDisplay[]>([])
const loading = ref(true)
const searchQuery = ref('')
const selectedRole = ref('all')
const selectedStatus = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(0)
const error = ref('')

// 编辑用户相关
const showEditModal = ref(false)
const editingUser = ref<UserDisplay | null>(null)
const editForm = ref({
  userId: '',
  userName: '',
  userEmail: '',
  userPw: '',
  role: 'user',
  userData: '',
  userStatus: 'active'
})

// 新增用户相关
const showAddModal = ref(false)
const addForm = ref({
  userName: '',
  userEmail: '',
  userPw: '',
  confirmPassword: ''
})

// 解析用户数据中的问卷数量
function parseQuestionnaireCount(userData: string): number {
  try {
    if (!userData || userData.trim() === '') {
      return 0
    }

    const userDataObj = JSON.parse(userData)
    const questionnaireIds = userDataObj.questionnaire_ids

    if (Array.isArray(questionnaireIds)) {
      return questionnaireIds.length
    }

    return 0
  } catch (error) {
    console.warn('解析userData失败:', error, 'userData:', userData)
    return 0
  }
}

// 加载用户数据
onMounted(async () => {
  await loadUsers()
})

async function loadUsers() {
  loading.value = true
  error.value = ''

  try {
    const userList = await getAllUsers()
    console.log('获取到的用户列表:', userList)

    // 转换数据格式，添加UI需要的字段
    users.value = userList.map(user => ({
      ...user,
      registrationDate: new Date().toLocaleDateString(), // 暂时使用当前日期
      lastLogin: new Date().toLocaleDateString(), // 暂时使用当前日期
      status: (user.userStatus === 'frozen' ? 'frozen' : 'active') as 'active' | 'frozen', // 只处理active和frozen状态
      questionnaireCount: parseQuestionnaireCount(user.userData) // 从userData解析问卷数量
    }))

    totalUsers.value = users.value.length
    console.log('处理后的用户列表:', users.value)
  } catch (err) {
    console.error('加载用户列表失败:', err)
    error.value = err instanceof Error ? err.message : '加载用户列表失败'
  } finally {
    loading.value = false
  }
}

// 搜索用户
async function searchUser() {
  if (!searchQuery.value.trim()) {
    await loadUsers()
    return
  }

  loading.value = true
  error.value = ''

  try {
    const user = await searchUserById(searchQuery.value.trim())
    if (user) {
      users.value = [{
        ...user,
        registrationDate: new Date().toLocaleDateString(),
        lastLogin: new Date().toLocaleDateString(),
        status: 'active' as const,
        questionnaireCount: parseQuestionnaireCount(user.userData) // 从userData解析问卷数量
      }]
      totalUsers.value = 1
    } else {
      users.value = []
      totalUsers.value = 0
      error.value = '未找到该用户'
    }
  } catch (err) {
    console.error('搜索用户失败:', err)
    error.value = err instanceof Error ? err.message : '搜索用户失败'
  } finally {
    loading.value = false
  }
}

// 过滤用户列表
const filteredUsers = computed(() => {
  let filtered = [...users.value]

  // 按角色筛选
  if (selectedRole.value !== 'all') {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }

  // 按状态筛选
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(user => user.status === selectedStatus.value)
  }

  return filtered
})

// 分页用户列表
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

function getRoleClass(role: string) {
  return role === 'admin' ? 'role-admin' : 'role-user'
}

function getStatusClass(status?: string) {
  switch (status) {
    case 'active': return 'status-active'
    case 'frozen': return 'status-frozen'
    default: return 'status-active'
  }
}

function getStatusText(status?: string) {
  switch (status) {
    case 'active': return '正常'
    case 'frozen': return '已冻结'
    default: return '正常'
  }
}

// 编辑用户
function editUser(user: UserDisplay) {
  editingUser.value = user
  editForm.value = {
    userId: user.userId,
    userName: user.userName,
    userEmail: user.userEmail,
    userPw: user.userPw,
    role: user.role,
    userData: user.userData,
    userStatus: user.userStatus || 'active'
  }
  showEditModal.value = true
}

async function saveUserEdit() {
  if (!editingUser.value) return

  try {
    await editUserApi(editForm.value)
    // 更新本地数据
    const index = users.value.findIndex(u => u.userId === editForm.value.userId)
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        userName: editForm.value.userName,
        userEmail: editForm.value.userEmail,
        userPw: editForm.value.userPw,
        role: editForm.value.role,
        userData: editForm.value.userData,
        userStatus: editForm.value.userStatus,
        status: editForm.value.userStatus as 'active' | 'frozen'
      }
    }
    showEditModal.value = false
    alert('用户信息更新成功')
  } catch (err) {
    console.error('保存用户编辑失败:', err)
    alert(err instanceof Error ? err.message : '保存失败')
  }
}

function cancelEdit() {
  showEditModal.value = false
  editingUser.value = null
}

// 新增用户
function showAddUserModal() {
  addForm.value = {
    userName: '',
    userEmail: '',
    userPw: '',
    confirmPassword: ''
  }
  showAddModal.value = true
}

async function saveNewUser() {
  // 验证表单
  if (!addForm.value.userName || !addForm.value.userEmail || !addForm.value.userPw) {
    alert('请填写完整信息')
    return
  }

  if (addForm.value.userPw !== addForm.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }

  if (addForm.value.userPw.length < 6) {
    alert('密码长度不能少于6位')
    return
  }

  try {
    const success = await registerUser(
      addForm.value.userName,
      addForm.value.userEmail,
      addForm.value.userPw
    )

    if (success) {
      showAddModal.value = false
      alert('用户创建成功')
      await loadUsers() // 重新加载用户列表
    } else {
      alert('用户创建失败，可能邮箱已存在')
    }
  } catch (err) {
    console.error('创建用户失败:', err)
    alert(err instanceof Error ? err.message : '创建用户失败')
  }
}

function cancelAdd() {
  showAddModal.value = false
}

// 冻结/解冻用户
async function toggleUserFreeze(user: UserDisplay) {
  const newStatus = user.status === 'frozen' ? 'active' : 'frozen'
  const actionText = newStatus === 'frozen' ? '冻结' : '解冻'

  if (confirm(`确定要${actionText}用户 ${user.userName} 吗？`)) {
    try {
      // 步骤1: 查询用户完整数据
      console.log(`正在查询用户 ${user.userId} 的完整数据...`)
      const fullUserData = await searchUserById(user.userId)

      if (!fullUserData) {
        throw new Error('无法获取用户完整数据')
      }

      // 步骤2: 修改用户数据中的userStatus
      const updatedUserData = {
        ...fullUserData,
        userStatus: newStatus
      }

      // 步骤3: 发送更新请求
      console.log(`正在${actionText}用户 ${user.userName}...`)
      const success = await editUserApi(updatedUserData)

      if (success) {
        // 更新本地显示数据
        const index = users.value.findIndex(u => u.userId === user.userId)
        if (index !== -1) {
          users.value[index].status = newStatus
          users.value[index].userStatus = newStatus
        }
        alert(`用户${actionText}成功`)
      } else {
        alert(`用户${actionText}失败，请重试`)
      }
    } catch (error) {
      console.error('更新用户状态失败:', error)
      alert(`用户${actionText}失败：${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}

async function deleteUser(user: UserDisplay) {
  if (confirm(`确定要删除用户 ${user.userName} 吗？此操作不可恢复。`)) {
    try {
      console.log(`正在删除用户 ${user.userName}...`)
      const success = await deleteUserApi(user.userId)

      if (success) {
        // 从本地列表中移除用户
        const index = users.value.findIndex(u => u.userId === user.userId)
        if (index !== -1) {
          users.value.splice(index, 1)
          totalUsers.value = users.value.length
        }
        alert(`用户 ${user.userName} 删除成功`)
      } else {
        alert('用户删除失败，请重试')
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      alert(`用户删除失败：${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}

// 分页相关
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize.value))

function goToPage(page: number) {
  currentPage.value = page
}

// 重置搜索
function resetSearch() {
  searchQuery.value = ''
  selectedRole.value = 'all'
  selectedStatus.value = 'all'
  currentPage.value = 1
  loadUsers()
}
</script>

<template>
  <div class="admin-layout">
    <!-- 管理员侧边栏 -->
    <AdminSiteList />

    <!-- 主内容区域 -->
    <div class="admin-main-content">
      <div class="admin-container">
        <!-- 页面头部 -->
        <div class="page-header">
          <div class="header-info">
            <h1 class="page-title">
              <i class="fas fa-users"></i>
              用户管理
            </h1>
            <p class="page-description">管理和监控系统中的所有用户</p>
          </div>
          <button @click="showAddUserModal" class="btn btn-primary">
            <i class="fas fa-user-plus"></i>
            添加用户
          </button>
        </div>

        <!-- 错误信息显示 -->
        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          {{ error }}
          <button @click="error = ''" class="error-close">×</button>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filters-section">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input v-model="searchQuery" @keyup.enter="searchUser" type="text" placeholder="输入用户ID进行搜索..."
              class="search-input">
            <button @click="searchUser" class="search-btn">搜索</button>
            <button @click="resetSearch" class="reset-btn">重置</button>
          </div>

          <div class="filter-controls">
            <select v-model="selectedRole" class="filter-select">
              <option value="all">所有角色</option>
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>

            <select v-model="selectedStatus" class="filter-select">
              <option value="all">所有状态</option>
              <option value="active">正常</option>
              <option value="frozen">已冻结</option>
            </select>
          </div>
        </div>

        <!-- 用户表格 -->
        <div class="users-table-container">
          <div v-if="loading" class="loading-section">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
              <p>加载用户数据中...</p>
            </div>
          </div>

          <table v-else class="users-table">
            <thead>
              <tr>
                <th>用户信息</th>
                <th>角色</th>
                <th>注册日期</th>
                <th>最后登录</th>
                <th>状态</th>
                <th>问卷数量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedUsers" :key="user.userId" class="user-row">
                <td>
                  <div class="user-info">
                    <div class="user-avatar">
                      {{ user.userName.charAt(0).toUpperCase() }}
                    </div>
                    <div class="user-details">
                      <div class="username">{{ user.userName }}</div>
                      <div class="user-email">{{ user.userEmail }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="role-badge" :class="getRoleClass(user.role)">
                    {{ user.role === 'admin' ? '管理员' : '普通用户' }}
                  </span>
                </td>
                <td class="date-cell">{{ user.registrationDate }}</td>
                <td class="date-cell">{{ user.lastLogin }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(user.status)">
                    {{ getStatusText(user.status) }}
                  </span>
                </td>
                <td class="count-cell">{{ user.questionnaireCount }}</td>
                <td class="actions-cell">
                  <button @click="editUser(user)" class="action-btn edit-btn" title="编辑用户">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="toggleUserFreeze(user)" class="action-btn freeze-btn"
                    :class="{ 'frozen': user.status === 'frozen' }" :title="user.status === 'frozen' ? '解冻用户' : '冻结用户'">
                    <i class="fas" :class="user.status === 'frozen' ? 'fa-unlock' : 'fa-lock'"></i>
                  </button>
                  <button @click="deleteUser(user)" class="action-btn delete-btn" title="删除用户">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="pagination-section">
          <div class="pagination-info">
            显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize,
              filteredUsers.length) }}
            共 {{ filteredUsers.length }} 个用户
          </div>
          <div class="pagination-controls">
            <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1" class="pagination-btn">
              <i class="fas fa-chevron-left"></i>
            </button>

            <button v-for="page in Math.min(totalPages, 5)" :key="page" @click="goToPage(page)"
              :class="['pagination-btn', { active: page === currentPage }]">
              {{ page }}
            </button>

            <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages" class="pagination-btn">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑用户模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="cancelEdit">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑用户</h3>
          <button @click="cancelEdit" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户ID</label>
            <input v-model="editForm.userId" type="text" disabled class="form-input disabled">
          </div>
          <div class="form-group">
            <label>用户名</label>
            <input v-model="editForm.userName" type="text" class="form-input" placeholder="请输入用户名">
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input v-model="editForm.userEmail" type="email" class="form-input" placeholder="请输入邮箱">
          </div>
          <div class="form-group">
            <label>密码</label>
            <input v-model="editForm.userPw" type="password" class="form-input" placeholder="请输入密码">
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="editForm.role" class="form-input">
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="form-group">
            <label>用户状态</label>
            <select v-model="editForm.userStatus" class="form-input">
              <option value="active">正常</option>
              <option value="frozen">已冻结</option>
            </select>
          </div>
          <div class="form-group">
            <label>用户数据</label>
            <textarea v-model="editForm.userData" class="form-input" rows="3" placeholder="用户数据（JSON格式）"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cancelEdit" class="btn btn-secondary">取消</button>
          <button @click="saveUserEdit" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>

    <!-- 新增用户模态框 -->
    <div v-if="showAddModal" class="modal-overlay" @click="cancelAdd">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新增用户</h3>
          <button @click="cancelAdd" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名</label>
            <input v-model="addForm.userName" type="text" class="form-input" placeholder="请输入用户名">
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input v-model="addForm.userEmail" type="email" class="form-input" placeholder="请输入邮箱">
          </div>
          <div class="form-group">
            <label>密码</label>
            <input v-model="addForm.userPw" type="password" class="form-input" placeholder="请输入密码（至少6位）">
          </div>
          <div class="form-group">
            <label>确认密码</label>
            <input v-model="addForm.confirmPassword" type="password" class="form-input" placeholder="请再次输入密码">
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cancelAdd" class="btn btn-secondary">取消</button>
          <button @click="saveNewUser" class="btn btn-primary">创建用户</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.admin-main-content {
  flex: 1;
  margin-left: 300px;
  transition: margin-left 0.3s;
}

.admin-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.header-info {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title i {
  color: #667eea;
}

.page-description {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

/* 错误信息样式 */
.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.error-close {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #dc2626;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 搜索按钮样式 */
.search-btn,
.reset-btn {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.search-btn {
  background: #667eea;
  color: white;
}

.search-btn:hover {
  background: #5a67d8;
}

.reset-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.reset-btn:hover {
  background: #e5e7eb;
}

.filter-controls {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.users-table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  margin-bottom: 2rem;
}

.loading-section {
  padding: 4rem;
  text-align: center;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner i {
  font-size: 2rem;
  color: #667eea;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 1.5rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.users-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.user-row:hover {
  background: #f9fafb;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.user-details {
  flex: 1;
}

.username {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.user-email {
  color: #6b7280;
  font-size: 0.875rem;
}

.role-badge,
.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-admin {
  background: #fef3c7;
  color: #d97706;
}

.role-user {
  background: #dbeafe;
  color: #2563eb;
}

.status-active {
  background: #dcfce7;
  color: #16a34a;
}

.status-inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.status-frozen {
  background: #dbeafe;
  color: #1d4ed8;
}

.date-cell,
.count-cell {
  color: #6b7280;
  font-size: 0.95rem;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  background: #dbeafe;
  color: #2563eb;
}

.edit-btn:hover {
  background: #3b82f6;
  color: white;
}

.status-btn {
  background: #fef3c7;
  color: #d97706;
}

.status-btn:hover {
  background: #f59e0b;
  color: white;
}

.freeze-btn {
  background: #dbeafe;
  color: #1d4ed8;
}

.freeze-btn:hover {
  background: #3b82f6;
  color: white;
}

.freeze-btn.frozen {
  background: #1d4ed8;
  color: white;
}

.freeze-btn.frozen:hover {
  background: #1e40af;
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
}

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.pagination-info {
  color: #6b7280;
  font-size: 0.95rem;
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.pagination-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.pagination-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f9fafb;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.disabled {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 1024px) {
  .admin-main-content {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .admin-main-content {
    margin-left: 0;
  }

  .admin-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-controls {
    justify-content: stretch;
  }

  .filter-select {
    flex: 1;
  }

  .users-table-container {
    overflow-x: auto;
  }

  .pagination-section {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
