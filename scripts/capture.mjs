import { mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const outputDir = resolve('screenshots/v3')
mkdirSync(outputDir, { recursive: true })

const pages = [
  ['01-home.png', 'screen=home'],
  ['02-a02-data.png', 'screen=host-edit&question=A02'],
  ['03-a07-fun.png', 'screen=host-edit&question=A07'],
  ['04-a-complete.png', 'screen=host-result'],
  ['05-b-unknown-vinyl.png', 'screen=host-result&side=B'],
  ['06-b-four-topics.png', 'screen=host-result&side=B&focus=picker'],
  ['07-b-switched-topic.png', 'screen=host-result&side=B&b=B04&focus=picker'],
  ['08-guest-song.png', 'view=guest&a=A01%3As25%2CA03%3As20%2CA05%3As09%2CA06%3As21&b=B03&name=%E9%98%BF%E4%BA%91'],
  ['09-guest-result.png', 'screen=guest-result'],
  ['10-one-friend.png', 'screen=host-result&demo=1&side=B&focus=wall'],
  ['11-three-friends.png', 'screen=host-result&demo=3&side=B&focus=wall'],
  ['12-many-friends.png', 'screen=host-result&demo=6&side=B&focus=wall'],
]

for (const [file, route] of pages) {
  const result = spawnSync(chrome, [
    '--headless=new', '--hide-scrollbars', '--disable-gpu', '--no-first-run',
    '--force-device-scale-factor=1', '--window-size=390,844',
    '--run-all-compositor-stages-before-draw', '--virtual-time-budget=1200',
    `--screenshot=${resolve(outputDir, file)}`,
    `http://127.0.0.1:5173/?${route}&capture=1`,
  ], { encoding: 'utf8' })
  if (result.status !== 0) {
    process.stderr.write(result.stderr || `Failed to capture ${file}\n`)
    process.exit(result.status ?? 1)
  }
  process.stdout.write(`Captured ${file}\n`)
}
