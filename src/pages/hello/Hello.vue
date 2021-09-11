<template>
  <div>
    {% extends "layout.html" %} {% block body %}
    <input
      type="date"
      v-bind:value="date"
      v-on:change="updateDate($event.target.value)"
    />
    <select v-model="department">
      <option>部署を選択</option>
      <option
        v-for="department in department_options"
        v-text="department"
        v-bind:key="department"
      ></option>
    </select>
    <table class="table table-striped table-sm">
      <thead
        class="thead-dark sticky-top bg-white"
        style="border-bottom: 2px solid black"
      >
        <tr>
          <th>日付</th>
          <td>名前</td>
          <td>部署</td>
          <th>出勤時刻</th>
          <th>退勤時刻</th>
          <th>みなし出勤</th>
          <th>みなし退勤</th>
          <th>確定</th>
          <th>残業時間</th>
          <td>弁当</td>
          <th>休憩</th>
          <th>朝休憩</th>
          <th>昼休憩</th>
          <th>午後休憩</th>
          <th>残業休憩</th>
          <th>定時内休憩時間</th>
          <th>定時外休憩時間</th>
          <th>総勤務時間</th>
          <th>みなし労働</th>
          <th>遅刻時間</th>
          <th>早退時間</th>
          <th>深夜残業</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(attendance, index) in attendances_filtered"
          v-bind:key="index"
        >
          <td
            v-text="getDateWithDay(new Date(attendance.date))"
            v-bind:class="{
              'table-primary': getDateWithDay(
                new Date(attendance.date)
              ).includes('土'),
              'table-danger': getDateWithDay(
                new Date(attendance.date)
              ).includes('日'),
            }"
          ></td>
          <td
            v-text="attendance.name"
            v-bind:class="{ 'table-success': attendance.is_confirmed }"
          ></td>
          <td v-text="attendance.department"></td>
          <td
            v-text="attendance.attended_at"
            v-bind:class="{
              'table-warning': attendance.earlier_30mins === 'True',
            }"
          ></td>
          <td v-text="attendance.left_at"></td>
          <td
            v-bind:class="{
              'table-warning': attendance.is_d_attended_at_edited !== 'False',
            }"
          >
            <input type="time" v-model="attendance.deemed_attended_at_time" />
          </td>
          <td
            v-bind:class="{
              'table-warning': attendance.is_d_left_at_edited !== 'False',
            }"
          >
            <input type="time" v-model="attendance.deemed_left_at_time" />
          </td>
          <td>
            <button class="btn btn-primary btn-sm" @click="save(attendance.id)">
              確定
            </button>
          </td>
          <td
            v-text="attendance.zangyo"
            v-bind:class="{
              'table-danger':
                attendance.zangyo !== '0:00:00' && attendance.zangyo != 'None',
            }"
          ></td>
          <td v-text="attendance.bento"></td>
          <td v-bind:class="{ 'table-info': has_active_break(index) }">
            <div
              v-for="break_time in attendance.dynamic_breaks"
              class="form-row"
              v-bind:key="break_time"
            >
              <span v-text="break_time.started_at"></span>
              &nbsp;～&nbsp;
              <span
                v-text="break_time.end_at"
                v-if="break_time.started_at !== break_time.end_at"
              ></span>
              <span
                v-text="break_time.delta"
                v-if="break_time.started_at !== break_time.end_at"
              ></span>
            </div>
          </td>
          <td v-text="attendance.static_breaks.morning"></td>
          <td v-text="attendance.static_breaks.noon"></td>
          <td v-text="attendance.static_breaks.afternoon"></td>
          <td v-text="attendance.static_breaks.zangyo"></td>
          <td
            class="form-row"
            v-bind:class="{
              'table-warning': attendance.is_break_normal_edited !== 'False',
            }"
          >
            <input
              v-model="attendance.break_normal"
              class="col-12"
              style="width: 7rem"
            />
          </td>
          <td
            class="form-row"
            v-bind:class="{
              'table-warning': attendance.is_break_overtime_edited !== 'False',
            }"
          >
            <input
              v-model="attendance.break_overtime"
              class="col-12"
              style="width: 7rem"
            />
          </td>
          <td v-text="attendance.total_office"></td>
          <td v-text="attendance.deemed_work"></td>
          <td
            v-text="attendance.late"
            v-bind:class="{ 'table-danger': attendance.late !== '' }"
          ></td>
          <td
            v-text="attendance.early"
            v-bind:class="{
              'table-danger':
                attendance.early !== '0:00:00' && attendance.early != '',
            }"
          ></td>
          <td v-text="attendance.midnight"></td>
        </tr>
      </tbody>
    </table>
  </div>
  {% endblock %}
</template>

<style></style>

<script>
import Vue from "vue";
import { Vue as VueClass } from "vue-class-component";

export default class App extends VueClass {
  person = "人を選択";
  date = this.getDateStr(new Date());
  department = "{{role}}";
  // eslint-disable-next-line no-undef
  bentoe = DATA["bentoes"];
  attendances = [];
  mounted() {
    console.log("aa");
    this.updateDate(this.getDateStr(new Date()));
  }
  get attendances_filtered() {
    console.log(this.date);
    let attendances = this.attendances;
    if (this.department !== "部署を選択")
      attendances = attendances.filter(
        (attendance) => attendance.department === this.department
      );
    return attendances;
  }
  get date_options() {
    return Array.from(
      new Set(this.attendances.map((attendance) => attendance.date))
    );
  }
  get bento_dict() {
    if (this.date === "日付を選択") return {};
    const bentoes = ["注文しない", "A", "B", "C", "D"];
    const bento_dict = {};
    // for (bento of bentoes) {
    //   bento_dict[bento] = this.attendances
    //     .filter((attendance) => attendance.date === this.date)
    //     .filter((attendance) => attendance.bento === bento).length;
    // }
    return bento_dict;
  }
  get department_options() {
    return Array.from(
      new Set(this.attendances.map((attendance) => attendance.department))
    );
  }
  has_active_break(index) {
    return this.attendances[index].dynamic_breaks.some(
      (break_time) => break_time.started_at_f === break_time.end_at_f
    );
  }
  getDateWithDay(dt) {
    var result =
      this.getDateStr(dt) +
      " (" +
      ["日", "月", "火", "水", "木", "金", "土"][dt.getDay()] +
      ")";
    return result;
  }
  getDateStr(dt) {
    var y = dt.getFullYear();
    var m = ("00" + (dt.getMonth() + 1)).slice(-2);
    var d = ("00" + dt.getDate()).slice(-2);
    var result = y + "-" + m + "-" + d;
    return result;
  }
  save(id) {
    const attendance = this.attendances.filter(
      (attendance) => attendance.id === id
    )[0];
    attendance.deemed_attended_at = `${attendance.deemed_attended_at_date} ${attendance.deemed_attended_at_time}`;
    attendance.deemed_left_at = `${attendance.deemed_left_at_date} ${attendance.deemed_left_at_time}`;
    attendance.break_normal = attendance.break_normal + ":00";
    attendance.break_overtime = attendance.break_overtime + ":00";
    console.log(attendance.bento_id);
    const req = new XMLHttpRequest();
    req.open("POST", `/${attendance.id}`);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(attendance));
    req.onloadend = () => {
      window.location = "./total";
    };
  }
  getAttendances() {
    const req = new XMLHttpRequest();
    req.open("GET", `./api/${this.date}`);
    req.send(null);
    req.onloadend = () => {
      const attendances = JSON.parse(req.responseText);
      this.attendances = attendances;
    };
  }
  updateDate(value) {
    console.log(value);
    this.date = value;
    this.getAttendances();
  }
}
// export const app = new Vue({
//   el: "#app",
//   data: function () {
//     return {
//       person: "人を選択",
//       date: this.getDateStr(new Date()),
//       department: "{{role}}",
//       // eslint-disable-next-line no-undef
//       bentoes: DATA["bentoes"],
//       attendances: [],
//     };
//   },
//   mounted: function () {
//     console.log("aa");
//     this.updateDate(this.getDateStr(new Date()));
//   },
//   computed: {
//     attendances_filtered() {
//       console.log(this.date);
//       let attendances = this.attendances;
//       if (this.department !== "部署を選択")
//         attendances = attendances.filter(
//           (attendance) => attendance.department === this.department
//         );
//       return attendances;
//     },
//     date_options() {
//       return Array.from(
//         new Set(this.attendances.map((attendance) => attendance.date))
//       );
//     },
//     bento_dict() {
//       if (this.date === "日付を選択") return {};
//       const bentoes = ["注文しない", "A", "B", "C", "D"];
//       const bento_dict = {};
//       // for (bento of bentoes) {
//       //   bento_dict[bento] = this.attendances
//       //     .filter((attendance) => attendance.date === this.date)
//       //     .filter((attendance) => attendance.bento === bento).length;
//       // }
//       return bento_dict;
//     },
//     department_options() {
//       return Array.from(
//         new Set(this.attendances.map((attendance) => attendance.department))
//       );
//     },
//   },
//   methods: {
//     has_active_break: function (index) {
//       return this.attendances[index].dynamic_breaks.some(
//         (break_time) => break_time.started_at_f === break_time.end_at_f
//       );
//     },
//     getDateWithDay: function (dt) {
//       var result =
//         this.getDateStr(dt) +
//         " (" +
//         ["日", "月", "火", "水", "木", "金", "土"][dt.getDay()] +
//         ")";
//       return result;
//     },
//     getDateStr: function (dt) {
//       var y = dt.getFullYear();
//       var m = ("00" + (dt.getMonth() + 1)).slice(-2);
//       var d = ("00" + dt.getDate()).slice(-2);
//       var result = y + "-" + m + "-" + d;
//       return result;
//     },
//     save: function (id) {
//       const attendance = this.attendances.filter(
//         (attendance) => attendance.id === id
//       )[0];
//       attendance.deemed_attended_at = `${attendance.deemed_attended_at_date} ${attendance.deemed_attended_at_time}`;
//       attendance.deemed_left_at = `${attendance.deemed_left_at_date} ${attendance.deemed_left_at_time}`;
//       attendance.break_normal = attendance.break_normal + ":00";
//       attendance.break_overtime = attendance.break_overtime + ":00";
//       console.log(attendance.bento_id);
//       const req = new XMLHttpRequest();
//       req.open("POST", `/${attendance.id}`);
//       req.setRequestHeader("Content-Type", "application/json");
//       req.send(JSON.stringify(attendance));
//       req.onloadend = () => {
//         window.location = "./total";
//       };
//     },
//     getAttendances: function () {
//       const req = new XMLHttpRequest();
//       req.open("GET", `./api/${this.date}`);
//       req.send(null);
//       req.onloadend = () => {
//         const attendances = JSON.parse(req.responseText);
//         this.attendances = attendances;
//       };
//     },
//     updateDate: function (value) {
//       console.log(value);
//       this.date = value;
//       this.getAttendances();
//     },
//   },
// });
</script>
