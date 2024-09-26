<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />

  <div class="big">
    <div class="mainArea">
      <RouterView />
    </div>
  </div>

  <div class="backgroung"></div>
</template>

<style scoped lang="scss">
.big {
  width: 100%;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;

  // .leftBar {
  //   width: 10%;
  //   height: 100vh;
  //   position: fixed;
  //   top: 0;
  //   left: 0;
  //   display: flex;
  //   align-items: center;
  // }

  .mainArea{
    width: 90%;
    height: 100dvh;
    position: fixed;
    left: 10%;
  }
}

.backgroung {
  width: 100%;
  height: 100dvh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  background-color: rgba(199, 199, 199, 0.5);
}
</style>
