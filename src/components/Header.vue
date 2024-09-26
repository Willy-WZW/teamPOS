<script>
export default {
    data() {
        return {
            selected: 'menuManage',
        }
    },
    methods: {
        selectRoute(option) {
            this.selected = option
        }
    }
}
</script>

<template>
    <div class="headerBar">
        <div class="menuManage" :class="{ isSelected: selected == 'menuManage' }" @click="selectRoute('menuManage')">
            <span>菜單管理</span>
        </div>
        <div class="workbench" :class="{ isSelected: selected == 'workbench' }" @click="selectRoute('workbench')">
            <span>工作檯</span>
        </div>
        <div class="announce" :class="{ isSelected: selected == 'announce' }" @click="selectRoute('announce')">
            <span>公告設定</span>
        </div>
        <div class="busiSetting" :class="{ isSelected: selected == 'busiSetting' }" @click="selectRoute('busiSetting')">
            <span>營業管理</span>
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

    .menuManage {
        width: 10%;
        height: 100%;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        letter-spacing: 3px;
        color: $textColor;
        font-weight: bold;
        font-family: "Noto Sans TC", sans-serif;
    }

    .workbench {
        width: 10%;
        height: 100%;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        letter-spacing: 3px;
        color: $textColor;
        font-weight: bold;
        font-family: "Noto Sans TC", sans-serif;
    }

    .announce {
        width: 10%;
        height: 100%;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        letter-spacing: 3px;
        color: $textColor;
        font-weight: bold;
        font-family: "Noto Sans TC", sans-serif;
    }

    .busiSetting {
        width: 10%;
        height: 100%;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        letter-spacing: 3px;
        color: $textColor;
        font-weight: bold;
        font-family: "Noto Sans TC", sans-serif;
    }

    .isSelected {
        color: $selectedTextColor;
        border-bottom: 3px solid $selectedTextColor;
    }
}
</style>