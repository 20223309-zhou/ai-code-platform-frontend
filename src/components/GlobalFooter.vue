<template>
  <a-layout-footer class="footer">
    <div class="footer-content">
      <p class="copyright">
        <span>该项目仅用于学习参考</span> &nbsp;&nbsp;|&nbsp;&nbsp;
        <a href="https://beian.miit.gov.cn/" target="_blank">渝ICP备2026006352号-2</a>
      </p>
    </div>
  </a-layout-footer>
</template>

<script setup lang="ts">
// 无需额外的响应式数据
</script>

<style scoped>
.footer {
  background: transparent;
  text-align: center;
  padding: 0 20px 28px;
  margin-top: 24px;
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  padding-top: 18px;
  border-top: 1px solid var(--ai-border);
}

.copyright {
  margin: 0;
  color: var(--ai-muted);
  font-size: 12px;
  line-height: 1.6;
}
</style>
