<script>
import LeftBar from "@/components/LeftBar.vue";
import axios from "axios";
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import zhLocale from '@fullcalendar/core/locales/zh-tw'

export default {
    components: {
        LeftBar,
        FullCalendar
    },
    data() {
        return {
            announceId: "",
            allAnnouncements: [],
            displayedAnnouncements: [],
            today: new Date().toISOString().split("T")[0],
            selectDate: null,
            calendarOptions: {
                plugins: [dayGridPlugin, interactionPlugin],
                initialView: 'dayGridMonth',
                locales: [zhLocale],
                locale: 'zh-tw',
                dateClick: this.handleDateClick,
                displayEventTime: false,
                events: [],

            }
        };
    },
    mounted() {
        this.fetchAllAnnouncements();
    },
    methods: {
        fetchAllAnnouncements() {
            const params = { announceId: this.announceId };
            axios
                .post("http://localhost:8080/announce/searchAnnounce", params)
                .then((response) => {
                    this.allAnnouncements = response.data.data;
                    console.log("獲取的公告數據：", this.allAnnouncements);
                    this.calendarOptions.events = this.getEvents();
                })
                .catch((error) => {
                    console.error("獲取公告失敗：", error);
                });
        },

        getEvents() {
            const colorPalette = ['#FF0000', '#0000E3', '#00BB00', '#BF0060'];
            const assignedEvents = [];

            return this.allAnnouncements.map((announce) => {
                const startDate = new Date(announce.announceStartTime);
                const endDate = new Date(announce.announceEndTime);
                const overlappingColors = assignedEvents
                    .filter(event => !(new Date(event.end) < startDate || new Date(event.start) > endDate))
                    .map(event => event.color);

                const availableColors = colorPalette.filter(color => !overlappingColors.includes(color));
                const eventColor = availableColors.length > 0 ? availableColors[0] : colorPalette[0];

                assignedEvents.push({
                    title: announce.announceTitle,
                    start: startDate,
                    end: endDate,
                    color: eventColor
                });

                return {
                    title: announce.announceTitle,
                    start: startDate,
                    end: endDate,
                    color: eventColor
                };
            });
        },

        handleDateClick(info) {
            this.selectDate = info.dateStr;
            this.displayedAnnouncements = this.allAnnouncements.filter(announce => {
                const startDate = new Date(announce.announceStartTime).toISOString().split("T")[0];
                const endDate = new Date(announce.announceEndTime).toISOString().split("T")[0];
                return this.selectDate >= startDate && this.selectDate <= endDate;
            });
        },
    }
};
</script>


<template>
    <div class="big">
        <div class="leftBar">
            <LeftBar />
        </div>
        <div class="mainArea">
            <div class="calendar-container">
                <FullCalendar :options="calendarOptions" />
            </div>
            <div>
                <div v-for="announce in displayedAnnouncements" :key="announce.announceId" class="announcement-item">
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

        .calendar-container {
            width: 60%;
            height: 500px;
        }
    }
}

.preview-image {
    width: 300px;
    height: 300px;
    object-fit: contain;
}
</style>
