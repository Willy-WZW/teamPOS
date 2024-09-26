<script>
import * as echarts from 'echarts';
import axios from 'axios';
export default{
    data(){
        return{
            currentHead:'日',
            dateForDay: new Date(),
            dateForMonth: new Date(),
            dateForSeason: new Date(),
            dateForYear: new Date(),
            startDate: null,
            endDate: null,
            analysis:null,


            preDateForDay: new Date(new Date().setDate(new Date().getDate() - 1)),
            preDateForMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            preDateForSeason: new Date(new Date().setMonth(new Date().getMonth() - 2)),
            preDateForYear: new Date(new Date().setYear(new Date().getFullYear() - 1)),
            preStartDate: null,
            preEndDate: null,
            preAnalysis:null,


            joinOrderList:[],

            optionPie: {
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    top: '10%',
                    left: 'center',
                    textStyle: {
                        fontSize: 18,  // 設置圖例的字體大小
                        color: '#000'                      
                    }
                },
                series: [
                    {
                        name: 'Access From',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        center: ['50%', '65%'],  // 將圓餅圖下移以增加與圖例的距離
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2
                        },
                        label: {
                            show: false,  // 確保標籤顯示
                            fontSize: 16,  // 調整 name 字體大小
                            fontWeight: 'bold',  // 設置字體粗細
                            formatter: '{b}',  // b 代表 name，這樣只顯示 name 不會顯示 value
                            position: 'outside'  // 確保標籤在圓餅外部
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: 20,
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: false,
                            
                        },
                        data: [

                        ]
                    }
                ]
            },
            optionLine:{
                tooltip: {
                        trigger: 'axis',  // 當軸上的數據被觸發時顯示 tooltip
                    },
                legend: {
                    data:['銷售額'],
                    left: 'center',
                    textStyle: {
                        fontSize: 18,  // 設置圖例的字體大小
                        color: '#000'                      
                    }
                },      
                grid: {
                    top: '15%',
                    left: '3%',
                    right: '3%',
                    bottom: '6%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data:[],
                    boundaryGap: false // 不留白，从原点开始
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name:'銷售額',
                        type: 'line',
                        label: {
                                show: false,  // 顯示數據標籤
                                position: 'top'  // 數值顯示在數據點上方
                            },
                        //显示出来折线图的面积
                        areaStyle: {
                            normal: {
                                // 颜色渐变函数 前四个参数分别表示四个位置依次为左、下、右、上
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: 'rgba(80,141,255,0.39)'
                                }, {
                                    offset: 0.25,
                                    color: 'rgba(56,155,255,0.25)'
                                }, {
                                    offset: 1,
                                    color: 'rgba(38,197,254,0.00)'
                                }])
                            }
                        },
                        data: [],

                    }
                ]
            }
        }
    },
    created(){
    },
    mounted() {

        //給startDate、endDate賦值
        this.getTodayDate() 
        
        //根據給startDate、endDate 設定chart x軸範圍
        this.optionLine.xAxis.data = this.getPeriodDate(this.startDate, this.endDate) 

        this.$nextTick(() => {
            axios.post("http://localhost:8080/pos/analysis", {   
                            "startDate":this.startDate,
                            "endDate":this.endDate
            })
            .then(response => {
                this.analysis = response.data.analysis
                this.analysis.popularDishes = this.analysis.popularDishes.sort((a,b)=>{return b.orders-a.orders})
            })
            .then(()=>{
                this.optionLine.series[0].data = [this.analysis.revenueGrowth[0].revenue]
            })
            .then(() => {
                this.drawChart(); 
            })
            .catch(error=>{
                console.error("Error fetching statistics:", error);
            })
        })
    },
    computed:{
        currentDay() {
            
            const year = this.dateForDay.getFullYear();
            const month = String(this.dateForDay.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始，需加 1
            const day = String(this.dateForDay.getDate()).padStart(2, '0'); // 格式化日期，確保兩位數
            this.startDate = `${year}-${month}-${day}`;
            this.endDate = `${year}-${month}-${day}`;
            this.postStartDateAndEndDate(this.startDate, this.endDate)

            return `${year}年${month}月${day}日`;
        },
        preCurrentDay() {
            const preYear = this.preDateForDay.getFullYear();
            const preMonth = String(this.preDateForDay.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始，需加 1
            const preDay = String(this.preDateForDay.getDate()).padStart(2, '0'); // 格式化日期，確保兩位數
            this.preStartDate = `${preYear}-${preMonth}-${preDay}`;
            this.preEndDate = `${preYear}-${preMonth}-${preDay}`;
            this.postPreStartDateAndPreEndDate(this.preStartDate, this.preEndDate)

            return `${preYear}年${preMonth}月${preDay}日`;
        },


        previousDay() {
            const newDate = new Date(this.dateForDay); // 先複製當前日期
            newDate.setDate(newDate.getDate() - 1); // 修改新日期的值
            this.dateForDay = newDate; // 賦值給 date，這樣 Vue 才能監測變化

            const newDate2 = new Date(this.preDateForDay); // 先複製當前日期
            newDate2.setDate(newDate2.getDate() - 1); // 修改新日期的值
            this.preDateForDay = newDate2; // 賦值給 date，這樣 Vue 才能監測變化

        },
        nextDay() {
            const newDate = new Date(this.dateForDay); // 先複製當前日期
            newDate.setDate(newDate.getDate() + 1); // 修改新日期的值
            this.dateForDay = newDate; // 賦值給 date，這樣 Vue 才能監測變化

            const newDate2 = new Date(this.preDateForDay); // 先複製當前日期
            newDate2.setDate(newDate2.getDate() + 1); // 修改新日期的值
            this.preDateForDay = newDate2; // 賦值給 date，這樣 Vue 才能監測變化
        },

        ///////////////////////////////////////////////////////////
        currentMonth() {
            const year = this.dateForMonth.getFullYear();
            const month = String(this.dateForMonth.getMonth()+1).padStart(2, '0'); // 月份從 0 開始，需加 1

            // 計算第一天 and 計算最後一天
            let firstDay = new Date(year, month - 1, 1); 
            let lastDay = new Date(year, month, 0); 
            firstDay = String(firstDay.getDate()).padStart(2, '0')
            lastDay = String(lastDay.getDate()).padStart(2, '0')
            this.startDate = `${year}-${month}-${firstDay}`;
            this.endDate = `${year}-${month}-${lastDay}`;
            this.postStartDateAndEndDate(this.startDate, this.endDate)

            return `${year}年${month}月`;
        },
        preCurrentMonth() {
            const preYear = this.preDateForMonth.getFullYear();
            const preMonth = String(this.preDateForMonth.getMonth()+1).padStart(2, '0'); // 月份從 0 開始，需加 1

            // 計算第一天 and 計算最後一天
            let preFirstDay = new Date(preYear, preMonth - 1, 1); 
            let preLastDay = new Date(preYear, preMonth, 0); 
            preFirstDay = String(preFirstDay.getDate()).padStart(2, '0')
            preLastDay = String(preLastDay.getDate()).padStart(2, '0')
            this.preStartDate = `${preYear}-${preMonth}-${preFirstDay}`;
            this.preEndDate = `${preYear}-${preMonth}-${preLastDay}`;
            this.postPreStartDateAndPreEndDate(this.preStartDate, this.preEndDate)

            return `${preYear}年${preMonth}月`;
        },
        previousMonth(){
            const newDate = new Date(this.dateForMonth);
            newDate.setMonth(newDate.getMonth() - 1);
            this.dateForMonth = newDate;
      
            const newDate2 = new Date(this.preDateForMonth); // 先複製當前日期
            newDate2.setMonth(newDate2.getMonth() - 1); // 修改新日期的值
            this.preDateForMonth = newDate2; // 賦值給 date，這樣 Vue 才能監測變化
  },
        nextMonth(){
            const newDate = new Date(this.dateForMonth);
            newDate.setMonth(newDate.getMonth() + 1);
            this.dateForMonth = newDate;        

            const newDate2 = new Date(this.preDateForMonth); // 先複製當前日期
            newDate2.setMonth(newDate2.getMonth() + 1); // 修改新日期的值
            this.preDateForMonth = newDate2; // 賦值給 date，這樣 Vue 才能監測變化
        },

        ///////////////////////////////////////////////////////////

        currentSeason() {
            let year = this.dateForSeason.getFullYear();
            let month = String(this.dateForSeason.getMonth()+1).padStart(2, '0'); // 月份從 0 開始，需加 1
            
            let monthStart
            let monthEnd
            if (month>=1 && month<=3){
                monthStart = 1
                monthEnd = 3
            }
            if (month>=4 && month<=6){
                monthStart = 4
                monthEnd = 6
            }
            if (month>=7 && month<=9){
                monthStart = 7
                monthEnd = 9
            }
            if (month>=10 && month<=12){
                monthStart = 10
                monthEnd = 12
            }
            //1~3 4~6 7~9 10~12
            // 計算第一天 and 計算最後一天
            let firstDay = new Date(year, monthStart, 1);
            let lastDay = new Date(year, monthEnd, 0)
            firstDay = String(firstDay.getDate()).padStart(2, '0')
            lastDay = String(lastDay.getDate()).padStart(2, '0')
            monthStart = String(monthStart).padStart(2, '0') 
            monthEnd = String(monthEnd).padStart(2, '0') 
            this.startDate = `${year}-${monthStart}-${firstDay}`;
            this.endDate = `${year}-${monthEnd}-${lastDay}`;
            this.postStartDateAndEndDate(this.startDate, this.endDate)

            return `${year}年${monthStart}月~${monthEnd}月`;
        },
        preCurrentSeason() {
            let year = this.preDateForSeason.getFullYear();
            let month = String(this.preDateForSeason.getMonth()+1).padStart(2, '0'); // 月份從 0 開始，需加 1
            
            let monthStart
            let monthEnd
            if (month>=1 && month<=3){
                monthStart = 1
                monthEnd = 3
            }
            if (month>=4 && month<=6){
                monthStart = 4
                monthEnd = 6
            }
            if (month>=7 && month<=9){
                monthStart = 7
                monthEnd = 9
            }
            if (month>=10 && month<=12){
                monthStart = 10
                monthEnd = 12
            }

            //1~3 4~6 7~9 10~12
            // 計算第一天 and 計算最後一天
            let firstDay = new Date(year, monthStart, 1);
            let lastDay = new Date(year, monthEnd, 0)
            firstDay = String(firstDay.getDate()).padStart(2, '0')
            lastDay = String(lastDay.getDate()).padStart(2, '0')
            monthStart = String(monthStart).padStart(2, '0') 
            monthEnd = String(monthEnd).padStart(2, '0') 
            this.preStartDate = `${year}-${monthStart}-${firstDay}`;
            this.preEndDate = `${year}-${monthEnd}-${lastDay}`;
            this.postPreStartDateAndPreEndDate(this.preStartDate, this.preEndDate)

            return `${year}年${monthStart}月~${monthEnd}月`;
        },
        previousSeason(){
            const newDate = new Date(this.dateForSeason);
            newDate.setMonth(newDate.getMonth() - 3);
            this.dateForSeason = newDate;

            const newDate2 = new Date(this.preDateForSeason);
            newDate2.setMonth(newDate2.getMonth() - 3);
            this.preDateForSeason = newDate2;
        },
        nextSeason(){
            const newDate = new Date(this.dateForSeason);
            newDate.setMonth(newDate.getMonth() + 3);
            this.dateForSeason = newDate;   

            const newDate2 = new Date(this.preDateForSeason);
            newDate2.setMonth(newDate2.getMonth() + 3);
            this.preDateForSeason = newDate2;        
        },

        ///////////////////////////////////////////////////////////
        currentYear() {
            let year = this.dateForYear.getFullYear();
            let firstDay = new Date(year, 1, 1);
            let lastDay = new Date(year, 12, 0)
            firstDay = String(firstDay.getDate()).padStart(2, '0')
            lastDay = String(lastDay.getDate()).padStart(2, '0')
            this.startDate = `${year}-01-${firstDay}`;
            this.endDate = `${year}-12-${lastDay}`;
            this.postStartDateAndEndDate(this.startDate, this.endDate)

            return `${year}年`;
        },
        preCurrentYear() {
            let year = this.preDateForYear.getFullYear();
            let firstDay = new Date(year, 1, 1);
            let lastDay = new Date(year, 12, 0)
            firstDay = String(firstDay.getDate()).padStart(2, '0')
            lastDay = String(lastDay.getDate()).padStart(2, '0')
            this.preStartDate = `${year}-01-${firstDay}`;
            this.preEndDate = `${year}-12-${lastDay}`;
            this.postPreStartDateAndPreEndDate(this.preStartDate, this.preEndDate)

            return `${year}年`;
        },
        previousYear(){
            const newDate = new Date(this.dateForYear);
            newDate.setFullYear(newDate.getFullYear() - 1);
            this.dateForYear = newDate;

            const newDate2 = new Date(this.preDateForYear);
            newDate2.setFullYear(newDate2.getFullYear() - 1);
            this.preDateForYear = newDate2;
        },
        nextYear(){
            const newDate = new Date(this.dateForYear);
            newDate.setFullYear(newDate.getFullYear() + 1);
            this.dateForYear = newDate;

            const newDate2 = new Date(this.preDateForYear);
            newDate2.setFullYear(newDate2.getFullYear() + 1);
            this.preDateForYear = newDate2;        
        },




    },
    methods:{
        drawChart() {
            const myChart = echarts.init(document.querySelector(".echart"))
            myChart.setOption(this.optionLine)
        },

        selectPeriod(type){
            this.currentHead = type
        },

        calRevenueGrowth(){
            const analysis = this.analysis
            const preAnalysis = this.preAnalysis
            let revenueUpRate = (analysis.totalRevenue-preAnalysis.totalRevenue)/preAnalysis.totalRevenue*100
            revenueUpRate = Math.round(revenueUpRate)
            return revenueUpRate
        },
        calOrdersGrowth(){
            const analysis = this.analysis
            const preAnalysis = this.preAnalysis
            let ordersUpRate = (analysis.totalOrders-preAnalysis.totalOrders)/preAnalysis.totalOrders*100
            ordersUpRate = Math.round(ordersUpRate)
            return ordersUpRate
        },

        postStartDateAndEndDate(startDate, endDate){
            axios.post("http://localhost:8080/pos/analysis", {   
                            "startDate":startDate,
                            "endDate":endDate
            })
            .then(response=>{
                this.analysis = response.data.analysis
                this.analysis.popularDishes.sort((a,b)=>{return b.orders-a.orders})
            })
            .then(()=>{
                this.optionLine.xAxis.data = this.getPeriodDate(startDate, endDate)
                this.optionLine.series[0].data = this.analysis.revenueGrowth.map(item=>{
                    return item.revenue
                })
            })
            .then(()=>{
                this.drawChart()
            })
        },
        postPreStartDateAndPreEndDate(startDate, endDate){
            axios.post("http://localhost:8080/pos/analysis", {   
                            "startDate":startDate,
                            "endDate":endDate
            })
            .then(response=>{
                this.preAnalysis = response.data.analysis
                this.preAnalysis.popularDishes.sort((a,b)=>{return b.orders-a.orders})
            })
        },

        getTodayDate() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始，需加 1
            const day = String(today.getDate()).padStart(2, '0'); // 確保日期是兩位數
            this.startDate = `${year}-${month}-${day}`;
            this.endDate = `${year}-${month}-${day}`;

            const preToday = new Date(new Date().setDate(new Date().getDate() - 1));
            const preYear = preToday.getFullYear();
            const preMonth = String(preToday.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始，需加 1
            const preDay = String(preToday.getDate()).padStart(2, '0'); // 確保日期是兩位數
            this.preStartDate = `${preYear}-${preMonth}-${preDay}`;
            this.preEndDate = `${preYear}-${preMonth}-${preDay}`;
        },

        getPeriodDate(startDate, endDate){
            if (!startDate || !endDate) {
                console.error("startDate 或 endDate 不能為 null");
                return [];
            }
            let list = [];
            let start = new Date(startDate);
            let end = new Date(endDate);

            while (start <= end) {
                let year = start.getFullYear(); // 月份從 0 開始，需要加 1
                let month = start.getMonth() + 1; // 月份從 0 開始，需要加 1
                let day = start.getDate();
                list.push(`${year}年${month}月${day}日`);
                start.setDate(start.getDate() + 1); // 增加一天
            }
            return list;
        }
    },
}
</script>


<template>

<div class="container">
    <div class="innerContainer">
        <div class="dashboardContainer">
            <div class="dashboardLeft">
                <div class="navHead">
                    <h1 class="headStyle" :class="{headStyleClick: currentHead == '日'}" @click="selectPeriod('日')">日</h1>
                    <h1 class="headStyle" :class="{headStyleClick: currentHead == '月'}" @click="selectPeriod('月')">月</h1>
                    <h1 class="headStyle" :class="{headStyleClick: currentHead == '季'}" @click="selectPeriod('季')">季</h1>
                    <h1 class="headStyle" :class="{headStyleClick: currentHead == '年'}" @click="selectPeriod('年')">年</h1>
                    <!-- <h1 class="headStyle" :class="{headStyleClick: currentHead == '自訂'}" @click="selectPeriod('自訂')">自訂</h1> -->
                </div>
                <div class="echartContainer" v-if="currentHead=='日'">
                    <div class="leftRightContainer">
                        <i class='bx bxs-chevron-left-circle bx-tada' @click="previousDay"></i>
                        <p>{{ currentDay }}</p>
                        <p>{{ preCurrentDay }}</p>
                        <i class='bx bxs-chevron-right-circle bx-tada' @click="nextDay"></i>
                    </div>
                </div>
                <div class="echartContainer" v-if="currentHead=='月'">
                    <div class="leftRightContainer">
                        <i class='bx bxs-chevron-left-circle bx-tada' @click="previousMonth"></i>
                        <p>{{ currentMonth }}</p>
                        <p>{{ preCurrentMonth }}</p>
                        <i class='bx bxs-chevron-right-circle bx-tada' @click="nextMonth"></i>
                    </div>
                </div>
                <div class="echartContainer" v-if="currentHead=='季'">
                    <div class="leftRightContainer">
                        <i class='bx bxs-chevron-left-circle bx-tada' @click="previousSeason"></i>
                        <p>{{ currentSeason }}</p> 
                        <p>{{ preCurrentSeason }}</p>
                        <i class='bx bxs-chevron-right-circle bx-tada' @click="nextSeason"></i>
                    </div>
                </div>
                <div class="echartContainer" v-if="currentHead=='年'">
                    <div class="leftRightContainer">
                        <i class='bx bxs-chevron-left-circle bx-tada' @click="previousYear"></i>
                        <p>{{ currentYear }}</p>
                        <p>{{ preCurrentYear }}</p>
                        <i class='bx bxs-chevron-right-circle bx-tada' @click="nextYear"></i>
                    </div>
                </div>
                <!-- <div class="echartContainer" v-if="currentHead=='自訂'">
                    <p>請選擇日期範圍</p>
                    <div class="leftRightContainer">
                        <p>開始</p>
                        <input type="date" v-model="startDate">
                        <p>結束</p>
                        <input type="date" v-model="startDate">
                    </div>
                </div> -->
                </div>
            <div class="dashboardRight">
                <i class='bx bxs-grid'></i>
                <button>Export CSV</button>
            </div>
        </div>

    </div>
</div>

</template>


<style scoped lang ="scss">
$up-background: #ffcdd2;
$up-font: #c62828;
$down-background: #c8e6c9;
$down-font: #388e3c;


*{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Poppins", sans-serif;

}

.container{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    .innerContainer{
        width: 100%;
        height: 30%;
        background-color: #dcdddfaa;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        .dashboardContainer{
            width: 100%;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2% 5%;
            position: relative;
            &:before{
                position: absolute;
                content: "";
                width: 100%;
                height: 1px;
                left: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.232);
            }
            
            .dashboardLeft{
                .navHead{
                    width: 30%;
                    height: 40px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: rgba(130, 130, 130, 0.503);
                    border-radius: 10px;
                    margin: 30px 0 0 0;
                    // padding: 0 10px;
                    position: relative;
                    .headStyle{
                        width: 25%;
                        height: 40px;
                        font-size: 20px;
                        text-align: center;
                        display: flex;
                        justify-content: center;  /* 水平居中 */
                        align-items: center;      /* 垂直居中 */
                        cursor: pointer;

                        &:hover{
                            color: white;
                            background-color: rgba(0, 0, 255, 0.301);
                            border-radius: 10px;
                        }
                    }

                    .headStyleClick {
                        color: white;
                        background-color: rgba(0, 0, 255, 0.301);
                        border-radius: 10px;
                    }

                }
                .echartContainer {
                    width: 100%;
                    height: 90px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    margin-top: 10px;
                    position: relative;
                    &:before{
                        position: absolute;
                        content: "";
                        width: 100%;
                        height: 1px;
                        left: 0;
                        bottom: 0;
                        background-color: rgba(0, 0, 0, 0.232);
                    }
                    .leftRightContainer{
                        width: 100%;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        i{
                            font-size: 40px;
                            cursor: pointer;
                        }
                        p{
                            font-size: 25px;
                            margin: 0 20px;
                        }
                        input{
                            width: 150px;
                            height: 40px;
                            border-radius: 12px;
                        }
                    }
                }
            }
            .dashboardRight{
                display: flex;
                align-items: center;
                justify-content: space-between;
                i{
                    font-size: 25px;
                    margin: 0 10px 0 0;
                    cursor: pointer;

                }

                button{
                    width: 120px;
                    height: 40px;
                    font-size: 18px;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    background-color: #2DB976;
                    cursor: pointer;
                }
            }
        }

    }
}
</style>