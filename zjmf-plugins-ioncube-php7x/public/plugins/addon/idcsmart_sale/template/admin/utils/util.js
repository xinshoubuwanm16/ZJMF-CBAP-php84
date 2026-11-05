// 防抖
debounce = (fn, ms) => {
  //fn:要防抖的函数 ms:时间
  let timerId;
  return function () {
    timerId && clearTimeout(timerId);

    timerId = setTimeout(() => {
      fn.apply(this, arguments);
    }, ms);
  };
};
function Twodigits(num) {
  return num < 10 ? '0' + num : num;
}

/**
 * 最近七天开始、结束时间戳
 * @returns {number[最近七天开始时间戳, 当前时间戳]}
 */
function nowSevenTimetamp() {
  const nowSevenDate = (new Date().getTime() - 3600 * 1000 * 24 * 7) 
  const nowDate = new Date().getTime()
  return [nowSevenDate, nowDate]
}

/**
 * 本周开始时间戳 结束时间戳
 * @returns {number}
 */
function weekStartTimestamp() {
  //  一天的秒数
  const MillisecondsADay = 24 * 60 * 60 // 一天
  //  今日零点时间戳
  const timestamp = Math.floor(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000)
  const weekDay = new Date().getDay() === 0 ? (7 - 1) : (new Date().getDay() - 1)
  const weekTimeStamp = timestamp - MillisecondsADay * weekDay
  const nowDate = new Date().getTime() / 1000
  return [weekTimeStamp, nowDate]
}

/**
 * 上周开始、结束时间戳
 * @returns {number[上周开始时间戳, 上周结束时间戳]}
 */
function lastWeekTimetamp() {
  //  一天的秒数
  const MillisecondsADay = 24 * 60 * 60
  //  今日零点时间戳
  const timestamp = Math.floor(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000)
  const weekDay = new Date().getDay() === 0 ? (7 - 1) : (new Date().getDay() - 1)
  //  本周开始时间戳
  const weekTimeStamp = timestamp - MillisecondsADay * weekDay
  //  上周开始时间戳
  const lastWeekStart = weekTimeStamp - MillisecondsADay * 7
  //  上周结束时间戳
  const lastWeekEnd = weekTimeStamp - 1
  return [lastWeekStart, lastWeekEnd]
}

/**
 * 当月开始时间戳、结束
 * @returns {number}
 */
function monthStartTimestamp() {
  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  const timeStamp = date.getTime() / 1000
  const nowDate = new Date().getTime() / 1000
  return [timeStamp, nowDate]
}

/**
 * 上月天数
 * @returns {number}
 */
function lastMonthDats() {
  const date = new Date()
  const year = date.getFullYear()
  //  上个月月份
  let month = (date.getMonth() + 1) - 1 //  0-11 表示 1月-12月
  //  0 表示12月
  month = month || 12
  //  30天的月份
  const arr30 = [4, 6, 9, 11]
  //  31天的月份
  const arr31 = [1, 3, 5, 7, 8, 10, 12]
  if (arr30.indexOf(month) !== -1) {
    //  上个月是 30 天
    return 30
  } else if (arr31.indexOf(month) !== -1) {
    //  上个月是 31 天
    return 31
  } else {
    //  2月
    if (isRunYear(year)) {
      return 29
    } else {
      return 28
    }
  }
}

/**
 * 获取上月开始、结束时间戳
 * @returns {number[上月开始时间戳，上月结束时间戳]}
 */
function lastMonthTimetamp() {
  //  一天的秒数
  const MillisecondsADay = 24 * 60 * 60

  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  //  当月开始时间戳
  const timeStamp = date.getTime() / 1000
  //  上个月的天数
  const days = lastMonthDats()
  //  上月开始时间戳
  const lastMonthStart = timeStamp - (MillisecondsADay * days)
  //  上月结束时间戳
  const lastMonthEnd = timeStamp - 1
  return [lastMonthStart, lastMonthEnd]
}

/**
 * 获取本年开始、结束时间戳
 * @returns {number[本年开始时间戳，当前时间戳]}
 */
function nowDayTimestamp() {
  // 本年开始的时间戳
  const yearStarTime = new Date(new Date().getFullYear(), 0).getTime() / 1000
  // 现在的时间戳
  const nowDate = new Date().getTime() / 1000
  return [yearStarTime, nowDate]
}

function add0(m) {
  return m < 10 ? '0' + m : m
}
function format(shijianchuo) {
  //shijianchuo是整数，否则要parseInt转换
  const time = new Date(shijianchuo);
  const y = time.getFullYear();
  const m = time.getMonth() + 1;
  const d = time.getDate();
  const h = time.getHours();
  const mm = time.getMinutes();
  const s = time.getSeconds();
  return y + '-' + add0(m) + '-' + add0(d);
}

/**
 * 是否为闰年
 * @param year
 * @returns {boolean}
 */
function isRunYear(year) {
  //  条件:能被4整除并且不能被100整除，或者被400整除的
  let flag = false
  if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
    flag = true
  }
  return flag
}

