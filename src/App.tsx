import { useMemo, useState } from 'react'

type Screen =
  | 'home' | 'host-q1' | 'host-q2' | 'host-q3' | 'host-q4' | 'host-ready'
  | 'guest-entry' | 'guest-q1' | 'guest-q2' | 'guest-q3' | 'guest-q4' | 'guest-result'
  | 'artist-quiz' | 'artist-reveal'

type Answers = { q1?: string; q2?: string; q3?: string; q4?: string }

type SongOption = { id: string; name: string; artist: string; tone: string; isAnswer: boolean }
type HabitOption = { id: string; title: string; caption: string; art: string; isAnswer: boolean }
type SubjectiveOption = { id: string; title: string; caption: string; art: string }

// 原型数据集中在这里：选项列表同时承载正确答案标记，Q1/Q3 由此推导答案。
// Q1 暂按“单曲循环”口径模拟，正式接数前需要确认和播放次数的定义。
const mockData = {
  q1: {
    prompt: '猜猜2026年，你单曲循环最多的是哪首歌？',
    options: [
      { id: 'song-sunny', name: '晴天', artist: '周杰伦', tone: 'sun', isAnswer: false },
      { id: 'song-moon', name: '若月亮没来', artist: '王宇宙Leto', tone: 'moon', isAnswer: false },
      { id: 'song-blue', name: '蓝色降落伞', artist: '张远', tone: 'blue', isAnswer: true },
      { id: 'song-rain', name: '雨爱', artist: '杨丞琳', tone: 'rain', isAnswer: false },
    ] satisfies SongOption[],
  },
  q2: {
    prompt: '如果一首歌特别好听，但歌词完全听不懂，你会？',
    options: [
      { id: 'q2-loop', title: '照样循环', caption: '好听就够了', art: 'repeat' },
      { id: 'q2-lyrics', title: '马上去搜歌词翻译', caption: '听懂每一句', art: 'stack' },
      { id: 'q2-language', title: '找同语言的其他歌曲', caption: '顺着感觉探索', art: 'globe' },
      { id: 'q2-done', title: '听完就算了', caption: '不强求共鸣', art: 'weekend' },
    ] satisfies SubjectiveOption[],
  },
  q3: {
    prompt: '下面哪件看起来不像你的听歌习惯，竟然真的发生过？',
    options: [
      { id: 'habit-night', title: '某天凌晨听了3小时', caption: '深夜还没睡', art: 'moon', isAnswer: false },
      { id: 'habit-hundred', title: '一天听了100首不同歌曲', caption: '一路探索新歌', art: 'stack', isAnswer: false },
      { id: 'habit-month', title: '连续一个月只听同一位歌手', caption: '循环停不下来', art: 'repeat', isAnswer: true },
      { id: 'habit-oldies', title: '有一周每天都听老歌', caption: '回到熟悉的旋律', art: 'travel', isAnswer: false },
    ] satisfies HabitOption[],
  },
  q4: {
    prompt: '你最不想被朋友发现自己偷偷听哪类歌？',
    options: [
      { id: 'q4-sad', name: '伤感情歌', hue: 'violet', symbol: '☾', line: '情绪藏进夜色里' },
      { id: 'q4-dance', name: '土嗨神曲', hue: 'orange', symbol: '✹', line: '快乐无需解释' },
      { id: 'q4-cartoon', name: '童年动画歌曲', hue: 'green', symbol: '⌁', line: '熟悉的片头响起' },
      { id: 'q4-open', name: '其实没什么不能公开', hue: 'cyan', symbol: '↻', line: '我的歌单我做主' },
    ],
  },
}

const q1Answer = mockData.q1.options.find(option => option.isAnswer)!
const q3Answer = mockData.q3.options.find(option => option.isAnswer)!
const q1Options = mockData.q1.options
const q2Options = mockData.q2.options
const q3Options = mockData.q3.options
const q4Options = mockData.q4.options

const navGroups: { title: string; items: { id: Screen; label: string }[] }[] = [
  { title: '主态 · 发起挑战', items: [
    { id: 'home', label: 'P1 活动首页' }, { id: 'host-q1', label: 'P2 年度歌曲' },
    { id: 'host-q2', label: 'P3 主观认知' }, { id: 'host-q3', label: 'P4 听歌行为' },
    { id: 'host-q4', label: 'P5 隐藏歌单' }, { id: 'host-ready', label: 'P6 生成完成' },
  ] },
  { title: '客态 · 好友作答', items: [
    { id: 'guest-entry', label: 'C1 好友邀请' }, { id: 'guest-q1', label: 'C2 歌曲竞猜' },
    { id: 'guest-q2', label: 'C3 主观选择' }, { id: 'guest-q3', label: 'C4 行为竞猜' },
    { id: 'guest-q4', label: 'C5 隐藏歌单' }, { id: 'guest-result', label: 'C6 双人结果' },
  ] },
  { title: '艺人联动', items: [
    { id: 'artist-quiz', label: '方案A · 初始引流' }, { id: 'artist-reveal', label: '方案B · 彩蛋揭晓' },
  ] },
]

const allScreens = navGroups.flatMap(group => group.items.map(item => item.id))
document.documentElement.classList.toggle(
  'capture-mode',
  new URLSearchParams(window.location.search).get('capture') === '1',
)

function initialScreen(): Screen {
  const value = new URLSearchParams(window.location.search).get('screen') as Screen | null
  return value && allScreens.includes(value) ? value : 'home'
}

function Brand({ dark = false, onReset }: { dark?: boolean; onReset: () => void }) {
  return <header className={`brand ${dark ? 'brand-dark' : ''}`}>
    <button className="brand-name" onClick={onReset} aria-label="返回活动首页">
      <span className="logo-mark">◎</span><span>网易云音乐</span><i></i><b>2026</b>
    </button>
    <button className="restart" onClick={onReset}>重来 ↻</button>
  </header>
}

function PrimaryButton({ children, onClick, disabled = false, light = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; light?: boolean }) {
  return <button className={`primary ${light ? 'primary-light' : ''}`} onClick={onClick} disabled={disabled}>
    <span>{children}</span><b>→</b>
  </button>
}

function Progress({ index, guest = false }: { index: number; guest?: boolean }) {
  return <div className="progress-wrap">
    <span>{guest ? '好友挑战' : '我的挑战'}</span>
    <div className="progress"><i style={{ width: `${index * 25}%` }} /></div>
    <b>{index}/4</b>
  </div>
}

function Vinyl({ small = false }: { small?: boolean }) {
  return <div className={`vinyl ${small ? 'vinyl-small' : ''}`}>
    <i className="vinyl-groove groove-a" /><i className="vinyl-groove groove-b" />
    <span><b>A</b><em>B</em></span>
  </div>
}

function SongCover({ tone }: { tone: string }) {
  return <div className={`song-cover cover-${tone}`}><div className="cover-orbit" /><span>♪</span></div>
}

function BehaviorArt({ type }: { type: string }) {
  return <div className={`behavior-art art-${type}`}>
    <span className="behavior-symbol">{type === 'repeat' ? '30' : type === 'stack' ? '▤' : type === 'travel' ? '✈' : type === 'moon' ? '☾' : type === 'globe' ? '◎' : '☁'}</span>
    <i /><b />
  </div>
}

function TagCard({ tag, selected, onClick }: { tag: (typeof q4Options)[number]; selected: boolean; onClick?: () => void }) {
  return <button className={`tag-card tag-${tag.hue} ${selected ? 'selected' : ''}`} onClick={onClick} disabled={!onClick}>
    <div className="tag-art"><span>{tag.symbol}</span><i /><b /></div>
    <strong>{tag.name}</strong><small>{tag.line}</small>
    {selected && <em className="selected-dot">✓</em>}
  </button>
}

function Home({ go, artist }: { go: (s: Screen) => void; artist: () => void }) {
  return <main className="screen screen-dark home-screen">
    <Brand dark onReset={() => go('home')} />
    <div className="home-copy enter">
      <div className="eyebrow light"><span>2026 年度记忆</span><i>好友默契挑战</i></div>
      <h1>我的2026<br/><span>A</span>B面</h1>
      <p>你听见的是我的日常，<br/>朋友听见的是另一个我。</p>
    </div>
    <div className="hero-record enter delay-1">
      <div className="memory-chip chip-a">循环 127 次</div>
      <Vinyl />
      <div className="memory-chip chip-b">好友来写 B 面</div>
      <div className="tonearm"><i /><b /></div>
    </div>
    <div className="home-actions enter delay-2">
      <PrimaryButton light onClick={() => go('host-q1')}>生成我的2026 AB面</PrimaryButton>
      <button className="artist-teaser" onClick={artist}>
        <span className="artist-avatar">AL</span><span><b>A-Lin 的隐藏 B 面</b><small>先来猜一道 · 模拟内容</small></span><em>›</em>
      </button>
    </div>
    <div className="scribble one">✦</div><div className="scribble two">⌁</div>
  </main>
}

function QuestionShell({ index, guest, children, go, next, disabled = false, nextLabel }: { index: number; guest: boolean; children: React.ReactNode; go: (s: Screen) => void; next: () => void; disabled?: boolean; nextLabel?: string }) {
  return <main className="screen screen-light question-screen">
    <Brand onReset={() => go('home')} />
    <Progress index={index} guest={guest} />
    <div className="question-body">{children}</div>
    <div className="sticky-actions">
      <PrimaryButton onClick={next} disabled={disabled}>{nextLabel ?? (guest && index === 4 ? '提交，查看默契结果' : guest ? '下一题' : index === 4 ? '生成我的AB面' : '下一题')}</PrimaryButton>
    </div>
  </main>
}

function SongQuestion({ host, selected, revealed, onSelect, go, next }: { host: boolean; selected?: string; revealed?: boolean; onSelect?: (id: string) => void; go: (s: Screen) => void; next: () => void }) {
  const chosen = q1Options.find(song => song.id === selected)
  return <QuestionShell index={1} guest={!host} go={go} next={next} disabled={!selected || (host && !revealed)}>
    <div className="question-heading enter"><span className="question-kicker">SINGLE OF THE YEAR</span><h2>{mockData.q1.prompt.replace('你单曲', `${host ? '你' : 'TA'}单曲`)}</h2><p>{host ? '模拟单曲循环数据｜口径待业务确认' : '选一个你觉得最可能的答案，答完统一揭晓'}</p></div>
    <div className="song-list">
      {q1Options.map((song, i) => {
        const active = selected === song.id
        const answerShown = host && revealed && song.isAnswer
        return <button key={song.id} style={{ '--delay': `${i * 80}ms` } as React.CSSProperties} className={`song-option stagger ${active ? 'selected' : ''} ${answerShown ? 'data-answer' : ''}`} onClick={() => (!host || !revealed) && onSelect?.(song.id)} disabled={host && !!revealed}>
          <SongCover tone={song.tone} /><span className="song-meta"><strong>{song.name}</strong><small>{song.artist}</small></span>
          <span className="radio">{active || answerShown ? '✓' : String.fromCharCode(65 + i)}</span>
          {answerShown && <em className="answer-label">模拟真实答案</em>}
        </button>
      })}
    </div>
    {host && revealed && chosen && <div className={`answer-feedback ${chosen.isAnswer ? 'feedback-correct' : 'feedback-wrong'}`} role="status">{chosen.isAnswer ? '猜对啦！你果然了解自己的听歌习惯' : <>原来真正的答案是「{q1Answer.name}」— {q1Answer.artist}</>}</div>}
  </QuestionShell>
}

function SubjectiveQuestion({ index, host, selected, options, tags, prompt, onSelect, go, next }: { index: 2 | 4; host: boolean; selected?: string; options?: SubjectiveOption[]; tags?: typeof q4Options; prompt: string; onSelect: (id: string) => void; go: (s: Screen) => void; next: () => void }) {
  const isQ4 = index === 4
  const heading = isQ4 ? prompt.replace('你最不想', host ? '你最不想' : 'TA最不想') : prompt
  return <QuestionShell index={index} guest={!host} go={go} next={next} disabled={!selected} nextLabel={host && isQ4 ? '完成挑战' : undefined}>
    <div className="question-heading enter"><span className={`question-kicker ${isQ4 ? 'lime' : 'pink'}`}>{isQ4 ? 'YOUR SECRET TRACKS' : 'YOUR LISTENING STYLE'}</span><h2>{heading}</h2><p>{isQ4 ? (host ? '看看朋友会不会猜中你的私藏歌单' : '凭直觉选，答案最后揭晓') : '没有标准答案，选最像自己的反应'}</p></div>
    <div className={isQ4 ? 'tag-grid' : 'behavior-grid four-options'}>
      {isQ4 ? tags?.map((item, i) => <div className="stagger" style={{ '--delay': `${i * 70}ms` } as React.CSSProperties} key={item.id}><TagCard tag={item} selected={selected === item.id} onClick={() => onSelect(item.id)} /></div>) : options?.map((item, i) => <button key={item.id} style={{ '--delay': `${i * 70}ms` } as React.CSSProperties} className={`behavior-card stagger ${selected === item.id ? 'selected' : ''}`} onClick={() => onSelect(item.id)}><BehaviorArt type={item.art} /><strong>{item.title}</strong><small>{item.caption}</small><span className="mini-radio">{selected === item.id ? '✓' : String.fromCharCode(65 + i)}</span></button>)}
    </div>
  </QuestionShell>
}

function HabitQuestion({ host, selected, revealed, onSelect, go, next }: { host: boolean; selected?: string; revealed?: boolean; onSelect?: (id: string) => void; go: (s: Screen) => void; next: () => void }) {
  const chosen = q3Options.find(item => item.id === selected)
  const heading = mockData.q3.prompt.replace('你的听歌', `${host ? '你的' : 'TA的'}听歌`)
  return <QuestionShell index={3} guest={!host} go={go} next={next} disabled={!selected || (host && !revealed)}>
    <div className="question-heading enter"><span className="question-kicker pink">WEIRD BUT TRUE</span><h2>{heading}</h2><p>{host ? '模拟数据，仅用于原型；正式活动需先判断数据条件' : '选一个你觉得最可能的答案，答完统一揭晓'}</p></div>
    <div className="behavior-grid four-options">
      {q3Options.map((item, i) => { const active = selected === item.id; const answerShown = host && revealed && item.isAnswer; return <button key={item.id} style={{ '--delay': `${i * 75}ms` } as React.CSSProperties} className={`behavior-card stagger ${active ? 'selected' : ''} ${answerShown ? 'data-answer' : ''}`} onClick={() => (!host || !revealed) && onSelect?.(item.id)} disabled={host && !!revealed}><BehaviorArt type={item.art} /><strong>{item.title}</strong><small>{item.caption}</small><span className="mini-radio">{active || answerShown ? '✓' : String.fromCharCode(65 + i)}</span>{answerShown && <em className="answer-label">模拟真实答案</em>}</button>})}
    </div>
    {host && revealed && chosen && <div className={`answer-feedback ${chosen.isAnswer ? 'feedback-correct' : 'feedback-wrong'}`} role="status">{chosen.isAnswer ? '猜对啦！你果然了解自己的听歌习惯' : <>原来真正发生过的是「{q3Answer.title}」</>}</div>}
  </QuestionShell>
}

function HostReady({ go, hostAnswers, copy }: { go: (s: Screen) => void; hostAnswers: Answers; copy: () => void }) {
  const selfSong = q1Options.find(x => x.id === hostAnswers.q1)
  const selfHabit = q3Options.find(x => x.id === hostAnswers.q3)
  const q2 = q2Options.find(x => x.id === hostAnswers.q2)
  const tag = q4Options.find(t => t.id === hostAnswers.q4) ?? q4Options[0]
  return <main className="screen screen-dark ready-screen scrollable">
    <Brand dark onReset={() => go('home')} />
    <div className="ready-heading enter"><span className="question-kicker lime">A SIDE COMPLETE</span><h2>我的2026 A面<br/>已经写好了</h2><p>现在，等你来猜。</p></div>
    <div className="mini-record-card enter delay-1"><Vinyl small /><div><span>A SIDE · 真实的我</span><strong>季莫申科科科</strong><small>4 道年度音乐印记</small></div><em>READY</em></div>
    <div className="answer-tape">
      <div><span>01</span><p><b>{selfSong?.name ?? '尚未选择'}</b><small>我的选择 · {selfSong?.isAnswer ? '自测答对' : '自测未答对'}</small></p></div>
      <div><span>02</span><p><b>{q2?.title ?? '尚未选择'}</b><small>我眼中的自己</small></p></div>
      <div><span>03</span><p><b>{selfHabit?.title ?? '尚未选择'}</b><small>我的选择 · {selfHabit?.isAnswer ? '自测答对' : '自测未答对'}</small></p></div>
      <div><span>04</span><p><b>{tag.name}</b><small>我偷偷听的歌</small></p></div>
    </div>
    <p className="ready-note">Q1、Q3为原型模拟数据；主态自测不计入好友排行榜。</p>
    <div className="b-side-empty"><span>B SIDE</span><div className="empty-disc">?</div><p>还没有人写下<br/>眼中的你</p></div>
    <div className="ready-actions"><PrimaryButton light onClick={copy}>邀请好友挑战</PrimaryButton><button className="secondary-dark" onClick={() => go('guest-entry')}>体验好友视角</button></div>
  </main>
}

function GuestEntry({ go }: { go: (s: Screen) => void }) {
  return <main className="screen screen-dark guest-entry-screen">
    <Brand dark onReset={() => go('home')} />
    <div className="invite-top enter"><span className="avatar">季</span><p><b>季莫申科科科</b> 向你发来一张唱片</p></div>
    <div className="guest-record enter delay-1"><Vinyl /><div className="guest-sticker">懂我吗？</div></div>
    <div className="invite-copy enter delay-2"><span>FRIEND TEST · 04 QUESTIONS</span><h1>4道题，看看你到底<br/>懂不懂TA的2026？</h1><p>答案最后一起揭晓</p></div>
    <div className="bottom-button"><PrimaryButton light onClick={() => go('guest-q1')}>开始挑战</PrimaryButton></div>
  </main>
}

function GuestResult({ go, answers, hostAnswers, artist }: { go: (s: Screen) => void; answers: Answers; hostAnswers: Answers; artist: () => void }) {
  const guestSong = q1Options.find(x => x.id === answers.q1)
  const hostSong = q1Options.find(x => x.id === hostAnswers.q1)
  const guestHabit = q3Options.find(x => x.id === answers.q3)
  const hostHabit = q3Options.find(x => x.id === hostAnswers.q3)
  const hostQ2 = q2Options.find(x => x.id === hostAnswers.q2)
  const guestQ2 = q2Options.find(x => x.id === answers.q2)
  const hostQ4 = q4Options.find(x => x.id === hostAnswers.q4)
  const guestQ4 = q4Options.find(x => x.id === answers.q4)
  const q1Hit = answers.q1 === q1Answer.id
  const q3Hit = answers.q3 === q3Answer.id
  const q2Match = answers.q2 === hostAnswers.q2
  const q4Match = answers.q4 === hostAnswers.q4
  const score = Number(q1Hit) + Number(q2Match) + Number(q3Hit) + Number(q4Match)
  const surprise = (q1Hit && hostAnswers.q1 !== q1Answer.id) || (q3Hit && hostAnswers.q3 !== q3Answer.id)
  return <main className="screen screen-dark result-screen scrollable">
    <Brand dark onReset={() => go('home')} />
    <div className="score-hero enter"><span>MUSIC CHEMISTRY</span><div className="score-number"><b>{score}</b><em>/4</em></div><h2>{score === 4 ? '默契满格，像共用一副耳机' : score >= 3 ? '很懂，但还藏着一点B面' : score >= 2 ? '熟悉的歌里，也有意外答案' : '原来你认识的是另一个TA'}</h2></div>
    <div className="result-record"><div className="half half-a">A</div><div className="half half-b">B</div><i /></div>
    <section className="side-sheet">
      <div className="side-head"><div><span>A SIDE</span><b>真实的我</b></div><div><span>B SIDE</span><b>你眼中的我</b></div></div>
      <div className="comparison-list">
        <div className="comparison"><div className="compare-label"><span>01</span>年度单曲竞猜<em className={q1Hit ? 'hit' : 'miss'}>{q1Hit ? '好友答对 +1' : '未命中'}</em></div><div className="answer-columns"><div><small>我的选择</small><b>{hostSong?.name ?? '未作答'}</b></div><div><small>好友猜测</small><b>{guestSong?.name ?? '未作答'}</b></div><div className="true-answer"><small>网易云真实答案 · 模拟</small><b>{q1Answer.name} — {q1Answer.artist}</b></div></div><small className="self-test">主态自测：{hostSong?.isAnswer ? '答对' : '未答对'}（不计入好友排行）</small></div>
        <div className="comparison"><div className="compare-label"><span>02</span>歌词听不懂时<em className={q2Match ? 'hit' : 'miss'}>{q2Match ? '默契 +1' : '认知不同'}</em></div><div className="compare-values"><b>{hostQ2?.title ?? '未作答'}</b><i>{q2Match ? '=' : '≠'}</i><b>{guestQ2?.title ?? '未作答'}</b></div><div className="pair-labels"><span>我眼中的自己</span><span>好友眼中的我</span></div></div>
        <div className="comparison"><div className="compare-label"><span>03</span>年度听歌行为<em className={q3Hit ? 'hit' : 'miss'}>{q3Hit ? '好友答对 +1' : '未命中'}</em></div><div className="answer-columns"><div><small>我的选择</small><b>{hostHabit?.title ?? '未作答'}</b></div><div><small>好友猜测</small><b>{guestHabit?.title ?? '未作答'}</b></div><div className="true-answer"><small>网易云真实答案 · 模拟</small><b>{q3Answer.title}</b></div></div><small className="self-test">主态自测：{hostHabit?.isAnswer ? '答对' : '未答对'}（不计入好友排行）</small></div>
        <div className="comparison"><div className="compare-label"><span>04</span>偷偷听的歌<em className={q4Match ? 'hit' : 'miss'}>{q4Match ? '默契 +1' : '认知不同'}</em></div><div className="compare-values"><b>{hostQ4?.name ?? '未作答'}</b><i>{q4Match ? '=' : '≠'}</i><b>{guestQ4?.name ?? '未作答'}</b></div><div className="pair-labels"><span>我眼中的自己</span><span>好友眼中的我</span></div></div>
      </div>
      <p className="result-data-note">Q1、Q3答案均为原型Mock Data；不代表真实用户记录。</p>
      <div className={`contrast-copy ${q4Match && !surprise ? 'same' : ''}`}><span>{surprise ? 'PLOT TWIST' : q4Match ? 'SAME WAVELENGTH' : 'A SIDE / B SIDE'}</span><p>{surprise ? '没想到TA比你自己，还懂你的听歌记录！' : q4Match ? '原来我们对我的歌品，真的想到一起去了。' : <>我觉得自己是<strong>{hostQ4?.name}</strong>，<br/>但你觉得我是<strong>{guestQ4?.name}</strong>。</>}</p></div>
    </section>
    <div className="result-actions"><PrimaryButton light onClick={() => shareResult(score)}>分享我的结果</PrimaryButton><div><button onClick={() => go('guest-entry')}>再挑战一次</button><button onClick={() => go('host-q1')}>发起我的AB面</button></div></div>
    <button className="artist-egg" onClick={artist}><span className="artist-avatar big">AL</span><span><small>ARTIST BONUS · 模拟内容</small><b>你猜懂了TA，<br/>那你猜得懂A-Lin的隐藏B面吗？</b></span><em>→</em></button>
    <p className="prototype-note">艺人照片、歌曲与答案均为原型占位，不代表艺人本人确认。</p>
  </main>
}

async function shareResult(score: number) {
  const text = `我和好友的2026音乐默契是 ${score}/4，你也来挑战？（原型演示）`
  if (navigator.share) await navigator.share({ title: '我的2026 AB面', text }).catch(() => {})
  else await navigator.clipboard?.writeText(text)
}

function ArtistFlow({ reveal, selected, onSelect, go, back }: { reveal: boolean; selected?: string; onSelect: (id: string) => void; go: (s: Screen) => void; back: () => void }) {
  return <main className="screen artist-screen scrollable">
    <Brand dark onReset={() => go('home')} />
    <div className="artist-glow" />
    <div className="artist-profile enter"><div className="artist-portrait"><span>A</span><i /></div><div><span>ARTIST B SIDE · DEMO</span><h1>A-Lin</h1><p>艺人联动模拟素材</p></div></div>
    {!reveal ? <>
      <div className="artist-question enter delay-1"><span>隐藏 B 面 · 01</span><h2>如果把舞台灯光关掉，<br/>哪首歌更像她此刻的心情？</h2></div>
      <div className="artist-options">
        {[{ id: 'lost', name: '失恋无罪', sub: 'LIVE VERSION', tone: 'magenta' }, { id: 'sea', name: '给我一个理由忘记', sub: 'ACOUSTIC VERSION', tone: 'aqua' }, { id: 'light', name: '挚友', sub: 'MIDNIGHT VERSION', tone: 'gold' }].map((x, i) => <button className={`artist-song stagger ${selected === x.id ? 'selected' : ''}`} style={{ '--delay': `${i * 80}ms` } as React.CSSProperties} onClick={() => onSelect(x.id)} key={x.id}><div className={`artist-cover ${x.tone}`}>♪</div><span><b>{x.name}</b><small>{x.sub}</small></span><em>{selected === x.id ? '✓' : `0${i + 1}`}</em></button>)}
      </div>
      <div className="bottom-button artist-bottom"><PrimaryButton light onClick={() => go('artist-reveal')} disabled={!selected}>揭晓隐藏B面</PrimaryButton><button className="skip-artist" onClick={back}>跳过，生成我的AB面</button></div>
    </> : <>
      <div className="artist-reveal enter delay-1"><div className="reveal-disc"><i /><span>♪</span></div><span>模拟揭晓</span><h2>给我一个理由忘记</h2><p>ACOUSTIC VERSION</p><button className="play-demo" aria-label="模拟试听"><b>▶</b><span><i /></span><em>00:18</em></button><blockquote>“有些歌在舞台上很亮，<br/>在耳机里却有另一面。”</blockquote></div>
      <div className="bottom-button artist-bottom"><PrimaryButton light onClick={back}>生成我的2026 AB面</PrimaryButton></div>
    </>}
    <button className="artist-close" onClick={back}>×</button>
  </main>
}

function DemoNav({ screen, go, reset }: { screen: Screen; go: (s: Screen) => void; reset: () => void }) {
  return <aside className="demo-nav"><div className="demo-title"><span>♫</span><div><b>AB面 · 交互原型</b><small>DESKTOP DEMO CONSOLE</small></div></div><div className="demo-status"><i /> 当前为可交互演示</div>
    <nav>{navGroups.map(group => <section key={group.title}><h3>{group.title}</h3>{group.items.map(item => <button key={item.id} className={screen === item.id ? 'active' : ''} onClick={() => go(item.id)}><span>{item.label}</span><em>›</em></button>)}</section>)}</nav>
    <div className="demo-tips"><b>评审提示</b><p>建议先完整走一遍主态，再从 P6 进入好友视角。不同答案会实时改变 C6 得分。</p></div><button className="reset-demo" onClick={reset}>↻ 重置全部演示状态</button>
  </aside>
}

export default function App() {
  const firstScreen = initialScreen()
  const [screen, setScreen] = useState<Screen>(firstScreen)
  const demoHostAnswers: Answers = { q1: 'song-sunny', q2: 'q2-loop', q3: 'habit-night', q4: 'q4-sad' }
  const demoGuestAnswers: Answers = { q1: q1Answer.id, q2: 'q2-loop', q3: q3Answer.id, q4: 'q4-sad' }
  const [hostAnswers, setHostAnswers] = useState<Answers>(firstScreen === 'home' || firstScreen.startsWith('host-q') ? {} : demoHostAnswers)
  const [answers, setAnswers] = useState<Answers>(firstScreen === 'guest-result' ? demoGuestAnswers : {})
  const [hostRevealed, setHostRevealed] = useState<{ q1: boolean; q3: boolean }>({ q1: false, q3: false })
  const [artistChoice, setArtistChoice] = useState<string | undefined>(firstScreen === 'artist-reveal' ? 'sea' : undefined)
  const [artistReturn, setArtistReturn] = useState<'home' | 'result'>('home')
  const [toast, setToast] = useState('')

  const reset = () => { setScreen('home'); setHostAnswers({}); setAnswers({}); setHostRevealed({ q1: false, q3: false }); setArtistChoice(undefined); setToast('') }
  const setAnswer = (key: keyof Answers, value: string) => setAnswers(prev => ({ ...prev, [key]: value }))
  const setHostAnswer = (key: keyof Answers, value: string) => setHostAnswers(prev => ({ ...prev, [key]: value }))
  const ensureDemoState = (target: Screen) => {
    if (target === 'host-q1') { setHostAnswers({}); setAnswers({}); setHostRevealed({ q1: false, q3: false }) }
    if (target === 'guest-entry') setAnswers({})
    if ((target === 'host-ready' || target.startsWith('guest')) && !hostAnswers.q4) setHostAnswers(demoHostAnswers)
    if (target === 'guest-result') setAnswers(prev => Object.keys(prev).length === 4 ? prev : demoGuestAnswers)
    if (target === 'artist-reveal' && !artistChoice) setArtistChoice('sea')
    setScreen(target)
  }
  const openArtist = (from: 'home' | 'result') => { setArtistReturn(from); setArtistChoice(undefined); setScreen('artist-quiz') }
  const leaveArtist = () => {
    if (artistReturn === 'result') setScreen('guest-result')
    else { setHostAnswers({}); setAnswers({}); setHostRevealed({ q1: false, q3: false }); setScreen('host-q1') }
  }
  const copyInvite = async () => { await navigator.clipboard?.writeText('https://music.163.com/2026-ab-side/demo'); setToast('邀请链接已复制（模拟）'); window.setTimeout(() => setToast(''), 1800) }

  const page = useMemo(() => {
    switch (screen) {
      case 'home': return <Home go={ensureDemoState} artist={() => openArtist('home')} />
      case 'host-q1': return <SongQuestion host selected={hostAnswers.q1} revealed={hostRevealed.q1} onSelect={v => { setHostAnswer('q1', v); setHostRevealed(prev => ({ ...prev, q1: true })) }} go={ensureDemoState} next={() => setScreen('host-q2')} />
      case 'host-q2': return <SubjectiveQuestion index={2} host selected={hostAnswers.q2} options={q2Options} prompt={mockData.q2.prompt} onSelect={v => setHostAnswer('q2', v)} go={ensureDemoState} next={() => setScreen('host-q3')} />
      case 'host-q3': return <HabitQuestion host selected={hostAnswers.q3} revealed={hostRevealed.q3} onSelect={v => { setHostAnswer('q3', v); setHostRevealed(prev => ({ ...prev, q3: true })) }} go={ensureDemoState} next={() => setScreen('host-q4')} />
      case 'host-q4': return <SubjectiveQuestion index={4} host selected={hostAnswers.q4} tags={q4Options} prompt={mockData.q4.prompt} onSelect={v => setHostAnswer('q4', v)} go={ensureDemoState} next={() => setScreen('host-ready')} />
      case 'host-ready': return <HostReady go={ensureDemoState} hostAnswers={hostAnswers} copy={copyInvite} />
      case 'guest-entry': return <GuestEntry go={ensureDemoState} />
      case 'guest-q1': return <SongQuestion host={false} selected={answers.q1} onSelect={v => setAnswer('q1', v)} go={ensureDemoState} next={() => setScreen('guest-q2')} />
      case 'guest-q2': return <SubjectiveQuestion index={2} host={false} selected={answers.q2} options={q2Options} prompt={mockData.q2.prompt} onSelect={v => setAnswer('q2', v)} go={ensureDemoState} next={() => setScreen('guest-q3')} />
      case 'guest-q3': return <HabitQuestion host={false} selected={answers.q3} onSelect={v => setAnswer('q3', v)} go={ensureDemoState} next={() => setScreen('guest-q4')} />
      case 'guest-q4': return <SubjectiveQuestion index={4} host={false} selected={answers.q4} tags={q4Options} prompt={mockData.q4.prompt} onSelect={v => setAnswer('q4', v)} go={ensureDemoState} next={() => setScreen('guest-result')} />
      case 'guest-result': return <GuestResult go={ensureDemoState} answers={answers} hostAnswers={hostAnswers} artist={() => openArtist('result')} />
      case 'artist-quiz': return <ArtistFlow reveal={false} selected={artistChoice} onSelect={setArtistChoice} go={ensureDemoState} back={leaveArtist} />
      case 'artist-reveal': return <ArtistFlow reveal selected={artistChoice} onSelect={setArtistChoice} go={ensureDemoState} back={leaveArtist} />
    }
  }, [screen, hostAnswers, answers, hostRevealed, artistChoice])

  return <div className="app-shell"><DemoNav screen={screen} go={ensureDemoState} reset={reset} /><div className="phone-stage"><div className="phone-frame" key={screen}>{page}</div><p className="viewport-label">390 × 844 · MOBILE H5</p></div>{toast && <div className="toast">✓ {toast}</div>}</div>
}
