<script>
import LeftBar from "@/components/LeftBar.vue";
import interact from 'interactjs';

export default {
    data () {
        return {
            tables: [
                { id: 1, name: "A01", capacity: 4, status: "in-use" },
                { id: 2, name: "A01", capacity: 2, status: "reserved" },
                { id: 3, name: "A01", capacity: 4, status: "available" },
                { id: 4, name: "A01", capacity: 10, status: "in-use" },
                { id: 5, name: "A01", capacity: 4, status: "available" },
                // 可依據需要新增更多桌位
            ],
            viewType: 'reservation', // 預設顯示訂位
            currentDate: new Date(), // 初始化為當前系統日期
            reservations: [
                { id: 1, name: '翁千沛', phone: '0911223345', table: 'A01', time: '12:00', date: '2024-10-02' },
                { id: 2, name: '王政蔚', phone: '0911223345', table: 'A05', time: '18:30', date: '2024-10-03' },
            ],
            waitlist: [
                { id: 1, name: '謝芷倩', phone: '0911223345', position: 1 },
                { id: 2, name: '翁明泰', phone: '0911223345', position: 2 },
                // 更多候位資料...
            ],
        };
    },

    components: {
        LeftBar,
    },

    mounted() {
        // 初始化可拖動元素
        interact('.tableItem').draggable({
            listeners: {
                start (event) {
                    console.log('拖動開始');
                },
                move (event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    // 更新元素的位置
                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                },
                end (event) {
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
            }
        });

        // 加載時恢復桌位位置信息
        this.restoreTablePositions();
    },

    computed: {
        formattedDate() {
            // 檢查 currentDate 是否是有效的 Date 物件
            if (this.currentDate instanceof Date && !isNaN(this.currentDate)) {
            // 格式化日期顯示為 YYYY.MM.DD
            return this.currentDate.toISOString().split('T')[0].replace(/-/g, '.');
            } else {
            return '日期錯誤'; // 或者提供一個預設日期
            }
        },

        dayOfWeek() {
            // 確保 currentDate 為 Date 物件後計算星期幾
            if (this.currentDate instanceof Date && !isNaN(this.currentDate)) {
                const days = ['日', '一', '二', '三', '四', '五', '六'];
                return days[this.currentDate.getDay()];
            } else {
                return ''; // 預設值
            }
        },

        filteredReservations() {
            const formatted = this.currentDate.toISOString().split('T')[0];
            console.log('當前篩選的日期:', formatted);
            console.log('所有訂位資料:', this.reservations);
            return this.reservations.filter(reservation => reservation.date === formatted);
        },
    },

    methods: {
        refresh() {
            // 可在此實作刷新功能
            console.log("資料已刷新");
        },

        getScaleFactor(capacity) {
            const baseCapacity = 4; // 基本桌位容量
            const maxScale = 1.5;   // 設置最大縮放比例，防止過度放大
            const scaleFactor = capacity / baseCapacity;
            return scaleFactor > maxScale ? maxScale : scaleFactor;
        },

        getChairPosition(index, capacity) {
            if (capacity === 2) {
                return index === 0 ? 'chair-top' : 'chair-bottom';
            } else if (capacity <= 4) {
                const positionClasses = ['chair-top', 'chair-right', 'chair-bottom', 'chair-left'];
                return positionClasses[index % 4];
            } else {
                const totalPositions = ['chair-top', 'chair-top', 'chair-right', 'chair-right', 'chair-bottom', 'chair-bottom', 'chair-left', 'chair-left'];
                return totalPositions[index % totalPositions.length];
            }
        },

        restoreTablePositions() {
            const positions = JSON.parse(localStorage.getItem('tablePositions')) || {};
            const tables = this.$refs.tableItem;

            tables.forEach(table => {
                const tableId = table.getAttribute('data-id');
                if (positions[tableId]) {
                    const { x, y } = positions[tableId];
                    table.style.transform = `translate(${x}px, ${y}px)`;
                    table.setAttribute('data-x', x);
                    table.setAttribute('data-y', y);
                }
            });
        },

        changeDate(dayChange) {
            // 改變日期，保持為 Date 物件
            const newDate = new Date(this.currentDate);
            newDate.setDate(newDate.getDate() + dayChange);
            this.currentDate = newDate;
        },
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
        <!-- 桌位區域 -->
        <div class="tableArea">
  <!-- 桌位標題、刷新 Button -->
  <div class="tableHeader">
    <h1 class="tableTitle">桌位圖</h1>
    <button class="refreshButton" @click="refresh">
      <i class="fa-solid fa-arrows-rotate"></i>刷新
    </button>
  </div>

  <!-- 桌位狀態 -->
  <div class="status">
    <span class="activeDot"></span> 用餐中
    <span class="reservedDot"></span> 已訂位
    <span class="availableDot"></span> 可使用
  </div>

  <!-- 桌位圖 -->
  <div class="tableGrid">
  <div
    v-for="table in tables"
    :key="table.id"
    :data-id="table.id"
    :class="['tableItem', table.status]"
    :style="{ transform: `scale(${getScaleFactor(table.capacity)})` }"
    ref="tableItem"
  >
    <div class="circle">
      <div class="table-label">{{ table.name }}</div>
      <div class="table-capacity">👥 {{ table.capacity }}</div>
    </div>
    <div class="chairs">
      <div v-for="(chair, index) in table.capacity" :key="index" :class="getChairPosition(index, table.capacity)"></div>
    </div>
  </div>
</div>
</div>

        <!-- 訂位資訊 -->
        <div class="reservationArea">
            <!-- 切換 訂位/現場候位 -->
            <div class="header">
                <button :class="{ active: viewType === 'reservation' }" @click="viewType = 'reservation'" >
                    訂位
                </button>
                <button :class="{ active: viewType === 'waitlist' }" @click="viewType = 'waitlist'" >
                    現場候位
                </button>
            </div>

            <!-- 日期選擇 -->
            <div class="date-picker">
                <button @click="changeDate(-1)">←</button>
                <span>{{ formattedDate }} 週{{ dayOfWeek }}</span>
                <button @click="changeDate(1)">→</button>
            </div>

            <!-- 訂位顯示區域 -->
            <div v-if="viewType === 'reservation'" class="reservations">
                <div v-for="reservation in filteredReservations" :key="reservation.id" class="reservation-item" >
                    <div class="customer-info">
                        <div>{{ reservation.name }}</div>
                        <div>{{ reservation.phone }}</div>
                    </div>

                    <div class="reservation-details">
                        <div>{{ reservation.table }}</div>
                        <div>{{ reservation.time }}</div>
                        <button>報到</button>
                        <button>取消</button>
                    </div>
                </div>
            </div>

            <!-- 現場候位顯示區域 -->
            <div v-if="viewType === 'waitlist'" class="waitlist">
                <div v-for="wait in waitlist" :key="wait.id" class="waitlist-item">
                    <div class="customer-info">
                        <div>{{ wait.name }}</div>
                        <div>{{ wait.phone }}</div>
                    </div>
                    <div class="waitlist-details">
                        <div>候位順序: {{ wait.position }}</div>
                    </div>
                </div>
            </div>

            <button class="new-reservation">+ 新增訂位</button>
        </div>
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

        .tableArea {
  padding: 20px;

  .tableHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .tableTitle {
      font-size: 24px;
      font-weight: bold;
    }

    .refreshButton {
      background-color: #f5f5f5;
      border: 1px solid #ccc;
      padding: 10px;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: #e0e0e0;
      }
    }
  }

  .status {
    margin-bottom: 20px;
    span {
      margin-right: 20px;
    }
  }

  .tableGrid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    justify-items: center;
  }

  .tableItem {
    width: 150px;
    height: 150px;
    border: 1px solid #ccc;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    transition: transform 0.3s ease;

    .circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      background-color: #f4f6f9;
      margin-bottom: 10px;

      .table-label {
        font-size: 18px;
        font-weight: bold;
      }

      .table-capacity {
        font-size: 12px;
      }
    }

    /* 椅子容器 */
    .chairs {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-wrap: wrap;
    }

    /* 椅子位置調整 */
    .chair-top {
      position: absolute;
      top: -15px;
      width: 10px;
      height: 10px;
      background-color: #666;
      border-radius: 50%;
    }

    .chair-right {
      position: absolute;
      right: -15px;
      width: 10px;
      height: 10px;
      background-color: #666;
      border-radius: 50%;
    }

    .chair-bottom {
      position: absolute;
      bottom: -15px;
      width: 10px;
      height: 10px;
      background-color: #666;
      border-radius: 50%;
    }

    .chair-left {
      position: absolute;
      left: -15px;
      width: 10px;
      height: 10px;
      background-color: #666;
      border-radius: 50%;
    }

    &.in-use .circle {
      background-color: #8c8c8c; /* 用餐中狀態 */
    }

    &.reserved .circle {
      background-color: #d3d3d3; /* 已訂位狀態 */
    }

    &.available .circle {
      background-color: #f4f6f9; /* 可使用狀態，預設為淺色 */
    }
  }
}

        .reservationArea {
            width: 40%;
            height: 98%;
            border-radius: 10px;
            background-color: #FFFFFF;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 10px;
            margin-left: 5px;

  .header {
    display: flex;
    justify-content: space-around;
    width: 100%;
    margin-bottom: 20px;

    button {
      background-color: #f5f5f5;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      border-radius: 5px;
      transition: background-color 0.3s;

      &.active {
        background-color: #d3d3d3;
      }
    }
  }

  .date-picker {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 60%;
    margin-bottom: 20px;
    font-size: 18px;

    button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0 10px;
    }
  }

  .reservations,
  .waitlist {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    align-items: center;
  }

  .reservation-item,
  .waitlist-item {
    display: flex;
    justify-content: space-between;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 10px;
    width: 80%;
    max-width: 600px;

    .customer-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;

      div {
        font-size: 16px;
      }
    }

    .reservation-details,
    .waitlist-details {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;
      gap: 5px;

      button {
        background-color: #f5f5f5;
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 5px 10px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s;

        &:hover {
          background-color: #e0e0e0;
        }
      }
    }
  }

  .new-reservation {
    width: 80%;
    padding: 15px;
    background-color: #444;
    color: white;
    text-align: center;
    border-radius: 5px;
    cursor: pointer;
    font-size: 18px;
    margin-top: 20px;
    max-width: 600px;

    &:hover {
      background-color: #333;
    }
  }
        }
    }
}
</style>

// .tableArea {
    //     width: 60%;
    //     height: 98%;
    //     border-radius: 10px;
    //     background-color: #FFFFFF;
    //     padding: 20px;

    //     .tableHeader {
    //         display: flex;
    //         justify-content: space-between;
    //         align-items: center;

    //         .tableTitle {
    //             letter-spacing: 4px;
    //             margin-bottom: 10px;
    //         }

    //         .refreshButton {
    //             width: 13%;
    //             border-radius: 10px;
    //             border: 2px solid #4D5358;
    //             background-color: transparent;
    //             font-size: 18px;
    //             color: #4D5358;
    //             display: flex;
    //             justify-content: space-evenly;
    //             align-items: center;
    //             padding: 5px 10px;
    //             cursor: pointer;
    //             transition: 0.2s;

    //             &:hover {
    //                 scale: 1.05;
    //             }
    //         }
    //     }

    //     .status {
    //         width: 35%;
    //         font-size: 18px;
    //         display: flex;
    //         justify-content: space-evenly;
    //         align-items: center;
    //         margin-bottom: 20px;

    //         .activeDot {
    //             width: 12px;
    //             height: 12px;
    //             border-radius: 50%;
    //             background-color: #878d96;
    //         }

    //         .reservedDot {
    //             width: 12px;
    //             height: 12px;
    //             border-radius: 50%;
    //             background-color: #c1c7cd;
    //         }

    //         .availableDot {
    //             width: 12px;
    //             height: 12px;
    //             border-radius: 50%;
    //             border: 1px solid #000;
    //             background-color: #f2f4f8;
    //         }
    //     }

    //     .tableGrid {
    //         height: 89%;
    //         background-color: #f2f4f8;
    //         display: grid;
    //         grid-template-columns: repeat(4, 1fr);
    //         gap: 20px;
    //         justify-items: center;

    //         .tableItem {
    //             width: 130px;
    //             height: 80px;
    //             border: 1px solid #ccc;
    //             border-radius: 10px;
    //             display: flex;
    //             justify-content: center;
    //             align-items: center;
    //             background-color: white;
    //             transition: transform 0.3s ease; // 加入縮放動畫效果

    //             .circle {
    //                 width: 60px;
    //                 height: 60px;
    //                 border-radius: 50%;
    //                 display: flex;
    //                 justify-content: center;
    //                 align-items: center;
    //                 flex-direction: column;
    //                 background-color: #f4f6f9;

    //                 .table-label {
    //                 font-size: 18px;
    //                 font-weight: bold;
    //                 }

    //                 .table-capacity {
    //                 font-size: 12px;
    //                 }
    //             }

    //             &.in-use .circle {
    //                 background-color: #8c8c8c;  // 使用中狀態
    //             }

    //             &.reserved .circle {
    //                 background-color: #d3d3d3;  // 已訂位狀態
    //             }

    //             &.available .circle {
    //                 background-color: #f4f6f9;  // 可使用狀態，預設為淺色
    //             }
    //         }
    //     }
    // }