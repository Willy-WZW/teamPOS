<script>
import Swal from 'sweetalert2'; // 引入 SweetAlert2

export default {
    data() {
        return {
            user: {
                name: '',
                phone: '',
                email: '',
                totalSpent: '',
                memberLevel: '',
                purchaseHistory: [
                    { date: '2024-09-01', amount: 1500, details: '餐廳消費' },
                    { date: '2024-09-15', amount: 2500, details: '電子產品' },
                    { date: '2024-09-25', amount: 1000, details: '服飾' },
                ],
            },
            newPassword: '',
            confirmPassword: '',
            showModal: false,
            selectedPurchase: null,
        };
    },
    methods: {
        openModal(purchase) {
            this.selectedPurchase = purchase;
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        },
        changePassword() {
            if (this.newPassword == this.confirmPassword) {
                const memberId = sessionStorage.getItem('memberId');
                const reqData = {
                    phone: this.user.phone,
                    pwd: this.newPassword,
                };

                fetch('http://localhost:8080/api/member/resetpassword', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(reqData),
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        Swal.fire({
                            title: data.message,
                            icon: 'success',
                            confirmButtonText: '確定',
                        });
                        this.newPassword = '';
                        this.confirmPassword = '';
                    })
                    .catch(error => {
                        console.error('修改密碼失敗:', error);
                        Swal.fire({
                            title: '修改密碼失敗',
                            text: '請稍後再試。',
                            icon: 'error',
                            confirmButtonText: '確定',
                        });
                    });
            } else {
                Swal.fire({
                    title: '錯誤',
                    text: '新密碼與確認新密碼不一致',
                    icon: 'warning',
                    confirmButtonText: '確定',
                });
            }
        },
        getUserData() {
            const memberId = sessionStorage.getItem('memberId');

            if (memberId) {
                fetch(`http://localhost:8080/api/member/${memberId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log(data);
                        this.user.name = data.member.name;
                        this.user.phone = data.member.phone;
                        this.user.email = data.member.email;
                        this.user.totalSpent = data.member.totalSpendingAmount;
                        this.user.memberLevel = data.member.memberLevel;
                    })
                    .catch(error => {
                        console.error("取得使用者資料失敗:", error);
                    });
            } else {
                console.error("無法取得使用者資料");
            }
        },
    },
    mounted() {
        const memberId = sessionStorage.getItem('memberId');

        if (memberId) {
            this.getUserData();
        }
    }
};
</script>


<template>
    <div class="user-info-container">
        <div class="user-info">
            <h2>用戶資訊</h2>
            <div class="info-grid">
                <div class="info-section">
                    <h3>個人資料</h3>
                    <div class="info-field">
                        <label>姓名:</label>
                        <span>{{ user.name }}</span>
                    </div>
                    <div class="info-field">
                        <label>手機:</label>
                        <span>{{ user.phone }}</span>
                    </div>
                    <div class="info-field">
                        <label>生日:</label>
                        <span>1990-01-01</span>
                    </div>
                    <div class="info-field">
                        <label>電子郵件:</label>
                        <span>{{ user.email }}</span>
                    </div>
                    <div class="info-field">
                        <label>總消費金額:</label>
                        <span>{{ user.totalSpent }}</span>
                    </div>
                    <div class="info-field">
                        <label>會員等級:</label>
                        <span>{{ user.memberLevel }}</span>
                    </div>
                </div>

                <div class="purchase-section">
                    <h3>消費紀錄</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>日期</th>
                                <th>金額</th>
                                <th>詳情</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="purchase in user.purchaseHistory" :key="purchase.date">
                                <td>{{ purchase.date }}</td>
                                <td>{{ purchase.amount }}</td>
                                <td>
                                    <button @click="openModal(purchase)" class="details-btn">查看詳情</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="password-section">
                <h3>修改密碼</h3>
                <div class="password-field">
                    <input v-model="newPassword" placeholder="輸入新密碼" type="password" />
                    <input v-model="confirmPassword" placeholder="確認新密碼" type="password" />
                    <button @click="changePassword" class="change-password-btn">修改密碼</button>
                </div>
            </div>
        </div>

        <!-- 浮現視窗 -->
        <div v-if="showModal" class="modal" @click.self="closeModal">
            <div class="modal-content">
                <span class="close" @click="closeModal">&times;</span>
                <h3>消費明細</h3>
                <p>日期: {{ selectedPurchase?.date }}</p>
                <p>金額: {{ selectedPurchase?.amount }}</p>
                <p>詳細內容: {{ selectedPurchase?.details }}</p>
            </div>
        </div>
    </div>
</template>



<style scoped>
.user-info-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80vw;
    height: 80vh;
    overflow: hidden;
}

.user-info {
    max-width: 80dvw;
    max-height: 90dvh;
    width: 98%;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 15px;
    overflow-y: auto;
    /* 允許垂直滾動 */
    display: flex;
    flex-direction: column;
}

h2 {
    font-size: 26px;
    /* 增加標題字體大小 */
    color: #2c3e50;
    margin-bottom: 15px;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 8px;
}

h3 {
    font-size: 22px;
    /* 增加副標題字體大小 */
    color: #34495e;
    margin-bottom: 10px;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 15px;
}

.info-section,
.purchase-section {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 12px;
}

.info-field {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    padding: 6px;
    border-radius: 4px;
    font-size: 16px;
    /* 增加內容字體大小 */
}

.info-field label {
    font-weight: bold;
    color: #555;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
    /* 增加表格字體大小 */
}

th,
td {
    text-align: left;
    padding: 10px;
    /* 增加表格內邊距 */
    border-bottom: 1px solid #e0e0e0;
}

th {
    background-color: #ecf0f1;
    color: #2c3e50;
}

.details-btn {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 6px 12px;
    /* 增加按鈕內邊距 */
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 14px;
    /* 增加按鈕字體大小 */
}

.details-btn:hover {
    background-color: #2980b9;
}

.password-section {
    margin-top: 15px;
}

.password-field {
    display: flex;
    gap: 10px;
}

input {
    flex: 1;
    padding: 10px;
    /* 增加輸入框內邊距 */
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    /* 增加輸入框字體大小 */
}

.change-password-btn {
    padding: 10px 16px;
    /* 增加按鈕內邊距 */
    background-color: #343a3f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    /* 增加按鈕字體大小 */
    transition: background-color 0.3s;
}

.change-password-btn:hover {
    background-color: #27ae60;
}

.modal {
    display: flex;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: #fefefe;
    padding: 15px;
    border-radius: 8px;
    width: 90%;
    max-width: 380px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.close {
    color: #aaa;
    float: right;
    font-size: 22px;
    font-weight: bold;
    cursor: pointer;
    transition: color 0.3s;
}

.close:hover {
    color: #333;
}

@media (max-width: 1024px) {
    .info-grid {
        grid-template-columns: 1fr;
    }

    .password-field {
        flex-direction: column;
    }

    input,
    .change-password-btn {
        width: 100%;
    }
}

@media (max-width: 600px) {
    .user-info {
        padding: 10px;
    }

    h2 {
        font-size: 24px;
        /* 增加手機版標題字體大小 */
    }

    h3 {
        font-size: 20px;
        /* 增加手機版副標題字體大小 */
    }

    .info-field,
    table,
    input,
    .change-password-btn {
        font-size: 14px;
        /* 增加手機版內容字體大小 */
    }
}
</style>
