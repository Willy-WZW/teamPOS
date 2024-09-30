<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    data () {
        return {
            // managementArea 數據
            selectedMenu: '桌號管理', // 預設選中的選單項目
            managementItems: ['桌號管理', '訂位時段管理'], // 選單項目

            // 桌號的 tableManagementContentArea 數據
            tableList: [], // 桌位列表，從後端獲取資料
            newTable: { table_number: '', table_capacity: '', table_status: 'AVAILABLE' }, // 新增桌號的初始值
            capacityOptions: ['2人桌', '4人桌', '6人桌', '8人桌', '10人桌'], // 可選的容納人數
            showNewTableRow: false, // 控制新增桌號行是否顯示

            // 訂位時間的 managementContentArea 數據
            openingTime: '',
            closingTime: '',
            diningDuration: '',
            reservationTimeSlots: [],
            weekDays: [
            { name: '星期一', selected: false },
            { name: '星期二', selected: false },
            { name: '星期三', selected: false },
            { name: '星期四', selected: false },
            { name: '星期五', selected: false },
            { name: '星期六', selected: false },
            { name: '星期日', selected: false },
            ],
        };
    },

    mounted() {
        this.loadInitialTableData();
    },

    methods: {
         // 加載初始的桌位數據
        async loadInitialTableData () {
            try {
                const response = await axios.get('http://localhost:8080/tableManagement/getAllTables');
                this.tableList = response.data.map(table => ({
                    table_number: table.tableNumber,
                    table_capacity: `${table.tableCapacity}人桌`,
                    table_status: table.tableStatus,  // 保留桌位狀態
                }));
                console.log(this.tableList);  // 確認數據是否正確加載
                this.originalTableList = JSON.parse(JSON.stringify(this.tableList)); // 深拷貝，保存初始數據
            } catch (error) {
                console.error('加載桌位數據失敗:', error);

                Swal.fire({
                    icon: 'error',
                    title: '加載失敗',
                    text: '加載桌位數據失敗，請稍後再試。',
                });
            }
        },

        // 切換選單
        selectMenu (item) {
            this.selectedMenu = item;
        },

        // 新增桌號，暫時加入 tableList，並不立刻儲存到後端
        addTableRow() {
            // 首先檢查當前的桌號和容納人數是否填寫完整
            if (this.showNewTableRow && (!this.newTable.table_number.trim() || !this.newTable.table_capacity)) {
                Swal.fire({
                    icon: 'warning',
                    title: '錯誤',
                    text: '請輸入桌號並選擇容納人數',
                });
                return; // 阻止繼續操作
            }

            // 如果當前桌號和容納人數都填寫了，則進行其他檢查並新增桌號
            if (this.newTable.table_number.trim() && this.newTable.table_capacity) {
                // 檢查桌號是否符合格式（大寫字母+兩個數字）
                const tableNumberPattern = /^[A-Z]\d{2}$/;
                if (!this.newTable.table_number.trim().match(tableNumberPattern)) {
                    Swal.fire({
                        icon: 'warning',
                        title: '桌號格式錯誤',
                        text: '桌號必須是一個大寫字母加兩個數字（如 A01）。',
                    });
                    return;
                }

                // 檢查桌號是否已存在於 tableList 中
                const existingTable = this.tableList.find(table => table.table_number === this.newTable.table_number);
                if (existingTable) {
                    Swal.fire({
                        icon: 'warning',
                        title: '錯誤',
                        text: '該桌號已存在，請選擇其他桌號',
                    });
                    return;
                }

                // 將新桌號暫時加入 tableList，未立刻儲存到後端
                this.tableList.push({
                    table_number: this.newTable.table_number,
                    table_capacity: this.newTable.table_capacity,
                    table_status: 'AVAILABLE'
                });

                // 清空 newTable 以便下一次輸入
                this.newTable = { table_number: '', table_capacity: '', table_status: 'AVAILABLE' };
            }

            // 顯示新的新增行
            this.showNewTableRow = true;
        },

        // 刪除桌位
        removeTable (index) {
            const table = this.tableList[index];
            
            // 檢查狀態，如果是 RESERVED 或 ACTIVE，則禁止刪除
            if (table.table_status === 'RESERVED' || table.table_status === 'ACTIVE') {
                Swal.fire({
                    icon: 'error',
                    title: '無法刪除桌位',
                    text: `桌位 ${table.table_number} 正在使用或已預訂，無法刪除。`,
                    confirmButtonText: '確認'
                });
                return; // 阻止刪除
            }

            // 否則，執行刪除
            this.tableList.splice(index, 1);
        },

        // 刪除新增桌號欄位
        deleteNewTable () {
            this.newTable = { table_number: '', table_capacity: '', table_status: 'AVAILABLE' };
            this.showNewTableRow = false;
        },

        // 儲存操作，包括新增桌位
        async saveChanges() {
            try {
                // 如果顯示了新增桌位的行，才檢查 newTable 是否有輸入正確的桌號和容納人數
                if (this.showNewTableRow) {
                    if (!this.newTable.table_number.trim() || !this.newTable.table_capacity) {
                        Swal.fire({
                            icon: 'warning',
                            title: '錯誤',
                            text: '請輸入桌號並選擇容納人數',
                        });
                        return; // 阻止儲存操作
                    }

                    // 檢查桌號是否符合格式（大寫字母+兩個數字）
                    const tableNumberPattern = /^[A-Z]\d{2}$/;
                    if (!this.newTable.table_number.trim().match(tableNumberPattern)) {
                        Swal.fire({
                            icon: 'warning',
                            title: '桌號格式錯誤',
                            text: '桌號必須是一個大寫字母加兩個數字（如 A01）。',
                        });
                        return; // 阻止儲存操作
                    }

                    const existingTable = this.tableList.find(table => table.table_number === this.newTable.table_number);
                    if (existingTable) {
                        Swal.fire({
                            icon: 'warning',
                            title: '錯誤',
                            text: '該桌號已存在，請選擇其他桌號',
                        });
                        return; // 阻止儲存操作
                    }

                    // 將新桌號加入 tableList
                    this.tableList.push({
                        table_number: this.newTable.table_number,
                        table_capacity: this.newTable.table_capacity,
                        table_status: 'AVAILABLE'  // 預設狀態
                    });

                    // 發送新增桌位請求
                    const requestData = {
                        tableNumber: this.newTable.table_number,
                        tableCapacity: parseInt(this.newTable.table_capacity),
                        tableStatus: 'AVAILABLE'
                    };
                    await axios.post('http://localhost:8080/tableManagement/createTable', requestData);
                }

                // 2. 處理已修改的桌位（僅修改容納人數，桌號未變）
                const updatedTables = this.tableList.filter(table => {
                    const originalTable = this.originalTableList.find(orig => orig.table_number === table.table_number);
                    return originalTable && originalTable.table_capacity !== table.table_capacity;  // 僅容納人數不同的桌位
                });

                for (const table of updatedTables) {
                    // 檢查桌位狀態是否為 RESERVED 或 ACTIVE，阻止變更
                    if (table.table_status === 'RESERVED' || table.table_status === 'ACTIVE') {
                        Swal.fire({
                            icon: 'error',
                            title: '無法修改',
                            text: `桌位 ${table.table_number} 已被預訂或正在使用，無法進行修改。`,
                            confirmButtonText: '確認'
                        }).then(() => {
                            this.loadInitialTableData(); // 警告視窗關閉後重新加載數據
                        });
                        return; // 終止操作
                    }

                    // 刪除舊桌位並重新創建新桌位
                    await axios.delete(`http://localhost:8080/tableManagement/deleteTable/${table.table_number}`);

                    // 創建新桌位（替代原來的桌位）
                    const requestData = {
                        tableNumber: table.table_number,
                        tableCapacity: parseInt(table.table_capacity),
                        tableStatus: 'AVAILABLE'
                    };
                    await axios.post('http://localhost:8080/tableManagement/createTable', requestData);
                }

                // 3. 處理刪除桌位
                const deletedTables = this.originalTableList.filter(orig => !this.tableList.some(table => table.table_number === orig.table_number));
                for (const table of deletedTables) {
                    await axios.delete(`http://localhost:8080/tableManagement/deleteTable/${table.table_number}`);
                }

                // 更新成功後，刷新頁面數據
                this.loadInitialTableData();
                Swal.fire({
                    icon: 'success',
                    title: '儲存成功',
                    text: '所有變更已成功儲存。',
                });
            } catch (error) {
                console.error('儲存桌位變更時發生錯誤:', error);
                Swal.fire({
                    icon: 'error',
                    title: '儲存失敗',
                    text: '儲存過程中發生錯誤，請稍後再試。',
                });
            }
        },

        // 取消操作
        cancelChanges () {
            Swal.fire({
                icon: 'warning',
                title: '取消變更',
                text: '已取消變更桌位操作。',
            });

            // 還原 tableList 為原始數據
            this.tableList = JSON.parse(JSON.stringify(this.originalTableList)); 

            // 隱藏新增桌號行，並重置 newTable
            this.showNewTableRow = false;
            this.newTable = { table_number: '', table_capacity: '', table_status: 'AVAILABLE' };

            // 清空所有輸入匡
            document.querySelectorAll('.tableNumber').forEach(input => input.value = '');

            document.querySelectorAll('.tableCapacity').forEach(select => select.selectedIndex = 0);
        }
    }
};
</script>

<template>
<!-- 桌號、訂位管理區域 -->
<div class="managementArea">
    <div class="managementList">
        <ul>
            <li v-for="(item, index) in managementItems" :key="index" :class="{ active: selectedMenu === item }" @click="selectMenu(item)">
                {{ item }}
            </li>
        </ul>
    </div>
</div>

<!-- 桌號管理內容顯示區域 -->
<div class="tableManagementContentArea" v-if="selectedMenu === '桌號管理'">
    <!-- 顯示桌號標題 -->
    <h2 class="tableNumberTitle">桌號管理</h2>

    <!-- 顯示桌號注意事項 -->
    <p class="reminderText">桌號必須是一個大寫字母加兩個數字（如 A01）</p>

    <!-- 顯示桌號表格區域 -->
    <div class="tableArea">
        <!-- 顯示桌號表格列表 -->
        <table class="tableList">
            <!-- 桌號列表頭 -->
            <thead>
                <tr>
                    <th>桌號</th>
                    <th>容納人數</th>
                    <th>編輯</th>
                </tr>
            </thead>

            <!-- 桌號列表內容 -->
            <tbody>
                <!-- 桌號列表行 -->
                <tr v-for="(table, index) in tableList" :key="index">
                    <!-- 桌號 -->
                    <td>
                        <input class="tableNumber" v-model="table.table_number" type="text" placeholder="輸入桌號" />
                    </td>

                    <!-- 容納人數 -->
                    <td>
                        <select class="tableCapacity" v-model="table.table_capacity" >
                            <option value="" disabled>選擇容納人數</option>
                            <option v-for="option in capacityOptions" :key="option" :value="option">
                                {{ option }}
                            </option>
                        </select>
                    </td>

                    <!-- 刪除 Button -->
                    <td>
                        <button class="trashButton" @click="removeTable(index)">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
    
                <!-- 新增桌號行 -->
                <tr v-if="showNewTableRow">
                    <!-- 桌號 -->
                    <td>
                        <input class="tableNumber" v-model="newTable.table_number" type="text" placeholder="輸入桌號" />
                    </td>

                    <!-- 容納人數 -->
                    <td>
                        <select class="tableCapacity" v-model="newTable.table_capacity">
                            <option value="" disabled>選擇容納人數</option>
                            <option v-for="option in capacityOptions" :key="option" :value="option">
                                {{ option }}
                            </option>
                        </select>
                    </td>

                    <!-- 刪除 Button -->
                    <td>
                        <button class="trashButton" @click="deleteNewTable">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- 新增 Button -->
        <div class="addButtonArea">
            <button class="addButton" @click="addTableRow">
                <i class="fa-solid fa-circle-plus"></i>
            </button>
        </div>
    </div>

    <!-- 取消、儲存操作按鈕區域 -->
    <div class="buttonArea">
        <button class="cancelButton" @click="cancelChanges">取消</button>
        <button class="saveButton" @click="saveChanges">儲存</button>
    </div>
</div>

<!-- 訂位管理內容顯示區域 -->
<div class="reserveManagementContentArea" v-if="selectedMenu === '訂位時段管理'">
    <!-- 顯示訂位管理標題 -->
    <h2 class="reserveTitle">訂位時段管理</h2>

    <!-- 顯示訂位管理注意事項 -->
    <p class="reminderText">請依照步驟依序設定</p>

    <!-- 顯示桌號表格區域 -->
    <div class="tableArea">
            <!-- 顯示桌號表格列表 -->
            <table class="tableList">
                <!-- 桌號列表頭 -->
                <thead>
                    <tr>
                        <th>桌號</th>
                        <th>容納人數</th>
                        <th>編輯</th>
                    </tr>
                </thead>

                <!-- 桌號列表內容 -->
                <tbody>
                    <!-- 桌號列表行 -->
                    <tr v-for="(table, index) in tableList" :key="index">
                        <!-- 桌號 -->
                        <td>
                            <input class="tableNumber" v-model="table.table_number" type="text" placeholder="輸入桌號" />
                        </td>

                        <!-- 容納人數 -->
                        <td>
                            <select class="tableCapacity" v-model="table.table_capacity" >
                                <option value="" disabled>選擇容納人數</option>
                                <option v-for="option in capacityOptions" :key="option" :value="option">
                                    {{ option }}
                                </option>
                            </select>
                        </td>

                        <!-- 刪除 Button -->
                        <td>
                            <button class="trashButton" @click="removeTable(index)">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
    
                    <!-- 新增桌號行 -->
                    <tr v-if="showNewTableRow">
                        <!-- 桌號 -->
                        <td>
                            <input class="tableNumber" v-model="newTable.table_number" type="text" placeholder="輸入桌號" />
                        </td>

                        <!-- 容納人數 -->
                        <td>
                            <select class="tableCapacity" v-model="newTable.table_capacity">
                                <option value="" disabled>選擇容納人數</option>
                                <option v-for="option in capacityOptions" :key="option" :value="option">
                                    {{ option }}
                                </option>
                            </select>
                        </td>

                        <!-- 刪除 Button -->
                        <td>
                            <button class="trashButton" @click="deleteNewTable">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- 新增 Button -->
            <div class="addButtonArea">
                <button class="addButton" @click="addTableRow">
                    <i class="fa-solid fa-circle-plus"></i>
                </button>
            </div>
    </div>

    <!-- 取消、儲存操作按鈕區域 -->
    <div class="buttonArea">
            <button class="cancelButton" >取消</button>
            <button class="saveButton" >儲存</button>
    </div>
</div>
</template>

<style scoped lang="scss">
$divColor: #fff;
$addDiv: #343a3f;
$suppliable: #1ce34e;
$soldOut: #e02d11;

.managementArea {
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

.tableManagementContentArea {
    width: 80%;
    height: 100%;
    border-radius: 10px;
    background-color: $divColor;
    flex: 1;
    padding: 20px 35px;
    position: absolute;
    top: 0%;
    right: 0%;

    .tableNumberTitle {
        font-size: 25px;
        letter-spacing: 4px;
        margin-bottom: 10px;
    }

    .reminderText {
        margin-bottom: 20px;
        color: black;
        opacity: 0.6;
    }

    .tableArea {
        width: 100%;
        height: 85%;
        border: 2px solid #ccc; /* 表格外框邊線 */
        padding: 15px 10px;
        max-height: 650px;
        overflow-y: auto;

        .tableList {
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

                    .tableNumber {
                        width: 80%;
                        height: 35px;
                        border: none;
                        background-color: transparent;
                        font-size: 20px;
                        text-align: center;
                        outline: none;
                    }

                    .tableCapacity {
                        width: 80%;
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

                    .trashButton {
                        border: none;
                        background-color: transparent;
                        font-size: 30px;
                        cursor: pointer;
                    }
                }
            }
        }

        .addButtonArea {
            width: 100%;
            height: 10%;
            display: flex;
            justify-content: center;
            align-items: center;

            .addButton {
                border: none;
                background-color: transparent;
                font-size: 25px;
                margin-top: 15px;
                cursor: pointer;
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

    .tableArea {
        width: 100%;
        height: 85%;
        border: 2px solid #ccc; /* 表格外框邊線 */
        padding: 15px 10px;
        max-height: 650px;
        overflow-y: auto;

        .tableList {
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

                    .tableNumber {
                        width: 80%;
                        height: 35px;
                        border: none;
                        background-color: transparent;
                        font-size: 20px;
                        text-align: center;
                        outline: none;
                    }

                    .tableCapacity {
                        width: 80%;
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

                    .trashButton {
                        border: none;
                        background-color: transparent;
                        font-size: 30px;
                        cursor: pointer;
                    }
                }
            }
        }

        .addButtonArea {
            width: 100%;
            height: 10%;
            display: flex;
            justify-content: center;
            align-items: center;

            .addButton {
                border: none;
                background-color: transparent;
                font-size: 25px;
                margin-top: 15px;
                cursor: pointer;
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
