<script>
export default{
    data(){
        return{

        }
    },
    methods:{
        goSetting() {
            this.$router.push("./setting")
        },
    }
}
</script>

<template>
    <button @click="goSetting()">登入</button>
    <h1>或在網址列後面新增 /setting</h1>
</template>

<style scoped lang="scss">
button{
    width: 300px;
    height: 100px;
}
</style>