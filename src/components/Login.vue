<script>
import Swal from "sweetalert2";
import { useRouter } from "vue-router"; // 導入 useRouter

export default {
    data() {
        return {
            account: "",
            password: "",
            passwordVisible: false, // 是否顯示密碼
        };
    },
    methods: {
        handleSubmit() {
            // 檢查帳號是否為會員（以 09 開頭的手機號碼）
            const isMember = this.account.startsWith("09") && this.account.length === 10;
            const isStaff = this.account.startsWith("TEST");

            //會員
            if (isMember) {
                // 準備要傳送的資料
                const loginData = {
                    phone: this.account,
                    pwd: this.password,
                };

                // 將物件轉換為 JSON 字符串
                const jsonData = JSON.stringify(loginData);

                // Fetch API 傳送 jsonData 到後端
                // console.log('要傳送的資料:', jsonData);
                fetch("http://localhost:8080/api/member/checklogin", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: jsonData,
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.code == "200") {
                            Swal.fire({
                                title: data.message,
                                icon: "success",
                                confirmButtonText: "確定",
                            }).then(() => {
                                sessionStorage.setItem("memberId", data.memberId);
                                this.$router.push("/event");
                            });
                        } else {
                            Swal.fire({
                                title: data.message,
                                icon: "error",
                                confirmButtonText: "確定",
                            });
                        }
                        // console.log('成功:', data);
                    })
                    .catch((error) => {
                        console.error("錯誤:", error);
                        Swal.fire({
                            title: "網絡錯誤，請重試！",
                            icon: "error",
                            confirmButtonText: "確定",
                        });
                    });
            } else if (isStaff) {
                // 準備要傳送的資料
                const userData = {
                    staffNumber: this.account,
                    pwd: this.password,
                };

                // 將物件轉換為 JSON 字符串
                const jsonData = JSON.stringify(userData);

                // Fetch API 傳送 jsonData 到後端
                console.log("要傳送的資料:", jsonData);
                fetch("http://localhost:8080/api/staff/checklogin", {
                    // 假設員工登入的 API 路徑
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: jsonData,
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.code == "200") {
                            Swal.fire({
                                title: data.message,
                                icon: "success",
                                confirmButtonText: "確定",
                            });
                            sessionStorage.setItem("staffNumber", data.staffNumber);
                            this.$router.push("/event");
                        } else {
                            Swal.fire({
                                title: data.message,
                                icon: "error",
                                confirmButtonText: "確定",
                            });
                        }
                        console.log("成功:", data);
                    })
                    .catch((error) => {
                        console.error("錯誤:", error);
                        Swal.fire({
                            title: "網絡錯誤，請重試！",
                            icon: "error",
                            confirmButtonText: "確定",
                        });
                    });
            } else {
                //都不是就是錯
                Swal.fire({
                    title: "帳號格式錯誤",
                    icon: "error",
                    confirmButtonText: "確定",
                });
            }
        },
        togglePasswordVisibility() {
            //新增方法來切換密碼顯示
            this.passwordVisible = !this.passwordVisible;
        },
    },
};
</script>

<template>
    <div class="login-container">
        <div class="circle-1"></div>
        <div class="circle-2"></div>

        <div class="login-box">
            <img src="/images/Logo.jpg" alt="logo" class="logo" />
            <h2>登入</h2>
            <form @submit.prevent="handleSubmit">
                <div class="input-group">
                    <label for="account">帳號</label>
                    <input v-model="account" type="text" id="account" placeholder="請輸入帳號" required autocomplete="off" />
                </div>
                <div class="input-group">
                    <label for="password">密碼</label>
                    <div class="password-container">
                        <input v-model="password" :type="passwordVisible ? 'text' : 'password'" id="password" placeholder="請輸入密碼" required autocomplete="off" />
                        <span class="eye-icon" @click="togglePasswordVisibility">
                            <!-- 修改的地方 -->
                            <i :class="passwordVisible ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                            <!-- 修改的地方 -->
                        </span>
                    </div>
                </div>
                <div class="forgot-password">
                    <router-link to="/forgotPassword">忘記密碼？</router-link>
                </div>
                <button type="submit" class="login-btn">登入</button>
            </form>
            <!-- <div class="extra-links">
                <router-link class="register-link" to="/register">註冊(沒有會員功能了 但要進去可以先註冊之後去弄一個員工帳號 最終版會移除這個)</router-link>
            </div> -->
        </div>
    </div>
</template>

<style scoped lang="scss">
$bg-color: #f0f2f5;
$black-color: #1e1e1e;
$white-color: #ffffff;
$gray-color: #f2f4f8;
$hover-color: #555;
$yellow-color: #ffc90e;
$font-size-base: 16px;
$radius: 5px;

.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: $gray-color;
    // background-image: url('background-circles.png');
    background-size: cover;
    position: relative;
    overflow: hidden;

    // 圓形背景
    &::before,
    &::after {
        content: "";
        position: absolute;
        background-color: #555;
        border-radius: 50%;
    }

    &::before {
        width: 200px;
        height: 200px;
        top: -10%;
        left: 15%;
    }

    &::after {
        width: 250px;
        height: 250px;
        bottom: 8%;
        right: 29%;
    }

    .circle-1 {
        width: 300px;
        height: 300px;
        position: absolute;
        top: -10%;
        right: -5%;
        // border: 5px dashed black;
        background-color: $black-color;
        border-radius: 50%;
    }

    .circle-2 {
        width: 600px;
        height: 600px;
        position: absolute;
        bottom: -30%;
        left: -8%;
        border: 5px dashed black;
        // background-color: rgba(black, 0.9);
        border-radius: 50%;
    }

    .login-box {
        background-color: $white-color;
        padding: 2.5rem;
        border-radius: 10px;
        // border: 1px solid rgba(grey, 0.5);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        // border: 1px solid;
        // box-shadow: -3px 3px 4px black;
        text-align: center;
        width: 28rem;
        z-index: 1;

        .logo {
            width: 10.25rem;
            margin-bottom: 1.25rem;
        }

        h2 {
            margin-bottom: 1.25rem;
            font-size: 1.5rem;
            letter-spacing: 20px;
            color: $black-color;
            position: relative;
            z-index: 5;

        }

        .input-group {
            margin-bottom: 1.25rem;
            text-align: left;

            label {
                display: block;
                margin-bottom: 0.3125rem;
                color: $black-color;
                font-size: $font-size-base;
                letter-spacing: 2px;
            }

            input {
                width: 100%;
                background-color: $gray-color;
                border: none;
                border-radius: $radius;
                padding: 0.625rem;
                font-size: $font-size-base;
                text-indent: 5px;
                letter-spacing: 2px;
            }

            .password-container {
                position: relative; // 為眼睛圖示的定位做準備

                input {
                    width: 100%;
                    padding: 0.625rem;
                    font-size: $font-size-base;
                    border: none;
                    border-radius: $radius;
                }

                .eye-icon {
                    position: absolute;
                    right: 1rem; // 根據需要調整位置
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    color: $black-color; // 圖示顏色
                }
            }
        }

        .forgot-password {
            text-align: right;
            margin-bottom: 1.25rem;
            border-bottom: 2px solid #dde1e6;
            padding-bottom: 10px;

            a {
                color: $black-color;
                text-decoration: none;
                letter-spacing: 2px;
            }
        }

        .login-btn {
            width: 100%;
            padding: 0.625rem;
            font-size: $font-size-base;
            background-color: $black-color;
            letter-spacing: 2px;
            color: $white-color;
            border: none;
            border-radius: $radius;
            cursor: pointer;

            &:hover {
                background-color: $hover-color;
            }
        }

        .register-link {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.625rem;
            font-size: $font-size-base;
            background-color: $hover-color;
            color: $white-color;
            border-radius: $radius;
            text-decoration: none;

            &:hover {
                background-color: darken($hover-color, 10%);
            }
        }
    }
}
</style>
