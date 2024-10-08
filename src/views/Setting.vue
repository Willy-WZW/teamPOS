<script>
import LeftBar from '@/components/LeftBar.vue'
import Header from '@/components/Header.vue'
import AddMenu from '@/components/AddMenu.vue'
import Workbench from '@/components/Workbench.vue';
import BusiSetting from '@/components/BusiSetting.vue';

export default { 
    data() {
        return {
            selectedComponent: 'AddMenu',
        };
    },
    components: {
        LeftBar,
        Header,
        AddMenu,
        Workbench,
        BusiSetting,
    },
    methods: {
        handleComponentChange(component) {
            this.selectedComponent = component;
        }
    }
}
</script>

<template>
    <div class="big">
        <div class="leftBar">
            <LeftBar />
        </div>
        <div class="mainArea">
            <div class="header">
                <Header @changeComponent="handleComponentChange" />
            </div>
            <div class="mainView">
                <AddMenu v-if="selectedComponent === 'AddMenu'" />
                <Workbench v-if="selectedComponent === 'Workbench'" />
                <Announce v-if="selectedComponent === 'Announce'" />
                <BusiSetting v-if="selectedComponent === 'BusiSetting'" />
            </div>
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
        display: flex;
        justify-content: start;
        align-items: start;
        flex-direction: column;
        position: relative;

        .header {
            width: 96%;
            height: 6.3%;
            position: absolute;
            top: 2%;
            left: 2%;
        }

        .mainView {
            width: 96%;
            height: 87%;
            position: absolute;
            left: 2%;
            top: 9.5%;
        }
    }
}
</style>
