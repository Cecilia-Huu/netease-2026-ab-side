import { useMemo, useState } from 'react'
import {
  aQuestions, availableB, defaultAIds, defaultBFor, demoA, demoContributions,
  recommendations, songById, songs, aById, bById,
  type AId, type ASelection, type BId, type Contribution, type Song,
} from './content'

type Screen = 'home' | 'host-edit' | 'host-result' | 'guest-entry' | 'guest-topic' | 'guest-song' | 'guest-result' | 'artist-quiz' | 'artist-reveal'
type SearchContext = 'host' | 'guest'
const query = new URLSearchParams(window.location.search)
document.documentElement.classList.toggle('capture-mode', query.get('capture') === '1')
const screenParam = query.get('screen')
const initialStep = Math.min(3, Math.max(0, Number(query.get('step') || 0) || 0))
const initialScreen: Screen =
  query.get('view') === 'guest' ? 'guest-entry' :
  screenParam === 'host-q1' ? 'host-edit' :
  screenParam === 'guest-q1' ? 'guest-entry' :
  screenParam === 'host-ready' ? 'host-result' :
  screenParam === 'guest-result' ? 'guest-result' :
  (['home','host-edit','host-result','guest-entry','guest-topic','guest-song','artist-quiz','artist-reveal'].includes(screenParam ?? '') ? screenParam as Screen : 'home')

function parseShared(): ASelection[] {
  const value = query.get('a')
  if (!value) return demoA.map(item => ({ ...item }))
  const parts = value.split(',').map(part => part.split(':'))
  const valid = parts.length === 4 && new Set(parts.map(part => part[0])).size === 4 &&
    parts.every(part => aQuestions.some(q => q.id === part[0]) && songs.some(song => song.id === part[1]))
  return valid ? parts.map(part => ({ questionId: part[0] as AId, songId: part[1] })) : demoA.map(item => ({ ...item }))
}

function Brand({ dark = false, onHome }: { dark?: boolean; onHome: () => void }) {
  return <header className={'brand ' + (dark ? 'brand-dark' : '')}>
    <button className="brand-name" onClick={onHome} aria-label="返回活动首页"><span className="logo-mark">◎</span><span>网易云音乐</span><i></i><b>2026</b></button>
    <span className="brand-series">AB SIDE · DEMO</span>
  </header>
}
function Button({ children, onClick, disabled = false, light = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; light?: boolean }) {
  return <button className={'primary ' + (light ? 'primary-light' : '')} onClick={onClick} disabled={disabled}><span>{children}</span><b>→</b></button>
}
function Cover({ song, small = false }: { song: Song; small?: boolean }) {
  return <div className={'cover cover-' + song.palette + (small ? ' cover-small' : '')} aria-hidden="true"><i></i><span>♪</span><b></b></div>
}
function Vinyl({ palette = 'rainbow', side = 'A', small = false, onClick }: { palette?: string; side?: 'A' | 'B'; small?: boolean; onClick?: () => void }) {
  const contents = <><i className="vinyl-groove groove-a"></i><i className="vinyl-groove groove-b"></i><span className="vinyl-center"><b>{side}</b><em>2026</em></span></>
  return onClick ? <button className={'vinyl vinyl-' + palette + (small ? ' vinyl-small' : '')} onClick={onClick} aria-label="翻转唱片">{contents}</button> :
    <div className={'vinyl vinyl-' + palette + (small ? ' vinyl-small' : '')}>{contents}</div>
}
function SongChoices({ list, selected, onSelect }: { list: Song[]; selected?: string; onSelect: (id: string) => void }) {
  const chosen = songById(selected)
  const display = chosen && !list.some(song => song.id === chosen.id) ? [chosen, ...list] : list
  return <div className="song-list">{display.map((song, i) =>
    <button className={'song-option ' + (selected === song.id ? 'selected' : '')} key={song.id} onClick={() => onSelect(song.id)}>
      <Cover song={song} /><span className="song-meta"><strong>{song.title}</strong><small>{song.artist}</small><em>{chosen?.id === song.id && i === 0 && !list.some(item => item.id === song.id) ? '搜索选中' : song.note + ' · 模拟推荐'}</em></span>
      <span className="song-radio">{selected === song.id ? '✓' : String.fromCharCode(65 + i)}</span>
    </button>)}</div>
}
function SearchSheet({ context, search, setSearch, pick, close }: { context: SearchContext; search: string; setSearch: (v: string) => void; pick: (id: string) => void; close: () => void }) {
  const filtered = songs.filter(song => (song.title + song.artist).toLowerCase().includes(search.trim().toLowerCase()))
  return <div className="sheet-backdrop" role="presentation" onClick={close}><section className="search-sheet" role="dialog" aria-label="搜索歌曲" onClick={event => event.stopPropagation()}>
    <div className="sheet-top"><span>SEARCH THE RECORDS</span><button onClick={close}>×</button></div>
    <h3>{context === 'host' ? '为你的A面找一首歌' : '为TA的B面找一首歌'}</h3>
    <input autoFocus value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索歌曲或歌手" aria-label="搜索歌曲或歌手" />
    <div className="search-results">{filtered.map(song => <button key={song.id} onClick={() => pick(song.id)}><Cover song={song} small /><span><b>{song.title}</b><small>{song.artist}</small></span><em>选这首 ↗</em></button>)}{filtered.length === 0 && <p>没有找到，试试其他歌名或歌手。</p>}</div>
    <p className="demo-disclaimer">本地模拟歌曲库，无真实听歌数据。</p>
  </section></div>
}
function Home({ start, artist, onHome }: { start: () => void; artist: () => void; onHome: () => void }) {
  return <main className="screen home-screen"><Brand dark onHome={onHome} /><div className="home-copy">
    <span className="eyebrow">2026 · YOUR TWO SIDES</span><h1>我的2026<br/><em>A</em>B面</h1>
    <p>如果2026年是一张唱片，<br/>A面由我亲自录制，B面留给朋友来写。</p>
  </div><div className="home-art"><Vinyl /><span className="home-side-a">A SIDE<br/>我眼中的自己</span><span className="home-side-b">B SIDE<br/>好友眼中的我</span><i className="scribble">✦</i></div>
  <div className="home-actions"><Button light onClick={start}>录制我的A面</Button><button className="artist-teaser" onClick={artist}><span>AL</span><b>艺人隐藏B面 · 模拟彩蛋</b><em>↗</em></button></div></main>
}
function HostEditor({ step, slot, slots, draft, batch, select, switchQuestion, switchBatch, search, back, confirm, home }: {
  step:number; slot:ASelection; slots:ASelection[]; draft?:string; batch:number; select:(id:string)=>void;
  switchQuestion:()=>void; switchBatch:()=>void; search:()=>void; back:()=>void; confirm:()=>void; home:()=>void
}) {
  const question = aById(slot.questionId)
  const similar = slot.questionId === 'A09' && slots.some((item, index) => index !== step && item.questionId === 'A01')
  return <main className="screen question-screen"><Brand onHome={home} /><div className="progress-wrap"><span>A SIDE · {String(step+1).padStart(2,'0')}/04</span><div className="progress"><i style={{width:((step+1)*25)+'%'}}></i></div><b>{question.id}</b></div>
    <div className="question-body"><div className="question-heading"><span className="question-kicker">RECORD YOUR SIDE</span><p className="question-type">{question.title}</p><h2>{question.prompt}</h2><p>选一首歌，写下你愿意展示的2026。</p></div>
      {similar && <div className="similar-note">片头曲和片尾曲有些相近，试着给它们不同的心情。</div>}
      <SongChoices list={recommendations(question.id,batch)} selected={draft} onSelect={select} />
      <div className="question-tools"><button onClick={switchQuestion}>↻ 换一题</button><button onClick={switchBatch}>⟳ 换一批歌曲</button><button onClick={search}>⌕ 搜索歌曲</button></div>
      <p className="data-note">歌曲与推荐理由均为本地模拟，可换题、换歌或返回修改。</p>
    </div><div className="sticky-actions"><button className="back-link" onClick={back}>← {step === 0 ? '返回首页' : '上一题'}</button><Button onClick={confirm} disabled={!draft}>{step === 3 ? '完成我的A面' : '确认，下一题'}</Button></div>
  </main>
}
function MiniRecord({ contribution, onClick, large = false }: { contribution: Contribution; onClick?: () => void; large?: boolean }) {
  const question=bById(contribution.questionId), song=songById(contribution.songId)!
  return <button className={'mini-record mini-' + question.palette + (large ? ' mini-large' : '')} onClick={onClick} disabled={!onClick} aria-label={'查看' + contribution.friendName + '的B面贡献'}>
    <div className="mini-disc"><div className={'mini-center cover-' + song.palette}><span>♪</span></div></div>
    <span className="mini-caption"><b>{song.title}</b><small>{contribution.friendName}</small></span>
  </button>
}
function CollectionWall({ contributions, open }: { contributions:Contribution[]; open:(item:Contribution)=>void }) {
  return <div className={'wall-frame ' + (contributions.length === 1 ? 'wall-single' : '')}><div className="wall-inner"><div className="wall-masthead"><span>THE B SIDE ARCHIVE</span><b>朋友写下的另一面</b><small>{String(contributions.length).padStart(2,'0')} RECORDS</small></div>
    <div className="wall-grid">{contributions.map(item=><MiniRecord key={item.id} contribution={item} onClick={()=>open(item)} />)}</div>
  </div></div>
}
function HostResult({ slots, contributions, side, flip, invite, guestView, open, artist, home, ownerName, setDemoCount }: {
  slots:ASelection[]; contributions:Contribution[]; side:'A'|'B'; flip:(side:'A'|'B')=>void; invite:()=>void; guestView:()=>void; open:(item:Contribution)=>void; artist:()=>void; home:()=>void; ownerName:string; setDemoCount:(count:number)=>void
}) {
  return <main className="screen result-screen scrollable"><Brand dark onHome={home} /><div className="result-heading"><span className="eyebrow">YOUR 2026 · VINYL EDITION</span><h2>{ownerName === '我' ? '我的' : ownerName + '的'}2026 AB面</h2><p>你的A面已经写好。<br/>但这还不是你的全部。</p></div>
    <div className="result-record-wrap"><Vinyl palette={side === 'A' ? 'rainbow' : 'berry'} side={side} onClick={()=>flip(side === 'A' ? 'B' : 'A')} /><span className="flip-hint">轻触唱片，翻到{side === 'A' ? 'B' : 'A'}面 ↻</span></div>
    <div className="side-switch"><button className={side === 'A' ? 'active' : ''} onClick={()=>flip('A')}>A SIDE <small>我亲自录制</small></button><button className={side === 'B' ? 'active' : ''} onClick={()=>flip('B')}>B SIDE <small>朋友来写</small></button></div>
    {contributions.length === 0 && <div className="empty-callout"><span>THE OTHER SIDE IS WAITING</span><h3>朋友眼中的你，<br/>还藏着哪些歌？</h3><p>黑胶的B面仍然留白，第一首由朋友写下。</p></div>}
    {side === 'A' ? <section className="a-tracklist"><div className="section-title"><span>01—04 / A SIDE</span><b>我的四首年度注脚</b></div>{slots.map((item,index)=>{const song=songById(item.songId); return <div className="track-row" key={item.questionId}><span>{String(index+1).padStart(2,'0')}</span>{song && <Cover song={song} small/>}<div><small>{aById(item.questionId).title}</small><b>{song?.title ?? '待选歌曲'}</b><em>{song?.artist ?? ''}</em></div></div>})}</section> :
      contributions.length > 0 ? <section className="b-collection"><div className="section-title"><span>THE B SIDE COLLECTION</span><b>{contributions.length} 位好友，为你留下了另一面</b></div><CollectionWall contributions={contributions} open={open} /><p className="wall-tip">轻触小黑胶，查看好友留下的歌。</p></section> :
      <section className="empty-record"><div className="empty-disc">?</div><p>这里还没有一首歌。<br/>等待第一位朋友落下唱针。</p></section>}
    <div className="result-actions"><Button light onClick={invite}>邀请好友补全B面</Button><button onClick={guestView}>体验好友视角 ↗</button></div>
    <div className="result-demo-switch"><span>评审演示模式 · 模拟好友数量</span><div>{[0,1,3].map(count=><button key={count} className={contributions.length===count?'active':''} onClick={()=>{setDemoCount(count);flip(count===0?'A':'B')}}>{count} 位好友</button>)}</div></div>
    <button className="artist-egg" onClick={artist}><span>AL</span><b>艺人隐藏B面 · 可选模拟彩蛋</b><em>↗</em></button>
    {contributions.some(item=>item.demo) && <p className="demo-note">评审演示模式：好友贡献为预设样例，非线上实时数据。</p>}
  </main>
}
function GuestEntry({ slots, ownerName, friendName, setFriendName, next, home }: { slots:ASelection[]; ownerName:string; friendName:string; setFriendName:(v:string)=>void; next:()=>void; home:()=>void }) {
  return <main className="screen guest-entry-screen scrollable"><Brand dark onHome={home}/><div className="guest-top"><span className="eyebrow">A SIDE IS DONE. B SIDE IS YOURS.</span><h1>{ownerName}的2026，<br/>还差你这一首。</h1><p>TA已经录好4首A面歌曲。<br/>你来写下朋友眼中的另一面。</p></div>
    <div className="guest-a-preview"><span>A SIDE · TA选好的4首歌</span>{slots.map((item,index)=>{const song=songById(item.songId); return <div key={item.questionId}><i>{String(index+1).padStart(2,'0')}</i><b>{song?.title ?? '未选歌曲'}</b><small>{aById(item.questionId).title}</small></div>})}</div>
    <label className="guest-name">你的称呼 <span>可修改</span><input value={friendName} maxLength={12} onChange={event=>setFriendName(event.target.value)} placeholder="例如：小许"/></label>
    <div className="guest-entry-actions"><Button light onClick={next}>帮TA写下B面</Button></div><p className="demo-disclaimer">独立客态演示链接 · A面通过URL读取，好友贡献仅保存在当前浏览器会话。</p>
  </main>
}
function GuestTopics({ slots, ownerName, offset, rotate, choose, back, home }: { slots:ASelection[]; ownerName:string; offset:number; rotate:()=>void; choose:(id:BId)=>void; back:()=>void; home:()=>void }) {
  const available=defaultBFor(slots), shown=[0,1,2].map(i=>available[(offset+i)%available.length])
  const a01=songById(slots.find(item=>item.questionId==='A01')?.songId)
  return <main className="screen question-screen"><Brand onHome={home}/><div className="progress-wrap"><span>B SIDE · 01/02</span><div className="progress"><i style={{width:'50%'}}></i></div><b>选题</b></div>
    <div className="question-body"><div className="question-heading"><span className="question-kicker mint">WRITE THE OTHER SIDE</span><h2>你想用哪一面，<br/>认识{ownerName}？</h2><p>选一道题，再为TA留下一首歌。</p></div>
      <div className="topic-list">{shown.map((q,index)=><button className={'topic-card topic-'+q.palette} key={q.id} onClick={()=>choose(q.id)}><span className="topic-top"><b>{q.id}</b><em>{String(index+1).padStart(2,'0')}</em></span><strong>{q.title}</strong><p>{q.prompt}</p>{q.id==='B06' && a01 && <small>TA选的片头曲：《{a01.title}》 ↔ 你的版本？</small>}<i>选择这道题 ↗</i></button>)}</div>
      <button className="rotate-topic" onClick={rotate}>↻ 换一换其他题目</button>
    </div><div className="sticky-actions"><button className="back-link" onClick={back}>← 返回邀请</button><span className="step-hint">选一张卡片，就能进入选歌</span></div>
  </main>
}
function GuestSong({ questionId, slots, batch, selected, select, switchBatch, search, back, confirm, home }: { questionId:BId; slots:ASelection[]; batch:number; selected?:string; select:(id:string)=>void; switchBatch:()=>void; search:()=>void; back:()=>void; confirm:()=>void; home:()=>void }) {
  const q=bById(questionId), a01=songById(slots.find(item=>item.questionId==='A01')?.songId)
  return <main className="screen question-screen"><Brand onHome={home}/><div className="progress-wrap"><span>B SIDE · 02/02</span><div className="progress"><i style={{width:'100%'}}></i></div><b>{q.id}</b></div>
    <div className="question-body"><div className="question-heading"><span className="question-kicker mint">{q.title}</span><h2>{q.prompt}</h2><p>只留一首歌，就够写下你眼中的TA。</p></div>
      {q.id==='B06' && a01 && <div className="a-contrast">TA的A面片头曲 <b>《{a01.title}》</b><span>你的B面会选哪首？</span></div>}
      <SongChoices list={recommendations(q.id,batch)} selected={selected} onSelect={select}/><div className="question-tools two"><button onClick={switchBatch}>⟳ 换一批歌曲</button><button onClick={search}>⌕ 搜索歌曲</button></div><p className="data-note">本地模拟推荐，选择后可以修改。</p>
    </div><div className="sticky-actions"><button className="back-link" onClick={back}>← 重新选题</button><Button onClick={confirm} disabled={!selected}>把这首歌放进TA的B面</Button></div>
  </main>
}
function GuestResult({ contribution, ownerName, startOwn, viewOwner, invite, home }: { contribution:Contribution; ownerName:string; startOwn:()=>void; viewOwner:()=>void; invite:()=>void; home:()=>void }) {
  const q=bById(contribution.questionId), song=songById(contribution.songId)!
  return <main className="screen guest-result-screen scrollable"><Brand dark onHome={home}/><div className="guest-result-top"><span className="eyebrow">YOUR RECORD HAS LANDED</span><h1>你为{ownerName}的B面，<br/>留下了一首歌。</h1></div>
    <div className="solo-record"><MiniRecord contribution={contribution} large/><div className="solo-stamp">{q.badge}</div></div>
    <div className="guest-result-copy"><span>B SIDE · {q.id}</span><h2>{song.title}</h2><p>{song.artist} · {q.title}</p><blockquote>{q.line}</blockquote><small>由 {contribution.friendName} 收藏于TA的2026</small></div>
    <div className="guest-result-actions"><Button light onClick={startOwn}>我也要制作自己的AB面</Button><div><button onClick={viewOwner}>看看TA的AB面</button><button onClick={invite}>邀请其他朋友</button></div></div><p className="demo-note">本次好友贡献仅保存在当前浏览器会话，静态演示站不跨设备同步。</p>
  </main>
}
function DetailSheet({ item, close }: { item:Contribution; close:()=>void }) {
  const q=bById(item.questionId), song=songById(item.songId)!
  return <div className="sheet-backdrop" role="presentation" onClick={close}><section className="detail-sheet" role="dialog" aria-label="好友唱片详情" onClick={event=>event.stopPropagation()}><button className="sheet-close" onClick={close}>×</button><span className="eyebrow">B SIDE · {q.id}</span><MiniRecord contribution={item} large/><div className="detail-text"><span>{q.badge}</span><h3>{song.title}</h3><p>{song.artist}</p><blockquote>{q.line}</blockquote><small>{item.friendName} · {new Date(item.submittedAt).toLocaleString('zh-CN')}</small>{item.demo && <em>评审演示样例</em>}</div></section></div>
}
function ShareSheet({ url, copy, guest, close }: { url:string; copy:()=>void; guest:()=>void; close:()=>void }) {
  return <div className="sheet-backdrop" role="presentation" onClick={close}><section className="share-sheet" role="dialog" aria-label="邀请好友补全B面" onClick={event=>event.stopPropagation()}><button className="sheet-close" onClick={close}>×</button><span className="eyebrow">INVITE A FRIEND</span><h3>把B面，留给懂你的人。</h3><p>将链接发给好友。对方打开后能看到你的A面，并为你写下一首歌。</p><textarea readOnly value={url} aria-label="客态演示链接"/><Button onClick={copy}>复制邀请链接</Button><button className="share-demo" onClick={guest}>在本机体验好友视角 ↗</button><small>GitHub Pages静态演示：A面由链接承载，好友贡献不跨设备实时同步。</small></section></div>
}
function ArtistFlow({ reveal, selected, setSelected, next, back, home }: { reveal:boolean; selected?:string; setSelected:(v:string)=>void; next:()=>void; back:()=>void; home:()=>void }) {
  return <main className="screen artist-screen scrollable"><Brand dark onHome={home}/><div className="artist-profile"><div className="artist-portrait">AL</div><div><span>ARTIST B SIDE · CONCEPT</span><h1>A-Lin</h1><p>合作及内容均待确认 · 模拟素材</p></div></div>
    {!reveal ? <><div className="artist-question"><span>可选彩蛋 · 不影响个人A/B面</span><h2>如果舞台灯光关掉，<br/>哪首歌更像此刻的心情？</h2></div><div className="artist-options">{['失恋无罪','给我一个理由忘记','挚友'].map((title,index)=><button key={title} className={selected===title?'selected':''} onClick={()=>setSelected(title)}><span className={'artist-cover artist-cover-'+index}>♪</span><b>{title}</b><em>{selected===title?'✓':'0'+(index+1)}</em></button>)}</div><div className="artist-bottom"><Button light onClick={next} disabled={!selected}>揭晓模拟B面</Button><button onClick={back}>跳过，继续我的AB面</button></div></> :
    <><div className="artist-reveal"><Vinyl palette="berry"/><span>模拟彩蛋</span><h2>给我一个理由忘记</h2><p>概念示意，不代表艺人本人偏好。</p></div><div className="artist-bottom"><Button light onClick={back}>继续我的AB面</Button></div></>}
  </main>
}

export default function App() {
  const guestInitial = initialScreen.startsWith('guest') || query.get('view') === 'guest'
  const [screen,setScreen] = useState<Screen>(initialScreen)
  const [sideA,setSideA] = useState<ASelection[]>(guestInitial || initialScreen==='host-result' || (initialScreen==='host-edit' && initialStep>0) ? parseShared() : defaultAIds.map(questionId=>({questionId})))
  const [ownerName,setOwnerName] = useState(guestInitial || initialScreen==='host-result' ? query.get('name') || '季莫申科科科' : '我')
  const [step,setStep] = useState(initialStep)
  const [draft,setDraft] = useState<string|undefined>(initialScreen==='host-edit' && initialStep>0 ? parseShared()[initialStep].songId : undefined)
  const [batch,setBatch] = useState(0)
  const [contributions,setContributions] = useState<Contribution[]>(initialScreen==='guest-result' ? [demoContributions[0]] : initialScreen==='host-result' && query.get('demo')==='3' ? demoContributions : initialScreen==='host-result' && query.get('demo')==='1' ? [demoContributions[0]] : [])
  const [resultSide,setResultSide] = useState<'A'|'B'>(query.get('side')==='B'?'B':'A')
  const [detail,setDetail] = useState<Contribution|undefined>()
  const [friendName,setFriendName] = useState('你')
  const [topicOffset,setTopicOffset] = useState(0)
  const [selectedB,setSelectedB] = useState<BId>('B03')
  const [guestSong,setGuestSong] = useState<string|undefined>()
  const [guestBatch,setGuestBatch] = useState(0)
  const [lastContribution,setLastContribution] = useState<Contribution|undefined>(initialScreen==='guest-result'?demoContributions[0]:undefined)
  const [searchContext,setSearchContext] = useState<SearchContext|undefined>()
  const [searchText,setSearchText] = useState('')
  const [shareOpen,setShareOpen] = useState(false)
  const [toast,setToast] = useState('')
  const [artistSelected,setArtistSelected] = useState<string|undefined>()
  const [artistReturn,setArtistReturn] = useState<'home'|'result'>('home')
  const notify = (message:string) => { setToast(message); window.setTimeout(()=>setToast(''),2400) }
  const completeA = sideA.every(item=>Boolean(item.songId)) && new Set(sideA.map(item=>item.questionId)).size===4
  const shareUrl = useMemo(()=>{
    const url=new URL(window.location.origin+window.location.pathname)
    url.searchParams.set('view','guest')
    url.searchParams.set('a',sideA.map(item=>item.questionId+':'+item.songId).join(','))
    url.searchParams.set('name',ownerName==='我'?'阿云（演示）':ownerName)
    return url.toString()
  },[sideA,ownerName])
  const guestOwnerName=ownerName==='我'?'阿云（演示）':ownerName
  const setDemoCount=(count:number)=>{
    const items=demoContributions.map(item=>item.questionId==='B06' && !sideA.some(slot=>slot.questionId==='A01')?{...item,questionId:'B02' as BId}:item)
    setContributions(count===0?[]:count===1?[items[0]]:items)
  }
  const home = () => { setScreen('home'); setDetail(undefined); setShareOpen(false) }
  const startOwn = () => { setSideA(defaultAIds.map(questionId=>({questionId}))); setOwnerName('我'); setStep(0); setDraft(undefined); setBatch(0); setContributions([]); setLastContribution(undefined); setResultSide('A'); setScreen('host-edit'); setShareOpen(false) }
  const goStep = (index:number) => { setStep(index); setDraft(sideA[index].songId); setBatch(0); setScreen('host-edit') }
  const switchQuestion = () => {
    const current=sideA[step].questionId
    const used=new Set(sideA.filter((_,index)=>index!==step).map(item=>item.questionId))
    const start=aQuestions.findIndex(q=>q.id===current)
    const next=Array.from({length:aQuestions.length},(_,index)=>aQuestions[(start+index+1)%aQuestions.length]).find(q=>!used.has(q.id))!
    setSideA(prev=>prev.map((item,index)=>index===step?{questionId:next.id}:item))
    setDraft(undefined); setBatch(0)
    if ((next.id==='A09' && used.has('A01')) || (next.id==='A01' && used.has('A09'))) notify('片头与片尾主题相近，可以为它们选择不同心情')
  }
  const confirmHost = () => {
    if (!draft) return
    const updated=sideA.map((item,index)=>index===step?{...item,songId:draft}:item)
    setSideA(updated)
    if (step===3) { setResultSide('A'); setScreen('host-result') }
    else { setStep(step+1); setDraft(updated[step+1].songId); setBatch(0) }
  }
  const pickTopic = (id:BId) => { setSelectedB(id); setGuestSong(undefined); setGuestBatch(0); setScreen('guest-song') }
  const submitGuest = () => {
    if (!guestSong) return
    const item:Contribution={id:'local-'+Date.now(),friendName:friendName.trim()||'你',questionId:selectedB,songId:guestSong,submittedAt:new Date().toISOString()}
    setContributions(prev=>[...prev,item]); setLastContribution(item); setScreen('guest-result')
  }
  const openSearch=(context:SearchContext)=>{setSearchText('');setSearchContext(context)}
  const pickSearch=(id:string)=>{if(searchContext==='host')setDraft(id);else setGuestSong(id);setSearchContext(undefined)}
  const openArtist=(from:'home'|'result')=>{setArtistReturn(from);setArtistSelected(undefined);setScreen('artist-quiz')}
  const leaveArtist=()=>{if(artistReturn==='home')startOwn();else setScreen('host-result')}
  const copyShare=async()=>{
    try { await navigator.clipboard.writeText(shareUrl); notify('邀请链接已复制，可以发给好友') }
    catch { notify('请长按上方链接手动复制') }
  }
  const demo=(target:Screen,preset=0)=>{
    if(target==='home'){home();return}
    if(target==='host-edit'){setSideA(defaultAIds.map(questionId=>({questionId})));setOwnerName('我');setContributions([]);setStep(0);setDraft(undefined);setBatch(0);setScreen(target);return}
    setSideA(demoA.map(item=>({...item})));setOwnerName('季莫申科科科');setContributions(preset===3?demoContributions:preset===1?[demoContributions[0]]:[])
    setResultSide(preset>0?'B':'A');setLastContribution(demoContributions[0]);setSelectedB('B03');setGuestSong(undefined);setTopicOffset(0);setScreen(target)
  }
  const menu=[
    {label:'01 活动首页',action:()=>demo('home')},
    {label:'02 主态第1题',action:()=>demo('host-edit')},
    {label:'03 换题与换歌',action:()=>{demo('host-edit');setSideA([{questionId:'A01',songId:'s01'},{questionId:'A03'},{questionId:'A05'},{questionId:'A06'}]);setStep(1)}},
    {label:'04 A面完成',action:()=>demo('host-result')},
    {label:'05 B面 · 0位好友',action:()=>demo('host-result',0)},
    {label:'06 B面 · 1位好友',action:()=>demo('host-result',1)},
    {label:'07 B面 · 3位好友',action:()=>demo('host-result',3)},
    {label:'08 好友分享落地',action:()=>demo('guest-entry')},
    {label:'09 好友选择题目',action:()=>demo('guest-topic')},
    {label:'10 好友选择歌曲',action:()=>demo('guest-song')},
    {label:'11 好友贡献结果',action:()=>demo('guest-result',1)},
    {label:'12 唱片A/B翻面',action:()=>{demo('host-result',3);setResultSide('A')}},
  ]
  const page = screen==='home' ? <Home start={startOwn} artist={()=>openArtist('home')} onHome={home}/> :
    screen==='host-edit' ? <HostEditor step={step} slot={sideA[step]} slots={sideA} draft={draft} batch={batch} select={setDraft} switchQuestion={switchQuestion} switchBatch={()=>setBatch(x=>x+1)} search={()=>openSearch('host')} back={()=>step===0?home():goStep(step-1)} confirm={confirmHost} home={home}/> :
    screen==='host-result' ? <HostResult slots={sideA} contributions={contributions} side={resultSide} flip={setResultSide} invite={()=>setShareOpen(true)} guestView={()=>{setScreen('guest-entry');setFriendName('你')}} open={setDetail} artist={()=>openArtist('result')} home={home} ownerName={ownerName} setDemoCount={setDemoCount}/> :
    screen==='guest-entry' ? <GuestEntry slots={sideA} ownerName={guestOwnerName} friendName={friendName} setFriendName={setFriendName} next={()=>{setTopicOffset(0);setScreen('guest-topic')}} home={home}/> :
    screen==='guest-topic' ? <GuestTopics slots={sideA} ownerName={guestOwnerName} offset={topicOffset} rotate={()=>setTopicOffset(x=>(x+3)%availableB(sideA).length)} choose={pickTopic} back={()=>setScreen('guest-entry')} home={home}/> :
    screen==='guest-song' ? <GuestSong questionId={selectedB} slots={sideA} batch={guestBatch} selected={guestSong} select={setGuestSong} switchBatch={()=>setGuestBatch(x=>x+1)} search={()=>openSearch('guest')} back={()=>setScreen('guest-topic')} confirm={submitGuest} home={home}/> :
    screen==='guest-result' && lastContribution ? <GuestResult contribution={lastContribution} ownerName={guestOwnerName} startOwn={startOwn} viewOwner={()=>{setResultSide('B');setScreen('host-result')}} invite={()=>setShareOpen(true)} home={home}/> :
    screen==='artist-quiz'||screen==='artist-reveal' ? <ArtistFlow reveal={screen==='artist-reveal'} selected={artistSelected} setSelected={setArtistSelected} next={()=>setScreen('artist-reveal')} back={leaveArtist} home={home}/> :
    <Home start={startOwn} artist={()=>openArtist('home')} onHome={home}/>
  return <div className="app-shell"><aside className="demo-nav"><div className="demo-title"><span>♫</span><div><b>AB面 · V2.0</b><small>MENTOR REVIEW CONSOLE</small></div></div><div className="demo-status">● 本地交互演示</div><nav>{menu.map(item=><button key={item.label} className={screen==='home' && item.label.includes('首页')?'active':''} onClick={item.action}>{item.label}<em>›</em></button>)}<h3>可选艺人模块</h3><button onClick={()=>openArtist('home')}>艺人初始入口 <em>›</em></button><button onClick={()=>{setSideA(demoA);openArtist('result')}}>艺人结果彩蛋 <em>›</em></button></nav><p className="demo-tips">评审演示模式：0/1/3位好友可一键切换。模拟好友数据仅用于现场讨论。</p><button className="reset-demo" onClick={startOwn}>↻ 从头制作A面</button></aside>
    <div className="phone-stage"><div className="phone-frame" key={screen}>{page}{searchContext && <SearchSheet context={searchContext} search={searchText} setSearch={setSearchText} pick={pickSearch} close={()=>setSearchContext(undefined)}/>}
      {detail && <DetailSheet item={detail} close={()=>setDetail(undefined)}/>}
      {shareOpen && completeA && <ShareSheet url={shareUrl} copy={copyShare} guest={()=>{setShareOpen(false);setScreen('guest-entry')}} close={()=>setShareOpen(false)}/>}
      {toast && <div className="toast">{toast}</div>}</div><p className="viewport-label">390 × 844 · MOBILE H5</p></div></div>
}
