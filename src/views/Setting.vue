<script>
import LeftBar from '@/components/LeftBar.vue'
import Header from '@/components/Header.vue'
import Swal from 'sweetalert2';
export default {
    data() {
        return {
            startX: 0,
            translateX: 0,
            categories: [
                { text: "", translateX: 0 },
            ],
            cgInput: [],
            activeNames: [],
            collapses: [],
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
                    <div class="menuMain"></div>
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


            <!-- <div class="mealNameArea">
                <span>餐點名稱:</span>
                <input type="text" placeholder="請輸入餐點名稱">
                <span>餐點類型:</span>
                <select name="">
                    <option value="未選擇">未選擇</option>
                    <option value="漢堡">漢堡</option>
                    <option value="沙拉">沙拉</option>
                    <option value="飲料">飲料</option>
                    <option value="義大利麵">義大利麵</option>
                    <option value="組合餐">組合餐</option>
                </select>
                <span>餐點價格:</span>
                <input class="price" type="text" placeholder="輸入餐點價格">
            </div>
            <div class="mealImage">
                <span>新增餐點圖片:</span>
                <input type="file" name="" id="">
            </div>
            <div class="mealDescription">
                <textarea class="mealDes" style="resize: none;" placeholder="新增餐點描述"></textarea>
            </div>
            <el-collapse v-model="activeNames">
                <el-collapse-item v-for="(collapse, index) in collapses" :key="index" :title="collapse.title"
                    :name="collapse.name"> -->
            <!-- 自定義 title 部分，使用者可以輸入 -->
            <!-- <template #title>
                        <input class="collTitle" type="text" v-model="collapse.title"
                            :placeholder="'客製化選項標題' + (index + 1)" @input="updateTitle(collapse, index)" @click.stop />
                    </template>
<div class="editOption">
    <select v-model="collapse.type" @change="clearOption(collapse)" name="" id="">
        <option value="radio">單選</option>
        <option value="checkbox">多選</option>
    </select>
    <i class="fa-solid fa-plus" @click="addOptionBox(collapse)"></i>
    <i class="fa-solid fa-file-circle-xmark" @click="deleteThisCollapse(index)"></i>
</div>
<div class="option" v-for="(option, opIndex) in collapse.options" :key="opIndex">
    <input v-if="collapse.type === 'radio'" type="radio" :name="'radio' + collapse.name" id="">
    <input v-if="collapse.type === 'checkbox'" type="checkbox" name="" id="">
    <input type="text" class="markupOption" v-model="option.text" :placeholder="'客製化選項' + (opIndex + 1)"> -->
            <!-- markup防呆: 1. + or - 2.僅能是數字 3.數字不能0開頭 -->
            <!-- <input type="text" class="markup" placeholder="金額+/-">
                        <i class="fa-solid fa-trash" @click="removeOption(collapse, opIndex)"></i>
                    </div>
                </el-collapse-item>
            </el-collapse>
            <div class="addOption">
                <i class="fa-solid fa-square-plus" @click="addCustomization()"></i>
            </div> -->
        </div>
    </div>
</template>

<style scoped lang="scss">
$divColor: #fff;

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
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    border: 1px solid black
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
