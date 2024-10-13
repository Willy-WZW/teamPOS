<script>
export default {
    props: {
        item: Object,
        optionsList: Array,
        categoriesList: Array,
    },
    data() {
        return {
            singleDishes: {}, // 單點餐點
            singleOptions: {}, // 單點選項
            comboDishes: {
                comboName: this.item.comboName,
                discountAmount: this.item.discountAmount,
                comboBasicPrice: this.item.comboPrice,
                selectedDishes: [], // 選中的菜品和其客製化選項
            },
            totalPrice: 0,
        };
    },
    computed: {
        isCombo() {
            return !!this.item.comboDetail;
        },
        //套餐中的單品
        groupedComboDishes() {
            return this.item.comboDetail.map((detail) => ({
                categoryName: this.getCategoryName(detail.categoryId),
                categoryId: detail.categoryId,
                dishes: detail.dishesList.map((dish) => ({
                    name: dish.dishName,
                    price: dish.price,
                    categoryId: detail.categoryId,
                })),
            }));
        },
        itemPrice() {
            return this.isCombo ? this.item.comboPrice : this.item.price;
        },
        //單點客製化選項
        filteredOptions() {
            const selectedDish = this.singleDishes.default || null;
            const categoryId = selectedDish ? selectedDish.categoryId : this.item.categoryId;
            return this.optionsList.filter((option) => option.categoryId === categoryId);
        },
    },
    mounted() {
        if (this.isCombo) {
            // 預設選擇每個分類的第一個菜品
            this.comboDishes.selectedDishes = this.groupedComboDishes.map((group) => ({
                ...group.dishes[0], // 選擇第一個菜品
                selectedOptions: {}, // 初始化選項
            }));
            this.totalPrice = this.comboDishes.comboBasicPrice;
        } else {
            this.singleDishes = this.item;
            this.singleOptions = {};
            this.totalPrice = this.singleDishes.price;
        }
    },
    methods: {
        // 單點
        selectSingleDish(dish) {
            this.singleDishes = dish;
            this.calculateTotal();
        },
        toggleSingleOption(optionTitle, optionContent, extraPrice, optionType) {
            let options = this.singleOptions[optionTitle] || [];

            if (optionType === "radio") {
                options = [{ content: optionContent, price: extraPrice }];
            } else {
                const index = options.findIndex((opt) => opt.content === optionContent);
                if (index !== -1) {
                    options.splice(index, 1);
                } else {
                    options.push({ content: optionContent, price: extraPrice });
                }
            }
            this.singleOptions[optionTitle] = options;
            this.calculateTotal();
        },
        // 套餐
        selectComboDish(categoryName, dish) {
            const existingDishIndex = this.comboDishes.selectedDishes.findIndex((d) => d.categoryId === dish.categoryId);

            if (existingDishIndex !== -1) {
                this.comboDishes.selectedDishes[existingDishIndex] = {
                    ...dish,
                    selectedOptions: {},
                };
            } else {
                this.comboDishes.selectedDishes.push({
                    ...dish,
                    selectedOptions: {},
                });
            }

            this.calculateTotal();
        },
        toggleComboOption(categoryName, optionTitle, optionContent, extraPrice, optionType) {
            // 根據 categoryName 精準找到對應的菜品
            const dish = this.comboDishes.selectedDishes.find((d) => d.categoryId === this.getCategoryIdByName(categoryName));

            if (!dish) return; // 若找不到菜品則直接返回

            let options = dish.selectedOptions[optionTitle] || [];

            if (optionType === "radio") {
                // 單選：清空陣列並加入新選項
                options = [{ content: optionContent, price: extraPrice }];
            } else {
                // 多選：檢查是否已選擇，如果已選則移除，否則加入
                const index = options.findIndex((opt) => opt.content === optionContent);
                if (index !== -1) {
                    options.splice(index, 1);
                } else {
                    options.push({ content: optionContent, price: extraPrice });
                }
            }

            dish.selectedOptions[optionTitle] = options;
            this.calculateTotal();
        },
        getOptionsForDish(dish) {
            return this.optionsList.filter((option) => option.categoryId === dish.categoryId);
        },
        getCategoryName(categoryId) {
            const category = this.categoriesList.find((cat) => cat.categoryId === categoryId);
            return category ? category.category : "未分類";
        },
        getCategoryIdByName(categoryName) {
            const category = this.categoriesList.find((cat) => cat.category === categoryName);
            return category ? category.categoryId : null;
        },

        // 共用：套餐計算待修正
        calculateTotal() {
            let total = 0;

            // 單點的總金額
            if (this.singleDishes.mealName) {
                total += this.singleDishes.price;
                // 遍歷單點所有選項，累加選項價格
                Object.values(this.singleOptions).forEach((options) => {
                    total += options.reduce((sum, opt) => sum + opt.price, 0);
                });
            }

            // 套餐的總金額計算
            if (this.isCombo) {
                // 遍歷套餐中的每個選中的菜品及其選項
                this.comboDishes.selectedDishes.forEach((dish) => {
                    total += dish.price; // 加上菜品的價格

                    // 遍歷該菜品的所有客製化選項，累加價格
                    Object.values(dish.selectedOptions).forEach((options) => {
                        total += options.reduce((sum, opt) => sum + opt.price, 0);
                    });
                });

                // 套餐折扣計算
                if (this.comboDishes.discountAmount) {
                    total += this.comboDishes.discountAmount;
                }
            }

            this.totalPrice = total;
        },
        // 共用
        closePopup() {
            this.$emit("close");
        },
    },
};
</script>

<template>
    <!-- 單點客製化視窗 -->
    <div class="popup" v-if="!isCombo">
        <button @click="closePopup">Close</button>
        <img v-if="item.picture" :src="item.picture" class="popupMenuImage" />
        <h3>{{ singleDishes.mealName }}</h3>
        <p>價格：${{ singleDishes.price }}</p>

        <div v-for="option in filteredOptions" :key="option.optionTitle">
            <h4>{{ option.optionTitle }}</h4>
            <div v-for="item in option.optionItems" :key="item.optionContent">
                <label>
                    <input :type="option.optionType" :name="option.optionTitle" @change="toggleSingleOption(option.optionTitle, item.optionContent, item.extraPrice, option.optionType)" />
                    {{ item.optionContent }} (+${{ item.extraPrice }})
                </label>
            </div>
        </div>

        <div class="totalPriceBlock">
            <h3>合計：${{ totalPrice }}</h3>
        </div>
    </div>

    <!-- 套餐客製化視窗 -->
    <div class="popup2" v-if="isCombo">
        <button @click="closePopup">Close</button>
        <h3>{{ item.comboName }}</h3>
        <!-- 顯示每個分類的第一個菜品名稱 -->
        <p v-if="isCombo">
            內容：
            <span v-for="(group, index) in groupedComboDishes" :key="index"> | {{ group.dishes[0].name }} </span>
        </p>
        <p>價格：${{ item.comboPrice }}</p>

        <!-- 套餐選擇區 -->

        <div v-for="(group, index) in groupedComboDishes" :key="index">
            <h4># {{ group.categoryName }}</h4>

            <!-- 菜品選擇區 -->
            <div class="dishRadioGroup">
                <div v-for="dish in group.dishes" :key="dish.name">
                    <label>
                        <input
                            type="radio"
                            :name="group.categoryName"
                            :value="dish"
                            :checked="comboDishes.selectedDishes.some((d) => d.name === dish.name)"
                            @change="selectComboDish(group.categoryName, dish)" />
                        {{ dish.name }} - ${{ dish.price }}
                    </label>
                </div>
            </div>

            <!-- 該分類下的客製化區塊 -->
            <div v-if="comboDishes.selectedDishes.some((d) => d.categoryId === group.categoryId)">
                <div v-for="option in getOptionsForDish(comboDishes.selectedDishes.find((d) => d.categoryId === group.categoryId))" :key="option.optionTitle">
                    <h5>{{ option.optionTitle }}</h5>
                    <div v-for="item in option.optionItems" :key="item.optionContent">
                        <label>
                            <input
                                :type="option.optionType"
                                :name="`${group.categoryName}-${option.optionTitle}`"
                                @change="toggleComboOption(group.categoryName, option.optionTitle, item.optionContent, item.extraPrice, option.optionType)" />
                            {{ item.optionContent }} (+${{ item.extraPrice }})
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <!-- 合計金額區塊  -->
        <div class="totalPriceBlock">
            <h3>合計：${{ totalPrice }}</h3>
        </div>
    </div>

    <pre>{{ singleDishes }}</pre>
    <pre>{{ singleOptions }}</pre>

    <pre>{{ comboDishes }}</pre>
    <pre>{{ selectedDishes }}</pre>
</template>

<style scoped lang="scss">
.popup,
.popup2 {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px;
    border: 1px solid #ccc;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
}
.popupMenuImage {
    width: 200px;
    height: 200px;
    object-fit: cover;
    margin-bottom: 10px;
}
.comboItemOptions {
    display: flex;
    border: 1px solid gray;
    padding: 0 10px;
}
</style>
