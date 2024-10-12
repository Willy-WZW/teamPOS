<script>
import LeftBar from '@/components/LeftBar.vue'
import UserInfo from "../components/UserInfo.vue";


export default {
    data() {
        return {

        }
    },
    components: {
        LeftBar,
        UserInfo
    },
}
</script>

<template>
    <div class="big">
        <div class="leftBar">
            <LeftBar />
        </div>
        <div class="mainArea">
            <UserInfo />
        </div>
    </div>
</template>

<style scoped lang="scss">
.big {
    width: 100%;
    height: 100dvh;
    display: flex;
    justify-content: center;
    align-items: center;

    .leftBar {
        width: 10%;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
    }

    .mainArea {
        width: 100%;
        height: 100%;
        overflow-y: scroll;
        scrollbar-width: none;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
}
</style>