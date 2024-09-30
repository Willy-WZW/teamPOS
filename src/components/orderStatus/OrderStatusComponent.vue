<script>
import axios from 'axios';

export default{
    data(){
        return{
            currentDate:new Date(),
            orderDetail:null
        }
    },
    created(){

    },
    mounted(){
        axios.post("http://localhost:8080/pos/statistics", {   
                "startDate": this.currentDateFormate,
                "endDate": this.currentDateFormate
            })
        .then(response=>{
            response.data.joinOrderList
        })
        .catch(error => {
            console.error("Error fetching analysis:", error);
        });   
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
        <div class="titleContainer">
        </div>
        
        <div class="contentContainer">
            <div class="left">
                <h1>準備中</h1>
                <div class="tableContainer">
                    <div class="table"></div>
                </div>
            </div>
            <div class="mid"></div>
            <div class="right"></div>
        </div>

    </div>
</template>

<style>
</style>

