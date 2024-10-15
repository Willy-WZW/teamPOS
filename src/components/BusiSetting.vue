<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import TableManagement from './BusiSetting/TableManagement.vue'; // 確保路徑正確

export default {
    data () {
        return {
            // managementArea 數據
            selectedMenu: '桌號管理', // 預設選中的選單項目
            managementItems: ['桌號管理', '訂位時段設定', '訂位時段管理'], // 選單項目

            // 訂位時間的 managementContentArea 數據
            openingTime: '', // 營業開始時間
            closingTime: '', // 營業結束時間
            diningDuration: '', // 用餐時間
            timeSlots: [], // 從後端獲取的時間段
            storeId: 1, // 店鋪 ID 固定為 1
            weekDays: [
                { name: '星期一', value: 'Monday', selected: false },
                { name: '星期二', value: 'Tuesday', selected: false },
                { name: '星期三', value: 'Wednesday', selected: false },
                { name: '星期四', value: 'Thursday', selected: false },
                { name: '星期五', value: 'Friday', selected: false },
                { name: '星期六', value: 'Saturday', selected: false },
                { name: '星期日', value: 'Sunday', selected: false }
            ],

            businessHoursList: [], // 營業時間管理的數據
            toBeDeleted: [],  // 儲存要刪除的營業時間
            diningDurations: [],
        };
    },

    components: {
        TableManagement,
    },

    mounted() {
        this.loadBusinessHours();  // 初始化時加載營業時間數據
        this.loadDiningDurations();
         // 從 LocalStorage 中讀取用餐時間並轉換回數字
        const storedDuration = localStorage.getItem('diningDuration');
        if (storedDuration) {
        this.diningDuration = JSON.parse(storedDuration);  // 讀取並轉換為數字
        }
    },

    watch: {
        openingTime: 'fetchTimeSlots',   // 當 openingTime 變化時觸發
        closingTime: 'fetchTimeSlots',   // 當 closingTime 變化時觸發
        diningDuration: 'fetchTimeSlots' // 當 diningDuration 變化時觸發
    },

    methods: {
        // 訂位時段設定方法

        // 新增營業時間、用餐時間
        async saveBusinessHoursAndDays() {
            try {
                // 儲存營業時間並取得 IDs
                const businessHoursRequests = this.weekDays
                    .filter(day => day.selected)
                    .map(day => ({
                        storeId: this.storeId,
                        dayOfWeek: day.value,
                        openingTime: this.openingTime,
                        closingTime: this.closingTime
                    }));

                const businessHoursResponses = await Promise.all(
                    businessHoursRequests.map(req =>
                        axios.post('http://localhost:8080/businessHours/addOrUpdateBusinessHours', req)
                    )
                );

                // 獲取 businessHoursIds
                const businessHoursIds = businessHoursResponses.map(response => response.data.id);

                // 發送用餐時間的請求
                const diningDurationReq = {
                    durationMinutes: this.diningDuration,  // 用餐時間
                    businessHoursIds: businessHoursIds     // 儲存後的 businessHoursIds
                };

                // 儲存用餐時間，並獲取 diningDurationId
                const diningDurationResponse = await axios.post('http://localhost:8080/diningDuration/addOrUpdateDiningDuration', diningDurationReq);

                // 確保 diningDurations 是有效的陣列
                if (diningDurationResponse.data.diningDurations && diningDurationResponse.data.diningDurations.length > 0) {
                    const diningDurationId = diningDurationResponse.data.diningDurations[0].id;  // 提取陣列中的第一個 diningDuration 的 ID
                    console.log('更新的 diningDurationId:', diningDurationId);
                    
                    // 更新營業時間，將 diningDurationId 傳入
                    await Promise.all(businessHoursResponses.map(response => {
                        const updatedBusinessHoursReq = {
                            id: response.data.id,
                            dayOfWeek: response.data.dayOfWeek,
                            openingTime: response.data.openingTime,
                            closingTime: response.data.closingTime,
                            diningDuration: { id: diningDurationId }  // 確保這裡是 diningDurationId，且不為 null
                        };
                        console.log("更新的 businessHoursReq:", updatedBusinessHoursReq); // 打印請求，確認 diningDuration 被傳送
                        return axios.post('http://localhost:8080/businessHours/addOrUpdateBusinessHours', updatedBusinessHoursReq);
                    }));
                } else {
                    console.error('未能從用餐時間回應中提取到有效的 diningDuration');
                }

                // 成功提示
                Swal.fire({
                    icon: 'success',
                    title: '儲存成功',
                    text: '營業時間、日期和用餐時間已成功儲存！',
                });

            } catch (error) {
                // 捕捉後端錯誤，並顯示 SweetAlert
                const errorMessage = error.response && error.response.data && error.response.data.message
                    ? error.response.data.message
                    : '儲存過程中發生錯誤，請稍後再試。';

                Swal.fire({
                    icon: 'error',
                    title: '儲存失敗',
                    text: errorMessage,
                });
            }
        }, 
        // 加載訂位時間段
        async fetchTimeSlots() {
            // 檢查所有的值是否已經填寫完畢
            if (this.openingTime && this.closingTime && this.diningDuration) {
                try {
                    const response = await axios.get('http://localhost:8080/reservation/calculateAvailableStartTimes', {
                        params: {
                            openingTime: this.openingTime,
                            closingTime: this.closingTime,
                            diningDuration: this.diningDuration
                        }
                    });

                    // 提取開始時間
                    this.timeSlots = response.data.map(slot => slot.startTime);
                } catch (error) {
                    console.error('Error fetching time slots:', error);
                }
            }
        },

        // 訂位時段管理方法
        // 加載營業時間
        async loadBusinessHours() {
            try {
                const response = await axios.get('http://localhost:8080/businessHours/getAllBusinessHours');
                this.businessHoursList = response.data; // 確認返回的數據
                console.log('營業時間加載成功:', this.businessHoursList);
            } catch (error) {
                console.error('加載營業時間失敗:', error);
                Swal.fire({
                    icon: 'error',
                    title: '加載失敗',
                    text: '加載營業時間失敗，請稍後再試。',
                });
            }
        },
        // 從 API 刪除營業時間
        async deleteBussinessHour(index) {
                try {
                // 批量刪除被標記為刪除的營業時間
                for (const businessHour of this.toBeDeleted) {
                    await axios.delete(`http://localhost:8080/businessHours/deleteBusinessHours/${businessHour.id}`);
                }
                // 清空已刪除的陣列
                this.toBeDeleted = [];

                // 顯示成功訊息
                this.loadBusinessHours();
                Swal.fire({
                    icon: 'success',
                    title: '儲存成功',
                    text: '營業時間已成功更新。',
                });
            } catch (error) {
                console.error('儲存變更時發生錯誤:', error);

                Swal.fire({
                    icon: 'error',
                    title: '儲存失敗',
                    text: '儲存過程中發生錯誤，請稍後再試。',
                });
            }
        },
        // 刪除營業時間欄位
        removeBusinessHour(index) {
            const businessHour = this.businessHoursList[index];
            this.toBeDeleted.push(businessHour);  // 標記要刪除的項目
            this.businessHoursList.splice(index, 1);  // 從畫面上移除
        },
        // 加載用餐時間
        async loadDiningDurations() {
            try {
                const response = await axios.get('http://localhost:8080/diningDuration/getAllDiningDurations');
                this.diningDurations = response.data;  // 獲取所有的用餐時間資料

                // 假設只取第一個用餐時間的 durationMinutes
                if (this.diningDurations.length > 0) {
                    const durationMinutes = this.diningDurations[0].durationMinutes;

                    // 確保 durationMinutes 是數字，並儲存到 LocalStorage
                    localStorage.setItem('diningDuration', JSON.stringify(durationMinutes));

                    console.log('用餐時間已存入 LocalStorage:', durationMinutes);
                } else {
                    console.warn('無有效的用餐時間資料');
                }
            } catch (error) {
                console.error('加載用餐時間失敗:', error);
                Swal.fire({
                    icon: 'error',
                    title: '加載失敗',
                    text: '加載用餐時間失敗，請稍後再試。',
                });
            }
        }

    }
};
</script>

<template>
<!-- 桌號、訂位管理區域 -->
<div class="managementSettingArea">
    <div class="managementList">
        <ul>
            <li v-for="(item, index) in managementItems" :key="index" :class="{ active: selectedMenu === item }" @click="selectMenu(item)">
                {{ item }}
            </li>
        </ul>
    </div>
</div>

<!-- 桌號管理內容顯示區域 -->
<TableManagement v-if="selectedMenu === '桌號管理'" />

<!-- 訂位時段設定內容區域 -->
<div class="reserveSettingContentArea" v-if="selectedMenu === '訂位時段設定'">
    <!-- 顯示訂位管理標題 -->
    <h2 class="reserveTitle">訂位時段管理</h2>

    <!-- 顯示訂位管理注意事項 -->
    <p class="reminderText">請依照步驟依序設定，一次設定一個時段，若午餐晚餐時段分開請設定2次，以此類推！</p>

    <!-- 顯示訂位管理表格區域 -->
    <div class="reserveArea">
        <!-- 營業時間設定 -->
        <div class="businessHoursSection">
            <div class="sectionHeader">
                <div class="sectionNumber">1</div>

                <div class="sectionTitle">營業時間設定</div>
            </div>

            <div class="timeSelectArea">
                <div class="beginTimeSelectArea">
                    <label class="beginTimeLabel" for="openingTime">開始時間</label>
                    <input class="beginTimeInput" type="time" id="openingTime" v-model="openingTime" />
                </div>

                <div class="endTimeSelectArea">
                    <label class="endTimeLabel" for="closingTime">結束時間</label>
                    <input class="endTimeInput" type="time" id="closingTime" v-model="closingTime" />
                </div>
            </div>
        </div>

        <!-- 用餐時間設定 -->
        <div class="diningDurationSection">
            <div class="sectionHeader">
                <div class="sectionNumber">2</div>

                <div class="sectionTitle">用餐時間設定</div>
            </div>

            <div class="diningDurationArea">
                <input class="diningDurationInput" type="number" v-model="diningDuration" placeholder="輸入客人用餐時間" min="1" />
                <span class="diningDurationLabel">分鐘</span>
            </div>
        </div>

        <!-- 預設訂位時段設定 -->
        <div class="timeSlotSection">
            <div class="sectionHeader">
                <div class="sectionNumber">3</div>
                <div class="sectionTitle">預覽訂位時間段</div>
            </div>
            
            <div class="timeSlotArea">
                <p class="description">根據步驟 1 和步驟 2 自動計算</p>

                <div class="timeSlotBox">
                    <div class="timeSlot" v-for="(time, index) in timeSlots" :key="index">
                        {{ time }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 選擇營業日期 -->
        <div class="daySelectSection">
            <div class="sectionHeader">
                <div class="sectionNumber">4</div>
                <div class="sectionTitle">選擇營業日期</div>
            </div>

            <div class="daySelectArea">
                <label v-for="(day, index) in weekDays" :key="index" class="daySelectLabel">
                    <input type="checkbox" v-model="day.selected" />
                    {{ day.name }}
                </label>
            </div>
        </div>
    </div>

    <!-- 取消、儲存操作按鈕區域 -->
    <div class="buttonArea">
        <button class="cancelButton" >取消</button>
        <button class="saveButton" @click="saveBusinessHoursAndDays" >儲存</button>
    </div>
</div>

<!-- 訂位時段管理內容區域 -->
<div class="reserveManagementContentArea" v-if="selectedMenu === '訂位時段管理'">
    <!-- 顯示訂位標題 -->
    <h2 class="reserveSlotTitle">訂位時段管理</h2>

    <!-- 訂位時段管理注意事項 -->
    <p class="reminderText">
        所有已設定的營業時間如下，用餐時間皆為 {{ diningDuration ? diningDuration : '無資料' }} 分鐘
    </p>

    <!-- 顯示訂位時段表格區域 -->
    <div class="reserveSlotArea">
        <!-- 顯示訂位時段表格列表 -->
        <table class="reserveSlotList">
            <!-- 訂位時段列表頭 -->
            <thead>
                <tr>
                    <th>營業日期</th>
                    <th>營業時間</th>
                    <th>編輯</th>
                </tr>
            </thead>

            <!-- 訂位時段列表內容 -->
            <tbody>
                <!-- 只顯示營業日期和營業時間 -->
                <tr v-for="(businessHours, index) in businessHoursList" :key="index">
                    <!-- 營業日期 -->
                    <td>
                        <p class="bussinessDate">{{ businessHours.dayOfWeek }}</p>
                    </td>

                    <!-- 營業時間 -->
                    <td>
                        <p class="bussinessTime">{{ businessHours.openingTime }} - {{ businessHours.closingTime }}</p>
                    </td>

                    <!-- 刪除 Button -->
                    <td>
                        <button class="trashButton" @click="removeBusinessHour(index)">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- 取消、儲存操作按鈕區域 -->
    <div class="buttonArea">
        <button class="cancelButton" @click="cancelChanges">取消</button>
        <button class="saveButton" @click="deleteBussinessHour">儲存</button>
    </div>
</div>
</template>

<style scoped lang="scss">
$divColor: #fff;
$addDiv: #343a3f;
$suppliable: #1ce34e;
$soldOut: #e02d11;

.managementSettingArea {
    width: 19%;
    height: 100%;
    border-radius: 10px;
    background-color: $divColor;
    display: flex;
    justify-content: start;
    align-items: center;
    flex-direction: column;

    .managementList {
        width: 100%;
        padding: 10px 0;

        ul {
            list-style-type: none;

            li {
                border-right: 4px solid transparent; /* 預設無邊框 */
                font-size: 20px;
                font-weight: bolder;
                text-align: center;
                padding: 10px;
                margin: 20px 0px;
                cursor: pointer;
                transition: all 0.3s;

                &.active {
                    background-color: #DDE1E6;  /* 點擊後的底色 */
                    border-right-color: #000; /* 點擊後的左側框線 */
                }

                &:hover {
                    background-color: #ececec;
                }
            }
        }
    }
}

.reserveSettingContentArea {
    width: 80%;
    height: 100%;
    border-radius: 10px;
    background-color: $divColor;
    flex: 1;
    padding: 20px 35px;
    position: absolute;
    top: 0%;
    right: 0%;

    .reserveTitle {
        font-size: 25px;
        letter-spacing: 4px;
        margin-bottom: 10px;
    }

    .reminderText {
        margin-bottom: 20px;
        color: black;
        opacity: 0.6;
    }

    .reserveArea {
        width: 100%;
        height: 85%;
        border: 2px solid #ccc; /* 表格外框邊線 */
        padding: 15px 10px;
        max-height: 650px;
        overflow-y: auto;

        .daySelectSection {
            width: 75%;
            height: 200px;
            border-radius: 10px;
            border: 2px solid #c1c7cd;
            padding: 15px;
            margin: auto;
            margin-bottom: 20px;
            position: relative;

            .sectionHeader {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 2px solid #c1c7cd;

                .sectionNumber {
                    width: 50px;
                    height: 45px;
                    background-color: #dde1e6;
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: bold;
                    color: #21272a;
                }

                .sectionTitle {
                    font-size: 23px;
                    font-weight: bold;
                    letter-spacing: 3px;
                    margin-left: 10px;
                    color: #21272a;
                }
            }

            .daySelectArea {
                height: 95px;
                border-radius: 10px;
                background-color: rgba(242, 244, 248);
                display: flex;
                justify-content: space-between;
                background-color: #f0f2f5;
                padding: 15px;

                .daySelectLabel {
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    cursor: pointer;

                    input {
                        cursor: pointer;
                        margin-right: 8px;
                    }
                }
            }
        }

        .businessHoursSection {
            width: 75%;
            height: 235px;
            border-radius: 10px;
            border: 2px solid #c1c7cd;
            padding: 15px;
            margin: auto;
            margin-bottom: 20px;
            position: relative;

            .sectionHeader {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 2px solid #c1c7cd;

                .sectionNumber {
                    width: 50px;
                    height: 45px;
                    background-color: #dde1e6;
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: bold;
                    color: #21272a;
                }

                .sectionTitle {
                    font-size: 23px;
                    font-weight: bold;
                    letter-spacing: 3px;
                    margin-left: 10px;
                    color: #21272a;
                }
            }

            .timeSelectArea {
                width: 60%;
                height: 130px;
                border-radius: 10px;
                background-color: rgba(242, 244, 248);
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-top: 15px;
                padding-top: 10px;

                .beginTimeSelectArea {
                    width: 100%;
                    height: 58px;
                    display: flex;
                    justify-content: space-evenly;
                    align-items: center;

                    .beginTimeLabel {
                        font-size: 17px;
                        color: #21272a;
                    }

                    .beginTimeInput {
                        width: 35%;
                        border: 1px solid #ccc;
                        border-radius: 10px;
                        background-color: #fff;
                        outline: none;
                        font-size: 13px;
                        padding: 10px;
                        color: #333;
                    }
                }

                .endTimeSelectArea {
                    width: 100%;
                    height: 58px;
                    display: flex;
                    justify-content: space-evenly;
                    align-items: center;

                    .endTimeLabel {
                        font-size: 17px;
                        color: #21272a;
                    }

                    .endTimeInput {
                        width: 35%;
                        border: 1px solid #ccc;
                        border-radius: 10px;
                        background-color: #fff;
                        outline: none;
                        font-size: 13px;
                        padding: 10px;
                        color: #333;
                    }
                }
            }

            .addButton {
                border: none;
                border-radius: 50%;
                background-color: #343a40;
                color: white;
                padding: 10px 12px;
                cursor: pointer;
                position: absolute;
                top: 60%;
                right: 32%;

                i {
                    font-size: 15px;
                }
            }
        }

        .diningDurationSection {
            width: 75%;
            height: 200px;
            border-radius: 10px;
            border: 2px solid #c1c7cd;
            padding: 15px;
            margin: auto;
            margin-bottom: 20px;
            position: relative;

            .sectionHeader {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 2px solid #c1c7cd;

                .sectionNumber {
                    width: 50px;
                    height: 45px;
                    background-color: #dde1e6;
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: bold;
                    color: #21272a;
                }

                .sectionTitle {
                    font-size: 23px;
                    font-weight: bold;
                    letter-spacing: 3px;
                    margin-left: 10px;
                    color: #21272a;
                }
            }

            .diningDurationArea {
                height: 95px;
                border-radius: 10px;
                background-color: rgba(242, 244, 248);
                display: flex;
                align-items: center;
                margin-top: 15px;
                padding-top: 10px;

                .diningDurationInput {
                    width: 30%;
                    border: 2px solid #ccc;
                    border-radius: 10px;
                    background-color: transparent;
                    outline: none;
                    font-size: 15px;
                    padding: 10px;
                    color: #333;
                    margin-left: 60px;
                }

                .diningDurationLabel {
                    font-size: 17px;
                    color: #21272a;
                    margin-left: 20px;
                }
            }
        }

        .timeSlotSection {
            width: 75%;
            height: 215px;
            border-radius: 10px;
            border: 2px solid #c1c7cd;
            padding: 15px;
            margin: auto;
            margin-bottom: 20px;
            position: relative;

            .sectionHeader {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 2px solid #c1c7cd;

                .sectionNumber {
                    width: 50px;
                    height: 45px;
                    background-color: #dde1e6;
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: bold;
                    color: #21272a;
                }

                .sectionTitle {
                    font-size: 23px;
                    font-weight: bold;
                    letter-spacing: 3px;
                    margin-left: 10px;
                    color: #21272a;
                }
            }

            .timeSlotArea {
                max-width: 776px;
                height: 110px;
                overflow-x: scroll;
                border-radius: 10px;
                background-color: rgba(242, 244, 248);
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                margin-top: 15px;
                padding-top: 10px;

                .description {
                    font-size: 16px;
                    color: #878d96;
                    margin-left: 60px;
                }

                .timeSlotBox {
                    display: flex;
                    justify-content: space-between;
                    padding: 15px;
                    border-radius: 8px;

                    .timeSlot {
                        flex: 1;
                        text-align: center;
                        padding: 10px 20px;
                        font-size: 16px;
                        background-color: #fff;
                        border: 1px solid #ccc;
                        border-radius: 8px;
                        margin: 0 5px;
                        color: #333;
                        font-weight: bold;
                        cursor: pointer;
                    }
                }
            }
        }
    }

    .buttonArea {
        margin-top: 25px;
        display: flex;
        justify-content: flex-end;

        .cancelButton {
            width: 15%;
            border-radius: 10px;
            border: 2px solid rgb(32, 33, 42);
            background-color: transparent;
            font-size: 16px;
            letter-spacing: 5px;
            padding: 10px 20px;
            cursor: pointer;
        }

        .saveButton {
            width: 15%;
            border-radius: 10px;
            border: none;
            background-color: rgb(52, 58, 63);
            color: #f2f4f8;
            font-size: 16px;
            letter-spacing: 5px;
            margin-left: 40px;
            padding: 10px 20px;
            cursor: pointer;
        }
    }
}

.reserveManagementContentArea {
    width: 80%;
    height: 100%;
    border-radius: 10px;
    background-color: $divColor;
    flex: 1;
    padding: 20px 35px;
    position: absolute;
    top: 0%;
    right: 0%;

    .reserveSlotTitle {
        font-size: 25px;
        letter-spacing: 4px;
        margin-bottom: 10px;
    }

    .reminderText {
        margin-bottom: 20px;
        color: black;
        opacity: 0.6;
    }

    .reserveSlotArea {
        width: 100%;
        height: 85%;
        border: 2px solid #ccc; /* 表格外框邊線 */
        padding: 15px 10px;
        max-height: 650px;
        overflow-y: auto;

        .reserveSlotList {
            width: 100%;
            border-collapse: collapse; /* 使用 separate 來啟用 border-spacing */
            table-layout: fixed; /* 讓表格的列寬固定 */

            thead {
                height: 55px;
                background-color: #dde1e680;
                letter-spacing: 4px;
            }

            tbody {
                tr {
                    height: 65px;
                    border-bottom: 1px dashed #C1C7CD; /* 設置虛線的底線 */
                }

                td {
                    padding: 5px; /* 減少內邊距以減小行高 */
                    text-align: center;
                    vertical-align: middle; /* 垂直居中內容 */

                    .bussinessDate {
                        width: 100%;
                        height: 25px;
                        border: none;
                        background-color: transparent;
                        font-size: 18px;
                        letter-spacing: 1px;
                        outline: none;
                    }

                    .bussinessTime {
                        width: 100%;
                        height: 25px;
                        border: none;
                        background-color: transparent;
                        font-size: 18px;
                        letter-spacing: 1px;
                        cursor: pointer;
                    }

                    .durationTime {
                        width: 100%;
                        height: 25px;
                        border: none;
                        background-color: transparent;
                        font-size: 18px;
                        letter-spacing: 1px;
                        cursor: pointer;
                    }

                    .trashButton {
                        border: none;
                        background-color: transparent;
                        font-size: 30px;
                        cursor: pointer;
                    }
                }
            }
        }
    }

    .buttonArea {
        margin-top: 25px;
        display: flex;
        justify-content: flex-end;

        .cancelButton {
            width: 15%;
            border-radius: 10px;
            border: 2px solid rgb(32, 33, 42);
            background-color: transparent;
            font-size: 16px;
            letter-spacing: 5px;
            padding: 10px 20px;
            cursor: pointer;
        }

        .saveButton {
            width: 15%;
            border-radius: 10px;
            border: none;
            background-color: rgb(52, 58, 63);
            color: #f2f4f8;
            font-size: 16px;
            letter-spacing: 5px;
            margin-left: 40px;
            padding: 10px 20px;
            cursor: pointer;
        }
    }
}
</style>
