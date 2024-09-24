<script>
import LeftBar from '@/components/LeftBar.vue'
export default {
    data() {
        return {
            activeNames: [],
            collapses: [
                // {
                //     name: "",
                //     title: "",
                //     type: 'radio',
                //     options: [
                //         { text: '' },
                //         { text: '' },
                //     ],
                // }
            ]
        };
    },
    components: {
        LeftBar
    },
    methods: {
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
            <div class="mealNameArea">
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
                    :name="collapse.name">
                    <!-- 自定義 title 部分，使用者可以輸入 -->
                    <template #title>
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
                        <input type="text" class="markupOption" v-model="option.text"
                            :placeholder="'客製化選項' + (opIndex + 1)">
                        <!-- markup防呆: 1. + or - 2.僅能是數字 3.數字不能0開頭 -->
                        <input type="text" class="markup" placeholder="金額+/-">
                        <i class="fa-solid fa-trash" @click="removeOption(collapse, opIndex)"></i>
                    </div>
                </el-collapse-item>
            </el-collapse>
            <div class="addOption">
                <i class="fa-solid fa-square-plus" @click="addCustomization()"></i>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
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
        height: 90%;
        overflow-y: scroll;
        display: flex;
        justify-content: start;
        align-items: center;
        flex-direction: column;

        .mealNameArea {
            width: 90%;
            padding-bottom: 5px;
            font-size: 20px;
            border-bottom: 2px solid black;

            span {
                margin-right: 5px;
            }

            input {
                width: 50%;
                border: none;
                color: transparent;
                font-size: 20px;
                margin-right: 30px;
                color: black;
            }

            select {
                font-size: 20px;
                margin-right: 20px;
            }

            .price {
                width: 120px;
                color: black;
            }
        }

        .mealImage {
            width: 90%;
            margin-top: 5px;

            input {
                cursor: pointer;
                width: 70px;
            }

            span {
                margin-right: 5px;
            }
        }

        .mealDescription {
            width: 90%;
            margin-top: 5px;

            .mealDes {
                width: 80%;
                height: 80px;
                font-size: 18px;
            }
        }

        .collTitle {
            width: 230px;
            font-size: 26px;
            margin-left: 10px;
        }

        .el-collapse {
            width: 90%;
            margin: 30px auto;
            --el-collapse-header-font-size: 20px;
            --el-collapse-header-bg-color: #b0f079;

            .el-collapse-item {
                margin-bottom: 10px;
            }

            .editOption {
                width: 100%;
                display: flex;
                justify-content: space-around;
                align-items: center;
                margin: 2% auto;

                select {
                    font-size: 30px;
                }

                .fa-plus {
                    font-size: 40px;
                    cursor: pointer;
                }

                .fa-file-circle-xmark {
                    font-size: 40px;
                    cursor: pointer;
                }

            }

            .option {
                width: 100%;
                margin: 2% auto;
                display: flex;
                align-items: center;

                input[type=checkbox],
                input[type=radio] {
                    margin: 0 30px;
                    scale: 2;
                }

                .markupOption {
                    width: 60%;
                    font-size: 40px;
                    margin-right: 100px
                }

                .markup {
                    width: 15%;
                    font-size: 40px;
                    margin-right: 70px;
                }

                .fa-trash {
                    font-size: 40px;
                    cursor: pointer;
                }
            }
        }

        .addOption {
            width: 90%;
            margin-top: 30px;
            display: flex;
            justify-content: center;

            .fa-square-plus {
                font-size: 40px;
                cursor: pointer;
            }
        }
    }

}
</style>
