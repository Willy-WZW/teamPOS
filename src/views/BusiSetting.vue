<script>
import LeftBar from '@/components/LeftBar.vue';
import Header from '@/components/Header.vue';
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    data () {
        return {
            selectedMenu: '桌號管理', // 預設選中的選單項目
            managementItems: ['桌號管理', '訂位時段管理'], // 選單項目
            tableList: [], // 桌位列表，從後端獲取資料
            newTable: { table_number: '', table_capacity: '', table_status: 'AVAILABLE' }, // 新增桌號的初始值
            capacityOptions: ['2人桌', '4人桌', '6人桌', '8人桌', '10人桌'], // 可選的容納人數
        };
    },
    components: {
        LeftBar,
        Header
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
        selectMenu(item) {
            this.selectedMenu = item;
        },

        // 新增桌位，並添加到 tableList 中
        addTable() {
            // 測試輸出 newTable 的內容
            console.log('新桌號資料：', this.newTable);

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

            if (this.newTable.table_number.trim() !== '' && this.newTable.table_capacity !== '') {
                const existingTable = this.tableList.find(table => table.table_number === this.newTable.table_number);

                if (existingTable) {
                    Swal.fire({
                        icon: 'warning',
                        title: '錯誤',
                        text: '該桌號已存在，請選擇其他桌號',
                    });
                    return;
                }

                // 將新桌號加入 tableList
                this.tableList.push({
                    table_number: this.newTable.table_number,
                    table_capacity: this.newTable.table_capacity,
                    table_status: 'AVAILABLE'  // 預設狀態
                });

                // 清空 newTable 以便下次輸入
                this.newTable = { table_number: '', table_capacity: '', table_status: 'AVAILABLE' };
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: '錯誤',
                    text: '請輸入桌號並選擇容納人數',
                });
            }
        },

        // 刪除桌位
        removeTable(index) {
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

        async saveChanges() {
            try {
                // 在儲存前先檢查 newTable 是否還有內容
                if (this.newTable.table_number.trim() !== '' || this.newTable.table_capacity !== '') {
                    // 如果還有資料，提醒使用者必須按+號新增
                    Swal.fire({
                        icon: 'warning',
                        title: '未完成新增操作',
                        text: '請先按「+」新增桌號，才能儲存變更。',
                        confirmButtonText: '確定'
                    });
                    return; // 阻止儲存操作
                }

                // 1. 判斷新增的桌位（只存在於 `tableList` 中的桌位）
                const newTables = this.tableList.filter(table => !this.originalTableList.some(orig => orig.table_number === table.table_number));
                
                // 發送新增桌位請求
                for (const table of newTables) {
                    // 構造正確的請求數據
                    const requestData = {
                        tableNumber: table.table_number,  // 確保字段名稱與後端一致
                        tableCapacity: parseInt(table.table_capacity),  // 確保傳遞的是數字
                        tableStatus: 'AVAILABLE'  // 預設狀態
                    };

                    // 發送 POST 請求
                    await axios.post('http://localhost:8080/tableManagement/createTable', requestData);
                }

                // 發送刪除桌位請求
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
                    confirmButtonText: '確定'
                });
            } catch (error) {
                console.error('儲存桌位變更時發生錯誤:', error);
                Swal.fire({
                    icon: 'error',
                    title: '儲存失敗',
                    text: '儲存過程中發生錯誤，請稍後再試。',
                    confirmButtonText: '確定'
                });
            }
        },

        // 取消操作
        cancelChanges() {
            // 恢復為初始數據
            this.tableList = JSON.parse(JSON.stringify(this.originalTableList)); // 還原初始桌位數據
            alert('已取消變更');
        }
    }
};
</script>

<template>
    <div class="big">
        <div class="leftBar">
            <LeftBar />
        </div>

        <div class="mainArea">
            <div class="header">
                <Header />
            </div>

            <div class="managementArea">
                <div class="managementList">
                    <ul>
                        <li v-for="(item, index) in managementItems" :key="index" :class="{ active: selectedMenu === item }" @click="selectMenu(item)">
                            {{ item }}
                        </li>
                    </ul>
                </div>
            </div>

            <div class="managementContentArea">
                <h2 class="title">{{ selectedMenu }}</h2>

                <p class="reminderText">桌號必須是一個大寫字母加兩個數字（如 A01）</p>

                <div class="tableArea">
                    <table class="tableList">
                        <thead>
                            <tr>
                                <th>桌號</th>
                                <th>容納人數</th>
                                <th>編輯</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(table, index) in tableList" :key="index">
                                <td>
                                    <input class="tableNumber" v-model="table.table_number" type="text" placeholder="輸入桌號" />
                                </td>
                                <td>
                                    <select class="tableCapacity" v-model="table.table_capacity" >
                                        <option value="" disabled>選擇容納人數</option>
                                        <option v-for="option in capacityOptions" :key="option" :value="option">
                                            {{ option }}
                                        </option>
                                    </select>
                                </td>
                                <td>
                                    <button class="trashButton" @click="removeTable(index)">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- 新增桌號行 -->
                            <tr>
                                <td>
                                    <input class="tableNumber" v-model="newTable.table_number" type="text" placeholder="輸入桌號" />
                                </td>
                                <td>
                                    <select class="tableCapacity" v-model="newTable.table_capacity">
                                        <option value="" disabled>選擇容納人數</option>
                                        <option v-for="option in capacityOptions" :key="option" :value="option">
                                            {{ option }}
                                        </option>
                                    </select>
                                </td>
                                <td>
                                    <button class="trashButton" @click="removeTable(index)">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="addButtonArea">
                        <button class="addButton" @click="addTable">
                            <i class="fa-solid fa-circle-plus"></i>
                        </button>
                    </div>
                </div>

                <!-- 底部操作按鈕 -->
                <div class="buttonArea">
                    <button class="cancelButton" @click="cancelChanges">取消</button>
                    <button class="saveButton" @click="saveChanges">儲存</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
$divColor: #fff;
$addDiv: #343a3f;
$suppliable: #1ce34e;
$soldOut: #e02d11;

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
            position: absolute;
            top: 2%;
            left: 2%;
        }

        .managementArea {
            width: 18%;
            height: 87%;
            border-radius: 10px;
            background-color: $divColor;
            display: flex;
            justify-content: start;
            align-items: center;
            flex-direction: column;
            position: absolute;
            top: 9.5%;
            left: 2%;

            .managementList {
                width: 100%;
                padding: 10px 0;

                ul {
                    list-style-type: none;
                    padding: 0;

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

        .managementContentArea {
            width: 77%;
            height: 87%;
            border-radius: 10px;
            background-color: $divColor;
            flex: 1;
            padding: 20px 35px;
            position: absolute;
            top: 9.5%;
            right: 2%;

            .title {
                font-size: 25px;
                letter-spacing: 4px;
                margin-bottom: 10px;
            }

            .reminderText {
                margin-bottom: 15px;
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
                margin-top: 30px;
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
    }
}
</style>
