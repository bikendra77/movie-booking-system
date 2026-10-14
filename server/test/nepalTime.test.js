import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compareShowtimesByNepalTime,
  getShowtimeInstant,
  isShowtimeInFuture
} from '../src/lib/nepalTime.js';
import {
  getKathmanduShowtimeInstant,
  isKathmanduShowtimeInFuture
} from '../../src/utils/dates.js';

const nepalDate = '2026-10-14';
const nepalThreePm = new Date('2026-10-14T09:15:00.000Z');

test('converts Nepal local date and 12-hour time to the correct instant', () => {
  assert.equal(getShowtimeInstant(nepalDate, '01:00 PM')?.toISOString(), '2026-10-14T07:15:00.000Z');
  assert.equal(getShowtimeInstant(nepalDate, '03:00 PM')?.toISOString(), nepalThreePm.toISOString());
  assert.equal(getShowtimeInstant(nepalDate, '12:00 AM')?.toISOString(), '2026-10-13T18:15:00.000Z');
  assert.equal(getKathmanduShowtimeInstant(nepalDate, '04:00 PM')?.toISOString(), '2026-10-14T10:15:00.000Z');
});

test('compares full Nepal date and time, including future shows today', () => {
  const showtime = time => ({ date: nepalDate, time });
  assert.equal(isShowtimeInFuture(showtime('01:00 PM'), nepalThreePm), false);
  assert.equal(isShowtimeInFuture(showtime('03:00 PM'), nepalThreePm), false);
  assert.equal(isShowtimeInFuture(showtime('04:00 PM'), nepalThreePm), true);
  assert.equal(isShowtimeInFuture({ date: '2026-10-15', time: '07:30 PM' }, nepalThreePm), true);
  assert.equal(isKathmanduShowtimeInFuture(showtime('01:00 PM'), nepalThreePm), false);
  assert.equal(isKathmanduShowtimeInFuture(showtime('04:00 PM'), nepalThreePm), true);
});

test('rejects invalid calendar dates and showtime values', () => {
  assert.equal(getShowtimeInstant('2026-02-30', '04:00 PM'), null);
  assert.equal(getShowtimeInstant(nepalDate, '13:00 PM'), null);
  assert.equal(getShowtimeInstant(nepalDate, '04:60 PM'), null);
  assert.equal(getKathmanduShowtimeInstant(nepalDate, '04:00'), null);
});

test('sorts showtimes by their Nepal local date and time', () => {
  const showtimes = [
    { date: '2026-10-14', time: '01:00 PM' },
    { date: '2026-10-14', time: '09:00 AM' },
    { date: '2026-10-15', time: '07:30 PM' }
  ];
  assert.deepEqual(showtimes.sort(compareShowtimesByNepalTime), [
    { date: '2026-10-14', time: '09:00 AM' },
    { date: '2026-10-14', time: '01:00 PM' },
    { date: '2026-10-15', time: '07:30 PM' }
  ]);
});
