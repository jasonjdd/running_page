// const
const MAPBOX_TOKEN =
  // For security reasons, please avoid using the default public token provided by Mapbox as much as possible.
  // Instead, manually add a new token and apply URL restrictions.
  // (please refer to https://github.com/yihong0618/running_page/issues/643#issuecomment-2042668580)
  // pk.eyJ1IjoiYXlhenVycmVobWFuNzg2IiwiYSI6ImNsdTZvbnphcjFzMGUyam54aWYxMzFraG8ifQ.yjQ5BZj58dJBP0Mts0r7Ww
  // pk.eyJ1IjoiYmVuLTI5IiwiYSI6ImNrZ3Q4Ym9mMDBqMGYyeXFvODV2dWl6YzQifQ.gSKoWF-fMjhzU67TuDezJQ
  // 
  'pk.eyJ1IjoieWlob25nMDYxOCIsImEiOiJjbWYxdXR4YncwMTJtMm5zOTE4eTZpMGdtIn0.OnsXdwkZFztR8a5Ph_T-xg';
const MUNICIPALITY_CITIES_ARR = [
  '北京市',
  '上海市',
  '天津市',
  '重庆市',
  '香港特别行政区',
  '澳门特别行政区',
];
const MAP_LAYER_LIST = [
  'road-label',
  'waterway-label',
  'natural-line-label',
  'natural-point-label',
  'water-line-label',
  'water-point-label',
  'poi-label',
  'airport-label',
  'settlement-subdivision-label',
  'settlement-label',
  'state-label',
  'country-label',
];

const USE_GOOGLE_ANALYTICS = false;
const GOOGLE_ANALYTICS_TRACKING_ID = '';

// styling: set to `true` if you want dash-line route
const USE_DASH_LINE = false;
// styling: route line opacity: [0, 1]
const LINE_OPACITY = 0.6;
// styling: map height
const MAP_HEIGHT = 600;
//set to `false` if you want to hide the road label characters
const ROAD_LABEL_DISPLAY = true;
//set to `true` if you want to display only the routes without showing the map.
const PRIVACY_MODE = false;
//set to `false` if you want to make light off as default, only effect when `PRIVACY_MODE` = false
const LIGHTS_ON = true;

// IF you outside China please make sure IS_CHINESE = false
const IS_CHINESE = true;
const USE_ANIMATION_FOR_GRID = false;
const CHINESE_INFO_MESSAGE = (yearLength: number, year: string): string => {
  const yearStr = year === 'Total' ? '所有' : ` ${year} `;
  return `我用 App 记录自己跑步 ${yearLength} 年了，下面列表展示的是${yearStr}的数据`;
};
const ENGLISH_INFO_MESSAGE = (yearLength: number, year: string): string =>
  `Running Journey with ${yearLength} Years, the table shows year ${year} data`;

const CHINESE_WEEK_STATISTIC_MESSAGE = (weekRunCount: number, weekRunDistance: number, weekRunAvgHR: number, weekRunAvgPace: string): string => `本周共计跑步${weekRunCount}次, 距离${weekRunDistance}公里, 平均心率${weekRunAvgHR}BPM,平均配速${weekRunAvgPace}`;
const EGNLISH_WEEK_STATISTIC_MESSAGE = (weekRunCount: number, weekRunDistance: number, weekRunAvgHR: number, weekRunAvgPace: string): string => `Total ${weekRunCount} runs this week, distance ${weekRunDistance} km, average heart rate ${weekRunAvgHR} BPM, average pace ${weekRunAvgPace}`;

// not support English for now
const CHINESE_LOCATION_INFO_MESSAGE_FIRST =
  '我跑过了一些地方，希望随着时间推移，地图点亮的地方越来越多';
const CHINESE_LOCATION_INFO_MESSAGE_SECOND = '不要停下来，不要停下奔跑的脚步';

const INFO_MESSAGE = IS_CHINESE ? CHINESE_INFO_MESSAGE : ENGLISH_INFO_MESSAGE;
const WEEK_STATISTIC_MESSAGE = IS_CHINESE ? CHINESE_WEEK_STATISTIC_MESSAGE : EGNLISH_WEEK_STATISTIC_MESSAGE;
const FULL_MARATHON_RUN_TITLE = IS_CHINESE ? '全程马拉松' : 'Full Marathon';
const HALF_MARATHON_RUN_TITLE = IS_CHINESE ? '半程马拉松' : 'Half Marathon';
const RUN_TITLE = IS_CHINESE ? '跑步' : 'Run';
const TRAIL_RUN_TITLE = IS_CHINESE ? '越野跑' : 'Trail Run';
const SWIM_TITLE = IS_CHINESE ? '游泳' : 'Swim';

const RIDE_TITLE = IS_CHINESE ? '骑行' : 'Ride';
const INDOOR_RIDE_TITLE = IS_CHINESE ? '室内骑行' : 'Indoor Ride';
const VIRTUAL_RIDE_TITLE = IS_CHINESE ? '虚拟骑行' : 'Virtual Ride';
const HIKE_TITLE = IS_CHINESE ? '徒步' : 'Hike';
const ROWING_TITLE = IS_CHINESE ? '划船' : 'Rowing';
const KAYAKING_TITLE = IS_CHINESE ? '皮划艇' : 'Kayaking';
const SNOWBOARD_TITLE = IS_CHINESE ? '单板滑雪' : 'Snowboard';
const SKI_TITLE = IS_CHINESE ? '双板滑雪' : 'Ski';
const ROAD_TRIP_TITLE = IS_CHINESE ? '自驾' : 'RoadTrip';
const FLIGHT_TITLE = IS_CHINESE ? '飞行' : 'Flight';
const WALK_TITLE = IS_CHINESE ? "散步" : "CityWalk";

// run time
const MORNING_TIME_TITLE = IS_CHINESE ? '清晨' : 'Morning ';
const MIDDAY_TIME_TITLE = IS_CHINESE ? '午间' : 'Midday ';
const AFTERNOON_TIME_TITLE = IS_CHINESE ? '午后' : 'Afternoon ';
const EVENING_TIME_TITLE = IS_CHINESE ? '傍晚' : 'Evening ';
const NIGHT_TIME_TITLE = IS_CHINESE ? '夜晚' : 'Night ';

const WORKOUT_TIME_TITLES = {
  MORNING_TIME_TITLE,
  MIDDAY_TIME_TITLE,
  AFTERNOON_TIME_TITLE,
  EVENING_TIME_TITLE,
  NIGHT_TIME_TITLE,
};

const RUN_TITLES = {
  FULL_MARATHON_RUN_TITLE,
  HALF_MARATHON_RUN_TITLE,
  RUN_TITLE,
  TRAIL_RUN_TITLE,
  WALK_TITLE,

  RIDE_TITLE,
  INDOOR_RIDE_TITLE,
  VIRTUAL_RIDE_TITLE,
  HIKE_TITLE,
  ROWING_TITLE,
  KAYAKING_TITLE,
  SWIM_TITLE,
  ROAD_TRIP_TITLE,
  FLIGHT_TITLE,
  SNOWBOARD_TITLE,
  SKI_TITLE,
};

export {
  USE_GOOGLE_ANALYTICS,
  GOOGLE_ANALYTICS_TRACKING_ID,
  CHINESE_LOCATION_INFO_MESSAGE_FIRST,
  CHINESE_LOCATION_INFO_MESSAGE_SECOND,
  MAPBOX_TOKEN,
  MUNICIPALITY_CITIES_ARR,
  MAP_LAYER_LIST,
  IS_CHINESE,
  ROAD_LABEL_DISPLAY,
  INFO_MESSAGE,
  WEEK_STATISTIC_MESSAGE,
  RUN_TITLES,
  WORKOUT_TIME_TITLES,
  USE_ANIMATION_FOR_GRID,
  USE_DASH_LINE,
  LINE_OPACITY,
  MAP_HEIGHT,
  PRIVACY_MODE,
  LIGHTS_ON,
};

const nike = 'rgb(224,237,94)';
const yellow = 'rgb(224,237,94)';
const green = 'rgb(0,237,94)';
const green2 = 'rgb(69,215,116)';
const pink = 'rgb(237,85,219)';
const cyan = 'rgb(112,243,255)';
const IKB = 'rgb(0,47,167)';
const dark_vanilla = 'rgb(228,212,220)';
const gold = 'rgb(242,190,69)';
const purple = 'rgb(154,118,252)';
const veryPeri = 'rgb(105,106,173)';//长春花蓝
const red = 'rgb(255,0,0)';//大红色
const red2 = 'rgb(238,83,81)';

// If your map has an offset please change this line
// issues #92 and #198
export const NEED_FIX_MAP = false;
export const MAIN_COLOR = green;
export const RUN_COLOR = yellow;
export const RIDE_COLOR = green2;
export const VIRTUAL_RIDE_COLOR = veryPeri;
export const HIKE_COLOR = pink;
export const WALK_COLOR = gold;
export const SWIM_COLOR = gold;
export const ROWING_COLOR = cyan;
export const ROAD_TRIP_COLOR = purple;
export const FLIGHT_COLOR = dark_vanilla;
export const PROVINCE_FILL_COLOR = '#47b8e0';
export const COUNTRY_FILL_COLOR = dark_vanilla;
export const KAYAKING_COLOR = red;
export const SNOWBOARD_COLOR = dark_vanilla;
export const TRAIL_RUN_COLOR = IKB;
