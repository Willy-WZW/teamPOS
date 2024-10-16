<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            newReservation: {
                people: 2,  // 預設人數為 2
                date: new Date().toISOString().split('T')[0],  // 預設為當前日期
                time: '',
                name: '', 
                title: '先生', 
                phone: '', 
                email: ''
            },
            availableTimes: [],  // 可用的時間段
        };
    },

    mounted() {
        // 頁面載入時自動調用 API，載入當前日期和人數的可用時間段
        this.fetchAvailableTimes();
    },

    watch: {
        // 當人數或日期變動時，自動調用 API
        'newReservation.people': 'fetchAvailableTimes',
        'newReservation.date': 'fetchAvailableTimes'
    },

    methods: {
        // 關閉訂位視窗
        closeReservationModal() {
            this.showReservationModal = false
        },

        // 可用的訂位時間段 API
        async fetchAvailableTimes() {
            try {
                // 設置日期和用餐人數的參數
                const reservationDate = this.newReservation.date;
                const reservationPeople = this.newReservation.people;

                // 發送請求到後端 API
                const response = await axios.get('http://localhost:8080/reservation/getAvailableTimeSlots', {
                    params: {
                        reservationDate: reservationDate,
                        reservationPeople: reservationPeople
                    }
                });

                // 使用返回的 availableTimeSlots 資料
                if (response.data && response.data.availableTimeSlots) {
                    this.availableTimes = response.data.availableTimeSlots.map(timeSlot => ({
                        startTime: timeSlot.startTime,
                        endTime: timeSlot.endTime,
                        available: timeSlot.available
                    }));
                } else {
                    this.availableTimes = [];
                    console.warn('訂位已滿沒有可選取的時段！');
                    Swal.fire({
                        icon: 'warning',
                        title: '下次請早',
                        text: '訂位已滿沒有可選取的時段！',
                    });
                }

                console.log('可用時段:', this.availableTimes);
            } catch (error) {
                console.error('無法獲取可用時段:', error);
                Swal.fire({
                    icon: 'error',
                    title: '錯誤',
                    text: '無法獲取可用時段！',
                });
            }
        },

        // 儲存訂位API
        async addReservation() {
            // 找到用戶選擇的時間段
            const selectedTimeSlot = this.availableTimes.find(time => time.startTime === this.newReservation.time);

            // 組裝訂位資料，使用從後端獲得的時間段結束時間
            const reservationData = {
                customerName: this.newReservation.name,
                customerPhoneNumber: this.newReservation.phone,
                customerEmail: this.newReservation.email,
                customerGender: this.newReservation.title, // 先生, 小姐, 或 其他
                reservationPeople: this.newReservation.people, // 注意：這裡改為 people，對應你表單中的命名
                reservationDate: this.newReservation.date,
                reservationStartTime: selectedTimeSlot.startTime, // 選擇的開始時間
                reservationEndingTime: selectedTimeSlot.endTime // 直接使用後端提供的結束時間
            };

            // 在這裡打印出準備發送的資料
            console.log('即將發送的訂位資料:', reservationData);

            try {
                // 發送 POST 請求到後端 API
                const response = await axios.post('http://localhost:8080/reservation/saveReservation', reservationData);

                if (response.status === 200) {
                    Swal.fire({
                        title: '訂位成功',
                        text: '您的訂位已確認',
                        icon: 'success',
                        confirmButtonText: '確定'
                    });
                    this.closeReservationModal();
                } else {
                    Swal.fire({
                        title: '訂位失敗',
                        text: response.data.message,
                        icon: 'error',
                        confirmButtonText: '確定'
                    });
                }
            } catch (error) {
                console.error('無法保存訂位:', error);
                Swal.fire({
                    title: '訂位失敗',
                    text: '發送訂位時發生錯誤',
                    icon: 'error',
                    confirmButtonText: '確定'
                });
            }
        },
    },
};
</script>

<template>
<div v-if="showReservationModal" class="reservationModal" @click="closeReservationModal">
    <div class="modalContent" @click.stop>
        <!-- 訂位區域 -->
        <div class="reserveInfoArea">
            <h3 class="reserveInfoTitle">訂位資訊</h3>
        
            <div class="partySizeAndDateArea">
                <!-- 人數選擇 -->
                <div class="partySizeArea">
                    <label for="partySize">人數</label>
                    <select v-model="newReservation.people">
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
                    <!-- 根據 available 狀態來顯示可用的時段 -->
                    <button 
                        v-for="time in availableTimes" 
                        :key="time.startTime" 
                        :class="{ selected: newReservation.time === time.startTime, disabled: !time.available }" 
                        @click="newReservation.time = time.startTime" 
                        :disabled="!time.available">
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
</template>

<style scoped lang="scss">
.reservationModal {
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

                    button {
                        border: none;
                        border-radius: 10px;
                        background-color: #E5E8EB;
                        font-size: 16px;
                        padding: 15px 25px;
                        margin-right: 15px;
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