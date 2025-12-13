<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://github.com/HLLLG" target="_blank">程序员HL</a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import GlobalHeader from '@/components/GlobalHeader.vue'

export default defineComponent({
  components: { GlobalHeader },
})
</script>

<style scoped>
#basicLayout .header {
  background: white;
  color: unset;
  margin-bottom: 16px;
  padding-inline: 20px;
}

#basicLayout .content {
  padding: 20px;
  background: linear-gradient(to right, #fefefe, #fff);
  margin-bottom: 30px;
}

#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}
</style>
