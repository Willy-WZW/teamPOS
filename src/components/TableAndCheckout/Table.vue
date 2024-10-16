<script>
import interact from 'interactjs';
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            isDragging: false,   // 用來追踪是否是拖動動作
            tables: [],  // 儲存桌位狀態
            timeSlots: [],  // 儲存從 API 獲取的時間段
            selectedTimeSlot: '',  // 使用者選擇的時間段
        };
    },

    mounted() {
        this.fetchTables().then(() => {
            this.$nextTick(() => {
                this.restoreTablePositions(); // 確保 DOM 渲染完成後再還原桌位位置
            });
        });

        // 初始化可拖動元素
        interact('.tableItem').draggable({
            listeners: {
                start(event) {
                    console.log('拖動開始');
                },

                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    // 保留桌子的縮放比例
                    const scale = target.getAttribute('data-scale') || 1;

                    // 更新元素的位置，合併縮放和位移
                    target.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                },

                end(event) {
                    const target = event.target;
                    const x = target.getAttribute('data-x');
                    const y = target.getAttribute('data-y');

                    // 保存桌位的位置信息到 LocalStorage
                    const tableId = target.getAttribute('data-id');
                    const positions = JSON.parse(localStorage.getItem('tablePositions')) || {};
                    positions[tableId] = { x, y };
                    localStorage.setItem('tablePositions', JSON.stringify(positions));

                    console.log(`桌位 ${tableId} 的位置已保存`, { x, y });
                }
            },

            modifiers: [
                interact.modifiers.restrict({
                    restriction: '.tableGrid', // 限制桌位只能在 tableGrid 容器內移動
                    endOnly: true, // 僅在拖動結束時生效
                    elementRect: { top: 0, left: 0, bottom: 1, right: 1 } // 元素邊界
                })
            ]
        });
    },

    methods: {
        // 加載桌位
        async fetchTables() {
            try {
                const response = await axios.get('http://localhost:8080/tableManagement/getTodayTableStatuses');

                // 存儲整個時間段對象，而不只是時間段字串
                this.timeSlots = response.data;

                if (this.timeSlots.length > 0) {
                    this.selectedTimeSlot = this.timeSlots[0].timeSlot;  // 預設選擇第一個時間段
                    this.updateTablesForTimeSlot(this.selectedTimeSlot);
                }
            } catch (error) {
                console.error('無法獲取桌位狀態資料:', error);
                Swal.fire({
                    icon: 'error',
                    title: '錯誤',
                    text: '無法獲取桌位資料！',
                });
            }
        },

        // 根據選擇的時間段更新桌位狀態
        updateTablesForTimeSlot(selectedTimeSlot) {
            // 找到與選擇時間段匹配的時間段對象
            const selectedSlot = this.timeSlots.find(slot => slot.timeSlot === selectedTimeSlot);

            console.log('選擇的時間段:', selectedTimeSlot);
            console.log('找到的時間段資料:', selectedSlot);

            if (selectedSlot) {
                // 更新桌位資料以顯示在前端
                this.tables = selectedSlot.tableStatuses.map(table => ({
                    id: table.tableNumber,
                    capacity: table.tableCapacity,
                    status: table.tableStatus,
                    reservations: table.reservations || []
                }));
                console.log('更新後的桌位資料:', this.tables);
            } else {
                console.warn('選擇的時間段沒有對應的桌位資料');
                Swal.fire({
                    icon: 'error',
                    title: '錯誤',
                    text: '選擇的時間段沒有對應的桌位資料！',
                });
            }
        },

        // 根據容納人數不同調整桌位寬度
        getWidthByCapacity(capacity) {
            const baseWidth = 150; // 2人桌的基礎寬度
            const additionalWidth = 15; // 每增加一個人增加的寬度
            if (capacity >= 2) {
                return baseWidth + (capacity - 2) * additionalWidth;
            }
            return baseWidth; // 針對小於2人的情況，確保至少有最小寬度
        },

        // 固定桌位高度
        getHeightByCapacity(capacity) {
            // 可以根據需求設置不同的高度，這裡統一高度為120px
            return 120;
        },

        // 桌位佈局拷貝以免刷新不見
        restoreTablePositions() {
            const positions = JSON.parse(localStorage.getItem('tablePositions')) || {};
            const tables = this.$refs.tableItem;

            if (Array.isArray(tables)) {
                // 如果 $refs 是陣列，遍歷每個桌位
                tables.forEach(table => {
                    const tableId = table.getAttribute('data-id');
                    if (positions[tableId]) {
                        const { x, y } = positions[tableId];
                        table.style.transform = `translate(${x}px, ${y}px)`;
                        table.setAttribute('data-x', x);
                        table.setAttribute('data-y', y);
                    }
                });
            } else if (tables) {
                // 單一桌位處理
                const tableId = tables.getAttribute('data-id');
                if (positions[tableId]) {
                    const { x, y } = positions[tableId];
                    tables.style.transform = `translate(${x}px, ${y}px)`;
                    tables.setAttribute('data-x', x);
                    tables.setAttribute('data-y', y);
                }
            } else {
                console.error('無法找到任何桌位元素');
            }
        },
    },
};
</script>

<template>
<div class="tableArea">
    <!-- 桌位標題、刷新 Button -->
    <div class="tableHeader">
        <h1 class="tableTitle">桌位圖</h1>
        <div class="timeSlotsArea">
            <!-- 時段選擇 -->
            <label for="timeSlots">時間</label>
            <select class="selectedTime" id="timeSlots" v-model="selectedTimeSlot" @change="updateTablesForTimeSlot(selectedTimeSlot)">
                <option v-for="slot in timeSlots" :key="slot.timeSlot" :value="slot.timeSlot">
                    {{ slot.timeSlot }}
                </option>
            </select>
        </div>
    </div>

    <!-- 桌位狀態 -->
    <div class="status">
        <span class="activeDot"></span> 用餐中
        <span class="reservedDot"></span> 已訂位
        <span class="availableDot"></span> 可使用
    </div>

    <!-- 桌位圖 -->
    <div class="tableGrid">
        <div v-for="table in tables" :key="table.id" :data-id="table.id" class="tableItem" ref="tableItem"
            :style="{ width: `${getWidthByCapacity(table.capacity)}px`, height: `${getHeightByCapacity(table.capacity)}px` }">
            <div :class="['circle', table.status]" @click="selectTable(table)">
                <div class="tableNumber">{{ table.id }}</div>
                <div class="tableCapacity">
                    <i class="fa-solid fa-user-group"></i> {{ table.capacity }}
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped lang="scss">
.tableArea {
    width: 65%;
    height: 100%;
    border-radius: 10px;
    background-color: #FFFFFF;
    padding: 20px;

    .tableHeader {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        .tableTitle {
            letter-spacing: 4px;
        }
        
        .timeSlotsArea {
            width: 35%;
            display: flex;
            align-items: center;
            justify-content: end;

            label {
                font-size: 19px;
                letter-spacing: 5px;
                margin-right: 4%;
            }

            .selectedTime {
                width: 60%;
                height: 35px;
                border-radius: 10px;
                border: 1px solid #C1C7CD;
                letter-spacing: 5px;
                padding-left: 10px;
                appearance: none; /* 隱藏默認的箭頭 */
                background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjcxNzUgNi41NDc1QzEzLjE3OTcgNi4xNDcyIDEzLjI4MjIgNS40MTMgMTIuOTg3MiA0LjkzMjVDMTIuNjkzMiA0LjQ1MjUgMTIuMDEwNCA0LjQ1MjUgMTEuNzE3IDQuOTMyNUw4IDkuMzM1NEw0LjI4MjUgNC45MzI1QzMuOTg5NiA0LjQ1MjUgMy4zMDY4IDQuNDUyNSAyLjAxMjggNC45MzI1QzEuNzE4OCA1LjQxMyAxLjgyMTEgNi4xNDcyIDIuMjg0MTIgNi41NDc1TDcuMzE1MTIgMTEuNTA2QzcuNzU4NDEgMTEuOTYxIDguMjQxNiAxMS45NjEgOC42ODY4IDExLjUwNkMxMC4xNzA4IDEwLjI1NyAxMS41OTExIDguOTAzNTggMTIuNzE3NSA3LjY2MjVIMTIuNzE3NVoiIGZpbGw9IiMyMjIyMjIiLz4KPC9zdmc+') no-repeat; /* 使用 base64 格式的箭頭圖標 */
                background-position: calc(100% - 14px) center; /* 調整箭頭的位置，讓它距離左邊更近 */
                background-size: 10px; /* 調整箭頭大小 */
                outline: none;
                cursor: pointer;
            }
        }
    }

    .status {
        width: 35%;
        font-size: 18px;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        margin-bottom: 15px;

        .activeDot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #878d96;
        }

        .reservedDot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #c1c7cd;
        }

        .availableDot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 1px solid #000;
            background-color: #f2f4f8;
        }
    }

    .tableGrid {
        height: 90%;
        /* 確保父容器有具體高度 */
        border-radius: 10px;
        background-color: #f2f4f8;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        justify-items: center;
        overflow: hidden;
        /* 防止元素超出容器 */

        .tableItem {
            border: 1px solid #ccc;
            border-radius: 10px;
            background-color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            cursor: move;

            .circle {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background-color: #f4f6f9;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                cursor: pointer;

                &.ACTIVE {
                    background-color: #878d96 !important;
                    /* 用餐中狀態 */
                }

                &.RESERVED {
                    background-color: #c1c7cd !important;
                    /* 已訂位狀態 */
                }

                &.AVAILABLE {
                    background-color: #f2f4f8 !important;
                    /* 可使用狀態，預設為淺色 */
                }

                .tableNumber {
                    font-size: 20px;
                    font-weight: bold;
                }

                .tableCapacity {
                    font-size: 15px;
                }
            }
        }
    }
}
</style>