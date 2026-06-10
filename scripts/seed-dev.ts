/* Seeds the local dev DB with real Whoop records (captured 2026-06-10) so the
   UI can be verified without a Whoop developer app.
   Usage: DATABASE_URL=postgres://localhost:5432/trainer_log_dev npx tsx scripts/seed-dev.ts
*/
import {
  upsertWorkout,
  upsertSleep,
  upsertRecovery,
  upsertCycle,
  WhoopWorkout,
  WhoopSleep,
  WhoopRecovery,
  WhoopCycle,
} from "../src/lib/ingest";

const workouts: WhoopWorkout[] = [
  { id: "558c7a75-9923-4133-9400-2240101e8175", sport_name: "running", start: "2026-06-09T13:31:58.000Z", end: "2026-06-09T14:02:00.000Z", timezone_offset: "+05:30", score_state: "SCORED", score: { strain: 9.797763, average_heart_rate: 139, max_heart_rate: 172, kilojoule: 1339.939, distance_meter: 2869.3774, altitude_gain_meter: 6.801248, altitude_change_meter: -0.399964, zone_durations: { zone_zero_milli: 10000, zone_one_milli: 207000, zone_two_milli: 1182010, zone_three_milli: 292010, zone_four_milli: 111000, zone_five_milli: 0 } } },
  { id: "3e37ac19-43ab-4cbc-97e8-1a17cdede7c2", sport_name: "running", start: "2026-06-08T11:45:46.000Z", end: "2026-06-08T12:18:39.000Z", timezone_offset: "+05:30", score_state: "SCORED", score: { strain: 13.00614, average_heart_rate: 149, max_heart_rate: 180, kilojoule: 1759.0668, distance_meter: 3315.8752, altitude_gain_meter: 1.50054, altitude_change_meter: -0.5, zone_durations: { zone_zero_milli: 16000, zone_one_milli: 290000, zone_two_milli: 277000, zone_three_milli: 661000, zone_four_milli: 488010, zone_five_milli: 241000 } } },
  { id: "b2917f1a-8f1c-4510-b7ed-acd55df9d712", sport_name: "walking", start: "2026-06-07T16:11:00.000Z", end: "2026-06-07T16:24:59.000Z", timezone_offset: "+05:30", score_state: "SCORED", score: { strain: 3.7861693, average_heart_rate: 92, max_heart_rate: 102, kilojoule: 81.07663, distance_meter: null, altitude_gain_meter: null, altitude_change_meter: null, zone_durations: { zone_zero_milli: 839010, zone_one_milli: 0, zone_two_milli: 0, zone_three_milli: 0, zone_four_milli: 0, zone_five_milli: 0 } } },
  { id: "0dda31dc-3ea0-486f-bd6c-e698e8e0093c", sport_name: "running", start: "2026-06-04T13:00:21.000Z", end: "2026-06-04T13:40:13.000Z", timezone_offset: "+05:30", score_state: "SCORED", score: { strain: 10.469534, average_heart_rate: 136, max_heart_rate: 161, kilojoule: 1691.6587, distance_meter: 3638.2092, altitude_gain_meter: 5.401944, altitude_change_meter: 0.199952, zone_durations: { zone_zero_milli: 25000, zone_one_milli: 357000, zone_two_milli: 1664010, zone_three_milli: 343010, zone_four_milli: 3000, zone_five_milli: 0 } } },
  { id: "9b63938c-df0b-4d85-8a5d-aa86d8c93346", sport_name: "running", start: "2026-06-03T04:26:45.739Z", end: "2026-06-03T04:59:51.901Z", timezone_offset: "+05:30", score_state: "SCORED", score: { strain: 9.576926, average_heart_rate: 136, max_heart_rate: 159, kilojoule: 1390.2809, distance_meter: 2963.3132, altitude_gain_meter: 111.80065, altitude_change_meter: -8.252486, zone_durations: { zone_zero_milli: 27000, zone_one_milli: 330000, zone_two_milli: 1172010, zone_three_milli: 457010, zone_four_milli: 0, zone_five_milli: 0 } } },
  { id: "80f38f13-a136-455e-b280-9278209691d5", sport_name: "running", start: "2026-06-01T12:51:09.797Z", end: "2026-06-01T13:17:33.282Z", timezone_offset: "+05:30", score_state: "SCORED", score: { strain: 10.494485, average_heart_rate: 139, max_heart_rate: 166, kilojoule: 1192.2465, distance_meter: 2175.9778, altitude_gain_meter: 78.68476, altitude_change_meter: -2.013259, zone_durations: { zone_zero_milli: 74000, zone_one_milli: 482000, zone_two_milli: 149000, zone_three_milli: 436010, zone_four_milli: 443010, zone_five_milli: 0 } } },
];

const sleeps: WhoopSleep[] = [
  { id: "771712c6-7aa6-4a8f-bc9e-0a734dc77d3e", start: "2026-06-09T19:49:15.520Z", end: "2026-06-10T02:44:32.870Z", timezone_offset: "+05:30", nap: false, score: { sleep_performance_percentage: 83, stage_summary: { total_light_sleep_time_milli: 12277760, total_slow_wave_sleep_time_milli: 6185200, total_rem_sleep_time_milli: 4742250, total_awake_time_milli: 1712140 } } },
  { id: "23b467c6-8923-45e1-adad-e807ac95b797", start: "2026-06-08T20:02:43.940Z", end: "2026-06-09T03:40:29.420Z", timezone_offset: "+05:30", nap: false, score: { sleep_performance_percentage: 83, stage_summary: { total_light_sleep_time_milli: 13271770, total_slow_wave_sleep_time_milli: 5011280, total_rem_sleep_time_milli: 6902310, total_awake_time_milli: 2280120 } } },
  { id: "ba2e8a9b-8d8c-43c8-acbf-658a93073a41", start: "2026-06-07T19:07:41.530Z", end: "2026-06-08T03:12:07.070Z", timezone_offset: "+05:30", nap: false, score: { sleep_performance_percentage: 86, stage_summary: { total_light_sleep_time_milli: 12768730, total_slow_wave_sleep_time_milli: 6272270, total_rem_sleep_time_milli: 7832350, total_awake_time_milli: 2192190 } } },
  { id: "ada70a39-4ae9-470e-9d95-231a60cd59fd", start: "2026-06-06T18:45:32.600Z", end: "2026-06-07T03:13:04.130Z", timezone_offset: "+05:30", nap: false, score: { sleep_performance_percentage: 85, stage_summary: { total_light_sleep_time_milli: 16010790, total_slow_wave_sleep_time_milli: 4892240, total_rem_sleep_time_milli: 7236310, total_awake_time_milli: 2312190 } } },
  { id: "10377e73-e86b-44d8-b203-05aebdc1a64b", start: "2026-06-05T20:00:30.850Z", end: "2026-06-06T02:37:33.890Z", timezone_offset: "+05:30", nap: false, score: { sleep_performance_percentage: 77, stage_summary: { total_light_sleep_time_milli: 12355450, total_slow_wave_sleep_time_milli: 5043270, total_rem_sleep_time_milli: 4442200, total_awake_time_milli: 1982120 } } },
  { id: "e570b824-c4cb-4e4e-91c1-5cdfac5ccac8", start: "2026-06-04T18:42:28.590Z", end: "2026-06-05T02:25:30.030Z", timezone_offset: "+05:30", nap: false, score: { sleep_performance_percentage: 83, stage_summary: { total_light_sleep_time_milli: 12955700, total_slow_wave_sleep_time_milli: 5190230, total_rem_sleep_time_milli: 7264380, total_awake_time_milli: 2371130 } } },
  { id: "da861b18-60c0-41cb-92af-9136da6db0dc", start: "2026-06-03T18:39:26.410Z", end: "2026-06-04T02:08:36.660Z", timezone_offset: "+05:30", nap: false, score: { sleep_performance_percentage: 75, stage_summary: { total_light_sleep_time_milli: 12367660, total_slow_wave_sleep_time_milli: 5252260, total_rem_sleep_time_milli: 4922280, total_awake_time_milli: 4408050 } } },
  { id: "82870e45-52c3-4f05-a4bb-edb1c0da9380", start: "2026-06-02T19:11:24.130Z", end: "2026-06-03T02:41:25.530Z", timezone_offset: "+05:30", nap: false, score: { sleep_performance_percentage: 80, stage_summary: { total_light_sleep_time_milli: 13553770, total_slow_wave_sleep_time_milli: 4920280, total_rem_sleep_time_milli: 6124200, total_awake_time_milli: 2403150 } } },
];

const recoveries: WhoopRecovery[] = [
  { cycle_id: 1558254446, sleep_id: "771712c6-7aa6-4a8f-bc9e-0a734dc77d3e", created_at: "2026-06-10T02:57:27.453Z", score_state: "SCORED", score: { recovery_score: 40, resting_heart_rate: 61, hrv_rmssd_milli: 66.1271, spo2_percentage: 96.333336, skin_temp_celsius: 32.704334 } },
  { cycle_id: 1555943079, sleep_id: "23b467c6-8923-45e1-adad-e807ac95b797", created_at: "2026-06-09T03:09:54.407Z", score_state: "SCORED", score: { recovery_score: 63, resting_heart_rate: 59, hrv_rmssd_milli: 78.01431, spo2_percentage: 95, skin_temp_celsius: 32.235516 } },
  { cycle_id: 1553643483, sleep_id: "ba2e8a9b-8d8c-43c8-acbf-658a93073a41", created_at: "2026-06-08T03:29:48.336Z", score_state: "SCORED", score: { recovery_score: 84, resting_heart_rate: 56, hrv_rmssd_milli: 90.53579, spo2_percentage: 95.25, skin_temp_celsius: 32.66617 } },
  { cycle_id: 1551264306, sleep_id: "ada70a39-4ae9-470e-9d95-231a60cd59fd", created_at: "2026-06-07T03:16:52.231Z", score_state: "SCORED", score: { recovery_score: 41, resting_heart_rate: 60, hrv_rmssd_milli: 71.51586, spo2_percentage: 99, skin_temp_celsius: 32.58917 } },
  { cycle_id: 1548908212, sleep_id: "10377e73-e86b-44d8-b203-05aebdc1a64b", created_at: "2026-06-06T02:15:24.620Z", score_state: "SCORED", score: { recovery_score: 38, resting_heart_rate: 61, hrv_rmssd_milli: 73.53324, spo2_percentage: 95.5, skin_temp_celsius: null } },
];

const cycles: WhoopCycle[] = [
  { id: 1558254446, start: "2026-06-09T19:49:15.520Z", end: null, timezone_offset: "+05:30", score: { strain: 3.9395604, average_heart_rate: 64 } },
  { id: 1555943079, start: "2026-06-08T20:02:43.940Z", end: "2026-06-09T19:49:15.520Z", timezone_offset: "+05:30", score: { strain: 12.021178, average_heart_rate: 73 } },
  { id: 1553643483, start: "2026-06-07T19:07:41.530Z", end: "2026-06-08T20:02:43.940Z", timezone_offset: "+05:30", score: { strain: 15.074339, average_heart_rate: 75 } },
  { id: 1551264306, start: "2026-06-06T18:45:32.600Z", end: "2026-06-07T19:07:41.530Z", timezone_offset: "+05:30", score: { strain: 5.10102, average_heart_rate: 65 } },
  { id: 1548908212, start: "2026-06-05T20:00:30.850Z", end: "2026-06-06T18:45:32.600Z", timezone_offset: "+05:30", score: { strain: 7.5003357, average_heart_rate: 74 } },
];

async function main() {
  for (const s of sleeps) await upsertSleep(s);
  for (const r of recoveries) await upsertRecovery(r);
  for (const c of cycles) await upsertCycle(c);
  for (const w of workouts) await upsertWorkout(w);
  console.log(`seeded ${workouts.length} workouts, ${sleeps.length} sleeps, ${recoveries.length} recoveries, ${cycles.length} cycles`);
  process.exit(0);
}
main();
