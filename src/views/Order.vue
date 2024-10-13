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
            selectedTableNumber: "A01", // 當前選擇的桌號
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
        // 預設顯示第一個分類
        if (this.categoriesList.length > 0) {
            const firstCategoryId = this.categoriesList[0].categoryId;
            this.filterMenuItems(firstCategoryId);
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

        handleOrderSubmit(orderDetails) {
            console.log("傳入的訂單資料:", orderDetails); // 查看傳遞的資料格式
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
                <Categores :categories="categoriesList" @selectCategory="filterMenuItems" :activeCategoryId="activeCategoryId" />
                <MenuItems
                    :menuItems="menuItemsList"
                    :combos="combosList"
                    @selectItem="handleItemSelect"
                    :currentCategory="categoriesList.find((cat) => cat.categoryId === activeCategoryId)?.category" />
                <CustomPopup
                    v-if="showPopup"
                    :item="selectedItem"
                    :optionsList="optionsList"
                    :categoriesList="categoriesList"
                    :tableNumber="selectedTableNumber"
                    @close="showPopup = false"
                    @submitOrder="handleOrderSubmit" />
            </div>
        </div>
        <div class="orderArea">
            <!-- 桌號(tableNumberList撈資料並綁定選項)及人數選單(1~20人，只供前端使用)-->
            <!-- 餐點明細：顯示從CustomPopupCopy傳來的資料 -->
            <!-- 送出訂單按鈕：將訂單明細包裝成完整req格式接上 api 存入資料庫 -->
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
