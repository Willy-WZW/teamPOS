<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            showWaitlistModal: false,
        };
    },

    methods: {
        // 關閉後位 model 視窗
        closeWaitlistModal() {
            this.showWaitlistModal = false
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
                    <div class="refreshTimeSlotsArea">
                        <!-- 時段選擇 -->
                        <div class="timeSlotsArea">
                            <label for="time">時段</label>
                            <select class="selectedTime" v-model="newReservation.time" id="time">
                                <option disabled value="">選擇時段</option>
                                <option v-for="time in availableTimes" :key="time.startTime" :value="time.startTime">
                                    {{ time.startTime }}
                                </option>
                            </select>
                        </div>
                        <button class="refreshButton" @click="refresh">
                            <i class="fa-solid fa-arrows-rotate"></i>刷新
                        </button>
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
                    <button :class="{ active: viewType === 'reservation' }" @click="viewType = 'reservation'">
                        訂位
                    </button>
                    <button :class="{ active: viewType === 'waitlist' }" @click="viewType = 'waitlist'">
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
                    <!-- 注意事項與搜尋欄 -->
                    <div class="reminderAndSearchArea">
                        <p class="reminderText">時間為訂位時間</p>
                        <button class="phoneSearch" @click="toggleSearch" v-if="!isSearching">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </button>
                        <input v-if="isSearching" type="search" v-model="searchNumber" placeholder="請輸入電話號碼 (末三碼)" 
                            @input="searchReservations" @blur="handleBlur" class="searchInput" ref="searchInput"/>
                    </div>
                    
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
                            <div class="tableNumbers">{{ reservation.tables.join(', ') }}</div> <!-- 顯示所有桌號 -->
                            <div class="reservationTime">{{ reservation.time }}</div>
                        </div>
        
                        <!-- 報到與取消 -->
                        <div class="reservationActions">
                            <div class="checkinArea">
                                <input type="checkbox" id="checkin_{{ reservation.id }}" name="checkin" @click="confirmCheckIn(reservation.tables[0])" />
                                <label for="checkin_{{ reservation.id }}">報到</label>
                            </div>
                            <div class="cancelArea">
                                <!-- 當取消勾選時調用 confirmCancellation 方法 -->
                                <input type="checkbox" id="cancel_{{ reservation.id }}" name="cancel" @click="confirmCancellation(reservation.id)" />
                                <label for="cancel_{{ reservation.id }}">取消</label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 開啟訂位 model 視窗 button -->
                <button v-if="viewType === 'reservation'" class="newReservation" @click="showReservationModal = true">
                    <i class="fa-solid fa-plus"></i>
                    新增訂位
                </button>

                <!-- 現場候位顯示區域 -->
                <div v-if="viewType === 'waitlist'" class="waitlist">
                    <!-- 注意事項與搜尋欄 -->
                    <div class="reminderAndSearchArea">
                        <p class="reminderText">時間為登記時間</p>
                        <button class="phoneSearch" @click="toggleSearch" v-if="!isSearching">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </button>
                        <input v-if="isSearching" type="search" v-model="searchNumber" placeholder="請輸入電話號碼 (末三碼)" 
                            @input="searchReservations" @blur="handleBlur" class="searchInput" ref="searchInput"/>
                    </div>

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
                            <div class="tableNumbers">{{ wait.table }}</div>
                            <div class="registrationTime">{{ wait.registrationTime }}</div>
                        </div>

                        <!-- 候位順序 -->
                        <div class="waitPositionAndTime">
                            <div class="waitPosition">候位 {{ wait.position }}</div>
                            <div class="checkinArea">
                                <input type="checkbox" id="checkin_{{ reservation.id }}" name="checkin" @click="confirmCheckIn(reservation.tables[0])" />
                                <label for="checkin_{{ reservation.id }}">報到</label>
                            </div>
                            <div class="cancelArea">
                                <!-- 當取消勾選時調用 confirmCancellation 方法 -->
                                <input type="checkbox" id="cancel_{{ reservation.id }}" name="cancel" @click="confirmCancellation(reservation.id)" />
                                <label for="cancel_{{ reservation.id }}">取消</label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 開啟候位 model 視窗 button -->
                <button v-if="viewType === 'waitlist'" class="newWaitlist" @click="showWaitlistModal = true">
                    <i class="fa-solid fa-plus"></i>
                    新增候位
                </button>
            </div>

            <!-- 結帳側邊欄區域 -->
            <div v-if="selectedTable" class="sidebarArea">
                <!-- 黑色背景層 -->
                <div class="sidebarBackground" @click="closePanel"></div>

                <!-- 側邊欄 -->
                <div class="sidebar">
                    <div class="sideHeader">

                        <!-- 返回鍵、結帳明細 -->
                        <div class="titleArea">
                            <i class="fa-solid fa-chevron-right" @click="closePanel"></i>
                            <h2>結帳明細</h2>
                        </div>

                        <!-- 桌號、訂單編號、會員電話 -->
                        <div class="dataArea">
                            <!-- 桌號 -->
                            <div class="tableNumber">{{ selectedTable.id }}</div>

                            <!-- 訂單編號 -->
                            <div class="orderNumber">
                                <p>訂單編號</p>
                                {{ ordersId }} {{ selectedTable.name }}
                            </div>

                            <!-- 會員電話輸入框 
                        <div class="memberArea">
                            <div class="memberPhone">
                                <input type="search" class="phoneInput" placeholder="輸入會員電話" v-model="memberPhoneNumber"/>
                                <button class="searchButton" @click="searchMember"><i class="fa-solid fa-search"></i></button>
                            </div>
                            <div v-if="memberDiscount" class="memberDiscount">
                                <span>黃金會員 {{ memberDiscount }} 折</span>
                            </div>
                        </div>-->
                        </div>
                    </div>

                    <div class="sideBody">

                        <!-- 明細、金額區域 -->
                        <div class="detailSection">

                            <!-- 餐點明細 -->
                            <div class="orderDetails">
                                <h3 class="orderTitle">餐點明細</h3>
                                <div v-for="(item, index) in orderItems" :key="index" class="orderItem">
                                    <div class="itemInfo">

                                        <!-- 餐點名稱 -->
                                        <div class="orderName">{{ item.name }}</div>

                                        <!-- 餐點細項 -->
                                        <ul v-if="item.notes && item.notes.length">
                                            <li v-for="(note, idx) in item.notes" :key="idx">{{ note }}</li>
                                        </ul>
                                    </div>
                                    <div class="itemPrice">$ {{ item.price }}</div>
                                </div>
                            </div>

                            <!-- 總金額、折扣與小計 -->
                            <div class="totalSummary">
                                <div class="totalPrice">
                                    <p>總金額</p>
                                    $ {{ total }}
                                </div>
                                <!-- <div class="priceDiscount">
                                <p>折扣</p>
                                黃金會員 {{ memberDiscount || 100 }} 折
                            </div> -->
                                <div class="summary">
                                    <p>小計</p>
                                    $ {{ subtotal }}
                                </div>
                            </div>
                        </div>

                        <!-- 付款方式 -->
                        <div class="paymentSection">
                            <h3 class="paymentTitle">選擇付款方式</h3>
                            <select class="paymentSelect" v-model="paymentMethod">
                                <option value="creditCard">信用卡</option>
                                <option value="cash">現金</option>
                            </select>

                            <!-- 信用卡表單 -->
                            <div v-if="paymentMethod === 'creditCard'" class="creditCardForm">

                                <!--<div>
                                <label>卡號</label>
                                <input type="text" v-model="creditCardInfo.cardNumber" />
                            </div>
                            <div>
                                <label>持卡人姓名</label>
                                <input type="text" v-model="creditCardInfo.cardHolder" />
                            </div>
                            <div>
                                <label>卡片到期日</label>
                                <input type="text" v-model="creditCardInfo.expiryDate" />
                            </div>
                            <div>
                                <label>確認碼</label>
                                <input type="text" v-model="creditCardInfo.cvv" />
                            </div>
                            -->
                                <button class="confirmButton" @click="confirmPayment(this.ordersId)">確認付款</button>
                            </div>

                            <!-- 現金付款表單 -->
                            <div v-if="paymentMethod === 'cash'" class="cashForm">
                                <div>
                                    <input type="number" placeholder="輸入收取金額" v-model="receivedAmount"
                                        @input="calculateChange" 
                                        @keypress="onlyNumbers"/>
                                </div>
                                <div class="cashSummary">
                                    <div class="payment">
                                        <p>付款</p>
                                        $ {{ receivedAmount }}
                                    </div>
                                    <div class="summary">
                                        <p>訂單金額</p>
                                        $ {{ subtotal }}
                                    </div>
                                    <div class="change">
                                        <p>找零</p>
                                        $ {{ change }}
                                    </div>
                                </div>

                                <button class="confirmButton" @click="confirmPayment(this.ordersId)">確認付款</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 新增訂位 Modal -->
            <div v-if="showReservationModal" class="reservationModal" @click="closeReservationModal">
            <div class="modalContent" @click.stop>
                <!-- 訂位區域 -->
                <div class="reserveInfoArea">
                    <h3 class="reserveInfoTitle">訂位資訊</h3>
                
                    <div class="partySizeAndDateArea">
                        <!-- 人數選擇 -->
                        <div class="partySizeArea">
                            <label for="partySize">人數</label>
                            <select v-model="newReservation.partySize">
                                <option disabled value="">選擇人數</option>
                                <option v-for="n in 20" :key="n" :value="n">{{ n }}</option>
                            </select>
                        </div>

                            <!-- 日期選擇 -->
                            <div class="dateArea">
                                <label for="date">日期</label>
                                <input type="date" v-model="newReservation.date" />
                            </div>
                        </div>


                        <!-- 時段選擇 -->
                        <div class="timeSlotsArea">
                            <label for="time">時段</label>
                            <div class="timeButtonArea">
                                <button v-for="time in availableTimes" :key="time.startTime"
                                    :class="{ selected: newReservation.time === time.startTime }"
                                    @click="newReservation.time = time.startTime">
                                    {{ time.startTime }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 聯絡資料 -->
                    <div class="contactInfoArea">
                        <h3 class="contactInfoTitle">聯絡資料</h3>

                        <div class="nameAndTitleArea">
                            <!-- 訂位人姓名 -->
                            <div class="nameArea">
                                <label for="name">訂位人姓名</label>
                                <input type="text" v-model="newReservation.name" />
                            </div>
                            <!-- 稱謂選擇 -->
                            <div class="titleArea">
                                <label>
                                    <input type="radio" v-model="newReservation.title" value="先生" /> 先生
                                </label>
                                <label>
                                    <input type="radio" v-model="newReservation.title" value="小姐" /> 小姐
                                </label>
                                <label>
                                    <input type="radio" v-model="newReservation.title" value="其他" /> 其他
                                </label>
                            </div>
                        </div>


                        <!-- 電話號碼 -->
                        <div class="phoneArea">
                            <label for="phone">電話號碼</label>
                            <input type="text" v-model="newReservation.phone" />
                        </div>

                        <!-- 電子郵件 -->
                        <div class="mailArea">
                            <label for="email">電子郵件Email</label>
                            <input type="email" v-model="newReservation.email" />
                        </div>
                    </div>

                    <!-- 按鈕 -->
                    <div class="buttonArea">
                        <button class="cancelButton" @click="closeReservationModal">取消</button>
                        <button class="addButton" @click="addReservation">確認</button>
                    </div>
                </div>
            </div>

            <!-- 新增候位 Modal -->
            <div v-if="showWaitlistModal" class="waitlistModal" @click="closeWaitlistModal">
            <div class="modalContent" @click.stop>
                <!-- 訂位區域 -->
                <div class="reserveInfoArea">
                    <h3 class="reserveInfoTitle">訂位資訊</h3>
                
                    <div class="partySizeAndDateArea">
                        <!-- 人數選擇 -->
                        <div class="partySizeArea">
                            <label for="partySize">人數</label>
                            <select v-model="newReservation.partySize">
                                <option disabled value="">選擇人數</option>
                                <option v-for="n in 20" :key="n" :value="n">{{ n }}</option>
                            </select>
                        </div>

                            <!-- 日期選擇 -->
                            <div class="dateArea">
                                <label for="date">日期</label>
                                <input type="date" v-model="newReservation.date" />
                            </div>
                        </div>


                        <!-- 時段選擇 -->
                        <div class="timeSlotsArea">
                            <label for="time">時段</label>
                            <div class="timeButtonArea">
                                <button v-for="time in availableTimes" :key="time.startTime"
                                    :class="{ selected: newReservation.time === time.startTime }"
                                    @click="newReservation.time = time.startTime">
                                    {{ time.startTime }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 聯絡資料 -->
                    <div class="contactInfoArea">
                        <h3 class="contactInfoTitle">聯絡資料</h3>

                        <div class="nameAndTitleArea">
                            <!-- 訂位人姓名 -->
                            <div class="nameArea">
                                <label for="name">訂位人姓名</label>
                                <input type="text" v-model="newReservation.name" />
                            </div>
                            <!-- 稱謂選擇 -->
                            <div class="titleArea">
                                <label>
                                    <input type="radio" v-model="newReservation.title" value="先生" /> 先生
                                </label>
                                <label>
                                    <input type="radio" v-model="newReservation.title" value="小姐" /> 小姐
                                </label>
                                <label>
                                    <input type="radio" v-model="newReservation.title" value="其他" /> 其他
                                </label>
                            </div>
                        </div>


                        <!-- 電話號碼 -->
                        <div class="phoneArea">
                            <label for="phone">電話號碼</label>
                            <input type="text" v-model="newReservation.phone" />
                        </div>

                        <!-- 電子郵件 -->
                        <div class="mailArea">
                            <label for="email">電子郵件Email</label>
                            <input type="email" v-model="newReservation.email" />
                        </div>
                    </div>

                    <!-- 按鈕 -->
                    <div class="buttonArea">
                        <button class="cancelButton" @click="closeReservationModal">取消</button>
                        <button class="addButton" @click="addReservation">確認</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.waitlistModal {
    width: 100dvw;
    height: 100dvh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;

    .modalContent {
        width: 50%;
        height: 75%;
        border-radius: 10px;
        background: white;
        padding: 20px;

        .reserveInfoArea {
            width: 100%;
            height: 40%;

            .reserveInfoTitle {
                font-size: 20px;
                letter-spacing: 3px;
                margin-bottom: 8px;
            }

            .partySizeAndDateArea {
                height: 35%;
                border-top: 2px solid #C1C7CD;
                display: flex;
                justify-content: space-between;
                padding: 10px;

                .partySizeArea {
                    width: 50%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;

                    label {
                        font-size: 17px;
                        letter-spacing: 4px;
                        margin-bottom: 5px;
                    }

                    select {
                        width: 65%;
                        height: 35px;
                        border-radius: 10px;
                        border: 1px solid #C1C7CD;
                        letter-spacing: 5px;
                        padding-left: 10px;
                        appearance: none;
                        /* 隱藏默認的箭頭 */
                        background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjcxNzUgNi41NDc1QzEzLjE3OTcgNi4xNDcyIDEzLjI4MjIgNS40MTMgMTIuOTg3MiA0LjkzMjVDMTIuNjkzMiA0LjQ1MjUgMTIuMDEwNCA0LjQ1MjUgMTEuNzE3IDQuOTMyNUw4IDkuMzM1NEw0LjI4MjUgNC45MzI1QzMuOTg5NiA0LjQ1MjUgMy4zMDY4IDQuNDUyNSAyLjAxMjggNC45MzI1QzEuNzE4OCA1LjQxMyAxLjgyMTEgNi4xNDcyIDIuMjg0MTIgNi41NDc1TDcuMzE1MTIgMTEuNTA2QzcuNzU4NDEgMTEuOTYxIDguMjQxNiAxMS45NjEgOC42ODY4IDExLjUwNkMxMC4xNzA4IDEwLjI1NyAxMS41OTExIDguOTAzNTggMTIuNzE3NSA3LjY2MjVIMTIuNzE3NVoiIGZpbGw9IiMyMjIyMjIiLz4KPC9zdmc+') no-repeat;
                        /* 使用 base64 格式的箭頭圖標 */
                        background-position: calc(100% - 15px) center;
                        /* 調整箭頭的位置，讓它距離左邊更近 */
                        background-size: 15px;
                        /* 調整箭頭大小 */
                        outline: none;
                        cursor: pointer;
                    }
                }

                .dateArea {
                    width: 35%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;

                    label {
                        font-size: 17px;
                        letter-spacing: 4px;
                        margin-bottom: 5px;
                    }

                    input {
                        width: 90%;
                        height: 35px;
                        border-radius: 10px;
                        border: 1px solid #C1C7CD;
                        text-indent: 3px;
                        outline: none;
                        cursor: pointer;
                    }
                }
            }

            .timeSlotsArea {
                width: 100%;
                height: 40%;
                overflow-x: scroll;
                display: flex;
                flex-direction: column;
                padding: 10px;

                label {
                    font-size: 17px;
                    letter-spacing: 4px;
                    margin-bottom: 25px;
                }

                .timeButtonArea {
                    display: flex;
                    justify-content: space-between;

                    button {
                        border: none;
                        border-radius: 10px;
                        background-color: #E5E8EB;
                        font-size: 16px;
                        padding: 15px 25px;
                        cursor: pointer;

                        &.selected {
                            background-color: #4D5358;
                            color: #FFFFFF;
                        }
                    }
                }
            }
        }

        .contactInfoArea {
            width: 100%;
            height: 45%;

            .contactInfoTitle {
                font-size: 20px;
                letter-spacing: 3px;
                margin-bottom: 8px;
            }

            .nameAndTitleArea {
                height: 30%;
                border-top: 2px solid #C1C7CD;
                display: flex;
                padding: 10px;

                .nameArea {
                    width: 50%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;

                    label {
                        font-size: 17px;
                        letter-spacing: 4px;
                        margin-bottom: 5px;
                    }

                    input {
                        width: 90%;
                        height: 35px;
                        border-radius: 10px;
                        border: 1px solid #C1C7CD;
                        text-indent: 5px;
                        letter-spacing: 3px;
                        outline: none;
                        cursor: pointer;
                    }
                }

                .titleArea {
                    width: 35%;
                    height: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 20px;

                    label {
                        font-size: 17px;
                        letter-spacing: 4px;
                        display: flex;
                        align-items: center;
                        margin-right: 10px;
                    }

                    input[type="radio"] {
                        margin-right: 10px;
                        cursor: pointer;
                    }
                }
            }

            .phoneArea {
                width: 100%;
                height: 30%;
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                padding: 10px;

                label {
                    font-size: 17px;
                    letter-spacing: 4px;
                    margin-bottom: 5px;
                }

                input {
                    width: 70%;
                    height: 35px;
                    border-radius: 10px;
                    border: 1px solid #C1C7CD;
                    text-indent: 5px;
                    letter-spacing: 3px;
                    outline: none;
                    cursor: pointer;
                }
            }

            .mailArea {
                width: 100%;
                height: 30%;
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                padding: 10px;

                label {
                    font-size: 17px;
                    letter-spacing: 4px;
                    margin-bottom: 5px;
                }

                input {
                    width: 70%;
                    height: 35px;
                    border-radius: 10px;
                    border: 1px solid #C1C7CD;
                    text-indent: 5px;
                    letter-spacing: 3px;
                    outline: none;
                    cursor: pointer;
                }
            }
        }

        .buttonArea {
            display: flex;
            justify-content: space-evenly;
            align-items: center;
            margin-top: 15px;

            .cancelButton {
                border: none;
                border-radius: 10px;
                background-color: #DDE1E6;
                font-size: 15px;
                letter-spacing: 3px;
                margin-top: 15px;
                padding: 15px 140px;
                cursor: pointer;
                color: #21272A;
            }

            .addButton {
                border: none;
                border-radius: 10px;
                background-color: #343A3F;
                font-size: 15px;
                letter-spacing: 3px;
                padding: 15px 140px;
                margin-top: 15px;
                cursor: pointer;
                color: white;
            }
        }
    }
}
</style>