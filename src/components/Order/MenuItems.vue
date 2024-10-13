<script>
export default {
    props: {
        menuItems: Array,
        combos: Array,
        currentCategory: String, // 當前分類名稱，判斷是否為"套餐"
    },
    computed: {
        showCombos() {
            return this.currentCategory === "套餐"; // 判斷是否顯示套餐
        },
    },
    methods: {
        calculateComboPrice(combo) {
            return combo.comboDetail.reduce((total, detail) => total + detail.dishesList[0].price, 0) + combo.discountAmount;
        },
        selectItem(item) {
            console.log(item); // 查看 item 物件內的所有屬性

            //如果是套餐，計算價格並附加到 item
            if (item.comboDetail) {
                item.comboPrice = this.calculateComboPrice(item);
            }
            // 選擇餐點後觸發事件，將資料傳給主元件
            this.$emit("selectItem", item);
        },
    },
};
</script>

<template>
    <div class="menuItems">
        <!-- 單點餐點 -->
        <div v-for="item in menuItems" :key="item.mealName" @click="selectItem(item)">
            <img :src="item.picture" class="mealImage" />
            <p>{{ item.mealName }} - ${{ item.price }}</p>
        </div>

        <!-- 套餐餐點 -->
        <div v-if="showCombos" v-for="combo in combos" :key="combo.comboName" @click="selectItem(combo)">
            <p>{{ combo.comboName }} - ${{ calculateComboPrice(combo) }}</p>
            <ul>
                <li v-for="dish in combo.comboDetail" :key="dish.dishesList[0].dishName">
                    {{ dish.dishesList[0].dishName }}
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped lang="scss">
.menuItems {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}
.menuItems div {
    cursor: pointer;
    padding: 10px;
    border: 1px solid #ccc;
    transition: background-color 0.3s;
}
.menuItems div:hover {
    background-color: #f0f0f0;
}
.mealImage {
    width: 100px;
    height: 100px;
    object-fit: cover;
    margin-bottom: 5px;
}
</style>
