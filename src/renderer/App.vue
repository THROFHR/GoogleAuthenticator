<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import webViewMeun from './assets/Meun';
  export default {
    name: 'ga',
    mounted() {
      if (process.env.NODE_ENV !== 'development') {
        webViewMeun(this.$electron.remote.app);
      }
    },
  };
</script>

<style>
  /* CSS */
</style>
