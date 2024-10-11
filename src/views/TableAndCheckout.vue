<script>
import LeftBar from "@/components/LeftBar.vue";
import interact from 'interactjs';
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    data () {
        return {
            // 桌位資訊 tableArea 數據
            isDragging: false,   // 用來追踪是否是拖動動作
            tables: [],

            // 點擊桌位側邊欄 tableSlider 數據
            selectedTable: null, // 存儲被選擇的桌位
            memberPhoneNumber: '', // 會員電話號碼
            memberDiscount: null, // 會員折扣
            ordersId: "", //訂單編號
            orderItems: [],
            total: 0,
            // discount: 18,  // 假設折扣
            subtotal: 0,
            paymentMethod: 'creditCard', // 預設付款方式
            creditCardInfo: {
                cardNumber: '',
                cardHolder: '',
                expiryDate: '',
                cvv: ''
            },
            receivedAmount: 0, // 收取的金額
            change: 0, // 找零

            // 訂位資訊 reservationArea 數據
            viewType: 'reservation',
            currentDate: new Date(), // 初始化為當前系統日期
            filteredReservations: [], // 根據日期篩選後的訂位資訊
            reservations: [], // 初始化為空陣列
            selectedDate: new Date(), // 當前選擇的日期

            // 訂位資訊
            newReservation: {
            partySize: 2,  // 人數
            date: this.formatDate(new Date()), // 預設日期為當前日期
            time: '',       // 時段
            name: '',       // 訂位人姓名
            title: '先生',  // 預設稱謂
            phone: '',      // 電話號碼
            email: ''       // 電子郵件
            },
            availableTimes: [], // 可選時段
            showReservationModal: false,
            
            // 現場候位 waitlist 數據
            filteredWaitlist: [], // 根據日期篩選後的候位資訊（稍後初始化）
            waitlist: [
                { id: 1, name: '翁千沛', phone: '0911223345', table: 'A01', registrationTime: '12:00', position: 1, partySize: 4 },
                { id: 2, name: '王政蔚', phone: '0911223345', table: 'A02', registrationTime: '12:30', position: 2, partySize: 2 },
                { id: 3, name: '黃冠霖', phone: '0911223345', table: 'A03', registrationTime: '13:00', position: 3, partySize: 12 }
            ],
        };
    },

    components: {
        LeftBar,
    },

    mounted() {
        // 從 LocalStorage 中獲取用餐時間
        const storedDiningDuration = localStorage.getItem('diningDuration');
        if (storedDiningDuration) {
            this.diningDuration = JSON.parse(storedDiningDuration); // 將儲存的資料轉換為數字
            console.log('從 LocalStorage 獲取的用餐時間:', this.diningDuration);
        }

        this.fetchTables().then(() => {
            this.$nextTick(() => {
                this.restoreTablePositions(); // 確保 DOM 渲染完成後再還原桌位位置
            });
        });

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
            },

            modifiers: [
                interact.modifiers.restrict({
                    restriction: '.tableGrid', // 限制桌位只能在 tableGrid 容器內移動
                    endOnly: true, // 僅在拖動結束時生效
                    elementRect: { top: 0, left: 0, bottom: 1, right: 1 } // 元素邊界
                })
            ]
        });

        // 加載當前日期的可預訂時間和訂位資訊
        this.currentDate = new Date(); // 初始化為當前系統日期
        this.fetchAvailableTimes();
        this.fetchReservationsByDate(this.currentDate);
    },

    watch: {
        'newReservation.date': 'fetchAvailableTimes',  // 監聽日期變化，當變化時調用 fetchAvailableTimes
        'diningDuration': 'fetchAvailableTimes',      // 當用餐時長變化時，也可以自動調用
        'newReservation.partySize': 'fetchAvailableTimes',
        reservations(newReservations) {
            this.filteredReservations = this.filterReservationsByDate(this.currentDate);
        }
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
            return this.filterReservationsByDate(this.currentDate);
        }
    },

    methods: {
        // tableArea 功能：
        // 加載桌位
        async fetchTables() {
            try {
                const response = await axios.get('http://localhost:8080/tableManagement/getAllTables');
                // 將 API 返回的桌位數據轉換成符合前端顯示的結構
                this.tables = response.data.map(table => ({
                id: table.tableNumber,
                capacity: table.tableCapacity,
                status: table.tableStatus,  // 使用原本的狀態
                }));
                console.log('桌位資料加載成功:', this.tables);
            } catch (error) {
                console.error('無法獲取桌位資料:', error);
            }
        },
        // 刷新
        refresh() {
            // 可在此實作刷新功能
            console.log("資料已刷新");
        },

        // 根據容納人數不同調整桌位寬度
        getWidthByCapacity(capacity) {
            // 根據桌位的人數設置不同的寬度
            if (capacity <= 2) {
                return 180; // 2人桌，寬度180px
            } else if (capacity <= 4) {
                return 220; // 4人桌，寬度220px
            } else if (capacity <= 6) {
                return 260; // 6人桌，寬度260px
            }else if (capacity <= 8) {
                return 300; // 8人桌，寬度300px
            }
            return 340; // 10人桌，寬度340px
        },

        // 固定桌位高度
        getHeightByCapacity (capacity) {
            // 可以根據需求設置不同的高度，這裡統一高度為100px
            return 140;
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

        // ReservationArea 功能：
        // 日期變化時更新訂位資訊
        changeDate(dayChange) {
            const newDate = new Date(this.currentDate);
            newDate.setDate(newDate.getDate() + dayChange);
            this.currentDate = newDate; // 更新當前日期

            // 確保在更新日期後重新加載訂位資料
            this.fetchReservationsByDate(newDate); // 傳入更新後的 Date 物件
        },

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

        formatDate(date) {
            if (!(date instanceof Date)) {
                date = new Date(date);
            }
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`; // 格式化為 YYYY-MM-DD
        },

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

        // 根據日期獲取訂位資訊
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

        // 開啟結帳側邊欄
        selectTable(table) {
            // 使用 fetch 發送 GET 請求
            fetch(`http://localhost:8080/api/checkout/details/${table.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json(); // 解析回應為 JSON 格式
                })
                .then(data => {

                    if (data.code == 200) {

                        //訂單編號
                        this.ordersId = data.data.orderId;

                        //放入單點
                        data.data.single.forEach(item => {
                            this.orderItems.push({ name: item.mealName, notes: [], price: item.price });
                        });

                        //放入套餐
                        data.data.orderMealId.forEach(item => {
                            let mealString = item.mealName;
                            let mealArray = mealString.split(', ').map(meal => meal.trim());

                            this.orderItems.push({ name: item.comboName, notes: mealArray, price: item.price });
                        });

                        //放入金額
                        this.total = data.data.totalPrice;
                        this.subtotal = data.data.totalPrice;


                    } else {
                        Swal.fire({
                            title: '查詢資料失敗',
                            text: data.message, // 顯示錯誤訊息
                            icon: 'error',
                            confirmButtonText: '確定',
                        });
                        this.closePanel();
                    }
                })
                .catch(error => {
                    console.error("取得桌號資料:", error);
                });
            this.selectedTable = table; // 設置選中的桌位
        },
        confirmPayment(ordersId)  {
            const now = new Date();
            // 將時間轉換為 UTC+8
            const taiwanTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // 加8小時
            const checkoutTime1 = taiwanTime.toISOString();

            console.log(checkoutTime1);
            

            let  payType = "";
            if (this.paymentMethod == "creditCard" ){
                payType = "信用卡";
            }else if( this.paymentMethod == "cash" ){
                payType = "現金";
            }

            

            const confirmPaymentData = {
                orderId: ordersId,
                tableNumber: this.selectedTable.id,
                totalPrice: this.subtotal,
                payType: payType,
                checkout: 1,
                checkoutTime: checkoutTime
            };


            fetch("http://localhost:8080/api/checkout/confirmPayment", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(confirmPaymentData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json(); // 解析回應的 JSON
                })
                .then(data => {
                    // 顯示 SweetAlert 成功提示
                    if (data.code == 200) {

                        const newWindow = window.open('', '_blank'); // 打開一個空的窗口
                        // 寫入 HTML 到新窗口
                        newWindow.document.write(data.message); // 將 API 返回的 HTML 內容寫入窗口
                        newWindow.document.close(); // 關閉文件流

                        Swal.fire({
                            title: "付款成功", // 假設 API 返回的訊息
                            icon: 'success',
                            confirmButtonText: '確定',
                        });
                        this.selectedTable = null; // 關閉側邊欄
                        this.orderItems = [];
                        this.ordersId = "";
                        this.total = 0;
                        this.subtotal = 0;


                    } else {
                        Swal.fire({
                            title: '結帳失敗',
                            text: data.message, // 顯示錯誤訊息
                            icon: 'error',
                            confirmButtonText: '確定',
                        });

                    }

                })
                .catch(error => {
                    console.error("結帳失敗：", error);
                    Swal.fire({
                        title: '結帳失敗',
                        text: '無法完成支付，請稍後重試',
                        icon: 'error',
                        confirmButtonText: '確定',
                    });
                });

            
        },
        // 關閉結帳側邊欄
        closePanel() {
            this.selectedTable = null; // 關閉側邊欄
            this.orderItems = [];
            this.ordersId = "";
            this.total = 0;
            this.subtotal = 0;
        },

        calculateChange() {
            this.change = this.receivedAmount - this.subtotal;
        },

        searchMember() {
            // 這裡可以根據會員電話進行會員折扣查詢的邏輯
            if (this.memberPhone === '0911223345') {
                this.memberDiscount = 95; // 假設會員為黃金會員，95折
            } else {
                this.memberDiscount = 100; // 默認無折扣
            }
        },

        closeReservationModal () {
            this.showReservationModal = false
        },
         // 從後端獲取可用的訂位時間段
        async fetchAvailableTimes() {
            try {
                // 設置日期和用餐時長的參數
                const reservationDate = this.newReservation.date;
                const diningDuration = this.diningDuration;

                // 發送請求到後端 API
                const response = await axios.get('http://localhost:8080/reservation/generateAndFindAvailableTables', {
                    params: {
                        reservationDate: reservationDate,
                        diningDuration: diningDuration,
                        reservationPeople: this.newReservation.partySize
                    }
                });

                // 使用正確的字段名稱 availableTimeSlots
                this.availableTimes = response.data.availableTimeSlots; // 從 availableTimeSlots 提取資料
                console.log('可用時段:', this.availableTimes);
            } catch (error) {
                console.error('無法獲取可用時段:', error);
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
                reservationPeople: this.newReservation.partySize,
                reservationDate: this.newReservation.date,
                reservationStartTime: selectedTimeSlot.startTime, // 選擇的開始時間
                reservationEndingTime: selectedTimeSlot.endTime // 直接使用後端提供的結束時間
            };

            try {
                // 發送 POST 請求到後端 API
                const response = await axios.post('http://localhost:8080/reservation/saveReservation', reservationData);
                
                if (response.data.code === 200) {
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
                        <div class="tableNumbers">{{ reservation.tables.join(', ') }}</div> <!-- 顯示所有桌號 -->
                        <div class="reservationTime">{{ reservation.time }}</div>
                    </div>
    
                    <!-- 報到與取消 -->
                    <div class="reservationActions">
                        <div class="checkinArea">
                            <input type="checkbox" id="checkin_{{ reservation.id }}" name="checkin" />
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

            <button v-if="viewType === 'reservation'" class="newReservation" @click="showReservationModal = true">
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
                            {{ ordersId}} {{ selectedTable.name }}
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
                            <div>
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

                            <button class="confirmButton" @click="confirmPayment(this.ordersId)">確認付款</button>
                        </div>

                        <!-- 現金付款表單 -->
                        <div v-if="paymentMethod === 'cash'" class="cashForm">
                            <div>
                                <input type="number" placeholder="輸入收取金額" v-model="receivedAmount" @input="calculateChange" />
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
                                <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
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
                            <input type="text" v-model="newReservation.name"/>
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
                height: 90%; /* 確保父容器有具體高度 */
                border-radius: 10px;
                background-color: #f2f4f8;
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                justify-items: center;
                overflow: hidden; /* 防止元素超出容器 */

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
                            background-color: #878d96 !important; /* 用餐中狀態 */
                        }

                        &.RESERVED {
                            background-color: #c1c7cd !important; /* 已訂位狀態 */
                        }

                        &.AVAILABLE {
                            background-color: #f2f4f8 !important; /* 可使用狀態，預設為淺色 */
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

        .sidebarArea {
            width: 100vw;
            height: 100vh;
            position: fixed;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            top: 0;
            left: 0;

            .sidebarBackground {
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.5); /* 半透明的黑色遮罩 */
                position: absolute;
                top: 0;
                left: 0;
                cursor: pointer;
            }

            .sidebar {
                width: 50%;
                height: 98%;
                border-radius: 10px;
                background-color: #fff;
                padding: 20px;
                position: relative;
                z-index: 100; /* 確保側邊欄在遮罩上面 */

                .sideHeader {
                    display: flex;
                    flex-direction: column;

                    .titleArea {
                        letter-spacing: 5px;
                        display: flex;
                        align-items: center;
                        margin-bottom: 15px;

                        i {
                            font-size: 20px;
                            color: #878D96;
                            margin-right: 10px;
                            cursor: pointer;
                        }
                    }

                    .dataArea {
                        display: flex;
                        align-items: center;
                        margin-bottom: 15px;

                        .tableNumber {
                            border-radius: 10px;
                            background-color: #DDE1E6;
                            font-size: 22px;
                            font-weight: bolder;
                            padding: 20px 15px;
                        }

                        .orderNumber {
                            font-size: 17px;
                            color: #343A3F;
                            font-weight: bold;
                            padding: 15px;

                            p {
                                margin-bottom: 5px;
                            }
                        }

                        .memberArea {
                            display: flex;
                            flex-direction: column;
                            align-items: end;
                            position: absolute;
                            right: 2%;

                            .memberPhone {
                                display: flex;
                                align-items: center;
                                margin-bottom: 5px;

                                .phoneInput {
                                    width: 350px;
                                    height: 40px;
                                    border: 1px solid #697077;
                                    border-radius: 5px;
                                    font-size: 18px;
                                    color: #A2A9B0;
                                    text-indent: 10px;
                                    letter-spacing: 2px;
                                    outline: none;
                                }

                                .searchButton {
                                    margin: 10px;
                                    background: none;
                                    border: none;
                                    font-size: 20px;
                                    color: #697077;
                                    cursor: pointer;
                                }
                            }

                            .memberDiscount {
                                font-size: 16px;
                                letter-spacing: 2px;
                                margin-right: 15px;
                            }
                        }
                    }
                }

                .sideBody {
                    height: 84%;
                    display: flex;
                    justify-content: space-between;

                    .detailSection {
                        width: 50%;
                        border-radius: 10px;
                        background-color: #F2F4F8;
                        padding: 20px;

                        .orderDetails {
                            width: 100%;
                            height: 600px;
                            max-height: 600px;
                            overflow-y: auto;
                            margin-bottom: 10px;

                            .orderTitle {
                                font-size: 20px;
                                letter-spacing: 5px;
                                margin-bottom: 20px;
                            }

                            .orderItem {
                                width: 100%;
                                border: 2px solid #d9d9d9;
                                border-radius: 10px;
                                display: flex;
                                justify-content: space-between;
                                padding: 10px 20px;
                                margin-bottom: 10px;

                                .itemInfo {
                                    flex: 1;
                                    display: flex;
                                    flex-direction: column;

                                    .orderName {
                                        font-size: 17px;
                                        color: #1e1e1e;
                                        font-weight: bold;
                                        letter-spacing: 3px;
                                        margin-bottom: 10px;
                                    }

                                    ul {
                                        font-size: 15px;
                                        letter-spacing: 1px;
                                        color: #21272A;
                                        margin-left: 20px;

                                        li {
                                            margin-bottom: 5px;
                                        }
                                    }
                                }

                                .itemPrice {
                                    font-size: 17px;
                                    letter-spacing: 2px;
                                    color: #1e1e1e;
                                }
                            }
                        }

                        .totalSummary {
                            padding: 20px;

                            .totalPrice {
                                font-size: 15px;
                                font-weight: bold;
                                letter-spacing: 3px;
                                color: #697077;
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 10px;
                            }

                            .priceDiscount {
                                font-size: 15px;
                                font-weight: bold;
                                letter-spacing: 3px;
                                color: #697077;
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 15px;
                            }

                            .summary {
                                font-size: 17px;
                                font-weight: bold;
                                letter-spacing: 3px;
                                color: #1e1e1e;
                                display: flex;
                                justify-content: space-between;
                            }
                        }
                    }

                    .paymentSection {
                        width: 50%;
                        padding: 20px;

                        .paymentTitle {
                            font-size: 20px;
                            letter-spacing: 5px;
                            margin-bottom: 20px;
                        }

                        .paymentSelect {
                            width: 100%;
                            border: 1px solid #A2A9B0;
                            border-radius: 10px;
                            font-size: 16px;
                            letter-spacing: 2px;
                            appearance: none; /* 隱藏默認的箭頭 */
                            background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjcxNzUgNi41NDc1QzEzLjE3OTcgNi4xNDcyIDEzLjI4MjIgNS40MTMgMTIuOTg3MiA0LjkzMjVDMTIuNjkzMiA0LjQ1MjUgMTIuMDEwNCA0LjQ1MjUgMTEuNzE3IDQuOTMyNUw4IDkuMzM1NEw0LjI4MjUgNC45MzI1QzMuOTg5NiA0LjQ1MjUgMy4zMDY4IDQuNDUyNSAyLjAxMjggNC45MzI1QzEuNzE4OCA1LjQxMyAxLjgyMTEgNi4xNDcyIDIuMjg0MTIgNi41NDc1TDcuMzE1MTIgMTEuNTA2QzcuNzU4NDEgMTEuOTYxIDguMjQxNiAxMS45NjEgOC42ODY4IDExLjUwNkMxMC4xNzA4IDEwLjI1NyAxMS41OTExIDguOTAzNTggMTIuNzE3NSA3LjY2MjVIMTIuNzE3NVoiIGZpbGw9IiMyMjIyMjIiLz4KPC9zdmc+') no-repeat; /* 使用 base64 格式的箭頭圖標 */
                            background-position: calc(100% - 20px) center; /* 調整箭頭的位置，讓它距離左邊更近 */
                            background-size: 15px; /* 調整箭頭大小 */
                            outline: none;
                            cursor: pointer;
                            padding: 10px;
                            margin-bottom: 30px;
                        }

                        .creditCardForm {
                            width: 100%;
                            height: 85%;
                            position: relative;

                            label {
                                font-size: 16px;
                                letter-spacing: 2px;
                            }

                            input {
                                width: 100%;
                                height: 40%;
                                border: 1px solid #DDE1E6;
                                border-radius: 10px;
                                font-size: 16px;
                                color: #697077;
                                letter-spacing: 2px;
                                outline: none;
                                padding: 10px;
                                margin: 10px 0px;
                            }

                            .confirmButton {
                                width: 100%;
                                border: none;
                                border-radius: 10px;
                                background-color: #343A3F;
                                font-size: 16px;
                                letter-spacing: 3px;
                                color: #ffffff;
                                padding: 15px;
                                position: absolute;
                                bottom: 4%;
                                cursor: pointer;
                            }
                        } 

                        .cashForm {
                            width: 100%;
                            height: 85%;
                            position: relative;

                            input {
                                width: 100%;
                                height: 40%;
                                border: 1px solid #DDE1E6;
                                border-radius: 10px;
                                background-color: #F2F4F8;
                                font-size: 16px;
                                color: #697077;
                                letter-spacing: 2px;
                                outline: none;
                                padding: 10px;
                                margin: 10px 0px;
                            }

                            .cashSummary {
                                padding: 20px;

                                .payment {
                                    font-size: 16px;
                                    font-weight: bold;
                                    letter-spacing: 3px;
                                    color: #697077;
                                    display: flex;
                                    justify-content: space-between;
                                    margin-bottom: 15px;
                                }

                                .summary {
                                    font-size: 16px;
                                    font-weight: bold;
                                    letter-spacing: 3px;
                                    color: #697077;
                                    display: flex;
                                    justify-content: space-between;
                                    margin-bottom: 15px;
                                }

                                .change {
                                    font-size: 18px;
                                    font-weight: bold;
                                    letter-spacing: 3px;
                                    color: #1e1e1e;
                                    display: flex;
                                    justify-content: space-between;
                                }
                            }

                            .confirmButton {
                                width: 100%;
                                border: none;
                                border-radius: 10px;
                                background-color: #343A3F;
                                font-size: 16px;
                                letter-spacing: 3px;
                                color: #ffffff;
                                padding: 15px;
                                position: absolute;
                                bottom: 4%;
                                cursor: pointer;
                            }
                        }
                    }
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
                                appearance: none; /* 隱藏默認的箭頭 */
                                background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjcxNzUgNi41NDc1QzEzLjE3OTcgNi4xNDcyIDEzLjI4MjIgNS40MTMgMTIuOTg3MiA0LjkzMjVDMTIuNjkzMiA0LjQ1MjUgMTIuMDEwNCA0LjQ1MjUgMTEuNzE3IDQuOTMyNUw4IDkuMzM1NEw0LjI4MjUgNC45MzI1QzMuOTg5NiA0LjQ1MjUgMy4zMDY4IDQuNDUyNSAyLjAxMjggNC45MzI1QzEuNzE4OCA1LjQxMyAxLjgyMTEgNi4xNDcyIDIuMjg0MTIgNi41NDc1TDcuMzE1MTIgMTEuNTA2QzcuNzU4NDEgMTEuOTYxIDguMjQxNiAxMS45NjEgOC42ODY4IDExLjUwNkMxMC4xNzA4IDEwLjI1NyAxMS41OTExIDguOTAzNTggMTIuNzE3NSA3LjY2MjVIMTIuNzE3NVoiIGZpbGw9IiMyMjIyMjIiLz4KPC9zdmc+') no-repeat; /* 使用 base64 格式的箭頭圖標 */
                                background-position: calc(100% - 15px) center; /* 調整箭頭的位置，讓它距離左邊更近 */
                                background-size: 15px; /* 調整箭頭大小 */
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
    }
}
</style>