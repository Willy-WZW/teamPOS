<script>
export default {
    props: {
        item: Object, // 接收選擇的餐點或套餐資料
        optionsList: Array,
    },
    data() {
        return {
            selectedDish: null, // 追蹤套餐中的選中餐點
            selectedOptions: {}, // 存放選擇的客製化內容
        };
    },
    computed: {
        // 根據 item 判斷是否為套餐，並格式化顯示資料
        isCombo() {
            return !!this.item.comboDetail;
        },
        comboDetails() {
            return this.item.comboDetail.map((detail) => detail.dishesList[0].dishName).join(", ");
        },
        itemPrice() {
            if (this.isCombo) {
                return this.item.comboPrice;
            }
            return this.item.price;
        },
        comboDishes() {
            // 套餐中的所有菜品，以 Radio 顯示
            return this.item.comboDetail.map((detail) => ({
                name: detail.dishesList[0].dishName,
                price: detail.dishesList[0].price,
                categoryId: detail.categoryId,
            }));
        },
        filteredOptions() {
            let categoryId;

            // 如果是套餐，從選中的 dish 中取得 categoryId
            if (this.isCombo && this.selectedDish) {
                categoryId = this.selectedDish.categoryId;
            } else if (this.item) {
                categoryId = this.item.categoryId;
            }

            // 如果 categoryId 不存在，避免錯誤
            if (!categoryId) return [];

            return this.optionsList.filter((option) => option.categoryId === categoryId);
        },
    },
    mounted() {
        if (this.isCombo && this.comboDishes.length > 0) {
            // 預設選擇第一個 dish
            this.selectedDish = this.comboDishes[0];
        } else {
            this.selectedDish = this.item || null;
        }
    },
    methods: {
        selectDish(dish) {
            this.selectedDish = dish; // 更新選中的菜品
        },
        toggleOption(optionTitle, optionContent) {
            // 切換選擇的客製化選項
            if (!this.selectedOptions[optionTitle]) {
                this.selectedOptions[optionTitle] = [];
            }
            const index = this.selectedOptions[optionTitle].indexOf(optionContent);
            if (index === -1) {
                this.selectedOptions[optionTitle].push(optionContent);
            } else {
                this.selectedOptions[optionTitle].splice(index, 1);
            }
        },
        closePopup() {
            this.$emit("close"); // 發出關閉事件，讓主元件控制彈窗關閉
        },
    },
};
</script>

<template>
    <div class="popup">
        <button @click="closePopup">Close</button>

        <img v-if="item.picture" :src="item.picture" class="popupMenuImage" />
        <h3>{{ item.mealName || item.comboName }}</h3>
        <p v-if="isCombo">內容：{{ comboDetails }}</p>
        <p>價格：${{ itemPrice }}</p>

        <!-- 套餐選擇區-->
        <div v-if="isCombo">
            <p>選擇套餐內容：</p>
            <div v-for="dish in comboDishes" :key="dish.name">
                <label>
                    <input type="radio" name="comboDish" :value="dish" :checked="selectedDish && selectedDish.name === dish.name" @change="selectDish(dish)" />
                    {{ dish.name }} - ${{ dish.price }}
                </label>
            </div>
        </div>

        <!-- 客製化區塊-->
        <div v-for="option in filteredOptions" :key="option.optionTitle">
            <h4>{{ option.optionTitle }}</h4>
            <div v-for="item in option.optionItems" :key="item.optionContent">
                <label>
                    <input :type="option.optionType" :name="option.optionTitle" :value="item.optionContent" @change="toggleOption(option.optionTitle, item.optionContent)" />
                    {{ item.optionContent }} (+${{ item.extraPrice }})
                </label>
            </div>
        </div>
    </div>
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
    max-width: 300px;
    width: 100%;
}
.popupMenuImage {
    width: 200px;
    height: 200px;
    object-fit: cover;
    margin-bottom: 10px;
}
</style>
