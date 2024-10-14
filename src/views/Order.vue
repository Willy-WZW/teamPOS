<script>
import LeftBar from "@/components/LeftBar.vue";
import Categores from "@/components/Order/Categores.vue";
import MenuItems from "@/components/Order/MenuItems.vue";
import CustomPopup from "@/components/Order/CustomPopup.vue";

export default {
    data() {
        return {
            // 資料分類
            categoriesList: [],
            menuItemsList: [],
            optionsList: [],
            combosList: [],
            tablesList: [],

            //邏輯變數
            selectedItem: null, // 存放選中的餐點或套餐資訊
            showPopup: false, // 控制彈跳視窗的顯示
            orderItems: [], // 儲存所有選擇的訂單項目
            activeCategoryId: null, // 追蹤當前選中的分類

            orderList: [], // 存放所有從子元件傳來的訂單資料
            selectedTableNumber: null, // 被選中的桌號
        };
    },
    components: {
        LeftBar,
        Categores,
        MenuItems,
        CustomPopup,
    },
    computed: {},
    mounted() {
        this.fetchOrderData();
        // 預設顯示第一個分類：失效中待搶救
        if (this.categoriesList.length > 0) {
            const firstCategoryId = this.categoriesList[0].categoryId;
            this.filterMenuItems(firstCategoryId);
        }
        // 預設選中第一個桌號
        if (this.tablesList.length > 0) {
            this.selectedTableNumber = this.tablesList[0];
        }
    },
    methods: {
        fetchOrderData() {
            fetch("http://localhost:8080/pos/getOrderMenu", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json(); // 解析回應為 JSON 格式
                })
                .then((data) => {
                    this.orderMenuData = data;
                    this.categoriesList = this.orderMenuData.categoriesList;
                    this.menuItemsList = this.orderMenuData.menuItemList;
                    this.optionsList = this.orderMenuData.optionList;
                    this.combosList = this.orderMenuData.comboList;
                    this.tablesList = this.orderMenuData.tableNumberList;
                })
                .catch((error) => {
                    console.error("取得菜單資料失敗:", error);
                });
        },
        filterMenuItems(categoryId) {
            this.activeCategoryId = categoryId; // 更新 active 狀態

            const selectCategory = this.categoriesList.find((cat) => cat.categoryId === categoryId);

            if (selectCategory && selectCategory.category.includes("套餐")) {
                this.menuItemsList = []; // 清空單點餐點,傳到子元件的的menuItemsList為空, 只有combosList有值
            } else {
                this.menuItemsList = this.orderMenuData.menuItemList.filter((item) => item.categoryId === categoryId);
            }
        },
        handleItemSelect(item) {
            this.selectedItem = item;
            this.showPopup = true;
        },
        // 接收子元件傳來的訂單資料，並將其加入到 orderList
        handleAddToOrder(order) {
            console.log("收到的訂單資料:", order);

            this.orderList = [...this.orderList, ...order]; // 將資料加入 orderList
        },
        submitOrder() {
            const now = new Date();
            const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, "");
            const formattedTime = now.toTimeString().slice(0, 5).replace(/:/g, "");
            const orderId = `${formattedDate}${formattedTime}${this.selectedTableNumber}`;

            // 將每個訂單物件轉換為符合格式的結構
            const ordersList = this.orderList.map((item) => ({
                orderId: orderId,
                orderMealId: item.orderMealId,
                comboName: item.comboName,
                mealName: item.mealName,
                options: item.options,
                workstationId: item.workstationId,
                price: item.price,
                mealStatus: "準備中", // 固定值
                tableNumber: this.selectedTableNumber, // 被選中的桌號
                orderTime: now.toISOString(), // ISO 時間格式
                checkout: false, // 固定值
            }));

            // 封裝為最終送出的資料結構
            const finalOrder = {
                ordersList: ordersList,
            };

            console.log("送出的訂單資料:", finalOrder); // 預覽格式是否正確

            //送出訂單的 API 請求
            fetch("http://localhost:8080/pos/addOrder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(finalOrder),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    console.log("訂單已成功送出！");
                    this.resetOrder();
                })
                .catch((error) => {
                    console.error("送出訂單失敗:", error);
                });
        },
        resetOrder() {
            this.orderList = [];
            this.selectedTableNumber = null;
            console.log("訂單已重置");
        },
    },
};
</script>

<template>
    <div class="big">
        <div class="leftBar">
            <LeftBar />
        </div>

        <div class="mainArea">

            <div class="menuArea">
                <h2>菜單</h2>
                <Categores :categories="categoriesList" @selectCategory="filterMenuItems" :activeCategoryId="activeCategoryId" />
                <MenuItems
                    :menuItems="menuItemsList"
                    :combos="combosList"
                    @selectItem="handleItemSelect"
                    :currentCategory="categoriesList.find((cat) => cat.categoryId === activeCategoryId)?.category" />
                <CustomPopup v-if="showPopup" :item="selectedItem" :optionsList="optionsList" :categoriesList="categoriesList" @close="showPopup = false" @addToOrder="handleAddToOrder" />
            </div>

            <div class="orderArea">
                <h2>訂單</h2>

                <!-- 桌號(tableNumberList撈資料並綁定選項)及人數選單(1~20人，只供前端使用)-->
                <div class="tableAndCustomerNum">
                    <label for="tableSelect">桌號：</label>
                    <select id="tableSelect" v-model="selectedTableNumber">
                        <option v-for="table in tablesList" :key="table" :value="table">
                            {{ table }}
                        </option>
                    </select>
                </div>
    
                <!-- 餐點明細：顯示從CustomPopupCopy傳來的資料 -->
                <div class="orderSummary">
                    <h2>訂單明細</h2>
                    <pre>{{ orderList }}</pre>
                </div>
    
                <!-- 送出訂單按鈕：將訂單明細包裝成完整req格式接上 api 存入資料庫 -->
    
                <button @click="submitOrder">送出訂單</button>
            </div>

        </div>
        
    </div>
</template>

<style scoped lang="scss">
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
        display: flex;
        justify-content: space-between;
        padding: 20px;
        letter-spacing: 0.2dvw;

        .menuArea {
            width: 70%;
            border: 2px solid black;
        }

        .orderArea {
            width: 30%;
            border: 2px solid black;
        }
    }
}
</style>
