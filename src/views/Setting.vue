<script>
import LeftBar from '@/components/LeftBar.vue'
import Header from '@/components/Header.vue'
import Swal from 'sweetalert2';
import { options } from '@fullcalendar/core/preact';
export default {
    data() {
        return {
            startX: 0,
            translateX: 0,
            selectedType: 'checkbox',
            categories: [
                { text: "", translateX: 0 },
            ],
            cgInput: [],
            menuList: [],
            custList: [],
        };
    },
    components: {
        LeftBar,
        Header
    },
    methods: {
        startTouch(event, index) {
            this.categories[index].startX = event.touches[0].clientX;
        },
        moveTouch(event, index) {
            const currentX = event.touches[0].clientX;
            this.categories[index].translateX = currentX - this.categories[index].startX; // 根據滑動距離更新 translateX
            if (this.categories[index].translateX < -55) {
                this.categories[index].translateX = -55
            }
            if (this.categories[index].translateX > 0) {
                this.categories[index].translateX = 0; // 避免滑動超過初始位置
            }
        },
        endTouch(index) {
            if (this.categories[index].translateX > -50) {
                this.categories[index].translateX = 0;
            }
        },
        confirmDelete() {
            Swal.fire({
                title: '確定要刪除這條訊息嗎？',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '確定',
                cancelButtonText: '取消',
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire('已刪除!', '該訊息已被刪除。', 'success');
                    // 在這裡處理刪除訊息的邏輯
                }
            });
        },
        addCgInput() {
            this.cgInput.push(
                { category: "" },
            )
        },
        switchSta(menu) {
            menu.supply = !menu.supply
        },
        addMenu() {
            this.menuList.push({
                name: "", // 餐點名稱
                price: "", // 餐點金額
                workstation: "0", // 工作檯
                supply: true, // 供應狀態
            });
        },
        removeMenu(index) {
            this.menuList.splice(index, 1);
        },
        addCust() {
            this.custList.push({
                title: "",
                selectedType: 'checkbox',
                options: "",
                price: "",
                options: [
                    { text: "", price: "" }
                ],
            })
        },
        removeCust(index) {
            this.custList.splice(index, 1)
        },
        addOption(custIndex) {
            this.custList[custIndex].options.push({
                text: "", // 選項內容
                price: "" // 選項金額
            });
        },
    }
}

</script>

<template>
    <div class="big">
        <div class="leftBar">
            <LeftBar />
        </div>
        <div class="mainArea">
            <div class="header">
                <Header />
            </div>
            <div class="menuCategory">
                <h1>菜單分類</h1>
                <div class="optionArea">
                    <div class="cOption" v-for="(category, cIndex) in categories" :key="cIndex"
                        :style="{ transform: `translate(${28 + category.translateX}px)` }"
                        @touchstart="startTouch($event, cIndex)" @touchmove="moveTouch($event, cIndex)"
                        @touchend="endTouch(cIndex)">
                        <div class="opContent">
                            <span>餐點名稱{{ category.name }}</span>
                            <div class="countOp">55{{ category.count }}</div>
                        </div>
                        <div @click="confirmDelete" class="deleteOp">
                            <span>刪除</span>
                        </div>
                    </div>
                    <div class="inputOp" v-for="(item, cgIndex) in cgInput" :key="cgIndex">
                        <input type="text" v-model="item.category" placeholder="輸入菜單分類">
                    </div>
                    <i class="fa-solid fa-circle-plus" @click="addCgInput()"></i>
                </div>
                <div class="saveCategory">儲存</div>
                <div class="editCategory">編輯</div>
            </div>
            <div class="menuAndCust">
                <div class="menuArea">
                    <div class="menuTop">
                        <div class="mtLeft">
                            <span>餐點</span>
                        </div>
                        <div class="mtRight">
                            <div class="selCate">
                                <span>菜單分類</span>
                                <div class="countOp">55</div>
                            </div>
                            <div class="saveBtn">儲存</div>
                        </div>
                    </div>
                    <div class="menuMain">
                        <div class="addMenuDiv" @click="addMenu()">+&nbsp&nbsp新增餐點</div>
                        <div class="menuItem" v-for="(menu, index) in menuList" :key="index">
                            <div class="itemPic">
                                <i class="fa-solid fa-upload"></i>
                            </div>
                            <div class="itemName">
                                <input type="text" v-model="menu.name" placeholder="輸入餐點名稱">
                            </div>
                            <div class="itemPrice">
                                <input type="text" v-model="menu.price" placeholder="餐點金額">
                            </div>
                            <div class="itemWorksta">
                                <span>工作檯</span>
                                <select v-model="menu.workstation">
                                    <option value="0">工作檯選擇</option>
                                </select>
                            </div>
                            <div class="itembot">
                                <div class="itemStatus" :class="{ flip: !menu.supply }" @click="switchSta(menu)">
                                    <span>{{ menu.supply ? "供應中" : "售完" }}</span>
                                </div>
                                <div class="itemIcon">
                                    <i class="fa-solid fa-square-pen"></i>
                                    <i class="fa-solid fa-trash-can" @click="removeMenu(index)"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="customerization">
                    <div class="cuTop">
                        <div class="cuLeft">
                            <span>客製化選項</span>
                        </div>
                        <div class="cuRight">
                            <div class="selCate">
                                <span>菜單分類</span>
                                <div class="countOp">55</div>
                            </div>
                            <div class="saveBtn">儲存</div>
                        </div>
                    </div>
                    <div class="custItem">
                        <div class="addItem" @click="addCust()">+&nbsp&nbsp新增客製化選項</div>
                        <div class="custInput" v-for="(cust, index) in custList" :key="index">
                            <div class="cuTitle">
                                <input type="text" v-model="cust.Title" placeholder="客製化標題">
                                <select v-model="selectedType">
                                    <option value="checkbox">多選</option>
                                    <option value="radio">單選</option>
                                </select>
                            </div>
                            <div class="titleOption">
                                <div class="oneOption" v-for="(option, opIndex) in cust.options" :key="opIndex">
                                    <div class="optionL">
                                        <input type="checkbox" v-if="selectedType == 'checkbox'" disabled>
                                        <input type="radio" v-if="selectedType == 'radio'" disabled>
                                        <input type="text" v-model="option.options" class="inText"
                                            :placeholder="'選項' + (opIndex + 1)">
                                    </div>
                                    <div class="optionPrice">
                                        <span>$</span>
                                        <input type="text" v-model="option.price" class="inPrice" placeholder="金額">
                                    </div>
                                </div>
                            </div>
                            <div class="cuInputCtrl">
                                <i class="fa-solid fa-trash-can" @click="removeCust(index)"></i>
                                <i class="fa-solid fa-circle-plus" @click="addOption(index)"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
$divColor: #fff;
$addDiv: #343a3f;
$suppliable: #1ce34e;
$soldOut: #e02d11;
$borderBot: #697077;

.big {
    width: 100%;
    height: 100dvh;
    display: flex;
    justify-content: center;
    align-items: center;

    .leftBar {
        width: 10%;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
    }

    .mainArea {
        width: 100%;
        height: 100%;
        overflow-y: scroll;
        display: flex;
        justify-content: start;
        align-items: start;
        flex-direction: column;
        position: relative;

        .header {
            width: 96%;
            height: 6.3%;
            position: absolute;
            top: 2%;
            left: 2%;
        }

        .menuCategory {
            width: 21%;
            height: 87%;
            border-radius: 10px;
            display: flex;
            justify-content: start;
            align-items: center;
            flex-direction: column;
            position: absolute;
            top: 9.5%;
            left: 2%;
            background-color: white;

            h1 {
                margin: 1% auto;
                letter-spacing: 3px;
                font-family: "Noto Sans TC", sans-serif;
            }

            .optionArea {
                width: 87%;
                height: 84%;
                margin-bottom: 3%;
                display: flex;
                justify-content: start;
                align-items: center;
                flex-direction: column;
                overflow-x: hidden;

                .cOption {
                    width: 125%;
                    height: 6%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-direction: column;
                    top: 0;
                    left: 0;
                    border-radius: 5px;
                    margin-bottom: 5%;
                    overflow-y: scroll;
                    transition: transform 0.7s;
                    background-color: #f2f4f8;

                    .opContent {
                        width: 80%;
                        height: 100%;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        position: absolute;
                        left: 0;
                        overflow: hidden;

                        span {
                            font-weight: bold;
                            font-family: "Noto Sans TC", sans-serif;
                            margin-left: 2.5%;
                        }

                        .countOp {
                            min-width: 15%;
                            height: 50%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            margin-right: 2.5%;
                            border-radius: 30px;
                            color: white;
                            background-color: gray;
                        }
                    }

                    .deleteOp {
                        width: 20%;
                        height: 100%;
                        letter-spacing: 2px;
                        position: absolute;
                        right: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        color: white;
                        font-weight: bold;
                        font-family: "Noto Sans TC", sans-serif;
                        background-color: red;
                    }
                }

                .inputOp {
                    width: 100%;
                    height: 6%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: 5px;
                    margin-bottom: 5%;
                    background-color: #f2f4f8;

                    input {
                        width: 95%;
                        border: none;
                        background-color: transparent;
                        margin-left: 2.5%;
                        font-size: 18px;
                        font-weight: bold;
                        font-family: "Noto Sans TC", sans-serif;
                    }
                }

                .fa-circle-plus {
                    font-size: 30px;
                    cursor: pointer;
                }
            }

            .saveCategory {
                width: 90%;
                height: 37px;
                border-radius: 10px;
                margin-bottom: 3%;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                color: white;
                background-color: #343a3f;
                font-family: "Noto Sans TC", sans-serif;
            }

            .editCategory {
                width: 90%;
                height: 37px;
                border-radius: 10px;
                margin-bottom: 3%;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                color: black;
                background-color: #dde1e6;
                font-family: "Noto Sans TC", sans-serif;
            }
        }

        .menuAndCust {
            width: 73.5%;
            height: 87%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            position: absolute;
            top: 9.5%;
            right: 2%;

            .menuArea {
                width: 100%;
                height: 71%;
                border-radius: 10px;
                display: flex;
                justify-content: start;
                align-items: center;
                flex-direction: column;
                background-color: $divColor;

                .menuTop {
                    width: 97%;
                    height: 7%;
                    margin: 2% 0 1% 0;
                    border-bottom: 1px solid #343a3f;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .mtLeft {
                        width: 20%;
                        font-size: 30px;
                        font-weight: bold;
                        letter-spacing: 3px;
                        margin-left: 1%;
                        font-family: "Noto Sans TC", sans-serif;
                    }

                    .mtRight {
                        width: 26%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        letter-spacing: 3px;

                        .selCate {
                            width: 66%;
                            display: flex;
                            justify-content: space-evenly;
                            align-items: center;
                            font-weight: bold;
                            font-family: "Noto Sans TC", sans-serif;

                            .countOp {
                                min-width: 20%;
                                letter-spacing: 0px;
                                font-weight: 500;
                                color: white;
                                background-color: gray;
                                border-radius: 30px;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                            }
                        }

                        .saveBtn {
                            width: 32.4%;
                            height: 91%;
                            border-radius: 5px;
                            color: white;
                            background-color: black;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            font-family: "Noto Sans TC", sans-serif;
                        }
                    }
                }

                .menuMain {
                    width: 97%;
                    height: 85%;
                    display: flex;
                    overflow-y: scroll;
                    flex-wrap: wrap;

                    .addMenuDiv {
                        width: 22%;
                        height: 52%;
                        margin: 0 4% 1% 0;
                        border-radius: 10px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        color: white;
                        background-color: $addDiv;
                        font-size: 25px;
                        font-family: "Noto Sans TC", sans-serif;
                    }

                    .addMenuDiv:nth-child(4n) {
                        margin: 0 0 1% 0;
                    }

                    .menuItem {
                        display: grid;
                        grid-template-columns: repeat(6, 1fr);
                        grid-template-rows: repeat(8, 1fr);
                        grid-column-gap: 8px;
                        grid-row-gap: 6px;
                        width: 22%;
                        height: 52%;
                        margin: 0 4% 1% 0;
                        border-radius: 10px;
                        border: 1px solid black;

                        .itemPic {
                            grid-area: 1 / 1 / 5 / 7;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            border: dotted;
                            margin: 4% 4% 0 4%;

                            .fa-upload {
                                font-size: 30px;
                            }
                        }

                        .itemName {
                            grid-area: 5 / 1 / 6 / 7;
                            display: flex;
                            align-items: center;
                            font-weight: bold;
                            letter-spacing: 3px;
                            font-family: "Noto Sans TC", sans-serif;
                            margin: 0 4%;

                            input {
                                max-width: 100%;
                                font-size: 20px;
                                font-family: "Noto Sans TC", sans-serif;
                            }
                        }

                        .itemPrice {
                            grid-area: 6 / 1 / 7 / 7;
                            display: flex;
                            align-items: center;
                            font-weight: bold;
                            font-family: "Noto Sans TC", sans-serif;
                            margin: 0 4%;

                            input {
                                max-width: 60%;
                                font-size: 15px;
                                font-family: "Noto Sans TC", sans-serif;
                            }
                        }

                        .itemWorksta {
                            grid-area: 7 / 1 / 8 / 7;
                            display: flex;
                            align-items: center;
                            border-bottom: 1px solid $borderBot;
                            color: #697077;
                            font-family: "Noto Sans TC", sans-serif;
                            margin: 0 4%;

                            span {
                                margin-right: 12%;
                            }

                            select {
                                width: 60%;
                                font-family: "Noto Sans TC", sans-serif;
                            }
                        }

                        .itembot {
                            grid-area: 8 / 1 / 9 / 7;
                            margin: 0 4%;
                            display: flex;

                            .itemStatus {
                                width: 50%;
                                margin-right: 5%;
                                margin-bottom: 2%;
                                border-radius: 5px;
                                letter-spacing: 3px;
                                cursor: pointer;
                                font-size: 17px;
                                font-weight: bold;
                                color: white;
                                background-color: $suppliable;
                                border: 1px solid $suppliable;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                transition: transform 0.7s, background-color 0.5s;
                            }

                            .flip {
                                transform: rotateX(360deg);
                                background-color: $soldOut;
                                border-color: $soldOut;
                                color: white;
                            }


                            .itemIcon {
                                width: 35%;
                                margin-left: 8%;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;

                                .fa-solid {
                                    font-size: 25px;
                                }
                            }
                        }

                    }

                    .menuItem:nth-child(4n) {
                        margin: 0 0 1% 0;
                    }

                }
            }

            .customerization {
                width: 100%;
                height: 27%;
                margin-top: 2.5%;
                border-radius: 10px;
                display: flex;
                justify-content: start;
                align-items: center;
                flex-direction: column;
                background-color: $divColor;

                .cuTop {
                    width: 97%;
                    height: 18%;
                    margin: 2% 0 1% 0;
                    border-bottom: 1px solid #343a3f;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .cuLeft {
                        width: 20%;
                        font-size: 30px;
                        font-weight: bold;
                        letter-spacing: 3px;
                        margin-left: 1%;
                        font-family: "Noto Sans TC", sans-serif;
                    }

                    .cuRight {
                        width: 26%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        letter-spacing: 3px;

                        .selCate {
                            width: 66%;
                            display: flex;
                            justify-content: space-evenly;
                            align-items: center;
                            font-weight: bold;
                            font-family: "Noto Sans TC", sans-serif;

                            .countOp {
                                min-width: 20%;
                                letter-spacing: 0px;
                                font-weight: 500;
                                color: white;
                                background-color: gray;
                                border-radius: 30px;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                            }
                        }

                        .saveBtn {
                            width: 32.4%;
                            height: 91%;
                            border-radius: 5px;
                            color: white;
                            background-color: black;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            font-family: "Noto Sans TC", sans-serif;
                        }
                    }
                }

                .custItem {
                    width: 97%;
                    height: 65%;
                    display: flex;
                    justify-content: start;
                    align-items: center;
                    overflow-x: scroll;
                    white-space: nowrap;

                    .addItem {
                        min-width: 25%;
                        height: 100%;
                        margin-right: 3%;
                        border-radius: 10px;
                        font-size: 25px;
                        font-family: "Noto Sans TC", sans-serif;
                        color: white;
                        background-color: $addDiv;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    .custInput {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        grid-template-rows: repeat(4, 1fr);
                        grid-column-gap: 4px;
                        grid-row-gap: 4px;
                        min-width: 25%;
                        max-width: 25%;
                        height: 100%;
                        margin-right: 3%;
                        border-radius: 10px;
                        border: 1px solid $borderBot;
                    }

                    .cuTitle {
                        grid-area: 1 / 1 / 2 / 5;
                        width: 98%;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin: 0 1%;

                        input {
                            width: 69%;
                            font-size: 15px;
                            margin-left: 2%;
                        }
                    }

                    .titleOption {
                        grid-area: 2 / 1 / 4 / 5;
                        width: 98%;
                        display: flex;
                        justify-content: start;
                        align-items: center;
                        flex-direction: column;
                        overflow-y: scroll;
                        overflow-x: hidden;
                        margin: 0 1%;

                        .oneOption {
                            width: 100%;
                            max-height: 30px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;

                            .optionL {
                                width: 70%;
                                margin-left: 1%;
                                display: flex;
                                justify-content: start;
                                align-items: center;

                                .inText {
                                    max-width: 89%;
                                    font-size: 15px;
                                    margin-left: 2%;
                                    margin-top: 1%;
                                    font-family: "Noto Sans TC", sans-serif;
                                }
                            }

                            .optionPrice {
                                width: 30%;
                                display: flex;
                                justify-content: end;
                                align-items: center;

                                .inPrice {
                                    max-width: 60%;
                                    font-size: 15px;
                                    margin: 1% 5%;
                                    font-family: "Noto Sans TC", sans-serif;
                                }
                            }
                        }

                    }

                    .cuInputCtrl {
                        grid-area: 4 / 1 / 5 / 5;
                        border-top: 1px solid $borderBot;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        .fa-solid {
                            font-size: 20px;
                        }

                        .fa-trash-can {
                            margin-left: 3%;
                        }

                        .fa-circle-plus {
                            margin-right: 3%;
                        }
                    }

                }
            }
        }
    }
}
</style>
