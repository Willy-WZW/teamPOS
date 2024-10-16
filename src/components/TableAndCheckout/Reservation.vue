<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            viewType: 'reservation',
            currentDate: new Date(), // 初始化為當前系統日期
            filteredReservations: [], // 根據日期篩選後的訂位資訊
            reservations: [], // 初始化為空陣列
            selectedDate: new Date(), // 當前選擇的日期
            isSearching: false, // 控制搜尋框的顯示
            searchNumber: '',    // 儲存輸入的查詢
            
            // 訂位 modal
            showReservationModal: false,
            newReservation: {
                people: 2,  // 預設人數為 2
                date: this.formatDate(new Date()), // 預設為當前日期
                time: '',
                name: '', 
                title: '先生', 
                phone: '', 
                email: ''
            },
            availableTimes: [],  // 可用的時間段
            
            // 候位 modal
            showWaitlistModal: false,
            maxWaitlistOrder: 0, // 用來儲存最大候位順序
            newWaitlist: {
                people: 2,  // 預設人數為 2
                date: new Date().toISOString().split('T')[0],  // 預設為當前日期
                time: this.getCurrentTime(), // 設定為當前時間
                name: '', 
                title: '先生', 
                phone: '', 
                email: ''
            },
        };
    },

    mounted() {
        this.currentDate = new Date(); // 初始化為當前系統日期
        this.fetchReservationsByDate(this.currentDate);
        this.fetchAvailableTimes();
        this.fetchMaxWaitlistOrder(); 
    },

    watch: {
        // 當人數或日期變動時，自動調用 API
        'newReservation.people': 'fetchAvailableTimes',
        'newReservation.date': 'fetchAvailableTimes'
    },

    computed: {
        formattedDate() {
            if (this.currentDate instanceof Date && !isNaN(this.currentDate)) {
                // 確保格式化為 YYYY.MM.DD
                const year = this.currentDate.getFullYear();
                const month = String(this.currentDate.getMonth() + 1).padStart(2, '0'); // 月份從0開始
                const day = String(this.currentDate.getDate()).padStart(2, '0');
                return `${year}.${month}.${day}`; // 返回格式為 YYYY.MM.DD
            } else {
                return '日期錯誤';
            }
        },

        dayOfWeek() {
            if (this.currentDate instanceof Date && !isNaN(this.currentDate)) {
                const days = ['日', '一', '二', '三', '四', '五', '六'];
                return days[this.currentDate.getDay()]; // 獲取星期幾
            } else {
                return '';
            }
        },

        filteredReservations() {
            // 先根據當前日期過濾出所有預約
            let reservationsByDate = this.filterReservationsByDate(this.currentDate);

            // 如果有搜尋號碼，則再進行第二次過濾
            if (this.searchNumber) {
                reservationsByDate = reservationsByDate.filter(reservation =>
                    reservation.phone.endsWith(this.searchNumber) // 檢查電話號碼是否以搜尋號碼結尾
                );
            }

            return reservationsByDate; // 返回最終的過濾結果
        }
    },

    methods: {
        // 訂位
        // 日期變化時更新訂位資訊
        changeDate(dayChange) {
            const newDate = new Date(this.currentDate);
            newDate.setDate(newDate.getDate() + dayChange);
            this.currentDate = newDate; // 更新當前日期
            // 確保在更新日期後重新加載訂位資料
            this.fetchReservationsByDate(newDate); // 傳入更新後的 Date 物件
        },

        // 格式化日期
        formatDate(date) {
            if (!(date instanceof Date)) {
                date = new Date(date);
            }
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`; // 格式化為 YYYY-MM-DD
        },

        // 格式化時間
        formatTime(time) {
            if (!time) {
                console.error('無效的時間:', time);
                return '00:00'; // 返回預設值以避免顯示 NaN
            }

            // 將時間轉換為完整的日期格式
            const currentDate = new Date(); // 獲取當前日期
            const [hours, minutes, seconds] = time.split(':'); // 分割時間字符串
            const formattedDateTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hours, minutes, seconds); // 使用當前日期組合完整的日期時間

            // 檢查 date 是否有效
            if (isNaN(formattedDateTime.getTime())) {
                console.error('無效的時間:', time);
                return '00:00'; // 返回預設值以避免顯示 NaN
            }

            const formattedHours = String(formattedDateTime.getHours()).padStart(2, '0'); // 小時
            const formattedMinutes = String(formattedDateTime.getMinutes()).padStart(2, '0'); // 分鐘
            return `${formattedHours}:${formattedMinutes}`; // 返回 HH:mm 格式
        },

        // 篩選的訂位日期
        filterReservationsByDate(date) {
            const formatted = this.formatDate(date); // 格式化當前日期
            console.log('篩選的日期:', formatted);

            const filtered = this.reservations.filter(reservation => {
                const reservationDate = new Date(reservation.date).toISOString().split('T')[0]; // 格式化訂位日期
                console.log('檢查訂位日期:', reservationDate, ' vs 篩選日期:', formatted);
                return reservationDate === formatted; // 比較格式化後的日期
            });

            console.log('篩選後的訂位資料:', filtered);
            return filtered;
        },

        // 開啟電話搜尋欄
        toggleSearch() {
            this.isSearching = !this.isSearching;
            if (!this.isSearching) {
                this.searchNumber = ''; // 如果關閉搜尋，清空輸入框
                this.filteredReservations = []; // 清空結果
            }
        },

        // 自動關閉電話搜尋欄
        handleBlur() {
            // 當輸入框失去焦點時，檢查輸入框的值
            if (this.searchNumber.trim() === '') {
                // 如果輸入框為空，則呼叫日期篩選 API
                this.fetchReservationsByDate(this.currentDate);
                this.isSearching = false; // 隱藏輸入框
            }
        },

        // 根據電話號碼搜尋訂位資訊 API
        async searchReservations() {
            if (this.searchNumber.trim() === '') {
                // 當搜尋欄位為空時，呼叫日期篩選的 API 方法
                await this.fetchReservationsByDate(this.currentDate);
            } else {
                // 如果有輸入，則使用手機號碼搜尋
                try {
                    const response = await axios.get(`http://localhost:8080/reservation/findReservationsByPhoneNumber`, {
                        params: { phoneNumber: this.searchNumber }
                    });

                    let reservations = response.data.reservations;

                    // 確保 reservations 是陣列
                    if (!Array.isArray(reservations)) {
                        reservations = reservations ? [reservations] : [];
                    }

                    // 更新 reservations
                    this.reservations = reservations.map(reservation => ({
                        id: reservation.reservationId,
                        name: reservation.customerName,
                        phone: reservation.customerPhoneNumber,
                        partySize: reservation.reservationPeople,
                        tables: reservation.tableNumbers || [], // 這裡要確保有 tableNumbers
                        date: reservation.reservationDate, // 確保有日期字段
                        time: this.formatTime(reservation.reservationStartTime) // 格式化時間
                    }));

                    console.log('已成功加載搜尋結果:', this.reservations);
                } catch (error) {
                    console.error('無法獲取搜尋結果:', error);
                    Swal.fire('查詢失敗', error.response.data.message || '請稍後再試', 'error');
                    this.reservations = [];
                }
            }
        },

        // 根據日期獲取訂位資訊 API
        async fetchReservationsByDate(date) {
            try {
                const formattedDate = this.formatDate(date);
                const response = await axios.get(`http://localhost:8080/reservation/findReservationsByDate`, {
                    params: { date: formattedDate }
                });

                let reservations = response.data.reservations;

                // 確保 reservations 是陣列
                if (!Array.isArray(reservations)) {
                    reservations = reservations ? [reservations] : [];
                }

                // 更新 reservations
                this.reservations = reservations.map(reservation => ({
                    id: reservation.reservationId,
                    name: reservation.customerName,
                    phone: reservation.customerPhoneNumber,
                    partySize: reservation.reservationPeople,
                    tables: reservation.tableNumbers || [], // 這裡要確保有 tableNumbers
                    date: reservation.reservationDate, // 確保有 date 字段
                    time: this.formatTime(reservation.reservationStartTime) // 格式化時間
                }));

                console.log('已成功加載訂位資料:', this.reservations);

            } catch (error) {
                console.error('無法獲取訂位資料:', error);
                this.reservations = [];
            }
        },

        // 確認報到視窗
        confirmCheckIn(tableNumber, reservationId) {
            Swal.fire({
                title: '請確認客人是否報到！',
                text: `桌號 ${tableNumber} 的報到操作將不可撤銷`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '是的，我要報到！',
                cancelButtonText: '取消'
            }).then((result) => {
                if (result.isConfirmed) {
                    // 如果用戶確認了報到，調用報到 API
                    this.manualCheckIn(tableNumber, reservationId); // 傳遞 reservationId
                }
            });
        },

        // 執行報到API
        async manualCheckIn(tableNumber, reservationId) {
            try {
                const response = await axios.post(`http://localhost:8080/reservation/manualCheckIn`, null, {
                    params: { 
                        tableNumber, 
                        reservationId 
                    }
                });

                // 成功提示
                Swal.fire(
                    '報到成功！',
                    `桌號 ${tableNumber} 已成功報到。`,
                    'success'
                );

                // 刷新訂位列表或更新狀態
                this.fetchReservationsByDate(this.currentDate);
                this.fetchTables(); // 添加這行以刷新桌位
            } catch (error) {
                // 處理錯誤情況
                console.error('報到失敗', error);

                // 顯示錯誤提示
                Swal.fire(
                    '報到失敗',
                    '報到時發生錯誤，請稍後重試。',
                    'error'
                );
            }
        },

        // 確認取消訂位視窗
        confirmCancellation(reservationId) {
            Swal.fire({
                title: '你確定要取消這個訂位嗎？',
                text: '這個操作無法撤銷',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '是的，我要取消！',
                cancelButtonText: '取消'
            }).then((result) => {
                if (result.isConfirmed) {
                    // 如果用戶確認了取消，調用刪除 API
                    this.deleteReservation(reservationId);
                }
            });
        },

        // 取消訂位API
        async deleteReservation(reservationId) {
            try {
                const response = await axios.delete(`http://localhost:8080/reservation/cancelReservation`, {
                    params: { reservationId }
                });

                // 成功提示
                Swal.fire(
                    '取消成功！',
                    '該訂位已被成功取消。',
                    'success'
                );

                // 刷新訂位列表
                this.fetchReservationsByDate(this.currentDate);
            } catch (error) {
                // 處理錯誤情況
                console.error('取消訂位失敗', error);

                // 顯示錯誤提示
                Swal.fire(
                    '取消失敗',
                    '取消訂位時發生錯誤，請稍後重試。',
                    'error'
                );
            }
        },

        // 訂位 modal
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
                    this.fetchReservationsByDate(this.currentDate);
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

        // 候位 modal
        // 關閉候位視窗
        closeWaitlistModal() {
            this.showWaitlistModal = false
        },

        // 格式化當前時間
        getCurrentTime() {
            const now = new Date();
            // 將時間格式化為 HH:MM:SS 的格式
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`; // 返回 HH:MM:SS 格式
        },

        // 獲取最大候位順序
        async fetchMaxWaitlistOrder() {
            try {
                const response = await axios.get('http://localhost:8080/waitlist/getMaxWaitlistOrder'); // 使用你的 API 路徑
                this.maxWaitlistOrder = response.data; // 更新最大候位順序
            } catch (error) {
                console.error('獲取最大候位順序失敗:', error);
                Swal.fire({
                    icon: 'error',
                    title: '錯誤',
                    text: '獲取最大候位順序！',
                });
            }
        },

        // 儲存候位API
        async addWaitlist() {
            // 將要傳送的數據格式化
            const waitlistData = {
                customerName: this.newWaitlist.name,
                customerPhoneNumber: this.newWaitlist.phone,
                customerEmail: this.newWaitlist.email,
                customerGender: this.newWaitlist.title,
                waitListPeople: this.newWaitlist.people,
                waitingDate: this.newWaitlist.date,
                waitTime: this.newWaitlist.time
            };

            try {
                const response = await axios.post('http://localhost:8080/waitlist/registerWaitlist', waitlistData); // 儲存候位的 API
                console.log('候位提交成功:', response.data);
                Swal.fire({
                    title: '候位成功',
                    text: '您的候位已確認',
                    icon: 'success',
                    confirmButtonText: '確定'
                });
                this.closeWaitlistModal();
            } catch (error) {
                console.error('候位提交失敗:', error);
                Swal.fire({
                    icon: 'error',
                    title: '錯誤',
                    text: '候位提交失敗！',
                });
            }
        }
    },
};
</script>

<template>
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
                    <input type="checkbox" id="checkin_{{ reservation.id }}" name="checkin" @click="confirmCheckIn(reservation.tables[0], reservation.id)" />
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

<div v-if="showWaitlistModal" class="waitlistModal" @click="closeWaitlistModal">
    <div class="modalContent" @click.stop>
        <!-- 候位區域 -->
        <div class="waitlistInfoArea">
            <h3 class="waitlistInfoTitle">候位資訊</h3>
        
            <div class="partySizeAndDateArea">
                <!-- 人數選擇 -->
                <div class="partySizeArea">
                    <label for="partySize">人數</label>
                    <select v-model="newWaitlist.people">
                        <option disabled value="">選擇人數</option>
                        <option v-for="n in 20" :key="n" :value="n">{{ n }}</option>
                    </select>
                </div>
                
                <!-- 日期選擇 -->
                <div class="dateArea">
                    <label for="date">日期</label>
                    <input type="date" v-model="newWaitlist.date" />
                </div>
            </div>
            
            <div class="timeAndOrderArea">
                <!-- 時段選擇 -->
                <div class="timeArea">
                    <label for="time">時間</label>
                    <input class="timeInput" type="time" v-model="newWaitlist.time" />
                </div>

                <!-- 候位順序 -->
                <div class="orderArea">
                    <label for="order">前方候位組數</label>
                    <input type="text" :value="maxWaitlistOrder" readonly />
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
                    <input type="text" v-model="newWaitlist.name" />
                </div>
                <!-- 稱謂選擇 -->
                <div class="titleArea">
                    <label>
                        <input type="radio" v-model="newWaitlist.title" value="先生" /> 先生
                    </label>
                    <label>
                        <input type="radio" v-model="newWaitlist.title" value="小姐" /> 小姐
                    </label>
                    <label>
                        <input type="radio" v-model="newWaitlist.title" value="其他" /> 其他
                    </label>
                </div>
            </div>


            <!-- 電話號碼 -->
            <div class="phoneArea">
                <label for="phone">電話號碼</label>
                <input type="text" v-model="newWaitlist.phone" />
            </div>

            <!-- 電子郵件 -->
            <div class="mailArea">
                <label for="email">電子郵件Email</label>
                <input type="email" v-model="newWaitlist.email" />
            </div>
        </div>
    
        <!-- 按鈕 -->
        <div class="buttonArea">
            <button class="cancelButton" @click="closeWaitlistModal">取消</button>
            <button class="addButton" @click="addWaitlist">確認</button>
        </div>
    </div>
</div>
</template>

<style scoped lang="scss">
.reservationArea {
    width: 35%;
    height: 100%;
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
        width: 100%;
        max-height: 720px;
        overflow: auto;
        border-top: 2.5px solid #DDE1E6;
        display: flex;
        flex-direction: column;
        padding: 10px 0;

        .reminderAndSearchArea {
            width: 100%;
            padding: 13px 10px;
            margin-bottom: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center; /* 垂直居中對齊 */

            .reminderText {
                font-size: 17px;
                color: black;
                opacity: 0.6;
            }

            .phoneSearch {
                background: transparent;
                border: none;
                font-size: 20px;
                color: #697077;
                cursor: pointer;
                margin-right: 10px;
            }

            .searchInput {
                width: 250px;
                border: 1px solid #ccc;
                border-radius: 10px;
                border-radius: 4px;
                font-size: 17px;
                text-indent: 10px;
                outline: none;
                padding: 5px;
            }
        }

        .reservationItem {
            width: 100%;
            border-radius: 10px;
            border: 1px solid #697077;
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 13px 5px;
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
                    margin-bottom: 15px;

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
                width: 25%;
                border-radius: 10px;
                background-color: #DDE1E6;
                color: #4D5358;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;

                .tableNumbers {
                    font-size: 18px;
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
                    margin-bottom: 15px;

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
        width: 100%;
        max-height: 720px;
        overflow: auto;
        border-top: 2.5px solid #DDE1E6;
        display: flex;
        flex-direction: column;
        padding: 10px 0;

        .reminderAndSearchArea {
            width: 100%;
            padding: 13px 10px;
            margin-bottom: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center; /* 垂直居中對齊 */

            .reminderText {
                font-size: 17px;
                color: black;
                opacity: 0.6;
            }

            .phoneSearch {
                background: transparent;
                border: none;
                font-size: 20px;
                color: #697077;
                cursor: pointer;
                margin-right: 10px;
            }

            .searchInput {
                width: 250px;
                border: 1px solid #ccc;
                border-radius: 10px;
                border-radius: 4px;
                font-size: 17px;
                text-indent: 10px;
                outline: none;
                padding: 5px;
            }
        }

        .waitlistItem {
            width: 100%;
            border-radius: 10px;
            border: 1px solid #697077;
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 13px 5px;
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
                    margin-bottom: 25px;

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
                width: 25%;
                border-radius: 10px;
                background-color: #DDE1E6;
                color: #4D5358;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;

                .tableNumbers {
                    font-size: 18px;
                    font-weight: bold;
                    letter-spacing: 2px;
                    margin-bottom: 20px;
                }

                .registrationTime {
                    font-size: 16px;
                    font-weight: bold;
                    letter-spacing: 1px;
                }
            }

            .waitPositionAndTime {
                display: flex;
                flex-direction: column;

                .waitPosition {
                    color: #697077;
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }

                .checkinArea {
                    color: #697077;
                    font-size: 18px;
                    margin-bottom: 10px;

                    input[type="checkbox"] {
                        margin-right: 5px;
                    }
                }

                .cancelArea {
                    color: #697077;
                    font-size: 18px;

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
        height: 70%;
        border-radius: 10px;
        background: white;
        padding: 20px;

        .waitlistInfoArea {
            width: 100%;
            height: 40%;

            .waitlistInfoTitle {
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

            .timeAndOrderArea {
                height: 35%;
                display: flex;
                justify-content: space-between;
                padding: 10px;

                .timeArea {
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
                        width: 65%;
                        height: 35px;
                        border-radius: 10px;
                        border: 1px solid #C1C7CD;
                        text-indent: 3px;
                        outline: none;
                        cursor: pointer;
                    }
                }

                .orderArea {
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
                        text-indent: 5px;
                        outline: none;
                        cursor: pointer;
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