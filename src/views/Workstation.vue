<script>
import LeftBar from '@/components/LeftBar.vue'
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            orders: [],
            categories: [],
            selectedWorkstationId: null,
            refreshInterval: null,
        }
    },
    components: {
        LeftBar
    },
    methods: {
        fetchWorkstations() {
            axios.post('http://localhost:8080/workstation/searchworkstation', {})
                .then(response => {
                    this.categories = response.data.data;

                    if (this.categories.length > 0) {
                        this.selectedWorkstationId = this.categories[0].workstationId;
                    }
                })
                .catch(error => {
                    console.log('搜索失敗', error);
                });
        },
        fetchAllOrders() {
            axios.post('http://localhost:8080/pos/selectInPreparation')
                .then(response => {
                    this.orders = response.data.data;
                })
                .catch(error => {
                    console.error("搜索訂單失敗", error);
                });
        },
        filterOrdersByWorkstation() {
            if (this.selectedWorkstationId === null) return [];

            const groupedOrders = {};
            this.orders
                .filter(order => order.workstationId === this.selectedWorkstationId)
                .forEach(order => {
                    if (!groupedOrders[order.tableNumber]) {
                        groupedOrders[order.tableNumber] = [];
                    }
                    groupedOrders[order.tableNumber].push(order);
                });

            Object.keys(groupedOrders).forEach(tableNumber => {
                groupedOrders[tableNumber] = groupedOrders[tableNumber].sort((a, b) => new Date(a.orderTime) - new Date(b.orderTime));
            });

            const sortedTableNumbers = Object.keys(groupedOrders).sort((a, b) => {
                const firstOrderA = groupedOrders[a][0];
                const firstOrderB = groupedOrders[b][0];
                return new Date(firstOrderA.orderTime) - new Date(firstOrderB.orderTime);
            });

            const sortedGroupedOrders = {};
            sortedTableNumbers.forEach(tableNumber => {
                sortedGroupedOrders[tableNumber] = groupedOrders[tableNumber];
            });

            return sortedGroupedOrders;
        },

        selectWorkstation(workstationId) {
            this.selectedWorkstationId = workstationId;
        },
        async updateInPreparation(orderId) {
            const data = { id: orderId };
            const result = await Swal.fire({
                title: '確定要送出嗎?',
                showCancelButton: true,
                confirmButtonText: '送出',
                cancelButtonText: '取消'
            });
            if (result.isConfirmed) {
                axios.post('http://localhost:8080/pos/updateInPreparation', data)
                    .then(response => {
                        if (response.data.code === 200) {
                            this.fetchAllOrders();
                        } else {

                        }
                    })
                    .catch(error => {
                        console.error('更新訂單狀態失敗', error);
                    });
            }
        }
    },
    mounted() {
        this.fetchWorkstations();
        this.fetchAllOrders();
        this.refreshInterval = setInterval(() => {
            this.fetchAllOrders();
        }, 10000);
    },
    beforeDestroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    },
}
</script>
<template>
    <div class="big">
        <div class="leftBar">
            <LeftBar />
        </div>
        <div class="mainArea">
            <div class="header">
                <div v-for="(category, index) in categories" :key="index"
                    :class="{ isSelected: selectedWorkstationId === category.workstationId }"
                    @click="selectWorkstation(category.workstationId)" class="headername">
                    {{ category.workstationName }}
                </div>
            </div>
            <div class="mainView">
                <div v-for="(orders, tableNumber) in filterOrdersByWorkstation()" :key="tableNumber" class="orders">
                    <div class="table">
                        {{ tableNumber }}桌
                    </div>
                    <div class="orderbox">
                        <div v-for="(order, index) in orders" :key="index" class="ordermenu">
                            {{ order.mealName }}
                            <i class="fa-solid fa-check" @click="updateInPreparation(order.id)"></i>
                            <ul v-if="order.options" style="padding-left: 10%;">
                                <li v-for="(option, index) in order.options.split(',')" :key="index">
                                    {{ option }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
$selectedTextColor: #21272a;
$textColor: #697077;

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
            border-radius: 10px;
            display: flex;
            position: absolute;
            top: 2%;
            left: 2%;
            background-color: #fff;
            overflow-x: auto;
            white-space: nowrap;
            scrollbar-width: none;
            padding-left: 4%;
            padding-right: 4%;

            .headername {
                min-width: calc(100% / 7);
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

            .headername::before {
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

        .mainView {
            width: 96%;
            height: 87%;
            position: absolute;
            left: 2%;
            top: 9.5%;
            border-radius: 10px;
            background-color: #fff;
            display: flex;
            overflow-x: auto;
            scrollbar-width: none;

            .orders {
                padding-left: 5%;
                min-width: 33.3%;

                .orderbox {
                    width: 90%;
                    overflow-y: scroll;
                    max-height: 85%;
                    scrollbar-width: none;

                }

                .table {
                    width: 90%;
                    height: 7%;
                    border-radius: 10px;
                    background-color: #A2A9B0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 3%;
                    position: relative;
                }

                .ordermenu {
                    padding: 10px;
                    width: auto;
                    max-width: 100%;
                    box-sizing: border-box;
                    background-color: #F2F4F8;
                    margin-top: 3%;
                    border-radius: 10px;

                }
            }
        }
    }
}

.fa-check {
    cursor: pointer;
}
</style>