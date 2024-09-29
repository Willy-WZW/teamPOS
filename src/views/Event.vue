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
                height: 'auto',
                headerToolbar: {
                    left: 'title',
                    right: 'prev,next'
                },

            }
        };
    },
    mounted() {
        this.fetchAllAnnouncements();
        this.displayCurrentMonthAnnouncements();
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
                    this.displayCurrentMonthAnnouncements();
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
        displayCurrentMonthAnnouncements() {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            this.displayedAnnouncements = this.allAnnouncements.filter(announce => {
                const startDate = new Date(announce.announceStartTime);
                const endDate = new Date(announce.announceEndTime);
                const startMonth = startDate.getMonth();
                const endMonth = endDate.getMonth();
                const startYear = startDate.getFullYear();
                const endYear = endDate.getFullYear();

                return (startMonth === currentMonth || endMonth === currentMonth) &&
                    (startYear === currentYear || endYear === currentYear);
            });
        },
        handleDateClick(info) {
            const calendarApi = info.view.calendar;
            calendarApi.gotoDate(info.date);

            this.selectDate = info.dateStr;

            const previouslySelected = document.querySelector('.selected-date');
            if (previouslySelected) {
                previouslySelected.classList.remove('selected-date');
            }
            info.dayEl.classList.add('selected-date');

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
                <div class="announcebox">
                    <div class="announcetitle">
                        <h2>近期活動</h2>
                    </div>
                    <div class="announcebox-content">
                        <div v-for="announce in displayedAnnouncements" :key="announce.announceId"
                            class="announcement-item">
                            <img :src="announce.announcePictureName" v-if="announce.announcePictureName"
                                class="preview-image" />
                            <div class="announcetext">
                                <h3>{{ announce.announceTitle }}</h3>
                                <span>活動時間{{ announce.announceStartTime }}~</span>
                                <span>{{ announce.announceEndTime }}</span>
                            </div>
                        </div>
                    </div>
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
        display: flex;
        justify-content: start;
        overflow: hidden;


        .calendar-container {
            width: 60%;
            height: auto;
            margin-left: 5%;
        }
    }
}

.announcebox {
    width: 350px;
    margin-left: 15%;
    border: 1px solid;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.announcetitle {
    margin-top: 3%;
}

.announcebox-content {
    width: 100%;
    max-height: 870px;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    align-items: center;
    scrollbar-width: none;
}

.announcement-item {
    width: 300px;
    height: 300px;
    margin-top: 5%;
    margin-bottom: 5%;
}

.preview-image {
    width: 300px;
    height: 200px;
    object-fit: fill;
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
}

.announcetext {
    height: 70px;
    padding-left: 5%;
    padding-top: 4%;
    margin-top: -2%;
    border: 1px solid black;
    border-top: none;
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
}
</style>

<style>
.fc-event {
    pointer-events: none;
}

.selected-date {
    border: 2px solid #0000ff;
    background-color: rgba(0, 0, 255, 0.1);
}

.fc-toolbar-chunk .fc-button {
    border-radius: 100%;
}

.fc-col-header-cell {
    background-color: white;
    border-radius: 10px;
}

.fc table,
.fc table th,
.fc table td {
    border: none;
    box-shadow: none;
}

.fc .fc-scrollgrid-liquid {
    border: none;
}

.fc .fc-daygrid-day-frame {
    border: 1px solid black;
}

.fc-scrollgrid-sync-table {
    margin-top: 2%;
    overflow: hidden;
    height: 100%;

}

.fc .fc-daygrid-day {
    width: 100px;
    height: 120px;
}
</style>
