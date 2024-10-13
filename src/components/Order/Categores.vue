<script>
export default {
    props: {
        categories: Array,
        activeCategoryId: Number, // 接收當前選中的分類 ID
    },
    methods: {
        selectCategory(categoryId) {
            this.$emit("selectCategory", categoryId); // 發出事件通知父元件
        },
    },
};
</script>

<template>
    <div class="categories">
        <button v-for="category in categories" :key="category.categoryId" :class="{ active: category.categoryId === activeCategoryId }"
        @click="selectCategory(category.categoryId)">
            {{ category.category }}
        </button>
    </div>
</template>

<style scoped lang="scss">
.categories {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    // border: 2px solid red;
}

button {
    padding: 10px 20px;
    border: 1px solid grey;
    background-color: transparent;
    cursor: pointer;
    // transition: border 0.3s;
}

button:hover {
    border: 1px solid grey;
}

button.active {
  border: 3px solid grey; /* 點擊後維持2px的邊框 */
}

</style>
