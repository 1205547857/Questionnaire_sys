<template>
    <div class="admin-layout">
        <AdminSiteList />
        <div class="admin-main-content">
            <div class="admin-container">
                <div class="page-header">
                    <h1 class="page-title">
                        <i class="fas fa-database"></i>
                        数据备份
                    </h1>
                    <p class="page-description">数据库备份和恢复管理</p>
                </div>

                <div class="coming-soon">
                    <i class="fas fa-database"></i>
                    <h2>功能开发中</h2>
                    <p>数据备份功能正在开发中，敬请期待...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import AdminSiteList from '../admin_siteList.vue'
</script>

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
    margin-bottom: 2rem;
    padding: 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
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

.coming-soon {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.coming-soon i {
    font-size: 4rem;
    color: #667eea;
    margin-bottom: 1rem;
}

.coming-soon h2 {
    color: #1f2937;
    margin-bottom: 1rem;
}

.coming-soon p {
    color: #6b7280;
    font-size: 1.1rem;
}
</style>
