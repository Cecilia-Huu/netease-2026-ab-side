import { useMemo, useState } from 'react'

type Screen =
  | 'home' | 'host-q1' | 'host-q2' | 'host-q3' | 'host-q4' | 'host-ready'
  | 'guest-entry' | 'guest-q1' | 'guest-q2' | 'guest-q3' | 'guest-q4' | 'guest-result'
  | 'artist-quiz' | 'artist-reveal'

type Answers = { q1?: string; q2?: string; q3?: string; q4?: string }

const songSets = [
  [
    { id: 'sunny', name: '晴天', artist: '周杰伦', tone: 'sun', correct: true },
    { id: 'moon', name: '若月亮没来', artist: '王宇宙Leto', tone: 'moon', correct: false },
    { id: 'friend', name: '普通朋友', artist: '陶喆', tone: 'blue', correct: false },
  ],
  [
    { id: 'rain', name: '雨爱', artist: '杨丞琳', tone: 'rain', correct: true },
    { id: 'star', name: '水星记', artist: '郭顶', tone: 'space', correct: false },
    { id: 'bird', name: '小半', artist: '陈粒', tone: 'green', correct: false },
  ],
]

const behaviorSets = [
  [
    { id: 'repeat30', title: '连续30天', caption: '听同一位歌手', art: 'repeat', correct: true },
    { id: 'playlists', title: '创建10多个', caption: '新的歌单', art: 'stack', correct: false },
    { id: 'travel', title: '旅途中听歌', caption: '比在家更多', art: 'travel', correct: false },
  ],
  [
    { id: 'midnight', title: '凌晨三点', caption: '还在单曲循环', art: 'moon', correct: true },
    { id: 'languages', title: '听遍8种', caption: '语言的歌曲', art: 'globe', correct: false },
    { id: 'weekend', title: '周末听歌', caption: '少于工作日', art: 'weekend', correct: false },
  ],
]

const campSets = [
  [
    { id: 'loop', name: '循环派', detail: '最爱循环的歌，听了 127 次', art: 'vinyl', correct: true },
    { id: 'explore', name: '探索派', detail: '全年探索 612 位新音乐人', art: 'planet', correct: false },
  ],
  [
    { id: 'night', name: '夜行派', detail: '46% 的音乐发生在深夜', art: 'night', correct: true },
    { id: 'morning', name: '晨光派', detail: '清晨是你的黄金听歌时间', art: 'sunrise', correct: false },
  ],
]

const tags = [
  { id: 'emo', name: '深夜emo常驻民', hue: 'violet', symbol: '☾', line: '情绪藏进夜色里' },
  { id: 'loud', name: '歌单显眼包', hue: 'orange', symbol: '✹', line: 'BGM 必须有态度' },
  { id: 'dig', name: '冷门挖宝人', hue: 'green', symbol: '⌁', line: '好歌不等排行榜' },
  { id: 'loop', name: '循环上头怪', hue: 'cyan', symbol: '↻', line: '一首歌听到包浆' },
]

const navGroups: { title: string; items: { id: Screen; label: string }[] }[] = [
  { title: '主态 · 发起挑战', items: [
    { id: 'home', label: 'P1 活动首页' }, { id: 'host-q1', label: 'P2 年度歌曲' },
    { id: 'host-q2', label: 'P3 听歌行为' }, { id: 'host-q3', label: 'P4 音乐阵营' },
    { id: 'host-q4', label: 'P5 自我标签' }, { id: 'host-ready', label: 'P6 生成完成' },
  ] },
  { title: '客态 · 好友作答', items: [
    { id: 'guest-entry', label: 'C1 好友邀请' }, { id: 'guest-q1', label: 'C2 歌曲竞猜' },
    { id: 'guest-q2', label: 'C3 行为竞猜' }, { id: 'guest-q3', label: 'C4 阵营竞猜' },
    { id: 'guest-q4', label: 'C5 好友吐槽' }, { id: 'guest-result', label: 'C6 双人结果' },
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
    <span>{guest ? '好友挑战' : '预览题目'}</span>
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

function CampArt({ type }: { type: string }) {
  return <div className={`camp-art camp-${type}`}>
    <span>{type === 'vinyl' ? '↻' : type === 'planet' ? '✦' : type === 'night' ? '☾' : '☀'}</span><i /><b />
  </div>
}

function TagCard({ tag, selected, onClick, reveal = false }: { tag: typeof tags[number]; selected: boolean; onClick?: () => void; reveal?: boolean }) {
  return <button className={`tag-card tag-${tag.hue} ${selected ? 'selected' : ''} ${reveal ? 'reveal' : ''}`} onClick={onClick} disabled={!onClick}>
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

function QuestionShell({ index, guest, children, go, next, disabled = false, swap }: { index: number; guest: boolean; children: React.ReactNode; go: (s: Screen) => void; next: () => void; disabled?: boolean; swap?: () => void }) {
  return <main className="screen screen-light question-screen">
    <Brand onReset={() => go('home')} />
    <Progress index={index} guest={guest} />
    <div className="question-body">{children}</div>
    <div className="sticky-actions">
      {swap && <button className="swap" onClick={swap}>换一题 <span>↻</span></button>}
      <PrimaryButton onClick={next} disabled={disabled}>{guest && index === 4 ? '提交，查看默契结果' : guest ? '下一题' : index === 4 ? '生成我的AB面' : '下一题'}</PrimaryButton>
    </div>
  </main>
}

function SongQuestion({ host, songs, selected, onSelect, go, next, swap }: { host: boolean; songs: typeof songSets[number]; selected?: string; onSelect?: (id: string) => void; go: (s: Screen) => void; next: () => void; swap?: () => void }) {
  return <QuestionShell index={1} guest={!host} go={go} next={next} disabled={!host && !selected} swap={host ? swap : undefined}>
    <div className="question-heading enter"><span className="question-kicker">SINGLE OF THE YEAR</span><h2>猜猜{host ? '我' : 'TA'}2026年<br/>单曲循环最多的是哪首歌？</h2><p>{host ? '根据你2026年的真实听歌数据生成' : '凭直觉选一首，答案暂时保密'}</p></div>
    <div className="song-list">
      {songs.map((song, i) => {
        const active = host ? song.correct : selected === song.id
        return <button key={song.id} style={{ '--delay': `${i * 80}ms` } as React.CSSProperties} className={`song-option stagger ${active ? 'selected' : ''} ${host && song.correct ? 'data-answer' : ''}`} onClick={() => !host && onSelect?.(song.id)} disabled={host}>
          <SongCover tone={song.tone} /><span className="song-meta"><strong>{song.name}</strong><small>{song.artist}</small></span>
          <span className="radio">{active ? '✓' : String.fromCharCode(65 + i)}</span>
          {host && song.correct && <em className="answer-label">真实答案</em>}
        </button>
      })}
    </div>
  </QuestionShell>
}

function BehaviorQuestion({ host, items, selected, onSelect, go, next, swap }: { host: boolean; items: typeof behaviorSets[number]; selected?: string; onSelect?: (id: string) => void; go: (s: Screen) => void; next: () => void; swap?: () => void }) {
  return <QuestionShell index={2} guest={!host} go={go} next={next} disabled={!host && !selected} swap={host ? swap : undefined}>
    <div className="question-heading enter"><span className="question-kicker pink">WEIRD BUT TRUE</span><h2>以下哪件离谱的听歌行为，<br/>真的发生在{host ? '我的' : 'TA的'}2026？</h2><p>{host ? '年度数据替你记住了这些小事' : '选一个你最相信的答案'}</p></div>
    <div className="behavior-grid">
      {items.map((item, i) => {
        const active = host ? item.correct : selected === item.id
        return <button key={item.id} style={{ '--delay': `${i * 90}ms` } as React.CSSProperties} className={`behavior-card stagger ${active ? 'selected' : ''} ${host && item.correct ? 'data-answer' : ''}`} onClick={() => !host && onSelect?.(item.id)} disabled={host}>
          <BehaviorArt type={item.art} /><strong>{item.title}</strong><small>{item.caption}</small><span className="mini-radio">{active ? '✓' : String.fromCharCode(65 + i)}</span>
          {host && item.correct && <em className="answer-label">真的发生过</em>}
        </button>
      })}
    </div>
  </QuestionShell>
}

function CampQuestion({ host, items, selected, onSelect, go, next, swap }: { host: boolean; items: typeof campSets[number]; selected?: string; onSelect?: (id: string) => void; go: (s: Screen) => void; next: () => void; swap?: () => void }) {
  return <QuestionShell index={3} guest={!host} go={go} next={next} disabled={!host && !selected} swap={host ? swap : undefined}>
    <div className="question-heading enter"><span className="question-kicker cyan">CHOOSE A SIDE</span><h2>猜猜{host ? '我的' : 'TA的'}2026，<br/>究竟是哪一派？</h2><p>{host ? '阵营由年度听歌数据判定' : '两个极端，你觉得TA站哪边？'}</p></div>
    <div className="camp-grid">
      {items.map((item, i) => {
        const active = host ? item.correct : selected === item.id
        return <button key={item.id} style={{ '--delay': `${i * 100}ms` } as React.CSSProperties} className={`camp-card stagger ${active ? 'selected' : ''} ${host && item.correct ? 'data-answer' : ''}`} onClick={() => !host && onSelect?.(item.id)} disabled={host}>
          <span className="camp-index">0{i + 1}</span><CampArt type={item.art} /><strong>{item.name}</strong><small>{host && active ? item.detail : i === 0 ? '熟悉比新鲜更重要' : '永远在找下一首'}</small>
          {host && active && <em className="answer-label">你的阵营</em>}
        </button>
      })}
    </div>
    {host && <div className="data-note"><span>数据判定</span><p>过去一年，你最常循环的歌曲占据了更多听歌时间。</p></div>}
  </QuestionShell>
}

function TagQuestion({ host, selected, onSelect, go, next }: { host: boolean; selected?: string | null; onSelect: (id: string) => void; go: (s: Screen) => void; next: () => void }) {
  return <QuestionShell index={4} guest={!host} go={go} next={next} disabled={!selected}>
    <div className="question-heading enter"><span className="question-kicker lime">YOUR MUSIC PERSONA</span><h2>{host ? '最后，给自己的2026歌品贴一个标签吧！' : '那在你眼里，TA又是哪种听歌选手？'}</h2><p>{host ? '看看朋友是不是也这么想' : '这题没有客观标准，只看你们是否想到一起'}</p></div>
    <div className="tag-grid">
      {tags.map((tag, i) => <div className="stagger" style={{ '--delay': `${i * 70}ms` } as React.CSSProperties} key={tag.id}><TagCard tag={tag} selected={selected === tag.id} onClick={() => onSelect(tag.id)} /></div>)}
    </div>
  </QuestionShell>
}

function HostReady({ go, hostTag, copy }: { go: (s: Screen) => void; hostTag: string; copy: () => void }) {
  const tag = tags.find(t => t.id === hostTag) ?? tags[2]
  return <main className="screen screen-dark ready-screen scrollable">
    <Brand dark onReset={() => go('home')} />
    <div className="ready-heading enter"><span className="question-kicker lime">A SIDE COMPLETE</span><h2>我的2026 A面<br/>已经写好了</h2><p>现在，等你来猜。</p></div>
    <div className="mini-record-card enter delay-1"><Vinyl small /><div><span>A SIDE · 真实的我</span><strong>季莫申科科科</strong><small>4 道年度音乐印记</small></div><em>READY</em></div>
    <div className="answer-tape">
      <div><span>01</span><p><b>晴天</b><small>年度单曲</small></p></div>
      <div><span>02</span><p><b>连续30天听同一位歌手</b><small>真实行为</small></p></div>
      <div><span>03</span><p><b>循环派</b><small>音乐阵营</small></p></div>
      <div><span>04</span><p><b>{tag.name}</b><small>自选歌品</small></p></div>
    </div>
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

function GuestResult({ go, answers, hostTag, songs, behaviors, camps, artist }: { go: (s: Screen) => void; answers: Answers; hostTag: string; songs: typeof songSets[number]; behaviors: typeof behaviorSets[number]; camps: typeof campSets[number]; artist: () => void }) {
  const correct = { q1: songs.find(x => x.correct)!, q2: behaviors.find(x => x.correct)!, q3: camps.find(x => x.correct)!, q4: tags.find(x => x.id === hostTag)! }
  const score = Number(answers.q1 === correct.q1.id) + Number(answers.q2 === correct.q2.id) + Number(answers.q3 === correct.q3.id) + Number(answers.q4 === correct.q4.id)
  const guestTag = tags.find(x => x.id === answers.q4) ?? tags[1]
  const rows = [
    { n: '01', label: '年度单曲', a: correct.q1.name, b: songs.find(x => x.id === answers.q1)?.name ?? '未作答', ok: answers.q1 === correct.q1.id },
    { n: '02', label: '听歌行为', a: correct.q2.title, b: behaviors.find(x => x.id === answers.q2)?.title ?? '未作答', ok: answers.q2 === correct.q2.id },
    { n: '03', label: '音乐阵营', a: correct.q3.name, b: camps.find(x => x.id === answers.q3)?.name ?? '未作答', ok: answers.q3 === correct.q3.id },
    { n: '04', label: '歌品认知', a: correct.q4.name, b: guestTag.name, ok: answers.q4 === correct.q4.id },
  ]
  return <main className="screen screen-dark result-screen scrollable">
    <Brand dark onReset={() => go('home')} />
    <div className="score-hero enter"><span>MUSIC CHEMISTRY</span><div className="score-number"><b>{score}</b><em>/4</em></div><h2>{score === 4 ? '默契满格，像共用一副耳机' : score >= 3 ? '很懂，但还藏着一点B面' : score >= 2 ? '熟悉的歌里，也有意外答案' : '原来你认识的是另一个TA'}</h2></div>
    <div className="result-record"><div className="half half-a">A</div><div className="half half-b">B</div><i /></div>
    <section className="side-sheet">
      <div className="side-head"><div><span>A SIDE</span><b>真实的我</b></div><div><span>B SIDE</span><b>你眼中的我</b></div></div>
      <div className="comparison-list">
        {rows.map(row => <div className="comparison" key={row.n}>
          <div className="compare-label"><span>{row.n}</span>{row.label}<em className={row.ok ? 'hit' : 'miss'}>{row.ok ? '一致' : '不同'}</em></div>
          <div className="compare-values"><b>{row.a}</b><i>{row.ok ? '=' : '≠'}</i><b>{row.b}</b></div>
        </div>)}
      </div>
      <div className={`contrast-copy ${answers.q4 === hostTag ? 'same' : ''}`}><span>{answers.q4 === hostTag ? 'SAME WAVELENGTH' : 'PLOT TWIST'}</span><p>{answers.q4 === hostTag ? '原来我们对我的歌品，真的想到一起去了。' : <>我觉得自己是<strong>{correct.q4.name}</strong>，<br/>但你觉得我是<strong>{guestTag.name}</strong>。</>}</p></div>
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
  const [songSet, setSongSet] = useState(0)
  const [behaviorSet, setBehaviorSet] = useState(0)
  const [campSet, setCampSet] = useState(0)
  const [hostTag, setHostTag] = useState<string | null>(firstScreen === 'home' || firstScreen.startsWith('host-q') ? null : 'dig')
  const [answers, setAnswers] = useState<Answers>(firstScreen === 'guest-result' ? { q1: 'sunny', q2: 'repeat30', q3: 'explore', q4: 'loud' } : {})
  const [artistChoice, setArtistChoice] = useState<string | undefined>(firstScreen === 'artist-reveal' ? 'sea' : undefined)
  const [artistReturn, setArtistReturn] = useState<'home' | 'result'>('home')
  const [toast, setToast] = useState('')

  const songs = songSets[songSet]
  const behaviors = behaviorSets[behaviorSet]
  const camps = campSets[campSet]

  const reset = () => { setScreen('home'); setSongSet(0); setBehaviorSet(0); setCampSet(0); setHostTag(null); setAnswers({}); setArtistChoice(undefined); setToast('') }
  const setAnswer = (key: keyof Answers, value: string) => setAnswers(prev => ({ ...prev, [key]: value }))
  const ensureDemoState = (target: Screen) => {
    if ((target === 'host-ready' || target.startsWith('guest')) && !hostTag) setHostTag('dig')
    if (target === 'guest-result') setAnswers(prev => Object.keys(prev).length === 4 ? prev : { q1: songs[0].id, q2: behaviors[0].id, q3: camps[1].id, q4: 'loud' })
    if (target === 'artist-reveal' && !artistChoice) setArtistChoice('sea')
    setScreen(target)
  }
  const openArtist = (from: 'home' | 'result') => { setArtistReturn(from); setArtistChoice(undefined); setScreen('artist-quiz') }
  const leaveArtist = () => setScreen(artistReturn === 'result' ? 'guest-result' : 'host-q1')
  const copyInvite = async () => { await navigator.clipboard?.writeText('https://music.163.com/2026-ab-side/demo'); setToast('邀请链接已复制（模拟）'); window.setTimeout(() => setToast(''), 1800) }

  const page = useMemo(() => {
    switch (screen) {
      case 'home': return <Home go={ensureDemoState} artist={() => openArtist('home')} />
      case 'host-q1': return <SongQuestion host songs={songs} go={ensureDemoState} next={() => setScreen('host-q2')} swap={() => setSongSet(x => 1 - x)} />
      case 'host-q2': return <BehaviorQuestion host items={behaviors} go={ensureDemoState} next={() => setScreen('host-q3')} swap={() => setBehaviorSet(x => 1 - x)} />
      case 'host-q3': return <CampQuestion host items={camps} go={ensureDemoState} next={() => setScreen('host-q4')} swap={() => setCampSet(x => 1 - x)} />
      case 'host-q4': return <TagQuestion host selected={hostTag} onSelect={setHostTag} go={ensureDemoState} next={() => setScreen('host-ready')} />
      case 'host-ready': return <HostReady go={ensureDemoState} hostTag={hostTag ?? 'dig'} copy={copyInvite} />
      case 'guest-entry': return <GuestEntry go={ensureDemoState} />
      case 'guest-q1': return <SongQuestion host={false} songs={songs} selected={answers.q1} onSelect={v => setAnswer('q1', v)} go={ensureDemoState} next={() => setScreen('guest-q2')} />
      case 'guest-q2': return <BehaviorQuestion host={false} items={behaviors} selected={answers.q2} onSelect={v => setAnswer('q2', v)} go={ensureDemoState} next={() => setScreen('guest-q3')} />
      case 'guest-q3': return <CampQuestion host={false} items={camps} selected={answers.q3} onSelect={v => setAnswer('q3', v)} go={ensureDemoState} next={() => setScreen('guest-q4')} />
      case 'guest-q4': return <TagQuestion host={false} selected={answers.q4} onSelect={v => setAnswer('q4', v)} go={ensureDemoState} next={() => setScreen('guest-result')} />
      case 'guest-result': return <GuestResult go={ensureDemoState} answers={answers} hostTag={hostTag ?? 'dig'} songs={songs} behaviors={behaviors} camps={camps} artist={() => openArtist('result')} />
      case 'artist-quiz': return <ArtistFlow reveal={false} selected={artistChoice} onSelect={setArtistChoice} go={ensureDemoState} back={leaveArtist} />
      case 'artist-reveal': return <ArtistFlow reveal selected={artistChoice} onSelect={setArtistChoice} go={ensureDemoState} back={leaveArtist} />
    }
  }, [screen, songs, behaviors, camps, hostTag, answers, artistChoice])

  return <div className="app-shell"><DemoNav screen={screen} go={ensureDemoState} reset={reset} /><div className="phone-stage"><div className="phone-frame" key={screen}>{page}</div><p className="viewport-label">390 × 844 · MOBILE H5</p></div>{toast && <div className="toast">✓ {toast}</div>}</div>
}
