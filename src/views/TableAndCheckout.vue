<script>
import LeftBar from "@/components/LeftBar.vue";
import Table from "../components/TableAndCheckout/Table.vue";
import Reservation from "../components/TableAndCheckout/Reservation.vue";


export default {
    data() {
        return {
            viewType: 'reservation',

        };
    },

    components: {
        LeftBar,
        Table,
        Reservation,
    },
};
</script>

<template>
    <div class="big">
        <!-- 側邊欄 -->
        <div class="leftBar">
            <LeftBar />
        </div>

        <!-- 桌位、訂位顯示區域 -->
        <div class="tableReservationArea">
            <Table />
            <Reservation />
        </div>
    </div>
</template>

<style scoped lang="scss">
.big {
    width: 100%;
    height: 100dvh;
    display: flex;

    .leftBar {
        width: 10%;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
    }

    .tableReservationArea {
        width: 98%;
        height: 100%;
        display: flex;
        align-items: center;
    }
}
</style>