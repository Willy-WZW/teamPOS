<script>
import LeftBar from '@/components/LeftBar.vue'
import Header from '@/components/Header.vue'
import Swal from 'sweetalert2';
export default {
    data() {
        return {
            startX: 0,
            translateX: 0,
            supply: true,
            categories: [
                { text: "", translateX: 0 },
            ],
            cgInput: [],
            activeNames: [],
            collapses: [],
            
            showComboArea:true
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
                { text: "" },
            )
        },
        switchSta() {
            this.supply = !this.supply
        },
        clearOption(collapse) {
            collapse.options.forEach(option => {
                option.text = ""
            });
        },
        addOptionBox(collapse) {
            collapse.options.push({ text: '' })
        },
        removeOption(collapse, opIndex) {
            if (collapse.options.length > 2) {
                collapse.options.splice(opIndex, 1)
            }
        },
        addCustomization() {
            const newIndex = this.collapses.length + 1;
            const newCollapse = {
                name: newIndex.toString(),
                title: "",
                type: "radio",
                options: [
                    { text: "" },
                    { text: "" },
                ]
            };
            this.collapses.push(newCollapse);
            // this.activeNames.push(newCollapse.name);
        },
        deleteThisCollapse(index) {
            this.collapses.splice(index, 1)
        },
        updateTitle(collapse, index) {
            this.collapses[index].title = collapse.title;
        }
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
                        <input type="text" placeholder="輸入菜單分類">
                    </div>
                    <i class="fa-solid fa-circle-plus" @click="addCgInput()"></i>
                </div>
                <div class="saveCategory">儲存</div>
                <div class="editCategory">編輯</div>
            </div>
            <div class="menuAndCust">
                <div class="menuArea" v-if="showComboArea">
                    <div class="menuTop">
                        <div class="mtLeft">
                            <span>餐點</span>
                        </div>
                        <div class="mtRight">
                            <div class="selCate">
                                <span>套餐</span>
                                <div class="countOp">55</div>
                            </div>
                            <div class="saveBtn">儲存</div>
                        </div>
                    </div>
                    <div class="menuMain">
                        <div class="addMenuDiv">+&nbsp&nbsp新增套餐</div>
                        <div class="menuItem">
                            <h1>套餐名稱</h1>
                            <div>
                                <label for="meal1">餐點選單</label>
                                <select id="meal1">
                                    <option value="豬排漢堡">豬排漢堡</option>
                                    <option value="雞排漢堡">雞排漢堡</option>
                                    <option value="美味蟹堡">美味蟹堡</option>
                                </select>
                                <div>
                                    <p>卡拉雞腿堡</p>
                                    <p>$160</p>
                                </div>
                            </div>
                            <div>
                                <label for="meal2">餐點選單</label>
                                <select id="meal2">
                                    <option value="紅茶">紅茶</option>
                                    <option value="奶茶">奶茶</option>
                                </select>
                                <div>
                                    <div>
                                        <p>紅茶</p>
                                        <p>$25</p>
                                    </div>
                                    <div>
                                        <p>奶茶</p>
                                        <p>$30</p>
                                    </div>
                                </div>
                            </div>   
                            <div class="itemIcon">
                                    <i class="fa-solid fa-square-pen"></i>
                            </div>
                                <!-- <div class="itemPic"></div>
                            <div class="itemName">青醬蛤蠣義大利麵</div>
                            <div class="itemPrice">$ 250</div>
                            <div class="itemWorksta">
                                <span>工作檯</span>
                                <select>
                                    <option value="0">工作檯選擇</option>
                                </select>
                            </div>
                            <div class="itembot">
                                <div class="itemStatus" :class="{ flip: !supply }" @click="switchSta()">
                                    <span>{{ supply ? "供應中" : "售完" }}</span>
                                </div>
                                <div class="itemIcon">
                                    <i class="fa-solid fa-square-pen"></i>
                                    <i class="fa-solid fa-trash-can"></i>
                                </div>
                            </div> -->
                        </div>
                    </div>
                </div>
                
                <div class="menuArea" v-if="!showComboArea">
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
                        <div class="addMenuDiv">+&nbsp&nbsp新增餐點</div>
                        <div class="menuItem">
                            <div class="itemPic"> </div>
                            <div class="itemName">青醬蛤蠣義大利麵</div>
                            <div class="itemPrice">$ 250</div>
                            <div class="itemWorksta">
                                <span>工作檯</span>
                                <select>
                                    <option value="0">工作檯選擇</option>
                                </select>
                            </div>
                            <div class="itembot">
                                <div class="itemStatus" :class="{ flip: !supply }" @click="switchSta()">
                                    <span>{{ supply ? "供應中" : "售完" }}</span>
                                </div>
                                <div class="itemIcon">
                                    <i class="fa-solid fa-square-pen"></i>
                                    <i class="fa-solid fa-trash-can"></i>
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
                    <div class="menuMain"></div>
                </div>
            </div>



        </div>
    </div>
</template>

<style scoped lang="scss">
$divColor: #fff;
$addDiv: #343a3f;

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
                            border: dotted;
                            margin: 4% 4% 0 4%;
                        }

                        .itemName {
                            grid-area: 5 / 1 / 6 / 7;
                            display: flex;
                            align-items: center;
                            font-weight: bold;
                            letter-spacing: 3px;
                            font-family: "Noto Sans TC", sans-serif;
                            margin: 0 4%;
                        }

                        .itemPrice {
                            grid-area: 6 / 1 / 7 / 7;
                            display: flex;
                            align-items: center;
                            font-weight: bold;
                            font-family: "Noto Sans TC", sans-serif;
                            margin: 0 4%;
                        }

                        .itemWorksta {
                            grid-area: 7 / 1 / 8 / 7;
                            display: flex;
                            align-items: center;
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
                                width: 60%;
                                margin-right: 5%;
                                margin-bottom: 2%;
                                border-radius: 5px;
                                letter-spacing: 3px;
                                cursor: pointer;
                                font-size: 25px;
                                font-weight: bold;
                                color: white;
                                background-color: green;
                                border: 1px solid green;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                transition: transform 0.7s, background-color 0.5s;
                            }
                            .flip {
                                transform: rotateX(360deg);
                                background-color: red;
                                color: white;
                            }


                            .itemIcon {
                                width: 35%;
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
            }
        }

        // .mealNameArea {
        //     width: 90%;
        //     padding-bottom: 5px;
        //     font-size: 20px;
        //     border-bottom: 2px solid black;

        //     span {
        //         margin-right: 5px;
        //     }

        //     input {
        //         width: 50%;
        //         border: none;
        //         color: transparent;
        //         font-size: 20px;
        //         margin-right: 30px;
        //         color: black;
        //     }

        //     select {
        //         font-size: 20px;
        //         margin-right: 20px;
        //     }

        //     .price {
        //         width: 120px;
        //         color: black;
        //     }
        // }

        // .mealImage {
        //     width: 90%;
        //     margin-top: 5px;

        //     input {
        //         cursor: pointer;
        //         width: 70px;
        //     }

        //     span {
        //         margin-right: 5px;
        //     }
        // }

        // .mealDescription {
        //     width: 90%;
        //     margin-top: 5px;

        //     .mealDes {
        //         width: 80%;
        //         height: 80px;
        //         font-size: 18px;
        //     }
        // }

        // .collTitle {
        //     width: 230px;
        //     font-size: 26px;
        //     margin-left: 10px;
        // }

        // .el-collapse {
        //     width: 90%;
        //     margin: 30px auto;
        //     --el-collapse-header-font-size: 20px;
        //     --el-collapse-header-bg-color: #b0f079;

        //     .el-collapse-item {
        //         margin-bottom: 10px;
        //     }

        //     .editOption {
        //         width: 100%;
        //         display: flex;
        //         justify-content: space-around;
        //         align-items: center;
        //         margin: 2% auto;

        //         select {
        //             font-size: 30px;
        //         }

        //         .fa-plus {
        //             font-size: 40px;
        //             cursor: pointer;
        //         }

        //         .fa-file-circle-xmark {
        //             font-size: 40px;
        //             cursor: pointer;
        //         }

        //     }

        //     .option {
        //         width: 100%;
        //         margin: 2% auto;
        //         display: flex;
        //         align-items: center;

        //         input[type=checkbox],
        //         input[type=radio] {
        //             margin: 0 30px;
        //             scale: 2;
        //         }

        //         .markupOption {
        //             width: 60%;
        //             font-size: 40px;
        //             margin-right: 100px
        //         }

        //         .markup {
        //             width: 15%;
        //             font-size: 40px;
        //             margin-right: 70px;
        //         }

        //         .fa-trash {
        //             font-size: 40px;
        //             cursor: pointer;
        //         }
        //     }
        // }

        // .addOption {
        //     width: 90%;
        //     margin-top: 30px;
        //     display: flex;
        //     justify-content: center;

        //     .fa-square-plus {
        //         font-size: 40px;
        //         cursor: pointer;
        //     }
        // }
    }

}
</style>
