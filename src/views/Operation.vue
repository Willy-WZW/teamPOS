<script>
import LeftBar from '@/components/LeftBar.vue' 
import OperationComponent from '@/components/operation/OperationComponent.vue';
export default {
    data() {
        return {
        }
    },
    components: {
        LeftBar,
        OperationComponent
    },
}
</script>

<template>
    <div class="big">
        <div class="leftBar">
            <LeftBar />
        </div>
        <div class="mainArea">
            <OperationComponent />
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
        height: 100dvh;
        position: fixed;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
    }

    .mainArea {
        width: 90%;
        height: 100dvh;
        overflow-y: scroll;
        display: flex;
        justify-content: start;
        align-items: center;
        flex-direction: column;
    }
}
</style>