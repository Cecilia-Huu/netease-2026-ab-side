import { mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const outputDir = resolve('screenshots')
mkdirSync(outputDir, { recursive: true })

const pages = [
  ['01-home.png', 'home'],
  ['02-host-q1.png', 'host-q1'],
  ['03-host-q2.png', 'host-q2'],
  ['04-host-q3.png', 'host-q3'],
  ['05-host-q4.png', 'host-q4'],
  ['06-host-empty-result.png', 'host-ready'],
  ['07-guest-entry.png', 'guest-entry'],
  ['08-guest-q3.png', 'guest-q3'],
  ['09-guest-q4.png', 'guest-q4'],
  ['10-guest-result.png', 'guest-result'],
  ['11-artist-entry.png', 'artist-quiz'],
  ['12-artist-easter-egg.png', 'artist-reveal'],
]

for (const [file, screen] of pages) {
  const result = spawnSync(chrome, [
    '--headless=new',
    '--hide-scrollbars',
    '--disable-gpu',
    '--no-first-run',
    '--force-device-scale-factor=1',
    '--window-size=390,844',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=1200',
    `--screenshot=${resolve(outputDir, file)}`,
    `http://127.0.0.1:5173/?screen=${screen}&capture=1`,
  ], { encoding: 'utf8' })

  if (result.status !== 0) {
    process.stderr.write(result.stderr || `Failed to capture ${file}\n`)
    process.exit(result.status ?? 1)
  }
  process.stdout.write(`Captured ${file}\n`)
}
