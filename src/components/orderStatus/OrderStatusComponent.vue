<script>
import axios from 'axios';

export default{
    data(){
        return{
            currentDate:new Date(),
            orderDetail:null,

            preparing:null,
            undelivered:null,
            delivered:null,
        }
    },
    created(){
        axios.post("http://localhost:8080/pos/searchOrderStatus", {   
                "startDate": "2024-09-27",
                "endDate": "2024-09-27"
            })
        .then(response=>{
            this.preparing = response.data.preparingOrders
            this.undelivered = response.data.undeliveredOrders
            this.delivered = response.data.deliveredOrders
            console.log(this.delivered)
        })
        .catch(error => {
            console.error("Error fetching analysis:", error);
        });  
    },
    mounted(){
 
    },
    computed:{
        currentDateFormate(){
            const year = this.currentDate.getDate()
            const month = String(this.currentDate.getMonth()+1).padStart(2, '0')
            const day = String( this.currentDate.getFullYear()).padStart(2, '0')
            return `${year}-${month}-${day}`;
        }
    },
    methods:{

    }
}
</script>


<template>
    <div class="container">
        <div class="innerContainer">
            <div class="titleContainer">
                <h1>餐點狀態</h1>
                <div>
                    <p>待送餐點</p>
                    <p>13</p>
                </div>
            </div>
            
            <div class="contentContainer">
                <div class="statusContainer">
                    <h1>準備中</h1>
                    <div class="tableContainer" v-for="(table, tableIndex) in preparing">
                        <div class="tableTitle">
                            <p>桌號{{ table.tableNumber }}</p>
                            <p>訂單編號{{ table.orderId }}</p>
                            <i class="fa-solid fa-chevron-up"></i>
                        </div>
                        <div class="tableContent"  v-for="(meal, mealIndex) in table.mealList">
                            <p class="comboName" v-if="meal.comboName">•{{ meal.comboName }}</p>
                            <div class="comboDetailList" v-if="meal.comboName">
                                <p v-for="(comboDetail) in meal.mealDetail">
                                    •{{ comboDetail.mealName }}
                                </p>
                            </div>
                            <p class="singleName" v-if="!meal.comboName">•{{ meal.mealDetail[0].mealName }}</p>
                        </div>
                    </div>
                </div>
                <div class="statusContainer">
                    <h1>待送餐點</h1>
                    <div class="tableContainer" v-for="(table, tableIndex) in undelivered">
                        <div class="tableTitle">
                            <p>桌號{{ table.tableNumber }}</p>
                            <p>訂單編號{{ table.orderId }}</p>
                            <i class="fa-solid fa-chevron-up"></i>
                        </div>
                        <div class="tableContent"  v-for="(meal, mealIndex) in table.mealList">
                            <p class="comboName" v-if="meal.comboName">•{{ meal.comboName }}</p>
                            <div class="comboDetailList" v-if="meal.comboName">
                                <p v-for="(comboDetail) in meal.mealDetail">
                                    •{{ comboDetail.mealName }}
                                </p>
                            </div>
                            <p class="singleName" v-if="!meal.comboName">•{{ meal.mealDetail[0].mealName }}</p>
                        </div>
                    </div>
                </div>
                <div class="statusContainer">
                    <h1>已送達</h1>
                    <div class="tableContainer" v-for="(table, tableIndex) in delivered">
                        <div class="tableTitle">
                            <p>桌號{{ table.tableNumber }}</p>
                            <p>訂單編號{{ table.orderId }}</p>
                            <i class="fa-solid fa-chevron-up"></i>
                        </div>
                        <div class="tableContent"  v-for="(meal, mealIndex) in table.mealList">
                            <p class="comboName" v-if="meal.comboName">•{{ meal.comboName }}</p>
                            <div class="comboDetailList" v-if="meal.comboName">
                                <p v-for="(comboDetail) in meal.mealDetail">
                                    •{{ comboDetail.mealName }}
                                </p>
                            </div>
                            <p class="singleName" v-if="!meal.comboName">•{{ meal.mealDetail[0].mealName }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>    
    </div>
</template>

<style scoped lang="scss">
*{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
.container{
    width: 100%;
    height: 100%;
    padding: 2% 2%; 
    .innerContainer{
        width: 100%;
        height: 100%;
        border-radius: 12px;
        background-color: white;
        .titleContainer{
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1% 4%; 
            position: relative;
            &:before{
                position: absolute;
                content: "";
                width: 95%;
                height: 1px;
                left: 2.5%;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.466)
            }
            
            div{
                width: 15%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                p{
                    width: 50%;
                    font-size: 20px;
                    font-weight: 600;
                    margin: 0 2%;
                    &:nth-child(2){
                        width: 30%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 12px;
                        background-color: rgba(0, 0, 0, 0.334);
                    }
                }
            }
        }
        .contentContainer{
            width: 100%;
            height: 90%;
            display: flex;
            align-items: start;
            justify-content: space-between;
            padding: 1% 4%;
            // background-color: antiquewhite;
            .statusContainer{
                width: 30%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.15);
                border-radius: 12px;
                padding: 1% 1%;
                overflow-y: auto;
                h1{
                    font-size: 30px;
                }
                &:nth-child(2){
                    background-color: rgba(0, 0, 0, 0.7);
                    h1{
                        color: white;
                    }
                }
                .tableContainer{
                    width: 100%;
                    height: auto;
                    border-radius: 12px;
                    background-color: white;
                    padding: 2% 2%;
                    margin: 4% 0;
                    
                    .tableTitle{
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        font-size: 20px;
                        font-weight: 600;
                        padding: 4% 6%;
                        p{
                            width: 40%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 12px;
                            background-color: rgba(0, 0, 0, 0.1);
                        }
                    }
                    .tableContent{
                        font-size: 18px;
                        font-weight: 600;
                        .comboName{
                            font-size: 20px;
                            padding: 0 8%;
                            margin: 2% 0;
                            position: relative;
                            &:before{
                                position: absolute;
                                content: "";
                                width: 20%;
                                height: 1px;
                                left: 5%;
                                bottom: -10%;
                                background-color: rgba(0, 0, 0, 0.3)
                            }
                        }
                        .comboDetailList{
                            padding: 0 15%;
                            margin: 2% 0;
                        }
                        .singleName{
                            font-size: 20px;
                            padding: 2% 8%;
                            position: relative;
                            &:before{
                                position: absolute;
                                content: "";
                                width: 20%;
                                height: 1px;
                                left: 5%;
                                bottom: 10%;
                                background-color: rgba(0, 0, 0, 0.4)
                            }
                        }

                    }
                }
            }
        }

    }
    
}

</style>

