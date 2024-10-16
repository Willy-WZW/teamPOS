<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            
            memberPhoneNumber: '', // 會員電話號碼
            memberDiscount: null, // 會員折扣
            ordersId: "", //訂單編號
            orderItems: [],
            total: 0,
            // discount: 18,  // 假設折扣
            subtotal: 0,
            paymentMethod: 'creditCard', // 預設付款方式
            creditCardInfo: {
                cardNumber: '',
                cardHolder: '',
                expiryDate: '',
                cvv: ''
            },
            receivedAmount: 0, // 收取的金額
            change: 0, // 找零
        };
    },

    methods: {
        // 開啟結帳側邊欄
        selectTable(table) {
            // 使用 fetch 發送 GET 請求
            fetch(`http://localhost:8080/api/checkout/details/${table.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json(); // 解析回應為 JSON 格式
                })
                .then(data => {

                    if (data.code == 200) {

                        //訂單編號
                        this.ordersId = data.data.orderId;

                        //放入單點
                        data.data.single.forEach(item => {
                            this.orderItems.push({ name: item.mealName, notes: [], price: item.price });
                        });

                        //放入套餐
                        data.data.orderMealId.forEach(item => {
                            let mealString = item.mealName;
                            let mealArray = mealString.split(', ').map(meal => meal.trim());

                            this.orderItems.push({ name: item.comboName, notes: mealArray, price: item.price });
                        });

                        //放入金額
                        this.total = data.data.totalPrice;
                        this.subtotal = data.data.totalPrice;


                    } else {
                        Swal.fire({
                            title: '查詢資料失敗',
                            text: data.message, // 顯示錯誤訊息
                            icon: 'error',
                            confirmButtonText: '確定',
                        });
                        this.closePanel();
                    }
                })
                .catch(error => {
                    console.error("取得桌號資料:", error);
                });
            this.selectedTable = table; // 設置選中的桌位
        },

        confirmPayment(ordersId) {

            const now = new Date();
            // 將時間轉換為 UTC+8
            const taiwanTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // 加8小時
            const checkoutTime = taiwanTime.toISOString();

            let payType = "";
            if (this.paymentMethod == "creditCard") {
                payType = "信用卡";
            } else if (this.paymentMethod == "cash") {
                payType = "現金";
            }



            const confirmPaymentData = {
                orderId: ordersId,
                tableNumber: this.selectedTable.id,
                totalPrice: this.subtotal,
                payType: payType,
                checkout: 1,
                checkoutTime: checkoutTime
            };


            fetch("http://localhost:8080/api/checkout/confirmPayment", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(confirmPaymentData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json(); // 解析回應的 JSON
                })
                .then(data => {
                    // 顯示 SweetAlert 成功提示
                    if (data.code == 200) {

                        if (this.paymentMethod == "creditCard") {
                            const newWindow = window.open('', '_blank'); // 打開一個空的窗口
                            // 寫入 HTML 到新窗口
                            newWindow.document.write(data.message); // 將 API 返回的 HTML 內容寫入窗口
                            newWindow.document.close(); // 關閉文件流
                        }

                        Swal.fire({
                            title: "付款成功", // 假設 API 返回的訊息
                            icon: 'success',
                            confirmButtonText: '確定',
                        });
                        this.selectedTable = null; // 關閉側邊欄
                        this.orderItems = [];
                        this.ordersId = "";
                        this.total = 0;
                        this.subtotal = 0;


                    } else {
                        Swal.fire({
                            title: '結帳失敗',
                            text: data.message, // 顯示錯誤訊息
                            icon: 'error',
                            confirmButtonText: '確定',
                        });

                    }

                })
                .catch(error => {
                    console.error("結帳失敗：", error);
                    Swal.fire({
                        title: '結帳失敗',
                        text: '無法完成支付，請稍後重試',
                        icon: 'error',
                        confirmButtonText: '確定',
                    });
                });


        },

        // 關閉結帳側邊欄
        closePanel() {
            this.selectedTable = null; // 關閉側邊欄
            this.orderItems = [];
            this.ordersId = "";
            this.total = 0;
            this.subtotal = 0;
        },

        calculateChange() {
            this.change = this.receivedAmount - this.subtotal;
        },

        searchMember() {
            // 這裡可以根據會員電話進行會員折扣查詢的邏輯
            if (this.memberPhone === '0911223345') {
                this.memberDiscount = 95; // 假設會員為黃金會員，95折
            } else {
                this.memberDiscount = 100; // 默認無折扣
            }
        },

        onlyNumbers(event) {
            const charCode = event.keyCode || event.which;
            // 允許 0~9 的數字，其他字符阻止輸入
            if (charCode < 48 || charCode > 57) {
                event.preventDefault();
            }
        },
    },
};
</script>

<template>
<!-- 結帳側邊欄區域 -->
<div class="sidebarArea">
    <!-- 黑色背景層 -->
    <div class="sidebarBackground" @click="closePanel"></div>

    <!-- 側邊欄 -->
    <div class="sidebar">
        <div class="sideHeader">

            <!-- 返回鍵、結帳明細 -->
            <div class="titleArea">
                <i class="fa-solid fa-chevron-right" @click="closePanel"></i>
                <h2>結帳明細</h2>
            </div>

            <!-- 桌號、訂單編號、會員電話 -->
            <div class="dataArea">
                <!-- 桌號 -->
                <div class="tableNumber">{{ selectedTable.id }}</div>

                <!-- 訂單編號 -->
                <div class="orderNumber">
                    <p>訂單編號</p>
                    {{ ordersId }} {{ selectedTable.name }}
                </div>

                <!-- 會員電話輸入框 
                <div class="memberArea">
                    <div class="memberPhone">
                        <input type="search" class="phoneInput" placeholder="輸入會員電話" v-model="memberPhoneNumber"/>
                        <button class="searchButton" @click="searchMember"><i class="fa-solid fa-search"></i></button>
                    </div>
                    <div v-if="memberDiscount" class="memberDiscount">
                        <span>黃金會員 {{ memberDiscount }} 折</span>
                    </div>
                </div>-->
            </div>
        </div>

        <div class="sideBody">

        <!-- 明細、金額區域 -->
        <div class="detailSection">

            <!-- 餐點明細 -->
            <div class="orderDetails">
                <h3 class="orderTitle">餐點明細</h3>
                <div v-for="(item, index) in orderItems" :key="index" class="orderItem">
                    <div class="itemInfo">

                        <!-- 餐點名稱 -->
                        <div class="orderName">{{ item.name }}</div>

                        <!-- 餐點細項 -->
                        <ul v-if="item.notes && item.notes.length">
                            <li v-for="(note, idx) in item.notes" :key="idx">{{ note }}</li>
                        </ul>
                    </div>
                    <div class="itemPrice">$ {{ item.price }}</div>
                </div>
            </div>

            <!-- 總金額、折扣與小計 -->
            <div class="totalSummary">
                <div class="totalPrice">
                    <p>總金額</p>
                    $ {{ total }}
                </div>
                <!-- <div class="priceDiscount">
                    <p>折扣</p>
                    黃金會員 {{ memberDiscount || 100 }} 折
                </div> -->
                <div class="summary">
                    <p>小計</p>
                    $ {{ subtotal }}
                </div>
            </div>
        </div>

        <!-- 付款方式 -->
        <div class="paymentSection">
            <h3 class="paymentTitle">選擇付款方式</h3>
            <select class="paymentSelect" v-model="paymentMethod">
                <option value="creditCard">信用卡</option>
                <option value="cash">現金</option>
            </select>

            <!-- 信用卡表單 -->
            <div v-if="paymentMethod === 'creditCard'" class="creditCardForm">

                <!--<div>
                    <label>卡號</label>
                    <input type="text" v-model="creditCardInfo.cardNumber" />
                </div>
                <div>
                    <label>持卡人姓名</label>
                    <input type="text" v-model="creditCardInfo.cardHolder" />
                </div>
                <div>
                    <label>卡片到期日</label>
                    <input type="text" v-model="creditCardInfo.expiryDate" />
                </div>
                <div>
                    <label>確認碼</label>
                    <input type="text" v-model="creditCardInfo.cvv" />
                </div>
                -->
                <button class="confirmButton" @click="confirmPayment(this.ordersId)">確認付款</button>
            </div>

            <!-- 現金付款表單 -->
            <div v-if="paymentMethod === 'cash'" class="cashForm">
                <div>
                    <input type="number" placeholder="輸入收取金額" v-model="receivedAmount"
                        @input="calculateChange" 
                        @keypress="onlyNumbers"/>
                    </div>
                    <div class="cashSummary">
                        <div class="payment">
                            <p>付款</p>
                            $ {{ receivedAmount }}
                        </div>
                        <div class="summary">
                            <p>訂單金額</p>
                            $ {{ subtotal }}
                        </div>
                        <div class="change">
                            <p>找零</p>
                            $ {{ change }}
                        </div>
                    </div>

                    <button class="confirmButton" @click="confirmPayment(this.ordersId)">確認付款</button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped lang="scss">
.sidebarArea {
    width: 100vw;
    height: 100vh;
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    top: 0;
    left: 0;

    .sidebarBackground {
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        /* 半透明的黑色遮罩 */
        position: absolute;
        top: 0;
        left: 0;
        cursor: pointer;
    }

    .sidebar {
        width: 50%;
        height: 98%;
        border-radius: 10px;
        background-color: #fff;
        padding: 20px;
        position: relative;
        z-index: 100;
        /* 確保側邊欄在遮罩上面 */

        .sideHeader {
            display: flex;
            flex-direction: column;

            .titleArea {
                letter-spacing: 5px;
                display: flex;
                align-items: center;
                margin-bottom: 15px;

                i {
                    font-size: 20px;
                    color: #878D96;
                    margin-right: 10px;
                    cursor: pointer;
                }
            }

            .dataArea {
                display: flex;
                align-items: center;
                margin-bottom: 15px;

                .tableNumber {
                    border-radius: 10px;
                    background-color: #DDE1E6;
                    font-size: 22px;
                    font-weight: bolder;
                    padding: 20px 15px;
                }

                .orderNumber {
                    font-size: 17px;
                    color: #343A3F;
                    font-weight: bold;
                    padding: 15px;

                    p {
                        margin-bottom: 5px;
                    }
                }

                .memberArea {
                    display: flex;
                    flex-direction: column;
                    align-items: end;
                    position: absolute;
                    right: 2%;

                    .memberPhone {
                        display: flex;
                        align-items: center;
                        margin-bottom: 5px;

                        .phoneInput {
                            width: 350px;
                            height: 40px;
                            border: 1px solid #697077;
                            border-radius: 5px;
                            font-size: 18px;
                            color: #A2A9B0;
                            text-indent: 10px;
                            letter-spacing: 2px;
                            outline: none;
                        }

                        .searchButton {
                            margin: 10px;
                            background: none;
                            border: none;
                            font-size: 20px;
                            color: #697077;
                            cursor: pointer;
                        }
                    }

                    .memberDiscount {
                        font-size: 16px;
                        letter-spacing: 2px;
                        margin-right: 15px;
                    }
                }
            }
        }

        .sideBody {
            height: 84%;
            display: flex;
            justify-content: space-between;

            .detailSection {
                width: 50%;
                border-radius: 10px;
                background-color: #F2F4F8;
                padding: 20px;

                .orderDetails {
                    width: 100%;
                    height: 600px;
                    max-height: 600px;
                    overflow-y: auto;
                    margin-bottom: 10px;

                    .orderTitle {
                        font-size: 20px;
                        letter-spacing: 5px;
                        margin-bottom: 20px;
                    }

                    .orderItem {
                        width: 100%;
                        border: 2px solid #d9d9d9;
                        border-radius: 10px;
                        display: flex;
                        justify-content: space-between;
                        padding: 10px 20px;
                        margin-bottom: 10px;

                        .itemInfo {
                            flex: 1;
                            display: flex;
                            flex-direction: column;

                            .orderName {
                                font-size: 17px;
                                color: #1e1e1e;
                                font-weight: bold;
                                letter-spacing: 3px;
                                margin-bottom: 10px;
                            }

                            ul {
                                font-size: 15px;
                                letter-spacing: 1px;
                                color: #21272A;
                                margin-left: 20px;

                                li {
                                    margin-bottom: 5px;
                                }
                            }
                        }

                        .itemPrice {
                            font-size: 17px;
                            letter-spacing: 2px;
                            color: #1e1e1e;
                        }
                    }
                }

                .totalSummary {
                    padding: 20px;

                    .totalPrice {
                        font-size: 15px;
                        font-weight: bold;
                        letter-spacing: 3px;
                        color: #697077;
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    }

                    .priceDiscount {
                        font-size: 15px;
                        font-weight: bold;
                        letter-spacing: 3px;
                        color: #697077;
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 15px;
                    }

                    .summary {
                        font-size: 17px;
                        font-weight: bold;
                        letter-spacing: 3px;
                        color: #1e1e1e;
                        display: flex;
                        justify-content: space-between;
                    }
                }
            }

            .paymentSection {
                width: 50%;
                padding: 20px;

                .paymentTitle {
                    font-size: 20px;
                    letter-spacing: 5px;
                    margin-bottom: 20px;
                }

                .paymentSelect {
                    width: 100%;
                    border: 1px solid #A2A9B0;
                    border-radius: 10px;
                    font-size: 16px;
                    letter-spacing: 2px;
                    appearance: none;
                    /* 隱藏默認的箭頭 */
                    background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjcxNzUgNi41NDc1QzEzLjE3OTcgNi4xNDcyIDEzLjI4MjIgNS40MTMgMTIuOTg3MiA0LjkzMjVDMTIuNjkzMiA0LjQ1MjUgMTIuMDEwNCA0LjQ1MjUgMTEuNzE3IDQuOTMyNUw4IDkuMzM1NEw0LjI4MjUgNC45MzI1QzMuOTg5NiA0LjQ1MjUgMy4zMDY4IDQuNDUyNSAyLjAxMjggNC45MzI1QzEuNzE4OCA1LjQxMyAxLjgyMTEgNi4xNDcyIDIuMjg0MTIgNi41NDc1TDcuMzE1MTIgMTEuNTA2QzcuNzU4NDEgMTEuOTYxIDguMjQxNiAxMS45NjEgOC42ODY4IDExLjUwNkMxMC4xNzA4IDEwLjI1NyAxMS41OTExIDguOTAzNTggMTIuNzE3NSA3LjY2MjVIMTIuNzE3NVoiIGZpbGw9IiMyMjIyMjIiLz4KPC9zdmc+') no-repeat;
                    /* 使用 base64 格式的箭頭圖標 */
                    background-position: calc(100% - 20px) center;
                    /* 調整箭頭的位置，讓它距離左邊更近 */
                    background-size: 15px;
                    /* 調整箭頭大小 */
                    outline: none;
                    cursor: pointer;
                    padding: 10px;
                    margin-bottom: 30px;
                }

                .creditCardForm {
                    width: 100%;
                    height: 85%;
                    position: relative;

                    label {
                        font-size: 16px;
                        letter-spacing: 2px;
                    }

                    input {
                        width: 100%;
                        height: 40%;
                        border: 1px solid #DDE1E6;
                        border-radius: 10px;
                        font-size: 16px;
                        color: #697077;
                        letter-spacing: 2px;
                        outline: none;
                        padding: 10px;
                        margin: 10px 0px;
                    }

                    .confirmButton {
                        width: 100%;
                        border: none;
                        border-radius: 10px;
                        background-color: #343A3F;
                        font-size: 16px;
                        letter-spacing: 3px;
                        color: #ffffff;
                        padding: 15px;
                        position: absolute;
                        bottom: 4%;
                        cursor: pointer;
                    }
                }

                .cashForm {
                    width: 100%;
                    height: 85%;
                    position: relative;

                    input {
                        width: 100%;
                        height: 40%;
                        border: 1px solid #DDE1E6;
                        border-radius: 10px;
                        background-color: #F2F4F8;
                        font-size: 16px;
                        color: #697077;
                        letter-spacing: 2px;
                        outline: none;
                        padding: 10px;
                        margin: 10px 0px;
                    }

                    .cashSummary {
                        padding: 20px;

                        .payment {
                            font-size: 16px;
                            font-weight: bold;
                            letter-spacing: 3px;
                            color: #697077;
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 15px;
                        }

                        .summary {
                            font-size: 16px;
                            font-weight: bold;
                            letter-spacing: 3px;
                            color: #697077;
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 15px;
                        }

                        .change {
                            font-size: 18px;
                            font-weight: bold;
                            letter-spacing: 3px;
                            color: #1e1e1e;
                            display: flex;
                            justify-content: space-between;
                        }
                    }

                    .confirmButton {
                        width: 100%;
                        border: none;
                        border-radius: 10px;
                        background-color: #343A3F;
                        font-size: 16px;
                        letter-spacing: 3px;
                        color: #ffffff;
                        padding: 15px;
                        position: absolute;
                        bottom: 4%;
                        cursor: pointer;
                    }
                }
            }
        }
    }
}

</style>