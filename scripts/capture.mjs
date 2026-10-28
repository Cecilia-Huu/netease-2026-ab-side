import { mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const outputDir = resolve('screenshots/v2')
mkdirSync(outputDir, { recursive: true })

const pages = [
  ['01-home.png', 'screen=home'],
  ['02-host-a01.png', 'screen=host-edit'],
  ['03-host-a03.png', 'screen=host-edit&step=1'],
  ['04-host-a05.png', 'screen=host-edit&step=2'],
  ['05-host-a06.png', 'screen=host-edit&step=3'],
  ['06-a-side-empty-b.png', 'screen=host-result'],
  ['07-b-side-one-friend.png', 'screen=host-result&demo=1&side=B'],
  ['08-b-side-three-friends.png', 'screen=host-result&demo=3&side=B'],
  ['09-guest-entry.png', 'screen=guest-entry'],
  ['10-guest-topic.png', 'screen=guest-topic'],
  ['11-guest-song.png', 'screen=guest-song'],
  ['12-guest-contribution.png', 'screen=guest-result'],
  ['13-artist-entry.png', 'screen=artist-quiz'],
  ['14-artist-reveal.png', 'screen=artist-reveal'],
]

for (const [file, route] of pages) {
  const result = spawnSync(chrome, [
    '--headless=new', '--hide-scrollbars', '--disable-gpu', '--no-first-run',
    '--force-device-scale-factor=1', '--window-size=390,844',
    '--run-all-compositor-stages-before-draw', '--virtual-time-budget=1000',
    `--screenshot=${resolve(outputDir, file)}`,
    `http://127.0.0.1:5173/?${route}&capture=1`,
  ], { encoding: 'utf8' })
  if (result.status !== 0) {
    process.stderr.write(result.stderr || `Failed to capture ${file}\n`)
    process.exit(result.status ?? 1)
  }
  process.stdout.write(`Captured ${file}\n`)
}
