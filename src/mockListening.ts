// 评审演示快照。全部为虚构记录，不代表真实网易云音乐用户数据。
type SongStats = {
  yearPlays?: number
  last7Plays?: number
  last30Plays?: number
  lateNightPlays?: number
  eveningPlays?: number
  playEvents?: string[]
  monthlyPlayCounts?: Record<string, number>
  firstPlayedAt?: string
  playsAfterFirst?: number
  heartedAt?: string
  isHearted?: boolean
}

export type MockListeningProfile = {
  snapshotDate: string
  annualRanking: string[]
  artistYearPlays: Record<string, number>
  songStats: Record<string, SongStats>
}

export const mockListeningProfiles: Record<'sample' | 'newUser', MockListeningProfile> = {
  sample: {
    snapshotDate: '2026-10-28',
    annualRanking: ['s19', 's01', 's18', 's08', 's24', 's29', 's31', 's20', 's03', 's30', 's33', 's17', 's28', 's32'],
    artistYearPlays: {'G.E.M.邓紫棋': 112},
    songStats: {
      s19: {yearPlays: 128},
      s01: {yearPlays: 93, last30Plays: 23},
      s18: {yearPlays: 67},
      s08: {yearPlays: 55, monthlyPlayCounts: {'2026-06': 4, '2026-07': 6, '2026-08': 7, '2026-09': 4, '2026-10': 8}},
      s24: {yearPlays: 54, last7Plays: 6},
      s29: {yearPlays: 45, playEvents: ['2026-10-01T22:11', '2026-10-02T21:04', '2026-10-03T23:08', '2026-10-04T22:17', '2026-10-05T21:20', '2026-10-06T22:02', '2026-10-07T23:14', '2026-10-08T21:39', '2026-10-09T22:51']},
      s31: {yearPlays: 42},
      s20: {yearPlays: 40, playEvents: ['2026-02-11T03:08', '2026-03-27T03:31', '2026-05-04T03:02', '2026-07-19T03:47', '2026-10-06T03:19']},
      s03: {yearPlays: 39, monthlyPlayCounts: {'2026-06': 5, '2026-07': 7, '2026-08': 8, '2026-09': 9, '2026-10': 10}},
      s30: {yearPlays: 37, heartedAt: '2026-03-08', isHearted: true},
      s33: {yearPlays: 36, eveningPlays: 14},
      s17: {yearPlays: 33, firstPlayedAt: '2026-05-12T14:30', playsAfterFirst: 32},
      s28: {yearPlays: 26, lateNightPlays: 11},
      s32: {yearPlays: 24, last30Plays: 16},
    },
  },
  newUser: {snapshotDate: '2026-10-28', annualRanking: [], artistYearPlays: {}, songStats: {}},
}

const monthStreak = (counts?: Record<string, number>) => {
  if (!counts) return 0
  const months = Object.entries(counts).filter(([, count]) => count > 0).map(([month]) => month).sort()
  let longest = 0, current = 0, previous = -2
  for (const month of months) {
    const [year, number] = month.split('-').map(Number)
    const index = year * 12 + number
    current = index === previous + 1 ? current + 1 : 1
    longest = Math.max(longest, current)
    previous = index
  }
  return longest
}

const distinctDatesAtHour = (events: string[] | undefined, hour: number) =>
  new Set((events ?? []).filter(time => Number(time.slice(11, 13)) === hour).map(time => time.slice(0, 10))).size

const recentNightDates = (events: string[] | undefined, snapshotDate: string) => {
  const snapshot = Date.parse(snapshotDate + 'T00:00:00Z')
  return new Set((events ?? []).filter(time => {
    const hour = Number(time.slice(11, 13))
    const age = (snapshot - Date.parse(time.slice(0, 10) + 'T00:00:00Z')) / 86400000
    return hour >= 20 && hour <= 23 && age >= 0 && age < 30
  }).map(time => time.slice(0, 10))).size
}

export function mockReasonFor(questionId: string, songId: string, profile: MockListeningProfile = mockListeningProfiles.sample): string | undefined {
  const stats = profile.songStats[songId]
  if (!stats) return undefined
  const plays = stats.yearPlays
  const rank = profile.annualRanking.indexOf(songId) + 1
  if (questionId === 'A02') {
    if (songId === 's19' && plays !== undefined && rank === 1) return `2026年累计播放${plays}次，年度播放TOP 1`
    if (songId === 's18' && plays !== undefined && rank === 3) return `今年累计播放${plays}次，年度播放TOP 3`
    if (songId === 's08' && monthStreak(stats.monthlyPlayCounts) >= 5) return '连续5个月，你都听过这首歌'
    if (songId === 's01' && stats.last30Plays !== undefined) return `最近30天，你又听了${stats.last30Plays}次`
  }
  if (questionId === 'A03') {
    const threeAmDates = distinctDatesAtHour(stats.playEvents, 3)
    if (songId === 's20' && threeAmDates >= 5) return `今年有${threeAmDates}个凌晨3点，你都点开过这首歌`
    if (songId === 's28' && plays !== undefined && stats.lateNightPlays !== undefined && stats.lateNightPlays <= plays) return `2026年听了${plays}次，其中${stats.lateNightPlays}次是在深夜`
    if (songId === 's03' && monthStreak(stats.monthlyPlayCounts) >= 5) return '从6月到10月，连续5个月都出现在你的播放记录里'
    if (songId === 's17' && stats.firstPlayedAt && stats.playsAfterFirst !== undefined && plays === stats.playsAfterFirst + 1) return `今年第一次听到它后，你又听了${stats.playsAfterFirst}次`
  }
  if (questionId === 'A04') {
    if (songId === 's31' && plays !== undefined) return `2026年，你累计播放了${plays}次`
    if (songId === 's08' && profile.artistYearPlays['G.E.M.邓紫棋'] !== undefined) return `今年听邓紫棋的歌累计${profile.artistYearPlays['G.E.M.邓紫棋']}次`
    if (songId === 's32' && stats.last30Plays !== undefined) return `最近30天，这首歌播放了${stats.last30Plays}次`
  }
  if (questionId === 'A05') {
    const nights = recentNightDates(stats.playEvents, profile.snapshotDate)
    if (songId === 's29' && nights >= 9) return `最近30天，有${nights}个夜晚听过这首歌`
    if (songId === 's24' && plays !== undefined && stats.last7Plays !== undefined) return `今年反复听了${plays}次，最近一周又听了${stats.last7Plays}次`
    if (songId === 's30' && stats.isHearted && stats.heartedAt) return `这首歌从${Number(stats.heartedAt.slice(5, 7))}月起，一直留在你的红心列表里`
    if (songId === 's33' && plays !== undefined && stats.eveningPlays !== undefined && stats.eveningPlays <= plays) return `今年累计播放${plays}次，其中${stats.eveningPlays}次在晚上`
  }
  return plays === undefined ? undefined : `2026年累计播放${plays}次`
}
