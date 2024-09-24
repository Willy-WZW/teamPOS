<script>
import { RouterLink } from 'vue-router';
export default {
    data() {
        return {
            timeCode: ''
        }
    },
    methods: {
        updateTime() { //更新時間方法
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM'; //判斷AM PM

            // 轉12小時制
            hours = hours % 12;
            hours = hours ? hours : 12; //小時為0時，顯示為12
            hours = String(hours).padStart(2, '0');

            this.timeCode = `${hours}:${minutes} ${ampm}`;

            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            this.dateCode = now.toLocaleDateString('en-US', options)
        },
        goSetting() {
            this.$router.push("./setting")
        },
        goOperation() {
            this.$router.push("./operation")
        },
        goOrder() {
            this.$router.push("./order")
        },
        goStatus() {
            this.$router.push("./orderStatus")
        },
        goTCheckout() {
            this.$router.push("./tableAndCheckout")
        },
        goEvent() {
            this.$router.push("./event")
        },
        goWorkstation() {
            this.$router.push("./workstation")
        },
        goHistory() {
            this.$router.push("./history")
        },
    },
    mounted() {
        // 初始化時間
        this.updateTime()

        this.timeInterval = setInterval(() => {
            this.updateTime()
        }, 1000)
    },
    beforeDestroy() {
        // 清除計時器
        clearInterval(this.timeInterval);
    }
}
</script>

<template>
    <div class="lefter">
        <div class="timeCode">
            <div class="timeStyle">{{ timeCode }}</div>
            <div class="timeStyle">{{ dateCode }}</div>
        </div>
        <div class="control">
            <div class="setting" @click="goSetting()" :class="{ 'selected': this.$route.path == '/setting' }">
                <i class="fa-solid fa-gear"></i>
                <h3>設定</h3>
            </div>
            <div class="operation" @click="goOperation()" :class="{ 'selected': this.$route.path == '/operation' }">
                <i class="fa-solid fa-chart-simple"></i>
                <h3>營運</h3>
            </div>
            <div class="order" @click="goOrder()" :class="{ 'selected': this.$route.path == '/order' }">
                <i class="fa-solid fa-utensils"></i>
                <h3>點餐</h3>
            </div>
            <div class="orderStatus" @click="goStatus()" :class="{ 'selected': this.$route.path == '/orderStatus' }">
                <i class="fa-solid fa-list-check"></i>
                <h3>餐點狀態</h3>
            </div>
            <div class="tableChechout" @click="goTCheckout()"
                :class="{ 'selected': this.$route.path == '/tableAndCheckout' }">
                <div>
                    <span class="material-symbols-outlined">
                        table_restaurant
                    </span>
                    <span class="material-symbols-outlined">
                        request_quote
                    </span>
                </div>
                <h3>桌位結帳</h3>
            </div>
            <div class="event" @click="goEvent()" :class="{ 'selected': this.$route.path == '/event' }">
                <i class="fa-regular fa-calendar-check"></i>
                <h3>活動</h3>
            </div>
            <div class="workstation" @click="goWorkstation()"
                :class="{ 'selected': this.$route.path == '/workstation' }">
                <i class="fa-solid fa-fire-burner"></i>
                <h3>工作檯</h3>
            </div>
            <div class="history" @click="goHistory()" :class="{ 'selected': this.$route.path == '/history' }">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <h3>歷史紀錄</h3>
            </div>
        </div>
        <div class="user">
            <div class="userInfo">
                <i class="fa-solid fa-user-injured"></i>
                <h3>謝新達</h3>
                <p>主持人</p>
            </div>
            <span>
                <RouterLink to="/">登出</RouterLink>
            </span>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@100..900&display=swap');
$bgColor: aliceblue;
$boxShadow: black;

.lefter {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex-direction: column;
    background-color: $bgColor;

    .timeCode {
        width: 80%;
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        border-bottom: 1px solid black;

        .timeStyle {
            margin: 5px auto;
            font-size: 18px;
        }
    }

    .control {
        width: 70%;
        height: 700px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: column;
        // border: 1px solid black;


        .setting {
            width: 100%;
            height: 12.5%;
            cursor: pointer;
            border-radius: 5px;
            display: flex;
            justify-content: space-evenly;
            align-items: center;
            flex-direction: column;
            font-family: "Noto Sans TC", sans-serif;
            box-shadow: -2px 2px 5px $boxShadow;

            .fa-gear {
                margin-top: 13px;
                scale: 2;
            }

            h3 {
                margin-left: 3px;
                padding-top: 10px;
                letter-spacing: 3px;
            }
        }

        .operation {
            width: 100%;
            height: 12.5%;
            cursor: pointer;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            font-family: "Noto Sans TC", sans-serif;
            box-shadow: -2px 2px 5px $boxShadow;

            .fa-chart-simple {
                margin-top: 13px;
                scale: 2;
            }

            h3 {
                margin-left: 3px;
                padding-top: 10px;
                letter-spacing: 3px;
            }
        }

        .order {
            width: 100%;
            height: 12.5%;
            cursor: pointer;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            font-family: "Noto Sans TC", sans-serif;
            box-shadow: -2px 2px 5px $boxShadow;

            .fa-utensils {
                margin-top: 13px;
                scale: 2;
            }

            h3 {
                margin-left: 3px;
                padding-top: 10px;
                letter-spacing: 3px;
            }
        }

        .orderStatus {
            width: 100%;
            height: 12.5%;
            cursor: pointer;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            font-family: "Noto Sans TC", sans-serif;
            box-shadow: -2px 2px 5px $boxShadow;

            .fa-list-check {
                margin-top: 13px;
                scale: 2;
            }

            h3 {
                margin-left: 3px;
                padding-top: 10px;
            }
        }

        .tableChechout {
            width: 100%;
            height: 12.5%;
            cursor: pointer;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            font-family: "Noto Sans TC", sans-serif;
            box-shadow: -2px 2px 5px $boxShadow;

            .material-symbols-outlined {
                margin-top: 13px auto 0 auto;
                scale: 1.2;
            }
        }

        .event {
            width: 100%;
            height: 12.5%;
            cursor: pointer;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            font-family: "Noto Sans TC", sans-serif;
            box-shadow: -2px 2px 5px $boxShadow;

            .fa-calendar-check {
                margin-top: 13px;
                scale: 2;
            }

            h3 {
                margin-left: 3px;
                padding-top: 10px;
                letter-spacing: 3px;
            }
        }

        .workstation {
            width: 100%;
            height: 12.5%;
            cursor: pointer;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            font-family: "Noto Sans TC", sans-serif;
            box-shadow: -2px 2px 5px $boxShadow;

            .fa-fire-burner {
                margin-top: 13px;
                scale: 2;
            }

            h3 {
                margin-left: 3px;
                padding-top: 10px;
                letter-spacing: 3px;
            }
        }

        .history {
            width: 100%;
            height: 12.5%;
            cursor: pointer;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            font-family: "Noto Sans TC", sans-serif;
            box-shadow: -2px 2px 5px $boxShadow;

            .fa-clock-rotate-left {
                margin-top: 13px;
                scale: 2;
            }

            h3 {
                margin-left: 3px;
                padding-top: 10px;
            }
        }

        .selected {
            background-color: rgb(200, 200, 200);
            box-shadow: 5px 0.1px 1px $boxShadow;
        }
    }

    .user {
        width: 80%;
        height: 150px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        .userInfo {
            width: 100%;
            height: 70%;
            display: flex;
            justify-content: space-evenly;
            align-items: center;
            flex-direction: column;
            border-bottom: 1px solid black;
            .fa-user-injured{
                scale: 2;
                margin-bottom: 5px;
            }
            p{
                margin-bottom: 5px;
                color: rgb(101, 101, 101);
            }
        }
    }

}
</style>