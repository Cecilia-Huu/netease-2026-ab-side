import { mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const outputDir = resolve('screenshots/result-conversion')
mkdirSync(outputDir, { recursive: true })

const mobilePages = [
  ['01-a-side-play.png', 'screen=host-result&demo=3&side=A'],
  ['02-b-side-play.png', 'screen=host-result&demo=3&side=B'],
  ['03-annual-notes.png', 'screen=host-result&demo=3&side=A&focus=tracks'],
  ['04-question-picker.png', 'screen=host-result&demo=3&side=A&focus=picker'],
  ['05-fixed-invite.png', 'screen=host-result&demo=1&side=B'],
]

for (const [file, route] of mobilePages) {
  const result = spawnSync(chrome, [
    '--headless=new', '--hide-scrollbars', '--disable-gpu', '--no-first-run',
    '--force-device-scale-factor=1', '--window-size=390,844',
    '--run-all-compositor-stages-before-draw', '--virtual-time-budget=1400',
    `--screenshot=${resolve(outputDir, file)}`,
    `http://127.0.0.1:5175/?${route}&capture=1`,
  ], { encoding: 'utf8' })
  if (result.status !== 0) {
    process.stderr.write(result.stderr || `Failed to capture ${file}\n`)
    process.exit(result.status ?? 1)
  }
  process.stdout.write(`Captured ${file}\n`)
}

const desktopResult = spawnSync(chrome, [
  '--headless=new', '--hide-scrollbars', '--disable-gpu', '--no-first-run',
  '--force-device-scale-factor=1', '--window-size=1440,1000',
  '--run-all-compositor-stages-before-draw', '--virtual-time-budget=1400',
  `--screenshot=${resolve(outputDir, '06-desktop-nav-artist-hidden.png')}`,
  'http://127.0.0.1:5175/?screen=host-result&demo=3&side=A',
], { encoding: 'utf8' })

if (desktopResult.status !== 0) {
  process.stderr.write(desktopResult.stderr || 'Failed to capture desktop navigation\n')
  process.exit(desktopResult.status ?? 1)
}
process.stdout.write('Captured 06-desktop-nav-artist-hidden.png\n')
