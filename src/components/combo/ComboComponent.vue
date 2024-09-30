<script>
    export default{
        data(){
            return{

            }
        }
    }
</script>



<template>
    <div class="container">
        <div class="topContainer">
            <div class="leftTile">
                <h1>餐點</h1>
            </div>
            <div class="rightTitle">
                <p class="combo">套餐</p>
                <p class="count">8</p>
                <p class="save">儲存</p>
            </div>
        </div>
        <div class="contentContainer">

            <div class="leftContainer"">
                <div class="addCombo">
                </div>
            </div>

            <div class="rightContainer">
                <div class="comboItem">
                    <h1>套餐名稱</h1>
                    <div class="comboDetail">
                        <label for="order">餐點選單</label>
                        <select id="order" name="order">
                            <option value="A134">訂單 A134</option>
                            <option value="A135">訂單 A135</option>
                            <option value="A136">訂單 A136</option>
                        </select>
                        <div class="">
                            <p>卡拉雞腿堡</p>
                            <p>$100</p>
                        </div>
                    </div>        
                </div>
            </div>


        </div>
    
    </div>
</template>


<style>
</style>
