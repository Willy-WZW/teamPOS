<script>
import * as echarts from 'echarts';
import axios from 'axios';
export default{
    data(){
        return{
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
    mounted() {
        this.drawChart();
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
    },
}
</script>


<template>
    <div id="echart" >
    </div>
</template>


<style scoped lang ="scss">

*{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Poppins", sans-serif;
}

#echart{
    width: 100dvw;
    height: 100dvh;
}

</style>
