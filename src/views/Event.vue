<script>
import LeftBar from "@/components/LeftBar.vue";
import axios from "axios";
import VueCal from "vue-cal";
import "vue-cal/dist/vuecal.css";

export default {
    data() {
        return {
            announceId: "",
            announcements: [],
            selectedDate: null, // 選中的日期
            today: new Date().toISOString().split("T")[0],
        };
    },
    mounted() {
        this.fetchAllannounceId();
    },
    components: {
        LeftBar,
        VueCal,
    },
    methods: {
        fetchAllannounceId() {
            const params = { announceId: this.announceId };
            axios
                .post("http://localhost:8080/announce/searchAnnounce", params)
                .then((response) => {
                    this.announcements = response.data.data;
                    console.log("獲取的公告數據：", this.announcements);
                })
                .catch((error) => {
                    console.error("獲取公告失敗：", error);
                });
        },
        filterAnnouncementsByDate() {
            if (!this.selectedDate) return this.announcements; // 如果未選擇日期，返回所有公告
            return this.announcements.filter((announce) => {
                const start = new Date(announce.announceStartTime);
                const end = new Date(announce.announceEndTime);
                const selected = new Date(this.selectedDate);
                return selected >= start && selected <= end;
            });
        },
        onDateSelect(date) {
            this.selectedDate = date;
        },
    },
};
</script>

<template>
    <div class="big">
        <div class="leftBar">
            <LeftBar />
        </div>
        <div class="mainArea">
            <vue-cal @cell-click="onDateSelect" style="width: 300px; margin-bottom: 20px"
                :disable-views="['years','year', 'week', 'multi-day', 'day']" />

            <div>
                <div v-for="announce in filterAnnouncementsByDate()" :key="announce.announceId"
                    class="announcement-item">
                    <img :src="announce.announcePictureName" v-if="announce.announcePictureName"
                        class="preview-image" />
                    <h3>{{ announce.announceTitle }}</h3>
                    <span>{{ announce.announceStartTime }}</span>
                    <span>{{ announce.announceEndTime }}</span>
                    <pre>{{ announce.announceContent }}</pre>
                </div>
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
    }
}

.preview-image {
    width: 300px;
    height: 300px;
    object-fit: contain;
}
</style>
