<script>
import LeftBar from "@/components/LeftBar.vue";
//import axios from "axios";

export default {
    data() {
        return {
            categories: [], // 存放所有分類
            selectedCategory: null, // 選擇的分類 ID
            menuItems: [], // 存放所有菜單項目
            filteredMenuItems: [], // 根據分類篩選的菜單項目
            customizationOptions: {}, // 根據分類 ID 存放的客製化選項
            currentCustomizationOptions: [], // 當前菜單項目的客製化選項
            currentCustomization: {}, // 使用者選擇的客製化選項
            showPopup: false, // 是否顯示彈跳視窗
            currentItem: null, // 當前選中的菜單項目
            showBackdrop: false, // 是否顯示背景遮罩
            tables: [], // 桌號選單
            peopleOptions: Array.from({ length: 20 }, (_, i) => i + 1), // 人數選單
            selectedTable: null, // 選擇的桌號
            selectedPeople: 1, // 預設選擇人數
            orderDetails: [], // 訂單明細
            totalAmount: 0, // 計算總價格
        };
    },
    components: {
        LeftBar,
    },
    computed: {
        totalOrderPrice() {
            return this.orderDetails.reduce((total, order) => total + order.totalPrice, 0);
        },
    },
    mounted() {
        this.initializeData(); // 初始化資料
    },
    methods: {
        initializeData() {
            // 模擬假資料的初始化
            const mockData = {
                categories: [
                    // 假資料結構 ( JSON 結構)
                    {
                        categoryId: 1,
                        categoryName: "漢堡",
                        menuItems: [
                            {
                                mealName: "卡拉雞腿堡",
                                price: 150,
                                categoryId: 1,
                            },
                            {
                                mealName: "起司牛肉堡",
                                price: 180,
                                categoryId: 1,
                            },
                        ],
                        options: [
                            {
                                optionTitle: "蛋",
                                optionContent: "不加蛋;半熟蛋;全熟蛋",
                                extraPrice: 0,
                                categoryId: 1,
                            },
                            {
                                optionTitle: "醬料",
                                optionContent: "不加美乃滋;不加番茄醬",
                                extraPrice: 0,
                                categoryId: 1,
                            },
                        ],
                    },
                    {
                        categoryId: 2,
                        categoryName: "飲料",
                        menuItems: [
                            {
                                mealName: "奶茶",
                                price: 50,
                                categoryId: 2,
                            },
                            {
                                mealName: "紅茶",
                                price: 30,
                                categoryId: 2,
                            },
                        ],
                        options: [
                            {
                                optionTitle: "冰塊",
                                optionContent: "去冰;少冰;正常冰",
                                extraPrice: 0,
                                categoryId: 2,
                            },
                            {
                                optionTitle: "甜度",
                                optionContent: "無糖;半糖;全糖",
                                extraPrice: 0,
                                categoryId: 2,
                            },
                        ],
                    },
                    {
                        categoryId: 3,
                        categoryName: "點心",
                        menuItems: [
                            {
                                mealName: "洋蔥圈",
                                price: 35,
                                categoryId: 3,
                            },
                            {
                                mealName: "薯條",
                                price: 40,
                                categoryId: 3,
                            },
                        ],
                        options: [
                            {
                                optionTitle: "沾醬",
                                optionContent: "番茄醬;蜂蜜芥末醬;胡椒粉",
                                extraPrice: 0,
                                categoryId: 3,
                            },
                        ],
                    },
                    {
                        categoryId: 4,
                        categoryName: "義大利麵",
                        menuItems: [
                            {
                                mealName: "白醬培根義大利麵",
                                price: 180,
                                categoryId: 4,
                            },
                            {
                                mealName: "青醬蛤蜊義大利麵",
                                price: 190,
                                categoryId: 4,
                            },
                        ],
                        options: [
                            {
                                optionTitle: "麵條硬度",
                                optionContent: "偏硬;普通;偏軟",
                                extraPrice: 0,
                                categoryId: 4,
                            },
                            {
                                optionTitle: "麵條種類",
                                optionContent: "長麵;寬扁麵;筆管麵;螺旋麵;蝴蝶麵",
                                extraPrice: 0,
                                categoryId: 4,
                            },
                            {
                                optionTitle: "加料",
                                optionContent: "蘑菇",
                                extraPrice: 10,
                                categoryId: 4,
                            },
                            {
                                optionTitle: "加料",
                                optionContent: "起司",
                                extraPrice: 15,
                                categoryId: 4,
                            },
                        ],
                    },
                    {
                        categoryId: 5,
                        categoryName: "套餐",
                        menuItems: [
                            {
                                comboName: "1號餐",
                                comboDetail: {
                                    選項1: ["卡拉雞腿堡"],
                                    選項2: ["炸薯條"],
                                    選項3: ["紅茶;奶茶"],
                                },
                                price: 250,
                                discountAmount: -10,
                                categoryId: 5,
                            },
                            {
                                comboName: "2號餐",
                                comboDetail: {
                                    選項1: ["白醬培根義大利麵"],
                                    選項2: ["洋蔥圈"],
                                    選項3: ["紅茶;奶茶"],
                                },
                                price: 300,
                                discountAmount: -20,
                                categoryId: 5,
                            },
                        ],
                        options: [
                            {
                                optionTitle: "飲料",
                                optionContent: "紅茶",
                                extraPrice: 0,
                                categoryId: 5,
                            },
                            {
                                optionTitle: "飲料",
                                optionContent: "奶茶",
                                extraPrice: 20,
                                categoryId: 5,
                            },
                        ],
                    },
                ],
                tables: [{ tableNumber: "A01" }, { tableNumber: "A02" }, { tableNumber: "A03" }, { tableNumber: "A04" }, { tableNumber: "A05" }],
            };

            // 初始化資料
            this.categories = mockData.categories;
            this.tables = mockData.tables;
            this.selectedCategory = this.categories[0]?.categoryId || null;

            // 整理菜單與客製化選項
            this.categories.forEach((category) => {
                this.menuItems = this.menuItems.concat(category.menuItems);
                this.customizationOptions[category.categoryId] = category.options;
            });

            // 預設篩選第一個分類的菜單
            this.filterMenuByCategory(this.selectedCategory);
        },
        filterMenuByCategory(categoryId) {
            this.selectedCategory = categoryId;
            // 根據 categoryId 過濾菜單項目
            this.filteredMenuItems = this.menuItems.filter((item) => item.categoryId === categoryId);
        },
        showItemPopup(item) {
            this.currentItem = item;
            const groupedOptions = {};
            const optionsForCategory = this.customizationOptions[this.selectedCategory];

            optionsForCategory.forEach((option) => {
                if (!groupedOptions[option.optionTitle]) {
                    groupedOptions[option.optionTitle] = [];
                    this.currentCustomization[option.optionTitle] = {}; // 初始化為一個物件
                }
                option.optionContent.split(";").forEach((content) => {
                    groupedOptions[option.optionTitle].push({
                        content,
                        extraPrice: option.extraPrice || 0,
                    });
                    // 為每個選項設置初始狀態為 false
                    this.currentCustomization[option.optionTitle][content] = false;
                });
            });

            this.currentCustomizationOptions = groupedOptions;
            this.totalAmount = item.price; // 初始化總金額為餐點基礎價
            this.showPopup = true;
            this.showBackdrop = true;
        },
        calculateTotalAmount() {
            let total = this.currentItem.price;

            // 遍歷 currentCustomization，將被勾選的項目的 extraPrice 累加到 total 中
            Object.entries(this.currentCustomization).forEach(([optionTitle, options]) => {
                Object.entries(options).forEach(([content, isSelected]) => {
                    if (isSelected) {
                        // 找到該 content 對應的 extraPrice 值
                        const extraPrice = this.currentCustomizationOptions[optionTitle].find((opt) => opt.content === content).extraPrice || 0;
                        total += extraPrice;
                    }
                });
            });

            this.totalAmount = total; // 更新 totalAmount 值
        },
        addToOrder() {
            const newOrder = {
                item: this.currentItem,
                customization: this.currentCustomization,
                totalPrice: this.totalAmount,
            };
            this.orderDetails.push(newOrder);
            this.closePopup();
        },
        closePopup() {
            this.showPopup = false;
            this.showBackdrop = false;
        },
        submitOrder() {
            // 送出訂單邏輯
        },
    },
};
</script>

<template>
    <div class="big">
        <!-- 左側欄位 -->
        <div class="leftBar">
            <LeftBar />
        </div>
        <div class="mainArea">
            <!-- 菜單區塊 -->
            <div class="menuSection">
                <h1>菜單</h1>
                <!-- 各菜單分類區塊 -->
                <div class="categories">
                    <button v-for="category in categories" :key="category.categoryId" @click="filterMenuByCategory(category.categoryId)" :class="{ active: selectedCategory === category.categoryId }">
                        {{ category.categoryName }}
                    </button>
                </div>

                <!-- 餐點區塊 -->
                <div class="menu">
                    <div v-for="item in filteredMenuItems" :key="item.mealName || item.comboName" class="menuItem" @click="showItemPopup(item)">
                        <!-- 模擬餐點圖片位置 -->
                        <div class="imageIcon"><i class="fa-regular fa-image"></i></div>
                        <div class="itemName">{{ item.mealName || item.comboName }}</div>
                        <div class="itemPrice">${{ item.price }}</div>
                    </div>
                </div>
            </div>

            <!-- 彈跳視窗 -->
            <div v-if="showPopup" class="popup">
                <!-- 1. Header 區塊 -->
                <div class="popupHeader">
                    <h3>餐點內容</h3>
                    <span class="closeIcon" @click="closePopup"><i class="bi bi-x-circle"></i></span>
                </div>

                <!-- 2. Item Detail 區塊 -->
                <div class="itemDetail">
                    <div class="itemImage"><i class="fa-regular fa-image"></i></div>
                    <div class="itemName">{{ currentItem.mealName || currentItem.comboName }}</div>
                    <div class="itemPrice">$ {{ currentItem.price }}</div>
                </div>

                <!-- 3. Options 區塊 -->
                <div class="options">
                    <div v-for="(options, optionTitle) in currentCustomizationOptions" :key="optionTitle" class="optionGroup">
                        <h4>{{ optionTitle }}</h4>
                        <div class="optionItem" v-for="option in options" :key="option.content">
                            <input type="checkbox" :id="option.content" :value="option.content" v-model="currentCustomization[optionTitle][option.content]" @change="calculateTotalAmount" />
                            <label :for="option.content">
                                <span class="optionContent">{{ option.content }}</span>
                                <span class="optionPrice">+ {{ option.extraPrice || 0 }} 元</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 4. Total Amount 區塊 -->
                <div class="totalAmount">合計&nbsp;&nbsp; $ {{ totalAmount }}</div>

                <!-- 5. 加入訂單按鈕 -->
                <button class="addOrderButton" @click="addToOrder">加入訂單</button>
            </div>

            <!-- 背景遮罩 -->
            <div v-if="showBackdrop" class="backdrop"></div>

            <!-- 訂單區塊 -->
            <div class="orderSection">
                <h1>訂單</h1>
                <!-- 桌號及人數選單 -->
                <div class="tableSelection">
                    <div class="tableNumber">
                        <span>桌號</span>
                        <select v-model="selectedTable">
                            <option v-for="table in tables" :key="table.tableNumber">{{ table.tableNumber }}</option>
                        </select>
                    </div>
                    <div class="peopleNumber">
                        <span>人數</span>
                        <select v-model="selectedPeople">
                            <option v-for="person in peopleOptions" :key="person">{{ person }}</option>
                        </select>
                    </div>
                </div>

                <!-- 餐點明細區塊 -->
                <div class="orderList">
                    <h2>餐點明細</h2>
                    <div v-for="(order, index) in orderDetails" :key="index" class="orderItem">
                        <div class="itemName">{{ order.item.mealName || order.item.comboName }}</div>
                        <div class="itemPrice">${{ order.totalPrice }}</div>
                        <div class="customization">
                            <span v-for="(option, key) in order.customization" :key="key"> {{ key }}: {{ option }} </span>
                        </div>

                        <div class="orderFooter">
                            <div class="btns">
                                <button @click="editOrder(index)"><i class="bi bi-pencil-square"></i></button>
                                <button @click="deleteOrder(index)"><i class="bi bi-trash-fill"></i></button>
                            </div>
                            <div class="totalPrice">合計 ${{ order.totalPrice }}</div>
                        </div>
                    </div>
                </div>

                <!-- 總價和訂單按鈕 -->
                <div class="submitButton">
                    <div class="totalPrice">合計&nbsp;&nbsp;&nbsp; $ {{ totalOrderPrice }}</div>
                    <button @click="submitOrder">送出訂單</button>
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
        // border: 2px solid black;

        .menuSection {
            width: 70%; /* 固定菜單區塊寬度 */
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(grey, 0.5);
            border-radius: 10px;
            padding: 25px;
            background-color: rgba(white, 1);
            gap: 2%;

            h1 {
                letter-spacing: 0.3dvw;
                font-size: 1.6rem;
            }

            .categories {
                display: flex;
                justify-content: space-between;

                button {
                    letter-spacing: 0.2dvw;
                    width: 17%;
                    padding: 5px 0;
                    border: 1px solid rgba(grey, 0.5);
                    border-radius: 5px;
                    cursor: pointer;
                    background: transparent;
                    font-size: 1rem;
                    font-weight: 400;
                    transition: background 0.3s ease;

                    &.active {
                        border: 3px solid rgba(grey, 1);
                        font-weight: 500;
                    }

                    &:hover {
                        border: 2px solid rgba(grey, 0.8);
                    }
                }
            }

            .menu {
                display: flex;
                flex-wrap: wrap;
                // justify-content: space-around;
                padding: 2% 0;
                gap: 5%;
                height: 85%;
                border-top: 1px dashed rgba(grey, 0.5);

                .menuItem {
                    width: 235px;
                    height: 210px;
                    border: 1px solid rgba(grey, 0.5);
                    background-color: transparent;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 1%;
                    transition: transform 0.3s ease;

                    &:hover {
                        border: 3px solid rgba(grey, 1);
                    }
                    //缺 &.active 的 class

                    .imageIcon {
                        width: 100%;
                        height: 80%;
                        border-radius: 10px;
                        background: rgba(grey, 0.2);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin-bottom: 2%;
                        i {
                            color: rgba(grey, 0.8);
                        }
                    }

                    .itemName {
                        font-size: 1rem;
                        font-weight: 400;
                        width: 100%;
                        padding: 0 2%;
                    }

                    .itemPrice {
                        font-size: 0.9rem;
                        font-weight: 500;
                        text-align: right;
                        width: 100%;
                        padding: 0 2%;
                    }
                }
            }
        }

        .orderSection {
            width: 29%; /* 固定訂單區塊寬度 */
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(grey, 0.5);
            border-radius: 10px;
            padding: 20px;
            background-color: rgba(white, 1);
            gap: 1.3%;

            h1 {
                letter-spacing: 0.3dvw;
                font-size: 1.6rem;
                // border: 2px solid green;
            }

            .tableSelection {
                height: 11%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 2% 2% 4% 2%;
                border-bottom: 1px solid rgba(grey, 0.5);
                // border: 2px solid green;

                span {
                    font-size: 1rem;
                }
                select {
                    margin-left: 10%;
                    width: 70%;
                    background-color: rgba(grey, 0.1);
                    border-radius: 5px;
                    border: none;
                    padding: 3px 20px;
                    font-size: 1rem;
                    color: rgba(grey, 1);
                }
            }

            .orderList {
                border-bottom: 1px solid rgba(grey, 0.5);
                height: 70%;
                display: flex;
                flex-direction: column;
                gap: 1.8%;
                padding: 1.7%;
                overflow-y: scroll;

                h2 {
                    // border: 2px solid red;
                    font-size: 1.2rem;
                }

                .orderItem {
                    border: 1px solid rgba(grey, 0.5);
                    border-radius: 8px;
                    padding: 3%;
                    // border: 2px solid red;

                    .orderHeader {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;

                        .itemName {
                            font-weight: bold;
                            font-size: 16px;
                        }

                        .itemPrice {
                            font-size: 16px;
                            color: #888;
                        }
                    }

                    .orderCustomization {
                        margin-bottom: 10px;

                        ul {
                            padding-left: 20px; /* 使用點狀列表 */
                            list-style-type: disc; /* 設定列表樣式 */

                            li {
                                margin-bottom: 5px;

                                div {
                                    display: flex;
                                    justify-content: space-between;
                                    padding: 2px 0;

                                    span:last-child {
                                        margin-left: 20px;
                                    }
                                }
                            }
                        }
                    }

                    .orderFooter {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        .btns {
                            button {
                                background: transparent;
                                border: none;
                                cursor: pointer;
                                font-size: 20px;
                                margin: 0 5px;

                                &:hover {
                                    color: #555;
                                }
                            }
                        }

                        .totalPrice {
                            font-weight: bold;
                            font-size: 18px;
                        }
                    }
                }
            }

            .submitButton {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: space-between;
                align-items: center;
                // border: 2px solid green;

                .totalPrice {
                    width: 100%;
                    text-align: right;
                    font-weight: bold;
                    font-size: 16px;
                    // border: 2px solid red;
                }

                button {
                    padding: 8px;
                    width: 100%;
                    background: #333;
                    color: #fff;
                    letter-spacing: 0.2dvw;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                }
            }
        }

        .popup {
            position: fixed;
            z-index: 10;
            width: 400px;
            background: rgba(white, 1);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border-radius: 10px;

            .popupHeader {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 1px solid rgba(grey, 0.5);
                padding-bottom: 5px;

                h3 {
                    font-size: 1.3rem;
                }

                .closeIcon {
                    cursor: pointer;
                    font-size: 20px;
                    color: rgba(grey, 0.8);

                    &:hover {
                        color: rgba(black, 0.5);
                    }
                }
            }

            .itemDetail {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
                background-color: rgba(grey, 0.1);
                border-radius: 10px;
                padding: 4%;

                .itemImage {
                    width: 50px;
                    height: 50px;
                    background: rgba(grey, 0.4);
                    border-radius: 5px;
                    margin-right: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    i {
                        color: rgba(grey, 1);
                    }
                }

                .itemName {
                    font-size: 1rem;
                    letter-spacing: 0.1dvw;
                    width: 60%;
                }

                .itemPrice {
                    font-size: 1rem;
                    font-weight: 500;
                    text-align: right;
                }
            }

            .options {
                .optionGroup {
                    margin-bottom: 10px;
                    border: 1px solid rgba(grey, 0.5);
                    border-radius: 10px;
                    padding: 3%;

                    h4 {
                        margin-bottom: 5px;
                        font-size: 1rem;
                        color: #333;
                    }

                    .optionItem {
                        display: flex;
                        align-items: center;
                        margin-bottom: 5px;

                        label {
                            margin-left: 10px;
                            font-size: 0.9rem;
                            display: flex;
                            justify-content: space-between;
                            width: 100%;

                            .optionContent {
                                /* 左側顯示內容 */
                                text-align: left;
                            }

                            .optionPrice {
                                /* 右側顯示額外價格 */
                                text-align: right;
                                margin-left: auto; /* 自動將額外價格推至右側 */
                            }
                        }
                    }
                }
            }

            .totalAmount {
                font-weight: bold;
                font-size: 16px;
                text-align: right;
                margin-bottom: 20px;
            }

            .addOrderButton {
                width: 100%;
                padding: 10px;
                background: #333;
                color: #fff;
                border: none;
                cursor: pointer;
                transition: background 0.3s ease;
                border-radius: 5px;

                &:hover {
                    background: #555;
                }
            }
        }

        .backdrop {
            position: fixed;
            z-index: 5;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
        }
    }
}
</style>
