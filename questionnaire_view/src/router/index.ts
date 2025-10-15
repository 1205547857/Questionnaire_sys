import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { isAuthenticated } from '@/utils/cookies'
import { checkAuthOnPageLoad } from '@/utils/authInit'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: () => {
        const userStore = useUserStore()
        const hasValidToken = isAuthenticated()
        const isLoggedIn = userStore.isLoggedIn || hasValidToken

        if (isLoggedIn) {
          // 如果是管理员，跳转到管理员页面
          if (userStore.role === 'admin') {
            return '/admin'
          }
          // 普通用户跳转到用户信息页
          return '/userInfo'
        }

        return '/login'
      },
    },
    {
      name: 'admin_index',
      path: '/admin',
      component: () => import('../templates/page/admin_index.vue'),
      meta: { requiresAdmin: true },
    },
    {
      name: 'question_center_create',
      path: '/page/question_center_create',
      component: () => import('../templates/page/question_center_create.vue'),
    },
    {
      name: 'question_center_my',
      path: '/page/question_center_my',
      component: () => import('../templates/page/question_center_my.vue'),
    },
    {
      name: 'question_center_edit',
      path: '/page/question_center_edit/:id',
      component: () => import('../templates/page/question_center_edit.vue'),
    },
    {
      name: 'question_center_shared',
      path: '/page/question_center_shared',
      component: () => import('../templates/page/question_center_shared.vue'),
    },
    {
      name: 'questionnaire_model_create',
      path: '/page/questionnaire_model_create',
      component: () => import('../templates/page/questionnaire_model_create.vue'),
    },
    {
      name: 'questionnaire_model_my',
      path: '/page/questionnaire_model_my',
      component: () => import('../templates/page/questionnaire_model_my.vue'),
    },
    {
      name: 'questionnaire_model_edit',
      path: '/page/questionnaire_model_edit/:id',
      component: () => import('../templates/page/questionnaire_model_edit.vue'),
    },
    {
      name: 'questionnaire_create',
      path: '/page/questionnaire_create',
      component: () => import('../templates/page/questionnaire_create.vue'),
    },
    {
      name: 'questionnaire_my',
      path: '/page/questionnaire_my',
      component: () => import('../templates/page/questionnaire_my.vue'),
    },
    {
      name: 'questionnaire_view',
      path: '/page/questionnaire_view/:id',
      component: () => import('../templates/page/questionnaire_view.vue'),
    },
    {
      name: 'questionnaire_analysis',
      path: '/page/questionnaire_analysis/:id',
      component: () => import('../templates/page/questionnaire_analysis.vue'),
    },
    {
      name: 'questionnaire_form',
      path: '/form/:id',
      component: () => import('../templates/page/questionnaire_form.vue'),
    },
    // 管理员路由
    {
      name: 'admin_user_list',
      path: '/admin/users',
      component: () => import('../templates/page/admin_user_list.vue'),
      meta: { requiresAdmin: true },
    },
    {
      name: 'admin_user_statistics',
      path: '/admin/users/statistics',
      component: () => import('../templates/page/admin_user_statistics.vue'),
      meta: { requiresAdmin: true },
    },
    {
      name: 'admin_questionnaire_list',
      path: '/admin/questionnaires',
      component: () => import('../templates/page/admin_questionnaire_list.vue'),
      meta: { requiresAdmin: true },
    },
    {
      name: 'admin_questionnaire_statistics',
      path: '/admin/questionnaires/statistics',
      component: () => import('../templates/page/admin_questionnaire_statistics.vue'),
      meta: { requiresAdmin: true },
    },
    {
      name: 'admin_questionnaire_audit',
      path: '/admin/questionnaires/audit',
      component: () => import('../templates/page/admin_questionnaire_audit.vue'),
      meta: { requiresAdmin: true },
    },
    {
      name: 'admin_system_settings',
      path: '/admin/system/settings',
      component: () => import('../templates/page/admin_system_settings.vue'),
      meta: { requiresAdmin: true },
    },
    {
      name: 'admin_system_logs',
      path: '/admin/system/logs',
      component: () => import('../templates/page/admin_system_logs.vue'),
      meta: { requiresAdmin: true },
    },
    {
      name: 'admin_backup',
      path: '/admin/system/backup',
      component: () => import('../templates/page/admin_backup.vue'),
      meta: { requiresAdmin: true },
    },
    {
      name: 'login',
      path: '/login',
      component: () => import('../templates/loginPage.vue'),
    },
    {
      name: 'register',
      path: '/register',
      component: () => import('../templates/registerPage.vue'),
    },
    {
      name: 'userInfo',
      path: '/userInfo',
      component: () => import('../templates/userInfoPage.vue'),
    },
    {
      name: 'api_test',
      path: '/test/api',
      component: () => import('../components/APIDeleteTestValidator.vue'),
    },
  ],
})

// 全局前置守卫 - 检查登录状态和管理员权限
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 检查是否有有效的认证token
  const hasValidToken = isAuthenticated()

  // 如果有token但userStore未标记为已登录，尝试自动登录恢复用户信息
  if (hasValidToken && !userStore.isLoggedIn) {
    console.log('Found token but user not logged in, attempting auto login...')
    const autoLoginSuccess = await checkAuthOnPageLoad()
    if (!autoLoginSuccess) {
      console.log('Auto login failed, redirecting to login page')
      // 如果自动登录失败，清除无效token并重定向到登录页
      if (to.path !== '/login' && to.path !== '/register' && !to.path.startsWith('/form/')) {
        next('/login')
        return
      }
    }
  }

  // 重新检查登录状态（可能在checkAuthOnPageLoad后更新了）
  const isLoggedIn = userStore.isLoggedIn

  // 如果访问根路径，重定向到相应页面
  if (to.path === '/') {
    if (isLoggedIn) {
      // 如果是管理员，跳转到管理员页面
      if (userStore.role === 'admin') {
        next('/admin')
      } else {
        next('/userInfo')
      }
    } else {
      next('/login')
    }
    return
  }

  // 检查管理员权限
  if (to.meta?.requiresAdmin) {
    if (!isLoggedIn) {
      next('/login')
      return
    }
    if (userStore.role !== 'admin') {
      // 非管理员访问管理员页面，跳转到用户信息页
      next('/userInfo')
      return
    }
  }

  // 定义需要登录才能访问的页面
  const requiresAuth = [
    '/userInfo',
    '/page/question_center_create',
    '/page/question_center_my',
    '/page/question_center_edit',
    '/page/question_center_shared',
    '/page/questionnaire_model_create',
    '/page/questionnaire_model_my',
    '/page/questionnaire_model_edit',
    '/page/questionnaire_create',
    '/page/questionnaire_my',
    '/page/questionnaire_view',
    '/page/questionnaire_analysis',
    '/admin', // 所有admin路径都需要登录
  ]

  // 检查当前路径是否需要登录
  const needsAuth = requiresAuth.some((path) => to.path.startsWith(path))

  if (needsAuth && !isLoggedIn) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isLoggedIn) {
    // 已登录但访问登录/注册页，根据角色跳转
    if (userStore.role === 'admin') {
      next('/admin')
    } else {
      next('/userInfo')
    }
  } else if (to.path === '/userInfo' && isLoggedIn && userStore.role === 'admin') {
    // 管理员访问普通用户页面，重定向到管理员页面
    next('/admin')
  } else {
    // 其他情况正常继续
    next()
  }
})

export default router
