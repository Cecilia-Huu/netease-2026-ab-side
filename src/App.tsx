import { useEffect, useMemo, useRef, useState } from 'react'
import {
  aQuestions, availableB, defaultAIds, defaultBFor, demoA, demoContributions,
  recommendations, songById, songs, aById, bById,
  type AId, type ASelection, type BId, type Contribution, type Song,
} from './content'

type Screen = 'home' | 'host-edit' | 'host-result' | 'guest-song' | 'guest-result' | 'artist-quiz' | 'artist-reveal'
type SearchContext = 'host' | 'guest'
const FEATURES = { artist: false } as const
const query = new URLSearchParams(window.location.search)
document.documentElement.classList.toggle('capture-mode', query.get('capture') === '1')
const screenParam = query.get('screen')
const initialStep = Math.min(3, Math.max(0, Number(query.get('step') || 0) || 0))
const initialScreen: Screen =
  query.get('view') === 'guest' ? 'guest-song' :
  screenParam === 'host-q1' ? 'host-edit' :
  screenParam === 'guest-q1' || screenParam === 'guest-entry' || screenParam === 'guest-topic' ? 'guest-song' :
  screenParam === 'host-ready' ? 'host-result' :
  screenParam === 'guest-result' ? 'guest-result' :
  (['home','host-edit','host-result','guest-song','artist-quiz','artist-reveal'].includes(screenParam ?? '') ?
    (!FEATURES.artist && screenParam?.startsWith('artist') ? 'home' : screenParam as Screen) : 'home')

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
  return <div className={'cover cover-' + song.palette + ' cover-art-' + (Number(song.id.slice(1))%4) + (small ? ' cover-small' : '')} aria-hidden="true"><i></i><span>♪</span><b></b></div>
}
function PlayButton({ song, playing, toggle, compact = false }: { song:Song; playing:boolean; toggle:(id:string)=>void; compact?:boolean }) {
  return <button type="button" className={'play-control '+(playing?'is-playing ':'')+(compact?'is-compact':'')} onClick={event=>{event.stopPropagation();toggle(song.id)}} aria-label={(playing?'暂停Demo试听：':'播放Demo试听：')+song.title} aria-pressed={playing}>
    <span aria-hidden="true">{playing?'Ⅱ':'▶'}</span>
  </button>
}
function TrackActionIcon({ type, filled = false }: { type:'heart'|'comment'|'share'; filled?:boolean }) {
  if(type==='heart')return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5S4 16 2.7 10.9C1.7 7 4.2 4 7.4 4c2 0 3.7 1.1 4.6 2.6C12.9 5.1 14.6 4 16.6 4c3.2 0 5.7 3 4.7 6.9C20 16 12 20.5 12 20.5Z" fill={filled?'currentColor':'none'}/></svg>
  if(type==='comment')return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 17.3 3.8 21l3.7-1.8A9.2 9.2 0 1 0 4.5 17.3Z"/><path d="M8 10h8M8 13.5h5"/></svg>
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 6.2 19.3 12l-5.8 5.8M19 12H9.8c-3.2 0-5.5 1.8-6.8 5.2.3-6.2 3.4-9.2 9.4-9.2"/></svg>
}
function Vinyl({ palette = 'rainbow', side = 'A', small = false, onClick }: { palette?: string; side?: 'A' | 'B'; small?: boolean; onClick?: () => void }) {
  const contents = <><i className="vinyl-groove groove-a"></i><i className="vinyl-groove groove-b"></i><span className="vinyl-center"><b>{side}</b><em>2026</em></span></>
  return onClick ? <button className={'vinyl vinyl-' + palette + (small ? ' vinyl-small' : '')} onClick={onClick} aria-label="翻转唱片">{contents}</button> :
    <div className={'vinyl vinyl-' + palette + (small ? ' vinyl-small' : '')}>{contents}</div>
}
function SongChoices({ list, selected, onSelect, host = false }: { list: Song[]; selected?: string; onSelect: (id: string) => void; host?: boolean }) {
  const chosen = songById(selected)
  const display = chosen && !list.some(song => song.id === chosen.id) ? [chosen, ...list] : list
  return <div className="song-list">{display.map((song, i) =>
    <button className={'song-option ' + (selected === song.id ? 'selected' : '')} key={song.id} onClick={() => onSelect(song.id)}>
      <Cover song={song} /><span className="song-meta"><strong>{song.title}</strong><small>{song.artist}</small><em>{chosen?.id === song.id && i === 0 && !list.some(item => item.id === song.id) ? '自主选择 · 未读取个人播放记录' : host ? song.note : song.note + ' · 模拟推荐'}</em></span>
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
  <div className="home-actions"><Button light onClick={start}>录制我的A面</Button>{FEATURES.artist&&<button className="artist-teaser" onClick={artist}><span>AL</span><b>艺人隐藏B面 · 模拟彩蛋</b><em>↗</em></button>}</div></main>
}
function HostEditor({ step, slot, slots, draft, batch, select, switchQuestion, switchBatch, search, back, confirm, home, hasHistory }: {
  step:number; slot:ASelection; slots:ASelection[]; draft?:string; batch:number; select:(id:string)=>void;
  switchQuestion:()=>void; switchBatch:()=>void; search:()=>void; back:()=>void; confirm:()=>void; home:()=>void; hasHistory:boolean
}) {
  const question = aById(slot.questionId)
  return <main className="screen question-screen"><Brand onHome={home} /><div className="progress-wrap"><span>A SIDE · {String(step+1).padStart(2,'0')}/04</span><div className="progress"><i style={{width:((step+1)*25)+'%'}}></i></div><b>{question.id}</b></div>
    <div className="question-body"><div className="question-heading"><span className="question-kicker">RECORD YOUR SIDE</span><p className="question-type">{question.title}</p><h2>{question.prompt}</h2><p>{!hasHistory?'通用歌单推荐':question.id==='A07'?'运营创意歌单':'模拟听歌数据'} · 选一首歌，写下你的2026。</p></div>
      <SongChoices list={recommendations(question.id,batch,hasHistory)} selected={draft} onSelect={select} host />
      <div className="question-tools"><button onClick={switchQuestion}>↻ 换一题</button><button onClick={switchBatch}>⟳ 换一批歌曲</button><button onClick={search}>⌕ 搜索歌曲</button></div>
      <p className="data-note">{!hasHistory?'无听歌数据示例：运营主题歌单推荐，不含个人播放信息。':question.id==='A07'?'本题歌曲与趣味文案为运营创意示例。':'播放记录与推荐理由均为Mock演示数据，不代表真实用户记录。'} 可换题、换歌或返回修改。</p>
    </div><div className="sticky-actions"><button className="back-link" onClick={back}>← {step === 0 ? '返回首页' : '上一题'}</button><Button onClick={confirm} disabled={!draft}>{step === 3 ? '完成我的A面' : '确认，下一题'}</Button></div>
  </main>
}
function MiniRecord({ contribution, onClick, large = false }: { contribution: Contribution; onClick?: () => void; large?: boolean }) {
  const question=bById(contribution.questionId), song=songById(contribution.songId)!
  return <button className={'mini-record mini-' + question.palette + (large ? ' mini-large' : '')} onClick={onClick} disabled={!onClick} aria-label={'查看' + contribution.friendName + '的B面贡献'}>
    <div className="mini-disc"><div className="mini-center"><Cover song={song} small/></div></div>
    <span className="mini-caption"><b>{song.title}</b><small>{contribution.friendName}</small></span>
  </button>
}
function BQuestionPicker({ slots, selected, choose, expanded, toggle }: {
  slots:ASelection[]; selected:BId; choose:(id:BId)=>void; expanded:boolean; toggle:()=>void
}) {
  const all=defaultBFor(slots)
  const firstFour=all.slice(0,4)
  const selectedQuestion=all.find(question=>question.id===selected)
  const deck=selectedQuestion&&!firstFour.some(question=>question.id===selected)?[selectedQuestion,...firstFour.slice(0,3)]:firstFour
  const selectedIndex=Math.max(0,deck.findIndex(question=>question.id===selected))
  const ordered=[...deck.slice(selectedIndex),...deck.slice(0,selectedIndex)]
  const a01=songById(slots.find(item=>item.questionId==='A01')?.songId)
  const startX=useRef<number|null>(null)
  const timer=useRef<number|undefined>(undefined)
  const [dragX,setDragX]=useState(0)
  const [leaving,setLeaving]=useState<'left'|'right'|null>(null)
  useEffect(()=>()=>window.clearTimeout(timer.current),[])
  const switchTo=(id:BId,direction:1|-1)=>{
    if(id===selected||leaving)return
    setLeaving(direction===1?'left':'right')
    timer.current=window.setTimeout(()=>{choose(id);setLeaving(null);setDragX(0)},180)
  }
  const cycle=(direction:1|-1)=>{
    const target=deck[(selectedIndex+direction+deck.length)%deck.length]
    if(target)switchTo(target.id,direction)
  }
  const pointerDown=(event:React.PointerEvent<HTMLButtonElement>)=>{
    startX.current=event.clientX
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const pointerMove=(event:React.PointerEvent<HTMLButtonElement>)=>{
    if(startX.current===null||leaving)return
    setDragX(Math.max(-75,Math.min(75,event.clientX-startX.current)))
  }
  const pointerEnd=(event:React.PointerEvent<HTMLButtonElement>)=>{
    if(startX.current===null)return
    const distance=event.clientX-startX.current
    startX.current=null
    if(Math.abs(distance)>38)cycle(distance<0?1:-1)
    else setDragX(0)
  }
  return <section className="b-question-picker">
    <div className="picker-heading fan-picker-heading"><span>CHOOSE A QUESTION</span><h2>抽一张题卡，让好友补全B面</h2></div>
    <div className="fanned-card-deck" aria-label="左右滑动或点击卡片边缘切换题目">
      {ordered.map((question,index)=>
        <button key={question.id} className={'fan-index-card fan-depth-'+index+(index===0?' is-front':'')+(index===0&&leaving?' is-leaving-'+leaving:'')} style={index===0?{'--drag-x':dragX+'px','--drag-rotate':dragX*.025+'deg'} as React.CSSProperties:undefined} onClick={()=>{if(index>0)switchTo(question.id,1)}} onPointerDown={index===0?pointerDown:undefined} onPointerMove={index===0?pointerMove:undefined} onPointerUp={index===0?pointerEnd:undefined} onPointerCancel={index===0?()=>{startX.current=null;setDragX(0)}:undefined} aria-pressed={index===0} aria-label={index===0?`当前分享题目：${question.title}`:`切换为${question.title}`}>
          {index===0&&<span className="fan-card-inner"><span className="fan-card-count">{String(selectedIndex+1).padStart(2,'0')}/04 · {question.id}</span><span className="fan-card-check">✓ 已选</span><strong>{question.title}</strong><small>{question.prompt}</small>{question.id==='B06'&&a01&&<em>TA的片头曲：《{a01.title}》</em>}<i>左右滑动翻阅</i></span>}
        </button>)}
    </div>
    <div className="fan-card-controls"><button onClick={()=>cycle(1)}>↻ 换一张</button><button onClick={toggle}>{expanded?'收起题目 ↑':'查看更多题目 ↗'}</button></div>
    {expanded&&<div className="fan-more-list">{all.map(question=><button key={question.id} className={selected===question.id?'chosen':''} onClick={()=>switchTo(question.id,1)} aria-pressed={selected===question.id}><span>{question.id}</span>{question.title}</button>)}</div>}
  </section>
}
function aCoverReason(item:ASelection, hasHistory:boolean) {
  const suggested=Array.from({length:songs.length+1},(_,batch)=>batch)
    .map(batch=>recommendations(item.questionId,batch,hasHistory).find(song=>song.id===item.songId))
    .find(Boolean)
  return suggested?.note.replace(/^模拟记录 · /,'').replace(/，还没分享过$/, '') ?? '你亲自选进A面的歌'
}
function bCoverReason(item:Contribution) {
  const question=bById(item.questionId)
  const song=songById(item.songId)
  const suggested=recommendations(item.questionId,0,false).find(candidate=>candidate.id===item.songId)
  const witty=item.questionId==='B07' ? recommendations('B03',0,false).find(candidate=>candidate.id===item.songId) : suggested
  return witty && witty.note!==song?.note ? witty.note : question.line
}
function HostResult({ slots, contributions, side, flip, invite, guestView, open, artist, home, setDemoCount, reviewCount, actualCount, selectedB, chooseB, expanded, toggleExpanded, hasHistory, playingSongId, togglePlay, likedSongs, toggleLike, commentSong, shareSong }: {
  slots:ASelection[]; contributions:Contribution[]; side:'A'|'B'; flip:(side:'A'|'B')=>void; invite:()=>void;
  guestView:()=>void; open:(item:Contribution)=>void; artist:()=>void; home:()=>void;
  setDemoCount:(count:number|null)=>void; reviewCount:number|null; actualCount:number; selectedB:BId; chooseB:(id:BId)=>void; expanded:boolean; toggleExpanded:()=>void; hasHistory:boolean;
  playingSongId?:string; togglePlay:(id:string)=>void; likedSongs:Set<string>; toggleLike:(id:string)=>void; commentSong:(song:Song)=>void; shareSong:(song:Song)=>void
}) {
  const empty=contributions.length===0
  const spotlight=slots.find(item=>item.questionId==='A02')??slots[0]
  const spotlightSong=songById(spotlight.songId)
  return <main className="screen album-result-screen">
    <div className="result-scroll scrollable">
    <Brand onHome={home}/>
    <div className="album-header"><span className="eyebrow">ONE RECORD · TWO SIDES</span>
      <h1>{side==='A'?'我的2026 A面':empty?'我的2026 B面':'我的2026 AB面'}</h1>
      <p>{side==='A'?'你的A面已经写好，但这还不是你的全部。':empty?'你的B面还没有被写完。':'朋友写下的歌，正让另一面慢慢完整。'}</p>
    </div>
    <div className={'album-stage '+(side==='B'?'show-b':'show-a')+(empty?' is-empty':' has-friends')}>
      <div className="sleeve-paper"><span>2026 / 私人唱片</span><i>✶</i></div>
      <div className="album-stack" role="button" tabIndex={0} onClick={()=>flip(side==='A'?'B':'A')} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();flip(side==='A'?'B':'A')}}} aria-label="翻转查看唱片另一面">
        <span className="album-a-record"><span className="record-ring"></span><span className="album-a-label">A<small>我的2026</small></span>
          {slots.map((item,index)=>{const song=songById(item.songId),reason=aCoverReason(item,hasHistory);return song?<span className={'record-cover cover-position-'+index} key={item.questionId}><Cover song={song} small/><PlayButton song={song} playing={playingSongId===song.id} toggle={togglePlay} compact/><span className="record-caption" title={reason}><b>#{aById(item.questionId).title}</b><strong>《{song.title}》</strong><small>{reason}</small></span></span>:null})}
          {spotlightSong&&<span className="album-a-songline">{spotlight.questionId==='A02'?'我的年度最爱':'我的年度主打'}《{spotlightSong.title}》</span>}
        </span>
        <span className="album-b-record"><span className="record-ring"></span><span className="album-b-label">{empty?'?':'B'}<small>{empty?'等待朋友写下':'好友眼中的我'}</small></span>{empty&&<span className="b-visible-question" aria-hidden="true"><b>?</b><small>B面待补全</small></span>}</span>
      </div>
      {side==='B'&&!empty&&<div className={'b-face-contributions count-'+Math.min(contributions.length,6)} aria-label="好友写在B面上的歌曲">
        {contributions.map(item=>{const song=songById(item.songId),question=bById(item.questionId),reason=bCoverReason(item);return song?<div key={item.id} className="b-face-entry" role="button" tabIndex={0} onClick={()=>open(item)} onKeyDown={event=>{if(event.key==='Enter'){open(item)}}} aria-label={'查看'+item.friendName+'为'+question.title+'选择的'+song.title+'，'+reason} title={reason}>
          <span className="b-face-mini-disc"><Cover song={song} small/><PlayButton song={song} playing={playingSongId===song.id} toggle={togglePlay} compact/></span><b>《{song.title}》</b><span className="b-face-note">{reason}</span><small className="b-face-owner">{item.friendName}</small>
        </div>:null})}
      </div>}
      <span className="stage-hint">{side==='B'&&!empty?'轻触好友歌曲，打开详情 ↗':'轻触唱片，也能翻面 ↗'}</span>
    </div>
    <div className="album-tabs"><button className={side==='A'?'active':''} onClick={()=>flip('A')}>A SIDE <small>我亲自录制</small></button><button className={side==='B'?'active':''} onClick={()=>flip('B')}>B SIDE <small>朋友来写</small></button></div>
    <BQuestionPicker slots={slots} selected={selectedB} choose={chooseB} expanded={expanded} toggle={toggleExpanded}/>
    <button className="guest-preview-link" onClick={guestView}>体验好友视角 ↗</button>
    <section className="album-tracklist"><div className="section-title"><span>THE FOUR TRACKS</span><b>我的四首年度注脚</b></div>
      {slots.map((item,index)=>{const song=songById(item.songId),reason=aCoverReason(item,hasHistory);return <div className="track-row" key={item.questionId}><span>{String(index+1).padStart(2,'0')}</span>{song&&<span className="track-cover"><Cover song={song} small/><PlayButton song={song} playing={playingSongId===song.id} toggle={togglePlay} compact/></span>}<div className="track-copy"><small>{aById(item.questionId).title}</small><b>{song?.title??'待选歌曲'}</b><em>{song?.artist??''}</em><small className="track-reason">{reason}</small></div>{song&&<div className="track-actions"><button className={likedSongs.has(song.id)?'liked':''} onClick={()=>toggleLike(song.id)} aria-label={(likedSongs.has(song.id)?'取消红心：':'添加红心：')+song.title} aria-pressed={likedSongs.has(song.id)}><TrackActionIcon type="heart" filled={likedSongs.has(song.id)}/></button><button onClick={()=>commentSong(song)} aria-label={'查看Demo评论：'+song.title}><TrackActionIcon type="comment"/></button><button onClick={()=>shareSong(song)} aria-label={'分享歌曲：'+song.title}><TrackActionIcon type="share"/></button></div>}</div>})}
      <p>4首歌曲，组成我的年度主打。红心与试听均为当前页面Demo状态。</p></section>
    {side==='B'&&!empty&&<section className="b-side-summary"><span>FRIENDS ON THE B SIDE</span><h2>{contributions.length} 位好友，写下了你的另一面</h2><p>每首歌都已收进B面唱片，轻触唱片上的小圆盘即可查看。</p></section>}
    <div className="result-demo-switch"><span>评审演示模式 · 仅模拟好友数量</span><div>{[0,1,3,6].map(count=><button key={count} className={reviewCount===count?'active':''} onClick={()=>{setDemoCount(count);flip(count===0?'A':'B')}}>{count===6?'多位':count+'位'}</button>)}{actualCount>0&&<button className={reviewCount===null?'active':''} onClick={()=>{setDemoCount(null);flip('B')}}>本次贡献</button>}</div></div>
    {FEATURES.artist&&<button className="artist-egg" onClick={artist}><span>AL</span><b>艺人隐藏B面 · 可选模拟彩蛋</b><em>↗</em></button>}
    {contributions.some(item=>item.demo)&&<p className="demo-note">评审演示样例，非真实线上好友数据。</p>}
    </div>
    <div className="result-fixed-invite"><Button onClick={invite}>继续邀请好友，发现更多B面</Button></div>
  </main>
}
function GuestSong({ questionId, slots, ownerName, batch, selected, select, switchBatch, search, back, confirm, home, hasHistory, friendName, setFriendName }: {
  questionId:BId; slots:ASelection[]; ownerName:string; batch:number; selected?:string; select:(id:string)=>void;
  switchBatch:()=>void; search:()=>void; back:()=>void; confirm:()=>void; home:()=>void; hasHistory:boolean;
  friendName:string; setFriendName:(value:string)=>void
}) {
  const question=bById(questionId), a01=songById(slots.find(item=>item.questionId==='A01')?.songId)
  return <main className="screen question-screen guest-song-screen"><Brand onHome={home}/><div className="progress-wrap"><span>B SIDE · 为{ownerName}选歌</span><div className="progress"><i style={{width:'100%'}}></i></div><b>01/01</b></div>
    <div className="question-body"><div className="guest-share-note"><span>来自{ownerName}的一张空白B面</span><b>{question.title}</b></div>
      <div className="question-heading"><span className="question-kicker mint">WRITE THE OTHER SIDE</span><h2>{question.prompt}</h2><p>只需要一首歌，写下你眼中的TA。</p></div>
      {question.id==='B06'&&a01&&<div className="a-contrast">TA为自己选的片头曲 <b>《{a01.title}》</b><span>你想换成哪首？</span></div>}
      <SongChoices list={recommendations(question.id,batch,hasHistory)} selected={selected} onSelect={select}/>
      <div className="question-tools two"><button onClick={switchBatch}>⟳ 换一批歌曲</button><button onClick={search}>⌕ 搜索歌曲</button></div>
      <label className="guest-name-inline">你的称呼 <input value={friendName} maxLength={12} onChange={event=>setFriendName(event.target.value)} placeholder="写一个昵称"/></label>
      <p className="data-note">原型模拟推荐；歌曲和文案不代表真实听歌记录。</p>
    </div><div className="sticky-actions"><button className="back-link" onClick={back}>← 返回活动首页</button><Button onClick={confirm} disabled={!selected}>把这首歌放进TA的B面</Button></div>
  </main>
}
function GuestResult({ contribution, ownerName, slots, startOwn, viewOwner, invite, detail, home }: {
  contribution:Contribution; ownerName:string; slots:ASelection[]; startOwn:()=>void; viewOwner:()=>void;
  invite:()=>void; detail:()=>void; home:()=>void
}) {
  const question=bById(contribution.questionId), song=songById(contribution.songId)!
  const a01=songById(slots.find(item=>item.questionId==='A01')?.songId)
  return <main className="screen guest-result-screen scrollable"><Brand onHome={home}/>
    <div className="guest-result-top"><span className="eyebrow">A SONG FROM ME TO YOU</span><h1>我为{ownerName}的B面，<br/>留了这一首。</h1></div>
    <div className="solo-record"><span className="paper-tape"></span><MiniRecord contribution={contribution} large onClick={detail}/><div className="solo-stamp">{question.badge}</div></div>
    <div className="guest-result-copy"><span>B SIDE · {question.id} / {question.title}</span><h2>{song.title}</h2><p>{song.artist}</p><blockquote>{question.line}</blockquote>
      {question.id==='B06'&&a01&&<div className="guest-contrast">TA给自己的2026选了《{a01.title}》；<br/>但我觉得，TA明明演的是一部《{song.title}》！</div>}
      <small>由 {contribution.friendName} 收藏于TA的2026 · 点击小黑胶看详情</small></div>
    <div className="guest-result-actions"><Button onClick={startOwn}>我也要制作自己的AB面</Button><div><button onClick={invite}>继续邀请好友</button><button onClick={viewOwner}>查看TA的AB面</button></div></div>
    <p className="demo-note">静态演示：本次贡献仅保存在当前会话，不跨设备实时同步。</p>
  </main>
}
function DetailSheet({ item, close }: { item:Contribution; close:()=>void }) {
  const q=bById(item.questionId), song=songById(item.songId)!
  return <div className="sheet-backdrop" role="presentation" onClick={close}><section className="detail-sheet" role="dialog" aria-label="好友唱片详情" onClick={event=>event.stopPropagation()}><button className="sheet-close" onClick={close}>×</button><span className="eyebrow">B SIDE · {q.id}</span><MiniRecord contribution={item} large/><div className="detail-text"><span>{q.badge}</span><h3>{song.title}</h3><p>{song.artist}</p><small>#{q.title} · {bCoverReason(item)}</small><blockquote>{q.line}</blockquote><small>{item.friendName} · {new Date(item.submittedAt).toLocaleString('zh-CN')}</small>{item.demo && <em>评审演示样例</em>}</div></section></div>
}
function ShareSheet({ url, questionId, share, copy, guest, close }: { url:string; questionId:BId; share:()=>void; copy:()=>void; guest:()=>void; close:()=>void }) {
  const question=bById(questionId)
  return <div className="sheet-backdrop" role="presentation" onClick={close}><section className="share-sheet" role="dialog" aria-label="分享B面题目" onClick={event=>event.stopPropagation()}>
    <button className="sheet-close" onClick={close} aria-label="关闭分享弹层">×</button><span className="eyebrow">INVITE A FRIEND</span><h3>这道题，想交给谁？</h3>
    <div className="share-question-preview"><span>{question.id} / {question.title}</span><b>{question.prompt}</b></div>
    <p>好友打开链接后会直接为这道题选一首歌。</p><textarea readOnly value={url} aria-label="客态演示链接"/>
    <Button onClick={share}>分享这道题给好友</Button><button className="share-demo" onClick={copy}>复制邀请链接</button><button className="share-demo" onClick={guest}>在本机体验好友视角 ↗</button>
    <small>静态演示：链接携带A面和这道B面题；好友贡献不跨设备实时同步。</small>
  </section></div>
}
function ArtistFlow({ reveal, selected, setSelected, next, back, home }: { reveal:boolean; selected?:string; setSelected:(v:string)=>void; next:()=>void; back:()=>void; home:()=>void }) {
  return <main className="screen artist-screen scrollable"><Brand dark onHome={home}/><div className="artist-profile"><div className="artist-portrait">AL</div><div><span>ARTIST B SIDE · CONCEPT</span><h1>A-Lin</h1><p>合作及内容均待确认 · 模拟素材</p></div></div>
    {!reveal ? <><div className="artist-question"><span>可选彩蛋 · 不影响个人A/B面</span><h2>如果舞台灯光关掉，<br/>哪首歌更像此刻的心情？</h2></div><div className="artist-options">{['失恋无罪','给我一个理由忘记','挚友'].map((title,index)=><button key={title} className={selected===title?'selected':''} onClick={()=>setSelected(title)}><span className={'artist-cover artist-cover-'+index}>♪</span><b>{title}</b><em>{selected===title?'✓':'0'+(index+1)}</em></button>)}</div><div className="artist-bottom"><Button light onClick={next} disabled={!selected}>揭晓模拟B面</Button><button onClick={back}>跳过，继续我的AB面</button></div></> :
    <><div className="artist-reveal"><Vinyl palette="berry"/><span>模拟彩蛋</span><h2>给我一个理由忘记</h2><p>概念示意，不代表艺人本人偏好。</p></div><div className="artist-bottom"><Button light onClick={back}>继续我的AB面</Button></div></>}
  </main>
}

function initialHostSlots():ASelection[] {
  if (initialStep>0) return parseShared()
  const slots=defaultAIds.map(questionId=>({questionId}))
  const requested=query.get('question') as AId | null
  if (requested && aQuestions.some(item=>item.id===requested)) {
    const existing=slots.findIndex(item=>item.questionId===requested)
    if (existing>0) slots[existing].questionId=slots[0].questionId
    slots[0].questionId=requested
  }
  return slots
}
export default function App() {
  useEffect(()=>{
    if(query.get('capture')!=='1'||initialScreen!=='host-result')return
    const focus=query.get('focus')
    if(focus!=='picker'&&focus!=='tracks'&&focus!=='wall')return
    window.requestAnimationFrame(()=>{
      const main=document.querySelector('.result-scroll')
      const target=document.querySelector(focus==='picker'?'.b-question-picker':focus==='tracks'?'.album-tracklist':'.b-collection')
      if(main&&target)main.scrollTo({top:(target as HTMLElement).offsetTop-26})
    })
  },[])
  const guestInitial=initialScreen.startsWith('guest') || query.get('view')==='guest'
  const sharedA=guestInitial || initialScreen==='host-result'
  const [screen,setScreen]=useState<Screen>(initialScreen)
  const [sideA,setSideA]=useState<ASelection[]>(sharedA?parseShared():initialHostSlots())
  const [ownerName,setOwnerName]=useState(sharedA?query.get('name')||'阿云（演示）':'我')
  const [hasHistory,setHasHistory]=useState(query.get('profile')!=='new')
  const [step,setStep]=useState(initialStep)
  const [draft,setDraft]=useState<string|undefined>(initialScreen==='host-edit'&&initialStep>0?parseShared()[initialStep].songId:undefined)
  const [batch,setBatch]=useState(0)
  const initialDemo=query.get('demo')
  const [realContributions,setRealContributions]=useState<Contribution[]>(initialScreen==='guest-result'?[demoContributions[0]]:[])
  const [reviewCount,setReviewCount]=useState<number|null>(initialScreen==='host-result'&&['0','1','3','6'].includes(initialDemo??'')?Number(initialDemo):null)
  const [resultSide,setResultSide]=useState<'A'|'B'>(query.get('side')==='B'?'B':'A')
  const [detail,setDetail]=useState<Contribution|undefined>()
  const [friendName,setFriendName]=useState('你')
  const urlB=query.get('b') as BId | null
  const [selectedB,setSelectedB]=useState<BId>(urlB&&availableB(parseShared()).some(question=>question.id===urlB)?urlB:'B03')
  const [expandedB,setExpandedB]=useState(false)
  const [guestSong,setGuestSong]=useState<string|undefined>()
  const [guestBatch,setGuestBatch]=useState(0)
  const [lastContribution,setLastContribution]=useState<Contribution|undefined>(initialScreen==='guest-result'?demoContributions[0]:undefined)
  const [searchContext,setSearchContext]=useState<SearchContext|undefined>()
  const [searchText,setSearchText]=useState('')
  const [shareOpen,setShareOpen]=useState(false)
  const [toast,setToast]=useState('')
  const [playingSongId,setPlayingSongId]=useState<string|undefined>()
  const [likedSongs,setLikedSongs]=useState<Set<string>>(()=>new Set())
  const [artistSelected,setArtistSelected]=useState<string|undefined>()
  const [artistReturn,setArtistReturn]=useState<'home'|'result'>('home')
  const notify=(message:string)=>{setToast(message);window.setTimeout(()=>setToast(''),2400)}
  const togglePlay=(songId:string)=>{
    const song=songById(songId)
    if(playingSongId===songId){setPlayingSongId(undefined);notify('Demo 试听已暂停')}
    else{setPlayingSongId(songId);notify(`Demo 试听中：${song?.title??'这首歌'} · 正式版待接入授权音源`)}
  }
  const toggleLike=(songId:string)=>setLikedSongs(previous=>{const next=new Set(previous);if(next.has(songId))next.delete(songId);else next.add(songId);return next})
  const commentSong=(song:Song)=>notify(`Demo 评论预览：${song.title} · 正式版可接入歌曲评论区`)
  const shareSong=async(song:Song)=>{
    const url=new URL(window.location.origin+window.location.pathname)
    url.searchParams.set('song',song.id)
    const text=`分享歌曲《${song.title}》— ${song.artist}`
    if(navigator.share){
      try{await navigator.share({title:`${song.title} - ${song.artist}`,text,url:url.toString()});return}
      catch(error){if(error instanceof DOMException&&error.name==='AbortError')return}
    }
    try{await navigator.clipboard.writeText(`${text} ${url}`);notify('单曲分享内容已复制')}
    catch{notify(`Demo 单曲分享：${song.title}`)}
  }
  const completeA=sideA.every(item=>Boolean(item.songId))&&new Set(sideA.map(item=>item.questionId)).size===4
  const shareUrl=useMemo(()=>{
    const url=new URL(window.location.origin+window.location.pathname)
    url.searchParams.set('view','guest')
    url.searchParams.set('a',sideA.map(item=>item.questionId+':'+item.songId).join(','))
    url.searchParams.set('b',selectedB)
    url.searchParams.set('name',ownerName==='我'?'阿云（演示）':ownerName)
    return url.toString()
  },[sideA,selectedB,ownerName])
  const guestOwnerName=ownerName==='我'?'阿云（演示）':ownerName
  const demoItems=demoContributions.map(item=>item.questionId==='B06'&&!sideA.some(slot=>slot.questionId==='A01')?{...item,questionId:'B02' as BId}:item)
  const contributions=reviewCount===null?realContributions:demoItems.slice(0,reviewCount)
  const setDemoCount=(count:number|null)=>setReviewCount(count)
  const flipResult=(side:'A'|'B')=>{setResultSide(side);document.querySelector('.result-scroll')?.scrollTo({top:0,behavior:'smooth'})}
  const home=()=>{setScreen('home');setDetail(undefined);setShareOpen(false)}
  const startOwn=()=>{
    setSideA(defaultAIds.map(questionId=>({questionId})));setOwnerName('我');setStep(0);setDraft(undefined);setBatch(0)
    setRealContributions([]);setReviewCount(null);setLastContribution(undefined);setSelectedB('B03');setExpandedB(false)
    setResultSide('A');setScreen('host-edit');setShareOpen(false);setPlayingSongId(undefined);setLikedSongs(new Set())
  }
  const goStep=(index:number)=>{setStep(index);setDraft(sideA[index].songId);setBatch(0);setScreen('host-edit')}
  const switchQuestion=()=>{
    const current=sideA[step].questionId
    const used=new Set(sideA.filter((_,index)=>index!==step).map(item=>item.questionId))
    const start=aQuestions.findIndex(question=>question.id===current)
    const next=Array.from({length:aQuestions.length},(_,index)=>aQuestions[(start+index+1)%aQuestions.length]).find(question=>!used.has(question.id))!
    setSideA(previous=>previous.map((item,index)=>index===step?{questionId:next.id}:item))
    setDraft(undefined);setBatch(0)
  }
  const confirmHost=()=>{
    if (!draft) return
    const updated=sideA.map((item,index)=>index===step?{...item,songId:draft}:item)
    setSideA(updated)
    if(step===3){setSelectedB('B03');setResultSide('A');setScreen('host-result')}
    else{setStep(step+1);setDraft(updated[step+1].songId);setBatch(0)}
  }
  const submitGuest=()=>{
    if(!guestSong) return
    const item:Contribution={id:'local-'+Date.now(),friendName:friendName.trim()||'你',questionId:selectedB,songId:guestSong,submittedAt:new Date().toISOString()}
    setRealContributions(previous=>[...previous,item]);setReviewCount(null);setLastContribution(item);setScreen('guest-result')
  }
  const openSearch=(context:SearchContext)=>{setSearchText('');setSearchContext(context)}
  const pickSearch=(id:string)=>{if(searchContext==='host')setDraft(id);else setGuestSong(id);setSearchContext(undefined)}
  const openArtist=(from:'home'|'result')=>{if(!FEATURES.artist)return;setArtistReturn(from);setArtistSelected(undefined);setScreen('artist-quiz')}
  const leaveArtist=()=>{if(artistReturn==='home')startOwn();else setScreen('host-result')}
  const copyShare=async()=>{
    try{await navigator.clipboard.writeText(shareUrl);notify('邀请链接已复制，可以发给好友')}
    catch{notify('请长按上方链接手动复制')}
  }
  const shareOrCopy=async()=>{
    if(navigator.share){
      try{await navigator.share({title:'我的2026 AB面',text:bById(selectedB).prompt,url:shareUrl});return}
      catch(error){if(error instanceof DOMException&&error.name==='AbortError')return}
    }
    await copyShare()
  }
  const demo=(target:Screen,count=0)=>{
    setShareOpen(false);setDetail(undefined);setSearchContext(undefined)
    if(target==='home'){home();return}
    if(target==='host-edit'){setSideA(defaultAIds.map(questionId=>({questionId})));setOwnerName('我');setRealContributions([]);setReviewCount(null);setStep(0);setDraft(undefined);setBatch(0);setScreen(target);return}
    setSideA(demoA.map(item=>({...item})));setOwnerName('阿云（演示）')
    setReviewCount(count)
    setResultSide(count>0?'B':'A');setLastContribution(demoContributions[0])
    setSelectedB('B03');setGuestSong(undefined);setExpandedB(false);setScreen(target)
    window.requestAnimationFrame(()=>document.querySelector('.result-scroll')?.scrollTo({top:0}))
  }
  const menu=[
    {label:'01 活动首页',action:()=>demo('home')},
    {label:'02 A面 · 年度本命',action:()=>{demo('host-edit');setSideA([{questionId:'A02'},...defaultAIds.slice(1).map(questionId=>({questionId}))])}},
    {label:'03 A面 · 精神状态',action:()=>{demo('host-edit');setSideA([{questionId:'A07'},...defaultAIds.filter(id=>id!=='A07').slice(0,3).map(questionId=>({questionId}))])}},
    {label:'04 A面完成',action:()=>demo('host-result')},
    {label:'05 B面问号 · 选题',action:()=>{demo('host-result');setResultSide('B')}},
    {label:'06 B面切换题目',action:()=>{demo('host-result');setResultSide('B');setSelectedB('B04')}},
    {label:'07 B面 · 1位好友',action:()=>demo('host-result',1)},
    {label:'08 B面 · 3位好友',action:()=>demo('host-result',3)},
    {label:'09 多好友B面',action:()=>demo('host-result',6)},
    {label:'10 好友直接选歌',action:()=>demo('guest-song')},
    {label:'11 好友贡献结果',action:()=>demo('guest-result',1)},
    {label:'12 A/B反复翻面',action:()=>{demo('host-result',3);setResultSide('A')}},
  ]
  const page=screen==='home'?<Home start={startOwn} artist={()=>openArtist('home')} onHome={home}/>:
    screen==='host-edit'?<HostEditor step={step} slot={sideA[step]} slots={sideA} draft={draft} batch={batch} select={setDraft} switchQuestion={switchQuestion} switchBatch={()=>setBatch(value=>value+1)} search={()=>openSearch('host')} back={()=>step===0?home():goStep(step-1)} confirm={confirmHost} home={home} hasHistory={hasHistory}/>:
    screen==='host-result'?<HostResult slots={sideA} contributions={contributions} side={resultSide} flip={flipResult} invite={shareOrCopy} guestView={()=>{setGuestSong(undefined);setScreen('guest-song')}} open={setDetail} artist={()=>openArtist('result')} home={home} setDemoCount={setDemoCount} reviewCount={reviewCount} actualCount={realContributions.length} selectedB={selectedB} chooseB={setSelectedB} expanded={expandedB} toggleExpanded={()=>setExpandedB(value=>!value)} hasHistory={hasHistory} playingSongId={playingSongId} togglePlay={togglePlay} likedSongs={likedSongs} toggleLike={toggleLike} commentSong={commentSong} shareSong={shareSong}/>:
    screen==='guest-song'?<GuestSong questionId={selectedB} slots={sideA} ownerName={guestOwnerName} batch={guestBatch} selected={guestSong} select={setGuestSong} switchBatch={()=>setGuestBatch(value=>value+1)} search={()=>openSearch('guest')} back={home} confirm={submitGuest} home={home} hasHistory={false} friendName={friendName} setFriendName={setFriendName}/>:
    screen==='guest-result'&&lastContribution?<GuestResult contribution={lastContribution} ownerName={guestOwnerName} slots={sideA} startOwn={startOwn} viewOwner={()=>{setResultSide('B');setScreen('host-result')}} invite={()=>setShareOpen(true)} detail={()=>setDetail(lastContribution)} home={home}/>:
    screen==='artist-quiz'||screen==='artist-reveal'?<ArtistFlow reveal={screen==='artist-reveal'} selected={artistSelected} setSelected={setArtistSelected} next={()=>setScreen('artist-reveal')} back={leaveArtist} home={home}/>:
    <Home start={startOwn} artist={()=>openArtist('home')} onHome={home}/>
  return <div className="app-shell"><aside className="demo-nav"><div className="demo-title"><span>♫</span><div><b>AB面 · V3.0</b><small>MENTOR REVIEW CONSOLE</small></div></div><div className="demo-status">● 可交互评审演示</div><nav>{menu.map(item=><button key={item.label} onClick={item.action}>{item.label}<em>›</em></button>)}<h3>其他状态</h3><button onClick={()=>{setHasHistory(false);demo('host-edit')}}>无听歌数据示例 <em>›</em></button>{FEATURES.artist&&<><h3>可选艺人模块</h3><button onClick={()=>openArtist('home')}>艺人初始入口 <em>›</em></button><button onClick={()=>{setSideA(demoA);openArtist('result')}}>艺人结果彩蛋 <em>›</em></button></>}</nav><p className="demo-tips">评审演示：0、1、3、6位好友可切换；贡献均为Mock样例。</p><button className="reset-demo" onClick={startOwn}>↻ 从头制作A面</button></aside>
    <div className="phone-stage"><div className="phone-frame" key={screen}>{page}{searchContext&&<SearchSheet context={searchContext} search={searchText} setSearch={setSearchText} pick={pickSearch} close={()=>setSearchContext(undefined)}/>}
      {detail&&<DetailSheet item={detail} close={()=>setDetail(undefined)}/>}
      {shareOpen&&completeA&&<ShareSheet url={shareUrl} questionId={selectedB} share={shareOrCopy} copy={copyShare} guest={()=>{setShareOpen(false);setGuestSong(undefined);setScreen('guest-song')}} close={()=>setShareOpen(false)}/>}
      {toast&&<div className="toast">{toast}</div>}</div><p className="viewport-label">390 × 844 · MOBILE H5</p></div></div>
}
