<script>
import LeftBar from "@/components/LeftBar.vue";

export default {
    data() {
        return {
            // Res格式
            orderMenuData: {
                categoriesList: [
                ],
                menuItemList: [
                ],
                optionList: [
                ],
                comboList: [
                ],
                tableNumberList: [
                ],
            },
            // 各項資料分類
            categories: [],
            menuItems: [],
            options: [],
            combos: [],
            tables: [],
            // 邏輯狀態
            peopleOptions: Array.from({ length: 20 }, (_, i) => i + 1), //人數選單
            selectedCategory: null, // 追蹤目前選中的菜單分類
            filteredMenuItems: [], // 篩選後的菜單項目列表
            showPopup: false, // 控制彈出視窗顯示
            currentItem: null, // 目前選中的餐點項目
            showBackdrop: false, // 是否顯示背景遮罩
            selectedOptions: {}, // 儲存已選客製化選項
            selectedDishes: {}, // 儲存選取的套餐品項
            totalAmount: 0, // 總金額
            comboPrice: 0, //套餐價格
            orderDetails: [], // 存放所有加入的餐點訂單資料
        };
    },
    components: {
        LeftBar,
    },
    computed: {},
    mounted() {
        this.fetchOrderData();
    
        // 預設載入第一個分類的餐點
        if (this.categories.length > 0) {
            this.selectedCategory = this.categories[0].categoryId;
            this.filterMenuByCategory(this.selectedCategory);
        }
    },
    methods: {
        fetchOrderData() {


            fetch("http://localhost:8080/pos/getOrderMenu", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json(); // 解析回應為 JSON 格式
            })
                .then(data => {
                    this.orderMenuData = data;
                    this.categories = this.orderMenuData.categoriesList;
                    this.menuItems = this.orderMenuData.menuItemList;
                    this.options = this.orderMenuData.optionList;
                    this.combos = this.orderMenuData.comboList;
                    this.tables = this.orderMenuData.tableNumberList;

                })
                .catch(error => {
                    console.error("取得菜單資料失敗:", error);
                });


          
        },
        // 根據所選分類篩選餐點
        filterMenuByCategory(categoryId) {
            this.selectedCategory = categoryId;
            if (categoryId === 9) {
                // 顯示套餐
                this.filteredMenuItems = this.combos;
            } else {
                // 顯示對應分類的單點餐點
                this.filteredMenuItems = this.menuItems.filter((item) => item.categoryId === categoryId);
            }
        },

        // 套餐基本價格
        getComboPrice(combo) {
            let total = 0;
            combo.comboDetail.forEach((detail) => {
                if (detail.dishesList.length > 0) {
                    // 加上每個 dishesList 中的第一個菜品的價格
                    total += detail.dishesList[0].price;
                }
            });
            total += combo.discountAmount;
            return total;
        },

        // 彈出視窗，顯示餐點詳細資料
        showItemPopup(item) {
            this.currentItem = item;
            this.showPopup = true;
            this.showBackdrop = true;

            if (this.selectedCategory === 9) {
                // 套餐邏輯處理
                this.initializeComboOptions(item);
                this.comboPrice = this.calculateComboTotal();
                this.totalAmount = this.comboPrice;
            } else {
                // 單點邏輯處理
                this.initializeSingleOptions(item);
                this.totalAmount = item.price;
            }
        },

        // 初始化單點客製化選項
        initializeSingleOptions(item) {
            this.selectedOptions = {};
            const optionsForCategory = this.options.filter((opt) => opt.categoryId === this.selectedCategory);
            optionsForCategory.forEach((option) => {
                if (option.optionType === "checkbox") {
                    this.selectedOptions[option.optionTitle] = [];
                } else {
                    this.selectedOptions[option.optionTitle] = null;
                }
            });
        },

        // 初始化套餐選項
        initializeComboOptions(item) {
            this.selectedDishes = {};
            item.comboDetail.forEach((detail) => {
                if (detail.dishesList.length > 0) {
                    // 預設選取每個 category 的第一項 dish
                    this.selectedDishes[detail.categoryId] = detail.dishesList[0];
                }
            });
        },

        // 計算套餐總金額
        calculateComboTotal() {
            let total = 0;
            for (const [categoryId, dish] of Object.entries(this.selectedDishes)) {
                total += dish.price;
            }
            total += this.currentItem.discountAmount;
            return total;
        },

        // 更新套餐總金額
        updateComboTotal() {
            this.totalAmount = this.calculateComboTotal();
        },

        // 更新單點總金額
        updateTotalAmount() {
            let basePrice = this.currentItem.price;
            let additionalPrice = 0;

            // 遍歷選中的選項，根據其類型進行額外價格的加總
            for (const [key, value] of Object.entries(this.selectedOptions)) {
                if (Array.isArray(value)) {
                    // 若為checkbox類型，處理多選項
                    value.forEach((item) => {
                        additionalPrice += item.extraPrice;
                    });
                } else if (value) {
                    // 若為radio類型，處理單一選項
                    additionalPrice += value.extraPrice;
                }
            }

            this.totalAmount = basePrice + additionalPrice;
        },

        // 關閉彈跳視窗
        closePopup() {
            this.showPopup = false;
            this.showBackdrop = false;
        },
        // 加入訂單
        addToOrder() {
            const newOrder = {
                item: this.currentItem, // 存放單點或套餐資料
                customization: { ...this.selectedOptions }, // 已選客製化選項
                selectedDishes: { ...this.selectedDishes }, // 套餐選擇的品項
                totalPrice: this.totalAmount, // 訂單合計金額
            };
            this.orderDetails.push(newOrder); // 新增訂單到 orderDetails
            this.closePopup(); // 關閉彈跳視窗
        },

        // 刪除訂單
        deleteOrder(index) {
            this.orderDetails.splice(index, 1);
        },

        // 編輯訂單 (可自定義方法)
        editOrder(index) {
            const order = this.orderDetails[index];
            this.showItemPopup(order.item); // 打開彈跳視窗，顯示已選資料
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
                    <button v-for="category in categories" :key="category.categoryId"
                        @click="filterMenuByCategory(category.categoryId)"
                        :class="{ active: selectedCategory === category.categoryId }">
                        {{ category.category }}
                    </button>
                </div>

                <!-- 餐點區塊 -->
                <div class="menu">
                    <!-- 單點品項-->
                    <div v-if="selectedCategory !== 9">
                        <div v-for="item in filteredMenuItems" :key="item.mealName" class="menuItem"
                            @click="showItemPopup(item)">
                            <div class="imageIcon">{{ item.picture }}</div>
                            <div class="itemName">{{ item.mealName }}</div>
                            <div class="itemPrice">${{ item.price }}</div>
                        </div>
                    </div>

                    <!-- 套餐品項 -->
                    <div v-if="selectedCategory === 9">
                        <div v-for="combo in filteredMenuItems" :key="combo.comboName" class="menuItem"
                            @click="showItemPopup(combo)">
                            <div class="itemName">{{ combo.comboName }}</div>
                            <div class="comboDishes">
                                <div v-for="detail in combo.comboDetail" :key="detail.categoryId" class="mainDish">
                                    {{ detail.dishesList[0].dishName }}
                                </div>
                            </div>
                            <div class="itemPrice">套餐價格: ${{ getComboPrice(combo) }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 彈跳視窗 -->
            <div v-if="showPopup" class="popup">
                <!-- 1. 標題及關閉按鈕 -->
                <div class="popupHeader">
                    <h3>餐點內容</h3>
                    <span class="closeIcon" @click="closePopup"><i class="bi bi-x-circle"></i></span>
                </div>

                <!-- 2. 餐點詳細內容 -->
                <div class="itemDetail">
                    <div class="itemImage">{{ currentItem.picture }}</div>
                    <div class="itemName">{{ currentItem.comboName || currentItem.mealName }}</div>

                    <div v-if="selectedCategory === 9" class="comboDishesList">
                        <h4>套餐內容：</h4>
                        <ul>
                            <li v-for="detail in currentItem.comboDetail" :key="detail.categoryId">
                                {{ categories.find((cat) => cat.categoryId === detail.categoryId).category }}：
                                {{ detail.dishesList[0].dishName }}
                            </li>
                        </ul>
                    </div>

                    <div class="itemPrice">$ {{ selectedCategory === 9 ? comboPrice : currentItem.price }}</div>
                </div>

                <!-- 3. 單點客製化選項 -->
                <div v-if="selectedCategory !== 9">
                    <div v-for="option in options.filter((opt) => opt.categoryId === selectedCategory)"
                        :key="option.optionTitle" class="optionGroup">
                        <h4>{{ option.optionTitle }}</h4>
                        <div v-for="item in option.optionItems" :key="item.optionContent" class="optionItem">
                            <input :type="option.optionType" :id="item.optionContent" :value="item"
                                v-model="selectedOptions[option.optionTitle]" @change="updateTotalAmount" />
                            <label :for="item.optionContent">
                                <span>{{ item.optionContent }}</span>
                                <span class="optionPrice">+ ${{ item.extraPrice }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 套餐客製化選項 -->
                <div class="comboOptions" v-if="selectedCategory === 9">
                    <div v-for="detail in currentItem.comboDetail" :key="detail.categoryId" class="optionGroup">
                        <h4>{{ categories.find((cat) => cat.categoryId === detail.categoryId).category }}</h4>

                        <div v-for="dish in detail.dishesList" :key="dish.dishName" class="optionItem">
                            <input type="radio" :id="dish.dishName" :value="dish"
                                v-model="selectedDishes[detail.categoryId]" @change="updateComboTotal"
                                :name="detail.categoryId" />
                            <label :for="dish.dishName">
                                <span>{{ dish.dishName }}</span>
                                <span class="dishPrice">+ ${{ dish.price }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 5. 總金額區塊 -->
                <div class="totalAmount">合計&nbsp;&nbsp; $ {{ totalAmount }}</div>

                <!-- 6. 加入訂單按鈕 -->
                <button class="addOrderButton" @click="addToOrder">加入訂單</button>
            </div>

            <!-- 背景遮罩 -->
            <div v-if="showBackdrop" class="backdrop"></div>

            <!-- 背景遮罩 -->
            <div v-if="showBackdrop" class="backdrop"></div>

            <!-- 訂單區塊 -->
            <div class="orderSection">
                <h1>訂單</h1>
                <!-- 桌號及人數選單 -->
                <div class="tableSelection">
                    <div class="tableNumber">
                        <span>桌號</span>
                        <select>
                            <option v-for="table in tables" :key="table">{{ table }}</option>
                        </select>
                    </div>
                    <div class="peopleNumber">
                        <span>人數</span>
                        <select>
                            <option v-for="person in peopleOptions" :key="person">{{ person }}</option>
                        </select>
                    </div>
                </div>

                <!-- 餐點明細區塊 -->
                <div class="orderList">
                    <h2>餐點明細</h2>
                    <div v-for="(order, index) in orderDetails" :key="index" class="orderItem">
                        <!-- 餐點名稱 -->
                        <div class="itemName">
                            {{ order.item.mealName || order.item.comboName }}
                            <span v-if="order.item.mealName">${{ order.item.price }}</span>
                        </div>

                        <!-- 客製化選項 -->
                        <div class="customization" v-if="Object.keys(order.customization).length">
                            <ul>
                                <li v-for="(option, key) in order.customization" :key="key">
                                    <span v-if="Array.isArray(option)">
                                        <span v-for="item in option" :key="item.optionContent"> {{ item.optionContent }}
                                            +${{ item.extraPrice }} </span>
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <!-- 套餐選擇的品項 -->
                        <div class="selectedDishes" v-if="Object.keys(order.selectedDishes).length">
                            <ul>
                                <li v-for="(dish, categoryId) in order.selectedDishes" :key="categoryId">
                                    {{ categories.find((cat) => cat.categoryId === parseInt(categoryId)).category }}:
                                    {{ dish.dishName }}
                                </li>
                            </ul>
                        </div>

                        <!-- 編輯及刪除按鈕 -->
                        <div class="orderFooter">
                            <button @click="editOrder(index)"><i class="bi bi-pencil-square"></i></button>
                            <button @click="deleteOrder(index)"><i class="bi bi-trash-fill"></i></button>
                            <div class="totalPrice">合計 ${{ order.totalPrice }}</div>
                        </div>
                    </div>
                </div>

                <!-- 總價和訂單按鈕 -->
                <div class="submitButton">
                    <div class="totalPrice">合計&nbsp;&nbsp;&nbsp; $ {{ orderDetails.reduce((sum, order) => sum +
                        order.totalPrice, 0) }}</div>
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
            width: 70%;
            /* 固定菜單區塊寬度 */
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
                justify-content: flex-start;
                padding: 2% 0;
                gap: 2%;
                height: auto;
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
            width: 29%;
            /* 固定訂單區塊寬度 */
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
                            padding-left: 20px;
                            /* 使用點狀列表 */
                            list-style-type: disc;
                            /* 設定列表樣式 */

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
                                margin-left: auto;
                                /* 自動將額外價格推至右側 */
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
            background: rgba(0, 0, 0, 0.5);
        }
    }
}
</style>
