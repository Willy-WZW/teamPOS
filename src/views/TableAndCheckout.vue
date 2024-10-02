<script>
import LeftBar from "@/components/LeftBar.vue";
import interact from 'interactjs';

export default {
    data () {
        return {
            tables: [
                { id: 1, name: "A01", capacity: 4, status: "active" },
                { id: 2, name: "A01", capacity: 2, status: "reserved" },
                { id: 3, name: "A01", capacity: 6, status: "available" },
                { id: 4, name: "A01", capacity: 10, status: "active" },
                { id: 5, name: "A01", capacity: 8, status: "available" },
                // 可依據需要新增更多桌位
            ],
            viewType: 'reservation', // 預設顯示訂位
            currentDate: new Date(), // 初始化為當前系統日期
            reservations: [
                { id: 1, name: '翁千沛', phone: '0911223345', table: 'A01', time: '12:00', date: '2024-10-02', partySize: 4 },
                { id: 2, name: '王政蔚', phone: '0911223345', table: 'A05', time: '18:30', date: '2024-10-02', partySize: 2 },
                { id: 3, name: '黃冠霖', phone: '0911223345', table: 'A02', time: '12:00', date: '2024-10-02', partySize: 12 },
                { id: 4, name: '謝芷倩', phone: '0911223345', table: 'A03', time: '11:30', date: '2024-10-03', partySize: 1 },
                { id: 5, name: '翁明泰', phone: '0911223345', table: 'A08', time: '20:30', date: '2024-10-03', partySize: 3 },
                { id: 6, name: '孫秉家', phone: '0911223345', table: 'A06', time: '19:00', date: '2024-10-03', partySize: 6 }
            ],
            waitlist: [
                { id: 1, name: '翁千沛', phone: '0911223345', table: 'A01', registrationTime: '12:00', position: 1, partySize: 4 },
                { id: 2, name: '王政蔚', phone: '0911223345', table: 'A02', registrationTime: '12:30', position: 2, partySize: 2 },
                { id: 3, name: '黃冠霖', phone: '0911223345', table: 'A03', registrationTime: '13:00', position: 3, partySize: 12 },
            ]
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

                    // 保留桌子的縮放比例
                    const scale = target.getAttribute('data-scale') || 1;

                    // 更新元素的位置，合併縮放和位移
                    target.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
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

        getWidthByCapacity(capacity) {
            // 根據桌位的人數設置不同的寬度
            if (capacity <= 2) {
                return 140; // 2人桌，寬度140px
            } else if (capacity <= 4) {
                return 180; // 4人桌，寬度180px
            } else if (capacity <= 6) {
                return 220; // 6人桌，寬度220px
            }else if (capacity <= 8) {
                return 260; // 8人桌，寬度260px
            }
            return 300; // 10人桌，寬度220px
        },

        getHeightByCapacity (capacity) {
            // 可以根據需求設置不同的高度，這裡統一高度為100px
            return 140;
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
                <div v-for="table in tables" :key="table.id" :data-id="table.id" class="tableItem" ref="tableItem"
                :style="{width: `${getWidthByCapacity(table.capacity)}px`, height: `${getHeightByCapacity(table.capacity)}px`}">
                    <div :class="['circle', table.status]">
                        <div class="tableNumber">{{ table.name }}</div>
                        <div class="tableCapacity">
                            <i class="fa-solid fa-user-group"></i>
                            {{ table.capacity }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 訂位資訊 -->
        <div class="reservationArea">
            <!-- 切換 訂位/現場候位 -->
            <div class="reservationHeader">
                <button :class="{ active: viewType === 'reservation' }" @click="viewType = 'reservation'" >
                    訂位
                </button>
                <button :class="{ active: viewType === 'waitlist' }" @click="viewType = 'waitlist'" >
                    現場候位
                </button>
            </div>

            <!-- 日期選擇 -->
            <div class="datePicker">
                <button @click="changeDate(-1)">
                    <i class="fa-solid fa-angle-left"></i>
                </button>
                <span>{{ formattedDate }} 週{{ dayOfWeek }}</span>
                <button @click="changeDate(1)">
                    <i class="fa-solid fa-angle-right"></i>
                </button>
            </div>

            <!-- 訂位顯示區域 -->
            <div v-if="viewType === 'reservation'" class="reservations">
                <p class="reminderText">時間為訂位時間</p>
                <div v-for="reservation in filteredReservations" :key="reservation.id" class="reservationItem">
                    <!-- 顧客名字 -->
                    <div class="customerName">{{ reservation.name }}</div>

                    <!-- 顧客手機與訂位人數 -->
                    <div class="customerPhoneAndParty">
                        <div class="customerPhone">
                            <i class="fa-solid fa-phone"></i>
                            {{ reservation.phone }}
                        </div>
                        <div class="customerPartySize">
                            <i class="fa-solid fa-user-group"></i>
                            {{ reservation.partySize }}位
                        </div>
                    </div>

                    <!-- 桌號與訂位時間 -->
                    <div class="tableNumberAndTime">
                        <div class="tableNumber">{{ reservation.table }}</div>
                        <div class="reservationTime">{{ reservation.time }}</div>
                    </div>
    
                    <!-- 報到與取消 -->
                    <div class="reservationActions">
                        <div class="checkinArea">
                            <input type="checkbox" id="checkin_{{ reservation.id }}" name="checkin" />
                            <label for="checkin_{{ reservation.id }}">報到</label>
                        </div>
                        <div class="cancelArea">
                            <input type="checkbox" id="cancel_{{ reservation.id }}" name="cancel" />
                            <label for="cancel_{{ reservation.id }}">取消</label>
                        </div>
                    </div>
                </div>
            </div>

            <button v-if="viewType === 'reservation'" class="newReservation">
                <i class="fa-solid fa-plus"></i>
                新增訂位
            </button>

            <!-- 現場候位顯示區域 -->
            <div v-if="viewType === 'waitlist'" class="waitlist">
                <p class="reminderText">時間為登記時間</p>
                <div v-for="wait in waitlist" :key="wait.id" class="waitlistItem">
                    <!-- 顧客名字 -->
                    <div class="customerName">{{ wait.name }}</div>

                    <!-- 顧客手機與候位人數 -->
                    <div class="customerPhoneAndParty">
                        <div class="customerPhone">
                            <i class="fa-solid fa-phone"></i>
                            {{ wait.phone }}
                        </div>
                        <div class="customerPartySize">
                            <i class="fa-solid fa-user-group"></i>
                            {{ wait.partySize }}位
                        </div>
                    </div>

                    <!-- 桌號與登記時間 -->
                    <div class="tableNumberAndTime">
                        <div class="tableNumber">{{ wait.table }}</div>
                        <div class="registrationTime">{{ wait.registrationTime }}</div>
                    </div>

                    <!-- 候位順序 -->
                    <div class="waitPositionAndTime">
                        <div class="waitPosition">候位順序: {{ wait.position }}</div>
                    </div>
                </div>
            </div>

            <button v-if="viewType === 'waitlist'" class="newWaitlist">
                <i class="fa-solid fa-plus"></i>
                新增候位
            </button>
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
            width: 65%;
            height: 98%;
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

                .refreshButton {
                    width: 13%;
                    border-radius: 10px;
                    border: 2px solid #4D5358;
                    background-color: transparent;
                    font-size: 18px;
                    color: #4D5358;
                    display: flex;
                    justify-content: space-evenly;
                    align-items: center;
                    padding: 5px 10px;
                    cursor: pointer;
                    transition: 0.2s;

                    &:hover {
                        scale: 1.05;
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
                border-radius: 10px;
                background-color: #f2f4f8;
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                justify-items: center;

                .tableItem {
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    background-color: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    position: relative;

                    .circle {
                        width: 100px;
                        height: 100px;
                        border-radius: 50%;
                        background-color: #f4f6f9;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        flex-direction: column;

                        &.active {
                            background-color: #878d96; /* 用餐中狀態 */
                        }

                        &.reserved {
                            background-color: #c1c7cd; /* 已訂位狀態 */
                        }

                        &.available {
                            background-color: #f2f4f8; /* 可使用狀態，預設為淺色 */
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

        .reservationArea {
            width: 35%;
            height: 98%;
            border-radius: 10px;
            background-color: #FFFFFF;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            margin-left: 5px;
            position: relative;

            .reservationHeader {
                width: 95%;
                display: flex;
                justify-content: center;
                margin-bottom: 10px;

                button {
                    width: 50%;
                    border: none;
                    border-radius: 10px;
                    background-color: #FFFFFF;
                    font-size: 20px;
                    color: #4D5358;
                    letter-spacing: 5px;
                    padding: 15px;
                    cursor: pointer;

                    &.active {
                        background-color: #DDE1E6;
                    }
                }
            }

            .datePicker {
                width: 95%;
                font-size: 20px;
                color: #343A3F;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;

                button {
                    background: none;
                    border: none;
                    font-size: 25px;
                    color: #697077;
                    cursor: pointer;
                    padding: 10px;
                }
            }

            .reservations {
                width: 95%;
                max-height: 720px;
                overflow: auto;
                border-top: 2.5px solid #DDE1E6;
                display: flex;
                flex-direction: column;
                padding: 15px 0;

                .reminderText {
                    margin-bottom: 10px;
                    color: black;
                    opacity: 0.6;
                }

                .reservationItem {
                    width: 100%;
                    border-radius: 10px;
                    border: 1px solid #697077;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    padding: 13px 10px;
                    margin-bottom: 20px;

                    .customerName {
                        font-size: 20px;
                        letter-spacing: 2px;
                        color: #4D5358;
                    }

                    .customerPhoneAndParty {
                        display: flex;
                        flex-direction: column;

                        .customerPhone {
                            display: flex;
                            align-items: center;
                            font-size: 18px;
                            color: #697077;
                            letter-spacing: 2px;
                            margin-bottom: 10px;

                            i {
                                color: #697077;
                                margin-right: 10px;
                            }
                        }
                        
                        .customerPartySize {
                            display: flex;
                            align-items: center;
                            color: #697077;
                            font-size: 18px;
                            letter-spacing: 2px;

                            i {
                                color: #697077;
                                margin-right: 10px;
                            }
                        }
                    }

                    .tableNumberAndTime {
                        border-radius: 10px;
                        background-color: #DDE1E6;
                        color: #4D5358;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 10px 20px;

                        .tableNumber {
                            font-size: 20px;
                            font-weight: bold;
                            letter-spacing: 2px;
                            margin-bottom: 10px;
                        }

                        .reservationTime {
                            font-size: 16px;
                            font-weight: bold;
                            letter-spacing: 1px;
                        }
                    }

                    .reservationActions {
                        display: flex;
                        flex-direction: column;

                        .checkinArea {
                            color: #697077;
                            font-size: 20px;
                            margin-bottom: 10px;

                            input[type="checkbox"] {
                                margin-right: 5px;
                            }
                        }

                        .cancelArea {
                            color: #697077;
                            font-size: 20px;

                            input[type="checkbox"] {
                                margin-right: 5px;
                            }
                        }
                    }
                }
            }

            .newReservation {
                width: 70%;
                border-radius: 10px;
                background-color: #343A3F;
                color: white;
                text-align: center;
                font-size: 20px;
                letter-spacing: 3px;
                cursor: pointer;
                padding: 15px;
                margin-top: 20px;
                position: absolute;
                bottom: 20px;

                &:hover {
                    background-color: #333;
                }
            }

            .waitlist {
                width: 95%;
                max-height: 720px;
                overflow: auto;
                border-top: 2.5px solid #DDE1E6;
                display: flex;
                flex-direction: column;
                padding: 15px 0;

                .reminderText {
                    margin-bottom: 10px;
                    color: black;
                    opacity: 0.6;
                }

                .waitlistItem {
                    width: 100%;
                    border-radius: 10px;
                    border: 1px solid #697077;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    padding: 13px 10px;
                    margin-bottom: 20px;

                    .customerName {
                        font-size: 20px;
                        letter-spacing: 2px;
                        color: #4D5358;
                    }

                    .customerPhoneAndParty {
                        display: flex;
                        flex-direction: column;

                        .customerPhone {
                            display: flex;
                            align-items: center;
                            font-size: 18px;
                            color: #697077;
                            letter-spacing: 2px;
                            margin-bottom: 10px;

                            i {
                                color: #697077;
                                margin-right: 10px;
                            }
                        }
                        
                        .customerPartySize {
                            display: flex;
                            align-items: center;
                            color: #697077;
                            font-size: 18px;
                            letter-spacing: 2px;

                            i {
                                color: #697077;
                                margin-right: 10px;
                            }
                        }
                    }

                    .tableNumberAndTime {
                        border-radius: 10px;
                        background-color: #DDE1E6;
                        color: #4D5358;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 10px 20px;

                        .tableNumber {
                            font-size: 20px;
                            font-weight: bold;
                            letter-spacing: 2px;
                            margin-bottom: 10px;
                        }

                        .registrationTime {
                            font-size: 16px;
                            font-weight: bold;
                            letter-spacing: 1px;
                        }
                    }

                    .reservationActions {
                        display: flex;
                        flex-direction: column;

                        .checkinArea {
                            color: #697077;
                            font-size: 20px;
                            margin-bottom: 10px;

                            input[type="checkbox"] {
                                margin-right: 5px;
                            }
                        }

                        .cancelArea {
                            color: #697077;
                            font-size: 20px;

                            input[type="checkbox"] {
                                margin-right: 5px;
                            }
                        }
                    }
                }
            }

            .newWaitlist {
                width: 70%;
                border-radius: 10px;
                background-color: #343A3F;
                color: white;
                text-align: center;
                font-size: 20px;
                letter-spacing: 3px;
                cursor: pointer;
                padding: 15px;
                margin-top: 20px;
                position: absolute;
                bottom: 20px;

                &:hover {
                    background-color: #333;
                }
            }
        }
    }
}
</style>