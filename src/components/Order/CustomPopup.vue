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
            comboDishes: {}, // 套餐餐點
            singleOptions: {}, // 單點選項
            comboOptions: {}, // 套餐選項
            totalPrice: 0,
        };
    },
    computed: {
        isCombo() {
            return !!this.item.comboDetail;
        },
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
        filteredOptions() {
            const selectedDish = this.singleDishes.default || null;
            const categoryId = selectedDish ? selectedDish.categoryId : this.item.categoryId;
            return this.optionsList.filter((option) => option.categoryId === categoryId);
        },
    },
    mounted() {
        if (this.isCombo) {
            this.comboDishes = this.groupedComboDishes.reduce((acc, group) => {
                acc[group.categoryName] = group.dishes[0];
                return acc;
            }, {});
        } else {
            this.singleDishes = { default: this.item };
        }
    },
    methods: {
        selectDish(isCombo, categoryName, dish) {
            if (isCombo) {
                this.comboDishes[categoryName] = dish;
            } else {
                this.singleDishes["default"] = dish;
            }
            this.calculateTotal();
            console.log("單點餐點:", this.singleDishes);
            console.log("套餐餐點:", this.comboDishes);
        },
        toggleOption(isCombo, dishName, optionTitle, optionContent, extraPrice, optionType) {
            const options = isCombo ? this.comboOptions[dishName] || [] : this.singleOptions[dishName] || [];

            if (optionType === "radio") {
                options.length = 0; // 單選：清除其他選項
                options.push({ title: optionTitle, content: optionContent, price: extraPrice });
            } else {
                const index = options.findIndex((opt) => opt.content === optionContent);
                if (index !== -1) {
                    options.splice(index, 1); // 移除已選選項
                } else {
                    options.push({ title: optionTitle, content: optionContent, price: extraPrice }); // 新增選項
                }
            }

            if (isCombo) {
                this.comboOptions[dishName] = options;
            } else {
                this.singleOptions[dishName] = options;
            }

            this.calculateTotal();
            console.log("單點選項:", this.singleOptions);
            console.log("套餐選項:", this.comboOptions);
        },
        calculateTotal() {
            let total = 0;

            // 計算單點總金額
            if (this.singleDishes.default) {
                const dish = this.singleDishes.default;
                total += dish.price;

                const options = this.singleOptions[dish.mealName] || [];
                total += options.reduce((sum, opt) => sum + opt.price, 0);
            }

            // 計算套餐總金額
            Object.values(this.comboDishes).forEach((dish) => {
                total += dish.price;

                const options = this.comboOptions[dish.name] || [];
                total += options.reduce((sum, opt) => sum + opt.price, 0);
            });

            // 如果有折扣，扣除折扣金額
            if (this.item.discountAmount) {
                total -= this.item.discountAmount;
            }

            this.totalPrice = total;
            console.log("總金額:", this.totalPrice);
        },
        getCategoryName(categoryId) {
            const category = this.categoriesList.find((cat) => cat.categoryId === categoryId);
            return category ? category.category : "未分類";
        },
        getOptionsForDish(dish) {
            return this.optionsList.filter((option) => option.categoryId === dish.categoryId);
        },
        closePopup() {
            this.$emit("close");
        },
    },
};
</script>

<template>
    <div class="popup">
        <button @click="closePopup">Close</button>

        <img v-if="item.picture" :src="item.picture" class="popupMenuImage" />
        <h3>{{ item.mealName || item.comboName }}</h3>

        <!-- 顯示每個分類的第一個菜品名稱 -->
        <p v-if="isCombo">
            內容：
            <span v-for="(group, index) in groupedComboDishes" :key="index"> | {{ group.dishes[0].name }} </span>
        </p>

        <p>價格：${{ itemPrice }}</p>

        <!-- 套餐選擇區 -->
        <div v-if="isCombo">
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
                                :checked="comboDishes[group.categoryName]?.name === dish.name"
                                @change="selectDish(true, group.categoryName, dish)" />
                            {{ dish.name }} - ${{ dish.price }}
                        </label>
                    </div>
                </div>

                <!-- 該分類下的客製化區塊 -->
                <div v-if="comboDishes[group.categoryName]" class="comboItemOptions">
                    <div v-for="option in getOptionsForDish(comboDishes[group.categoryName])" :key="option.optionTitle" class="comboItemOption">
                        <h5>{{ option.optionTitle }}</h5>
                        <div v-for="item in option.optionItems" :key="item.optionContent">
                            <label>
                                <input
                                    :type="option.optionType"
                                    :name="`${group.categoryName}-${option.optionTitle}`"
                                    @change="toggleOption(true, comboDishes[group.categoryName].name, option.optionTitle, item.optionContent, item.extraPrice, option.optionType)" />
                                {{ item.optionContent }} (+${{ item.extraPrice }})
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 單點的客製化區塊 -->
        <div v-else>
            <div v-for="option in filteredOptions" :key="option.optionTitle">
                <h4>{{ option.optionTitle }}</h4>
                <div v-for="item in option.optionItems" :key="item.optionContent">
                    <label>
                        <input
                            :type="option.optionType"
                            :name="option.optionTitle"
                            @change="toggleOption(false, singleDishes.default.mealName, option.optionTitle, item.optionContent, item.extraPrice, option.optionType)" />
                        {{ item.optionContent }} (+${{ item.extraPrice }})
                    </label>
                </div>
            </div>
        </div>

        <!-- 合計金額區塊 -->
        <div class="totalPriceBlock">
            <h3>合計：${{ totalPrice }}</h3>
        </div>
    </div>

    <pre>{{ singleDishes }}</pre>
    <pre>{{ comboDishes }}</pre>
    <pre>{{ singleOptions }}</pre>
    <pre>{{ comboOptions }}</pre>
</template>

<style scoped lang="scss">
.popup {
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
