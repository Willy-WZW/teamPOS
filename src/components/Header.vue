<script>
export default {
    data(){
        return{
            selected: "menuManage"
        }
    },
    methods: {
        selectMenu() {
            this.$emit('changeComponent', 'AddMenu');
            this.selectRoute('menuManage');
        },
        selectWorkbench() {
            this.$emit('changeComponent', 'Workbench');
            this.selectRoute('workbench');
        },
        selectAnnounce() {
            this.$emit('changeComponent', 'Announce');
            this.selectRoute('announce');
        },
        selectBusiSetting() {
            this.$emit('changeComponent', 'BusiSetting');
            this.selectRoute('busiSetting');
        },
        selectRoute(option){
            this.selected = option
        }
    }
}
</script>

<template>
    <div class="headerBar">
        <div class="menuManage" :class="{isSelected: selected === 'menuManage'}" @click="selectMenu">
            <span>菜單管理</span>
        </div>
        <div class="workbench":class="{isSelected: selected === 'workbench'}" @click="selectWorkbench">
            <span>工作檯</span>
        </div>
        <div class="announce":class="{isSelected: selected === 'announce'}" @click="selectAnnounce">
            <span>公告設定</span>
        </div>
        <div class="busiSetting":class="{isSelected: selected === 'busiSetting'}" @click="selectBusiSetting">
            <span>桌位與訂位</span>
        </div>
    </div>
</template>

<style scoped lang="scss">
$bgColor: #fff;
$selectedTextColor: #21272a;
$textColor: #697077;

.headerBar {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $bgColor;

    .menuManage,
    .workbench,
    .announce,
    .busiSetting {
        width: 10%;
        height: 100%;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        letter-spacing: 3px;
        color: $textColor;
        font-weight: bold;
        font-family: "Noto Sans TC", sans-serif;
        transition: transform 0.3s, color 0.3s, border-bottom 0.3s;
    }

    .menuManage::before,
    .workbench::before,
    .announce::before,
    .busiSetting::before {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        height: 5px;
        width: 0;
        background-color: $selectedTextColor;
        transition: width 0.3s ease-in-out;
    }

    .isSelected {
        color: $selectedTextColor;
    }

    .isSelected::before {
        width: 100%;
    }
}
</style>
