<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            maxWaitlistOrder: 0, // 用來儲存最大候位順序
            newWaitlist: {
                people: 2,  // 預設人數為 2
                date: new Date().toISOString().split('T')[0],  // 預設為當前日期
                time: this.getCurrentTime(), // 設定為當前時間
                name: '', 
                title: '先生', 
                phone: '', 
                email: ''
            },
        };
    },

    mounted() {
        this.fetchMaxWaitlistOrder(); // 在組件掛載時自動獲取最大候位順序
    },

    methods: {
        // 關閉候位視窗
        closeWaitlistModal() {
            this.showWaitlistModal = false
        },

        // 格式化當前時間
        getCurrentTime() {
            const now = new Date();
            // 將時間格式化為 HH:MM:SS 的格式
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`; // 返回 HH:MM:SS 格式
        },

        // 獲取最大候位順序
        async fetchMaxWaitlistOrder() {
            try {
                const response = await axios.get('http://localhost:8080/waitlist/getMaxWaitlistOrder'); // 使用你的 API 路徑
                this.maxWaitlistOrder = response.data; // 更新最大候位順序
            } catch (error) {
                console.error('獲取最大候位順序失敗:', error);
                Swal.fire({
                    icon: 'error',
                    title: '錯誤',
                    text: '獲取最大候位順序！',
                });
            }
        },

        // 儲存候位API
        async addWaitlist() {
            // 將要傳送的數據格式化
            const waitlistData = {
                customerName: this.newWaitlist.name,
                customerPhoneNumber: this.newWaitlist.phone,
                customerEmail: this.newWaitlist.email,
                customerGender: this.newWaitlist.title,
                waitListPeople: this.newWaitlist.people,
                waitingDate: this.newWaitlist.date,
                waitTime: this.newWaitlist.time
            };

            try {
                const response = await axios.post('http://localhost:8080/waitlist/registerWaitlist', waitlistData); // 儲存候位的 API
                console.log('候位提交成功:', response.data);
                Swal.fire({
                    title: '候位成功',
                    text: '您的候位已確認',
                    icon: 'success',
                    confirmButtonText: '確定'
                });
                this.closeWaitlistModal();
            } catch (error) {
                console.error('候位提交失敗:', error);
                Swal.fire({
                    icon: 'error',
                    title: '錯誤',
                    text: '候位提交失敗！',
                });
            }
        }
    },
};
</script>

<template>
<div v-if="showWaitlistModal" class="waitlistModal" @click="closeWaitlistModal">
    <div class="modalContent" @click.stop>
        <!-- 候位區域 -->
        <div class="waitlistInfoArea">
            <h3 class="waitlistInfoTitle">候位資訊</h3>
        
            <div class="partySizeAndDateArea">
                <!-- 人數選擇 -->
                <div class="partySizeArea">
                    <label for="partySize">人數</label>
                    <select v-model="newWaitlist.people">
                        <option disabled value="">選擇人數</option>
                        <option v-for="n in 20" :key="n" :value="n">{{ n }}</option>
                    </select>
                </div>
                
                <!-- 日期選擇 -->
                <div class="dateArea">
                    <label for="date">日期</label>
                    <input type="date" v-model="newWaitlist.date" />
                </div>
            </div>
            
            <div class="timeAndOrderArea">
                <!-- 時段選擇 -->
                <div class="timeArea">
                    <label for="time">時間</label>
                    <input class="timeInput" type="time" v-model="newWaitlist.time" />
                </div>

                <!-- 候位順序 -->
                <div class="orderArea">
                    <label for="order">前方候位組數</label>
                    <input type="text" :value="maxWaitlistOrder" readonly />
                </div>
            </div>
        </div>
    
        <!-- 聯絡資料 -->
        <div class="contactInfoArea">
            <h3 class="contactInfoTitle">聯絡資料</h3>

            <div class="nameAndTitleArea">
                <!-- 訂位人姓名 -->
                <div class="nameArea">
                    <label for="name">訂位人姓名</label>
                    <input type="text" v-model="newWaitlist.name" />
                </div>
                <!-- 稱謂選擇 -->
                <div class="titleArea">
                    <label>
                        <input type="radio" v-model="newWaitlist.title" value="先生" /> 先生
                    </label>
                    <label>
                        <input type="radio" v-model="newWaitlist.title" value="小姐" /> 小姐
                    </label>
                    <label>
                        <input type="radio" v-model="newWaitlist.title" value="其他" /> 其他
                    </label>
                </div>
            </div>


            <!-- 電話號碼 -->
            <div class="phoneArea">
                <label for="phone">電話號碼</label>
                <input type="text" v-model="newWaitlist.phone" />
            </div>

            <!-- 電子郵件 -->
            <div class="mailArea">
                <label for="email">電子郵件Email</label>
                <input type="email" v-model="newWaitlist.email" />
            </div>
        </div>
    
        <!-- 按鈕 -->
        <div class="buttonArea">
            <button class="cancelButton" @click="closeWaitlistModal">取消</button>
            <button class="addButton" @click="addWaitlist">確認</button>
        </div>
    </div>
</div>
</template>

<style scoped lang="scss">
.waitlistModal {
    width: 100dvw;
    height: 100dvh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;

    .modalContent {
        width: 50%;
        height: 70%;
        border-radius: 10px;
        background: white;
        padding: 20px;

        .waitlistInfoArea {
            width: 100%;
            height: 40%;

            .waitlistInfoTitle {
                font-size: 20px;
                letter-spacing: 3px;
                margin-bottom: 8px;
            }

            .partySizeAndDateArea {
                height: 35%;
                border-top: 2px solid #C1C7CD;
                display: flex;
                justify-content: space-between;
                padding: 10px;

                .partySizeArea {
                    width: 50%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;

                    label {
                        font-size: 17px;
                        letter-spacing: 4px;
                        margin-bottom: 5px;
                    }

                    select {
                        width: 65%;
                        height: 35px;
                        border-radius: 10px;
                        border: 1px solid #C1C7CD;
                        letter-spacing: 5px;
                        padding-left: 10px;
                        appearance: none;
                        /* 隱藏默認的箭頭 */
                        background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjcxNzUgNi41NDc1QzEzLjE3OTcgNi4xNDcyIDEzLjI4MjIgNS40MTMgMTIuOTg3MiA0LjkzMjVDMTIuNjkzMiA0LjQ1MjUgMTIuMDEwNCA0LjQ1MjUgMTEuNzE3IDQuOTMyNUw4IDkuMzM1NEw0LjI4MjUgNC45MzI1QzMuOTg5NiA0LjQ1MjUgMy4zMDY4IDQuNDUyNSAyLjAxMjggNC45MzI1QzEuNzE4OCA1LjQxMyAxLjgyMTEgNi4xNDcyIDIuMjg0MTIgNi41NDc1TDcuMzE1MTIgMTEuNTA2QzcuNzU4NDEgMTEuOTYxIDguMjQxNiAxMS45NjEgOC42ODY4IDExLjUwNkMxMC4xNzA4IDEwLjI1NyAxMS41OTExIDguOTAzNTggMTIuNzE3NSA3LjY2MjVIMTIuNzE3NVoiIGZpbGw9IiMyMjIyMjIiLz4KPC9zdmc+') no-repeat;
                        /* 使用 base64 格式的箭頭圖標 */
                        background-position: calc(100% - 15px) center;
                        /* 調整箭頭的位置，讓它距離左邊更近 */
                        background-size: 15px;
                        /* 調整箭頭大小 */
                        outline: none;
                        cursor: pointer;
                    }
                }

                .dateArea {
                    width: 35%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;

                    label {
                        font-size: 17px;
                        letter-spacing: 4px;
                        margin-bottom: 5px;
                    }

                    input {
                        width: 90%;
                        height: 35px;
                        border-radius: 10px;
                        border: 1px solid #C1C7CD;
                        text-indent: 3px;
                        outline: none;
                        cursor: pointer;
                    }
                }
            }

            .timeAndOrderArea {
                height: 35%;
                display: flex;
                justify-content: space-between;
                padding: 10px;

                .timeArea {
                    width: 50%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;

                    label {
                        font-size: 17px;
                        letter-spacing: 4px;
                        margin-bottom: 5px;
                    }

                    input {
                        width: 65%;
                        height: 35px;
                        border-radius: 10px;
                        border: 1px solid #C1C7CD;
                        text-indent: 3px;
                        outline: none;
                        cursor: pointer;
                    }
                }

                .orderArea {
                    width: 35%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;

                    label {
                        font-size: 17px;
                        letter-spacing: 4px;
                        margin-bottom: 5px;
                    }

                    input {
                        width: 90%;
                        height: 35px;
                        border-radius: 10px;
                        border: 1px solid #C1C7CD;
                        text-indent: 5px;
                        outline: none;
                        cursor: pointer;
                    }
                }
            }
        }

        .contactInfoArea {
            width: 100%;
            height: 45%;

            .contactInfoTitle {
                font-size: 20px;
                letter-spacing: 3px;
                margin-bottom: 8px;
            }

            .nameAndTitleArea {
                height: 30%;
                border-top: 2px solid #C1C7CD;
                display: flex;
                padding: 10px;

                .nameArea {
                    width: 50%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;

                    label {
                        font-size: 17px;
                        letter-spacing: 4px;
                        margin-bottom: 5px;
                    }

                    input {
                        width: 90%;
                        height: 35px;
                        border-radius: 10px;
                        border: 1px solid #C1C7CD;
                        text-indent: 5px;
                        letter-spacing: 3px;
                        outline: none;
                        cursor: pointer;
                    }
                }

                .titleArea {
                    width: 35%;
                    height: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 20px;

                    label {
                        font-size: 17px;
                        letter-spacing: 4px;
                        display: flex;
                        align-items: center;
                        margin-right: 10px;
                    }

                    input[type="radio"] {
                        margin-right: 10px;
                        cursor: pointer;
                    }
                }
            }

            .phoneArea {
                width: 100%;
                height: 30%;
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                padding: 10px;

                label {
                    font-size: 17px;
                    letter-spacing: 4px;
                    margin-bottom: 5px;
                }

                input {
                    width: 70%;
                    height: 35px;
                    border-radius: 10px;
                    border: 1px solid #C1C7CD;
                    text-indent: 5px;
                    letter-spacing: 3px;
                    outline: none;
                    cursor: pointer;
                }
            }

            .mailArea {
                width: 100%;
                height: 30%;
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                padding: 10px;

                label {
                    font-size: 17px;
                    letter-spacing: 4px;
                    margin-bottom: 5px;
                }

                input {
                    width: 70%;
                    height: 35px;
                    border-radius: 10px;
                    border: 1px solid #C1C7CD;
                    text-indent: 5px;
                    letter-spacing: 3px;
                    outline: none;
                    cursor: pointer;
                }
            }
        }

        .buttonArea {
            display: flex;
            justify-content: space-evenly;
            align-items: center;
            margin-top: 15px;

            .cancelButton {
                border: none;
                border-radius: 10px;
                background-color: #DDE1E6;
                font-size: 15px;
                letter-spacing: 3px;
                margin-top: 15px;
                padding: 15px 140px;
                cursor: pointer;
                color: #21272A;
            }

            .addButton {
                border: none;
                border-radius: 10px;
                background-color: #343A3F;
                font-size: 15px;
                letter-spacing: 3px;
                padding: 15px 140px;
                margin-top: 15px;
                cursor: pointer;
                color: white;
            }
        }
    }
}
</style>