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
            // analysis: {
            //     "totalRevenue": 600,
            //     "totalOrders": 12,
            //     "popularDishes": [
            //         {
            //             "name": "天堂漢堡",
            //             "orders": 1
            //         },
            //         {
            //             "name": "地獄漢堡",
            //             "orders": 1
            //         },
            //         {
            //             "name": "恐龍漢堡",
            //             "orders": 1
            //         },
            //         {
            //             "name": "水母漢堡",
            //             "orders": 1
            //         },
            //         {
            //             "name": "草尼碼漢堡",
            //             "orders": 1
            //         },
            //         {
            //             "name": "飛雷神漢堡",
            //             "orders": 1
            //         },
            //         {
            //             "name": "金妮漢堡",
            //             "orders": 2
            //         },
            //         {
            //             "name": "幻影俠客漢堡",
            //             "orders": 1
            //         },
            //         {
            //             "name": "天使破壞者漢堡",
            //             "orders": 1
            //         },
            //         {
            //             "name": "精靈射手漢堡",
            //             "orders": 1
            //         },
            //         {
            //             "name": "吐司漢堡",
            //             "orders": 1
            //         }
            //     ],
            //     "revenueGrowth": [
            //         {
            //             "day": "2024-09-26",
            //             "revenue": 600
            //         }
            //     ]
            // },
            analysis:null,
            preDateForDay: new Date(new Date().setDate(new Date().getDate() - 1)),
            preDateForMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            preDateForSeason: new Date(new Date().setMonth(new Date().getMonth() - 2)),
            preDateForYear: new Date(new Date().setYear(new Date().getFullYear() - 1)),
            preStartDate: null,
            preEndDate: null,
            // preAnalysis:{
            //     "totalRevenue": 0,
            //     "totalOrders": 0,
            //     "popularDishes": [],
            //     "revenueGrowth": [
            //         {
            //             "day": "2024-09-25",
            //             "revenue": 0
            //         }
            //     ]
            // },
            preAnalysis:null,
            joinOrderList:[],

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
                    data:["123"],
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
                        data: [20],
                    }
                ]
            }
        }
    },
    created(){
    },
    mounted() {
        this.getTodayDate() 
        this.optionLine.xAxis.data = this.getPeriodDate(this.startDate, this.endDate) 

        Promise.all([
            axios.post("http://localhost:8080/pos/analysis", {   
                "startDate": this.startDate,
                "endDate": this.endDate
            }),
            axios.post("http://localhost:8080/pos/analysis", {   
                "startDate": this.preStartDate,
                "endDate": this.preEndDate
            })
        ])
        .then(([response1, response2]) => {
            this.analysis = response1.data.analysis;
            this.analysis.popularDishes = this.analysis.popularDishes.sort((a, b) => b.orders - a.orders);

            this.preAnalysis  = response2.data.analysis;
        })
        .then(()=>{
            this.optionLine.xAxis.data = this.getPeriodDate(this.startDate, this.endDate)
            this.optionLine.series[0].data = this.analysis.revenueGrowth.map(item=>{
                return item.revenue
            })
        })
        .catch(error => {
            console.error("Error fetching analysis:", error);
        });

        this.$nextTick(() => {
            this.drawChart();  // 初始化图表
        });
    },
    computed:{
        currentDay() {
            
            const year = this.dateForDay.getFullYear();
            const month = String(this.dateForDay.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始，需加 1
            const day = String(this.dateForDay.getDate()).padStart(2, '0'); // 格式化日期，確保兩位數
            this.startDate = `${year}-${month}-${day}`;
            this.endDate = `${year}-${month}-${day}`;
            this.postStartDateAndEndDate(this.startDate, this.endDate)
            this.preCurrentDay

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
            this.preCurrentMonth

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
            this.preCurrentSeason

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
            this.preCurrentYear

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
            const myChart = echarts.init(document.getElementById("echart"));
            if (myChart) {
                myChart.setOption(this.optionLine);  
            } else {
                console.error("Invalid DOM: chart container not found");
            }
        },

        selectPeriod(type){
            this.currentHead = type
        },
        calRevenueGrowth(){
            console.log(this.analysis.totalRevenue)
            console.log(this.preAnalysis.totalRevenue)
            let revenueUpRate = (this.analysis.totalRevenue-this.preAnalysis.totalRevenue)/(this.preAnalysis.totalRevenue) * 100
            revenueUpRate = Math.round(revenueUpRate)
            return revenueUpRate
        },
        calOrdersGrowth(){
            let ordersUpRate = (this.analysis.totalOrders - this.preAnalysis.totalOrders)/ (this.preAnalysis.totalOrders) * 100
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
                    <i class='bx bx-chevron-left' @click="previousDay"></i>
                    <p>{{ currentDay }}</p>
                    <i class='bx bx-chevron-right' @click="nextDay"></i>
                </div>
            </div>
            <div class="echartContainer" v-if="currentHead=='月'">
                <div class="leftRightContainer">
                    <i class='bx bx-chevron-left' @click="previousMonth"></i>
                    <p>{{ currentMonth }}</p>
                    <i class='bx bx-chevron-right' @click="nextMonth"></i>
                </div>
            </div>
            <div class="echartContainer" v-if="currentHead=='季'">
                <div class="leftRightContainer">
                    <i class='bx bx-chevron-left' @click="previousSeason"></i>
                    <p>{{ currentSeason }}</p> 
                    <i class='bx bx-chevron-right' @click="nextSeason"></i>
                </div>
            </div>
            <div class="echartContainer" v-if="currentHead=='年'">
                <div class="leftRightContainer">
                    <i class='bx bx-chevron-left' @click="previousYear"></i>
                    <p>{{ currentYear }}</p>
                    <i class='bx bx-chevron-right' @click="nextYear"></i>
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
            <button>下載檔案</button>
        </div>
    </div>

    <div class="innerContainer2">
            <div class="innerContainer2-Left">
                <div class="compareContainer">
                    <div class="compareItem">
                        <p class="title">總銷售額</p>
                        <div class="content">
                            <p class="contentNumber" v-if="analysis && analysis.totalRevenue !== null">${{ analysis.totalRevenue }}</p>
                            <!-- <p class="contentNumber">{{ preAnalysis.totalRevenue }}</p> -->
                        </div>
                        <div class="foot">
                            <div class="contentRateUp" v-if="analysis && analysis.totalRevenue !== null && preAnalysis && preAnalysis.totalRevenue !== null && calRevenueGrowth()>=0">
                                <i class='bx bx-up-arrow-alt'></i>
                                <p>{{calRevenueGrowth()}}%</p>
                            </div>
                            <div class="contentRateDown" v-if="analysis && analysis.totalRevenue !== null && preAnalysis && preAnalysis.totalRevenue !== null && calRevenueGrowth()<0">
                                <i class='bx bx-down-arrow-alt'></i>
                                <p>{{calRevenueGrowth()}}%</p>
                            </div>
                            <p class="compareWhat" v-if="currentHead=='日'">vs 昨日</p>
                            <p class="compareWhat" v-if="currentHead=='月'">vs 前一月</p>
                            <p class="compareWhat" v-if="currentHead=='季'">vs 前一季</p>
                            <p class="compareWhat" v-if="currentHead=='年'">vs 前一年</p>
                        </div>    
                    </div>
                    <div class="compareItem">
                        <p class="title">總銷售量</p>
                        <div class="content">
                            <p class="contentNumber" v-if="analysis && analysis.totalOrders !== null">{{ analysis.totalOrders }}</p>
                        </div>
                        <div class="foot">
                            <div class="contentRateUp" v-if="analysis && analysis.totalOrders !== null && preAnalysis && preAnalysis.totalOrders !== null && calOrdersGrowth()>=0">
                                <i class='bx bx-up-arrow-alt'></i>
                                <p>{{calOrdersGrowth()}}%</p>
                            </div>
                            <div class="contentRateDown" v-if="analysis && analysis.totalOrders !== null && preAnalysis && preAnalysis.totalOrders !== null && calOrdersGrowth()<0">
                                <i class='bx bx-down-arrow-alt'></i>
                                <p>{{calOrdersGrowth()}}%</p>
                            </div>
                            <p class="compareWhat" v-if="currentHead=='日'">vs 昨日</p>
                            <p class="compareWhat" v-if="currentHead=='月'">vs 前一月</p>
                            <p class="compareWhat" v-if="currentHead=='季'">vs 前一季</p>
                            <p class="compareWhat" v-if="currentHead=='年'">vs 前一年</p>
                        </div>    
                    </div>
                </div>
                <div class="chartContainer">
                    <h1>營運分析圖</h1>
                    <div id="echart" >
                    </div>
                </div>
            </div>
            <div class="innerContainer2-Right">
                <div class="title">
                    <h1>人氣餐點排行</h1>
                    <!-- <p>View All</p> -->
                </div >
                <div class="column">
                    <p>Rank</p>
                    <p>Name</p>
                </div>
                <div class="poppularDishes">
                    <div class="dishItem" v-if="analysis && analysis.popularDishes!==null" v-for="(dish,index) in analysis.popularDishes">
                        <p class="rank">{{ String(index+1).padStart(2,"0")}}</p>
                        <img class="img" src="https://tokyo-kitchen.icook.network/uploads/recipe/cover/420886/dd9e8293a9b1a758.jpg" alt="">
                        <div class="content">
                            <h1 class="name">{{dish.name}}</h1>
                            <div class="quantity">
                                <p>Orders:</p>
                                <p>{{ dish.orders }}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
</div>

</template>


<style scoped lang ="scss">
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@100..900&display=swap');
$up-background: #ffcdd2;
$up-font: #c62828;
$down-background: #c8e6c9;
$down-font: #388e3c;


*{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Noto Sans TC", sans-serif;
}

.container{
    width: 100%;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 5% 0 10% 0;
    .innerContainer{
        width: 100%;
        height: 10%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0 0 0 0;
        .dashboardLeft{
            width: 88%;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            .navHead{
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: rgba(255, 255, 255, 0.7);
                border-radius: 10px;
                border: 2px solid rgba(0, 0, 0, 0.25);
                padding: 0 10px;
                margin: 0 5% 0 0;
                position: relative;

                .headStyle{
                    width: 25%;
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
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: rgba(255, 255, 255, 0.7);
                border-radius: 10px;
                border: 2px solid rgba(0, 0, 0, 0.25);
                .leftRightContainer{
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    i{  
                        width: 50px;
                        display: flex;
                        text-align: center;
                        justify-content: center;
                        background-color: rgba(0, 0, 0, 0.121);
                        font-size: 30px;
                        cursor: pointer;
                        border-radius: 6px;
                        padding: 2px 0 0 0;
                    }
                    p{
                        font-size: 25px;
                        margin: 0 10px;
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
            width: 50%;
            display: flex;
            align-items: center;
            justify-content: flex-end;
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
    .innerContainer2{
        width: 100%;
        height: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        .innerContainer2-Left{
            width: 65%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            border-radius: 12px;
            margin: 0 1% 0 0;
            .compareContainer{
                width: 100%;
                height: 25%;
                display: flex;
                align-items: center;
                justify-content: flex-start;
                border-radius: 6px;
                background-color: white;
                border: 2px solid rgba(0, 0, 0, 0.25);
                padding: 0 5%;
                margin: 0 0 2% 0;

                .compareItem{
                    width: 50%;
                    height: 100%;
                    padding: 20px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    justify-content: center;
                    margin: 0 0 0 4%;
                    position: relative;
                    &:nth-child(-n+2):before{
                        position: absolute;
                        content: "";
                        width: 2px;                   /* 線的寬度，1px 即為細線 */
                        height: 70%;                 /* 讓線佔滿元素的高度 */
                        top: 20%;                       /* 讓線從頂部開始 */
                        left: -2%;                     /* 將線放在元素的右邊 */
                        background-color: rgba(0, 0, 0, 0.232); /* 線的顏色 */
                    }
                    .title{
                        font-size: 18px;
                        color: #212528;
                        font-weight: 600;
                    }
                    .content{
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        .contentNumber{
                            font-size: 50px;
                            margin: 0 15px 0 0;
                        }
                    }
                    .foot{
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                        .contentRateUp{
                            width: 80px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            border-radius: 12px;
                            background-color: $up-background;
                            margin: 0 10px 0 0;
                            p{
                                color: $up-font;
                            }
                            i{
                                color: $up-font;
                            }
                        }
                        .contentRateDown{
                            width: 80px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            border-radius: 12px;
                            margin: 0 10px 0 0;
                            background-color: $down-background;
                            p{
                                color: $down-font;
                            }
                            i{
                                color: $down-font;
                            }
                        }
                        .compareWhat{
                            color: #5D6165;
                        }
                    }
                }
            }
            .chartContainer{
                width: 100%;
                height: 600px;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                border-radius: 6px;
                background-color: white;
                border: 2px solid rgba(0, 0, 0, 0.25);
                padding: 5% 4%;

                h1{
                    font-size: 25px;
                    margin: 0 0 20px 0;
                }
                #echart{
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(0, 0, 0, 0.25);
                }
            }
        }
        .innerContainer2-Right{
            width: 35%;
            height: 65%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            background-color: white;
            border-radius: 12px;
            border: 2px solid rgba(0, 0, 0, 0.25);
            padding: 20px 20px;
            overflow-y: scroll;

            .title{
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 0 0 10px 0;
                h1{
                    font-size: 25px;
                }
                // p{  
                //     font-weight: 500;
                //     color: #066a68cf;
                // }
            }
            .column{
                display: flex;
                align-items: center;
                justify-content: flex-start;
                color: #000000a5;
                margin: 0 0 10px 0;
                p{
                    margin: 0 10px 0 0;
                }
            }

            .poppularDishes{
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                // background-color: aquamarine;
                .dishItem{
                    width: 100%;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    // background-color: rgb(127, 142, 255);
                    margin: 10px 0;
                    padding: 10px 10px;

                    .rank{
                        margin: 0 20px 0 0;
                    }
                    .img{
                        width: 60px;
                        height: 60px;
                        border-radius: 50px;
                        margin: 0 20px 0 0;
                    }
                    .content{
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        justify-content: flex-start;
                        h1{
                            font-size: 20px; 
                        }
                        .quantity{
                            display: flex;
                            align-items: center;
                            justify-content: flex-start;
                            p:nth-child(1){
                                color: #000000aa;
                                margin: 0 10px 0 0;
                            }
                            p:nth-child(2){
                                font-weight: 500;
                                color: rgba(255, 0, 0, 0.723);
                            }
                            
                        }
                    }
                }

            }
        }

    }
}
</style>
