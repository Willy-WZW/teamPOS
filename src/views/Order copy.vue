<script>
import LeftBar from "@/components/LeftBar.vue";
import Categores from "@/components/Order/Categores.vue";
import MenuItems from "@/components/Order/MenuItems.vue";
import CustomPopup from "@/components/Order/CustomPopup.vue";
import OrderSummary from "@/components/Order/OrderSummary.vue";

export default {
    data() {
        return {
            // 模擬資料架構
            orderMenuData: {
                code: 200,
                message: "Success!",
                categoriesList: [
                    { categoryId: 2, category: "漢堡" },
                    { categoryId: 3, category: "吐司" },
                    { categoryId: 4, category: "蛋餅" },
                    { categoryId: 5, category: "沙拉" },
                    { categoryId: 6, category: "炒泡麵" },
                    { categoryId: 7, category: "炸物" },
                    { categoryId: 8, category: "飲料" },
                    { categoryId: 9, category: "套餐" },
                ],
                menuItemList: [
                    { categoryId: 2, mealName: "歐姆蛋堡", price: 55, workstationId: 1, available: 1, picture: "base64" },
                    { categoryId: 2, mealName: "燻雞堡", price: 65, workstationId: 1, available: 1, picture: "base64" },
                    { categoryId: 2, mealName: "牛肉堡", price: 75, workstationId: 1, available: 1, picture: "base64" },
                    { categoryId: 2, mealName: "田園蔬菜堡", price: 40, workstationId: 1, available: 1, picture: "base64" },
                    { categoryId: 2, mealName: "豬肉堡", price: 70, workstationId: 1, available: 1, picture: "base64" },
                    { categoryId: 3, mealName: "培根蛋吐司", price: 40, workstationId: 2, available: 1, picture: "base64" },
                    { categoryId: 3, mealName: "火腿蛋吐司", price: 40, workstationId: 2, available: 1, picture: "base64" },
                    { categoryId: 3, mealName: "煎蛋吐司", price: 30, workstationId: 2, available: 1, picture: "base64" },
                    { categoryId: 3, mealName: "薯餅蛋吐司", price: 45, workstationId: 2, available: 1, picture: "base64" },
                    { categoryId: 3, mealName: "鮪魚蛋吐司", price: 40, workstationId: 2, available: 1, picture: "base64" },
                    { categoryId: 4, mealName: "九層塔蛋餅", price: 45, workstationId: 3, available: 1, picture: "base64" },
                    { categoryId: 4, mealName: "原味蛋餅", price: 30, workstationId: 3, available: 1, picture: "base64" },
                    { categoryId: 4, mealName: "火腿蛋餅", price: 45, workstationId: 3, available: 1, picture: "base64" },
                    { categoryId: 4, mealName: "蔬菜蛋餅", price: 40, workstationId: 3, available: 1, picture: "base64" },
                    { categoryId: 4, mealName: "起司蛋餅", price: 40, workstationId: 3, available: 1, picture: "base64" },
                    { categoryId: 5, mealName: "凱薩沙拉", price: 70, workstationId: 4, available: 1, picture: "base64" },
                    { categoryId: 5, mealName: "煙燻鮭魚沙拉", price: 130, workstationId: 4, available: 1, picture: "base64" },
                    { categoryId: 5, mealName: "鮮蝦沙拉", price: 80, workstationId: 4, available: 1, picture: "base64" },
                    { categoryId: 6, mealName: "原味炒泡麵", price: 45, workstationId: 5, available: 1, picture: "base64" },
                    { categoryId: 6, mealName: "泰式炒泡麵", price: 50, workstationId: 5, available: 1, picture: "base64" },
                    { categoryId: 6, mealName: "牛肉炒泡麵", price: 60, workstationId: 5, available: 1, picture: "base64" },
                    { categoryId: 6, mealName: "豬肉炒泡麵", price: 55, workstationId: 5, available: 1, picture: "base64" },
                    { categoryId: 7, mealName: "洋蔥圈", price: 35, workstationId: 6, available: 1, picture: "base64" },
                    { categoryId: 7, mealName: "薯條", price: 40, workstationId: 6, available: 1, picture: "base64" },
                    { categoryId: 7, mealName: "薯餅", price: 30, workstationId: 6, available: 1, picture: "base64" },
                    { categoryId: 7, mealName: "雞塊", price: 40, workstationId: 6, available: 1, picture: "base64" },
                    { categoryId: 8, mealName: "紅茶", price: 25, workstationId: 7, available: 1, picture: "base64" },
                    { categoryId: 8, mealName: "綠茶", price: 25, workstationId: 7, available: 1, picture: "base64" },
                    { categoryId: 8, mealName: "美式咖啡", price: 50, workstationId: 7, available: 1, picture: "base64" },
                    { categoryId: 8, mealName: "鮮奶紅茶", price: 35, workstationId: 7, available: 1, picture: "base64" },
                    { categoryId: 8, mealName: "鮮奶綠茶", price: 35, workstationId: 7, available: 1, picture: "base64" },
                ],
                optionList: [
                    {
                        categoryId: 2,
                        optionTitle: "加料",
                        optionType: "checkbox",
                        optionItems: [
                            { optionContent: "培根", extraPrice: 20 },
                            { optionContent: "蔬菜", extraPrice: 20 },
                            { optionContent: "雙層", extraPrice: 40 },
                        ],
                    },
                    {
                        categoryId: 2,
                        optionTitle: "加蛋",
                        optionType: "radio",
                        optionItems: [
                            { optionContent: "全熟蛋", extraPrice: 15 },
                            { optionContent: "半熟蛋", extraPrice: 15 },
                            { optionContent: "歐姆蛋", extraPrice: 25 },
                        ],
                    },
                    {
                        categoryId: 3,
                        optionTitle: "加蛋",
                        optionType: "radio",
                        optionItems: [
                            { optionContent: "全熟蛋", extraPrice: 15 },
                            { optionContent: "半熟蛋", extraPrice: 15 },
                            { optionContent: "歐姆蛋", extraPrice: 25 },
                        ],
                    },
                    {
                        categoryId: 3,
                        optionTitle: "加起司",
                        optionType: "radio",
                        optionItems: [
                            { optionContent: "不炙燒", extraPrice: 10 },
                            { optionContent: "炙燒", extraPrice: 10 },
                        ],
                    },
                    {
                        categoryId: 4,
                        optionTitle: "加料",
                        optionType: "checkbox",
                        optionItems: [
                            { optionContent: "九層塔", extraPrice: 10 },
                            { optionContent: "火腿", extraPrice: 10 },
                            { optionContent: "起司", extraPrice: 10 },
                        ],
                    },
                    {
                        categoryId: 4,
                        optionTitle: "辣",
                        optionType: "radio",
                        optionItems: [
                            { optionContent: "不辣", extraPrice: 0 },
                            { optionContent: "加特製辣醬", extraPrice: 0 },
                        ],
                    },
                    {
                        categoryId: 5,
                        optionTitle: "加料",
                        optionType: "checkbox",
                        optionItems: [
                            { optionContent: "水煮蛋", extraPrice: 10 },
                            { optionContent: "酪梨", extraPrice: 20 },
                            { optionContent: "雞胸肉", extraPrice: 30 },
                        ],
                    },
                    {
                        categoryId: 5,
                        optionTitle: "醬料",
                        optionType: "radio",
                        optionItems: [
                            { optionContent: "不醬", extraPrice: 0 },
                            { optionContent: "低脂醬", extraPrice: 0 },
                        ],
                    },
                    {
                        categoryId: 6,
                        optionTitle: "加料",
                        optionType: "checkbox",
                        optionItems: [
                            { optionContent: "肉多多", extraPrice: 20 },
                            { optionContent: "菜多多", extraPrice: 15 },
                        ],
                    },
                    {
                        categoryId: 6,
                        optionTitle: "加蛋",
                        optionType: "radio",
                        optionItems: [
                            { optionContent: "全熟蛋", extraPrice: 15 },
                            { optionContent: "半熟蛋", extraPrice: 15 },
                            { optionContent: "炒蛋", extraPrice: 20 },
                        ],
                    },
                    {
                        categoryId: 6,
                        optionTitle: "辣度",
                        optionType: "radio",
                        optionItems: [
                            { optionContent: "不辣", extraPrice: 0 },
                            { optionContent: "中辣", extraPrice: 0 },
                            { optionContent: "大辣", extraPrice: 0 },
                            { optionContent: "小辣", extraPrice: 0 },
                        ],
                    },
                    {
                        categoryId: 7,
                        optionTitle: "胡椒",
                        optionType: "radio",
                        optionItems: [
                            { optionContent: "不胡椒", extraPrice: 0 },
                            { optionContent: "多胡椒", extraPrice: 0 },
                        ],
                    },
                    {
                        categoryId: 7,
                        optionTitle: "醬料",
                        optionType: "radio",
                        optionItems: [
                            { optionContent: "不醬", extraPrice: 0 },
                            { optionContent: "番茄醬", extraPrice: 0 },
                            { optionContent: "糖醋醬", extraPrice: 0 },
                        ],
                    },
                    {
                        categoryId: 8,
                        optionTitle: "冰塊",
                        optionType: "radio",
                        optionItems: [
                            { optionContent: "去冰", extraPrice: 0 },
                            { optionContent: "少冰", extraPrice: 0 },
                            { optionContent: "微冰", extraPrice: 0 },
                            { optionContent: "正常冰", extraPrice: 0 },
                        ],
                    },
                    {
                        categoryId: 8,
                        optionTitle: "加料",
                        optionType: "checkbox",
                        optionItems: [
                            { optionContent: "椰果", extraPrice: 10 },
                            { optionContent: "珍珠", extraPrice: 10 },
                            { optionContent: "粉粿", extraPrice: 10 },
                        ],
                    },
                    {
                        categoryId: 8,
                        optionTitle: "甜度",
                        optionType: "radio",
                        optionItems: [
                            { optionContent: "半糖", extraPrice: 0 },
                            { optionContent: "微糖", extraPrice: 0 },
                            { optionContent: "正常甜", extraPrice: 0 },
                            { optionContent: "無糖", extraPrice: 0 },
                        ],
                    },
                ],
                comboList: [
                    {
                        comboName: "一號餐",
                        comboDetail: [
                            { categoryId: 2, workstationId: 2, dishesList: [{ dishName: "歐姆蛋堡", price: 55 }] },
                            {
                                categoryId: 7,
                                workstationId: 7,
                                dishesList: [
                                    { dishName: "薯條", price: 40 },
                                    { dishName: "雞塊", price: 40 },
                                    { dishName: "洋蔥圈", price: 35 },
                                ],
                            },
                            {
                                categoryId: 8,
                                workstationId: 8,
                                dishesList: [
                                    { dishName: "紅茶", price: 25 },
                                    { dishName: "綠茶", price: 25 },
                                    { dishName: "美式咖啡", price: 50 },
                                ],
                            },
                        ],
                        discountAmount: -20,
                    },
                    {
                        comboName: "二號餐",
                        comboDetail: [
                            { categoryId: 6, workstationId: 6, dishesList: [{ dishName: "泰式炒泡麵", price: 50 }] },
                            {
                                categoryId: 2,
                                workstationId: 2,
                                dishesList: [
                                    { dishName: "豬肉堡", price: 70 },
                                    { dishName: "牛肉堡", price: 75 },
                                ],
                            },
                        ],
                        discountAmount: -25,
                    },
                    {
                        comboName: "三號餐",
                        comboDetail: [
                            { categoryId: 5, workstationId: 5, dishesList: [{ dishName: "鮮蝦沙拉", price: 80 }] },
                            {
                                categoryId: 4,
                                workstationId: 4,
                                dishesList: [
                                    { dishName: "九層塔蛋餅", price: 45 },
                                    { dishName: "火腿蛋餅", price: 45 },
                                    { dishName: "蔬菜蛋餅", price: 40 },
                                ],
                            },
                        ],
                        discountAmount: -30,
                    },
                    {
                        comboName: "四號餐",
                        comboDetail: [
                            { categoryId: 5, workstationId: 5, dishesList: [{ dishName: "凱薩沙拉", price: 70 }] },
                            {
                                categoryId: 8,
                                workstationId: 8,
                                dishesList: [
                                    { dishName: "紅茶", price: 25 },
                                    { dishName: "綠茶", price: 25 },
                                    { dishName: "鮮奶紅茶", price: 35 },
                                    { dishName: "鮮奶綠茶", price: 35 },
                                ],
                            },
                        ],
                        discountAmount: -15,
                    },
                    {
                        comboName: "五號餐",
                        comboDetail: [
                            { categoryId: 3, workstationId: 3, dishesList: [{ dishName: "原味蛋吐司", price: 30 }] },
                            {
                                categoryId: 7,
                                workstationId: 7,
                                dishesList: [
                                    { dishName: "薯條", price: 40 },
                                    { dishName: "雞塊", price: 40 },
                                ],
                            },
                            {
                                categoryId: 8,
                                workstationId: 8,
                                dishesList: [
                                    { dishName: "紅茶", price: 25 },
                                    { dishName: "綠茶", price: 25 },
                                    { dishName: "美式咖啡", price: 50 },
                                    { dishName: "鮮奶紅茶", price: 35 },
                                    { dishName: "鮮奶綠茶", price: 35 },
                                ],
                            },
                        ],
                        discountAmount: -10,
                    },
                ],
                tableNumberList: ["A01", "A02", "A03", "A04", "A05"],
            },
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
        };
    },
    components: {
        LeftBar,
        Categores,
        MenuItems,
        CustomPopup,
        OrderSummary,
    },
    computed: {},
    mounted() {
        //this.fetchOrderMenuData();

        // 串接後端後刪掉
        this.categoriesList = this.orderMenuData.categoriesList;
        this.menuItemsList = this.orderMenuData.menuItemList;
        this.optionsList = this.orderMenuData.optionList;
        this.combosList = this.orderMenuData.comboList;
        this.tablesList = this.orderMenuData.tableNumberList;

        // 預設顯示第一個分類
        if (this.categoriesList.length > 0) {
            const firstCategoryId = this.categoriesList[0].categoryId;
            this.filterMenuItems(firstCategoryId);
        }
    },
    methods: {
        // fetchOrderData() {
        //     axios
        //         .get("/api/getOrderData")
        //         .then((response) => {
        //             this.orderMenuData = response.data; // 用後端資料替換初始化的假資料
        //         })
        //         .catch((error) => {
        //             console.error("Error fetching data: ", error);
        //         });
        // },
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
                <CustomPopup v-if="showPopup" :item="selectedItem" :optionsList="optionsList" @close="showPopup = false" />
                <OrderSummary :orderItems="orderItems" />
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
    }
}
</style>
