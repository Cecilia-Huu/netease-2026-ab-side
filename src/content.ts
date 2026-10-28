export type AId = 'A01'|'A02'|'A03'|'A04'|'A05'|'A06'|'A07'|'A08'|'A09'
export type BId = 'B01'|'B02'|'B03'|'B04'|'B05'|'B06'|'B07'
export type ASelection = { questionId:AId; songId?:string }
export type Contribution = { id:string; friendName:string; questionId:BId; songId:string; submittedAt:string; demo?:boolean }
export type Song = { id:string; title:string; artist:string; palette:string; note:string }
export type AQuestion = { id:AId; title:string; prompt:string; isDefault:boolean; availability:'always' }
export type BQuestion = { id:BId; title:string; prompt:string; isDefault:boolean; availability:'always'|'requires:A01'; badge:string; line:string; palette:string }

export const aQuestions: AQuestion[] = [
  {id:'A01',title:'年度电影片头曲',prompt:'如果2026年是一部电影，你会给自己选哪首片头曲？',isDefault:true,availability:'always'},
  {id:'A02',title:'年度最佳歌曲',prompt:'如果给你2026年最喜欢的华语、K-pop、说唱或欧美歌曲颁奖，你会选哪首？',isDefault:false,availability:'always'},
  {id:'A03',title:'年度私藏宝藏',prompt:'2026年，你最想公开安利哪首私藏宝藏歌？',isDefault:true,availability:'always'},
  {id:'A04',title:'最佳现场',prompt:'2026年最难忘的一次现场，哪首歌一响就能让你瞬间回去？',isDefault:false,availability:'always'},
  {id:'A05',title:'独家情绪出口',prompt:'2026年，哪首歌是你的专属情绪避风港？',isDefault:true,availability:'always'},
  {id:'A06',title:'年度意外心动',prompt:'2026年，哪首歌原本不是你的菜，却越听越上头？',isDefault:true,availability:'always'},
  {id:'A07',title:'年度精神状态',prompt:'如果只能用一首歌暴露你2026年的精神状态，你会选哪首？',isDefault:false,availability:'always'},
  {id:'A08',title:'年度高光BGM',prompt:'如果给你2026年最闪耀的瞬间配乐，你会选哪首？',isDefault:false,availability:'always'},
  {id:'A09',title:'年度电影片尾曲',prompt:'如果2026年的电影即将散场，你想让哪首歌在片尾响起？',isDefault:false,availability:'always'},
]
export const bQuestions: BQuestion[] = [
  {id:'B01',title:'我眼里的TA',prompt:'如果用一首歌形容2026年的TA，你会选哪首？',isDefault:false,availability:'always',badge:'视角收藏家',line:'原来你眼中的TA，是这样的旋律。',palette:'mint'},
  {id:'B02',title:'送给2027的TA',prompt:'2027年，你最想送给TA哪首歌？',isDefault:false,availability:'always',badge:'未来寄歌人',line:'这首歌，替你先抵达TA的2027。',palette:'gold'},
  {id:'B03',title:'TA的隐藏面',prompt:'TA平时不轻易展现的另一面，在你心里是什么歌？',isDefault:true,availability:'always',badge:'隐藏面发现者',line:'你把TA没说出口的那面，放进了唱片。',palette:'pink'},
  {id:'B04',title:'我们的默契BGM',prompt:'如果把你和TA的2026拍成电影，哪首歌必须当BGM？',isDefault:true,availability:'always',badge:'回忆收藏家',line:'一听前奏，就知道这是你们的故事。',palette:'cyan'},
  {id:'B05',title:'安利给TA',prompt:'哪首歌是你2026年最想安利给TA，却还没来得及分享的？',isDefault:false,availability:'always',badge:'安利投递员',line:'这次安利终于投递成功。',palette:'violet'},
  {id:'B06',title:'主题曲投反对票',prompt:'TA给自己选好了2026主题曲，但你觉得真正适合TA的是哪首？',isDefault:true,availability:'requires:A01',badge:'年度导演',line:'你给TA的年度电影，换了一首片头曲。',palette:'orange'},
  {id:'B07',title:'歌品反差审判',prompt:'哪首歌看起来和TA八竿子打不着，你却觉得TA私下会偷偷循环？',isDefault:false,availability:'always',badge:'反差鉴定师',line:'这个反差，只有够熟的人才猜得到。',palette:'lime'},
]
export const defaultAIds:AId[]=['A01','A03','A05','A06']
export const defaultBIds:BId[]=['B03','B04','B06']
// 本地模拟歌曲和推荐理由；封面由 CSS 绘制，不使用真实专辑素材。
export const songs:Song[]=[
  {id:'s01',title:'晴天',artist:'周杰伦',palette:'sunset',note:'适合片头响起'},
  {id:'s02',title:'若月亮没来',artist:'王宇宙Leto',palette:'indigo',note:'最近发现的新歌'},
  {id:'s03',title:'爱人错过',artist:'告五人',palette:'apricot',note:'适合这道题的氛围'},
  {id:'s04',title:'逆光',artist:'孙燕姿',palette:'azure',note:'你可能喜欢'},
  {id:'s05',title:'Blueming',artist:'IU',palette:'blue',note:'换一种心情'},
  {id:'s06',title:'Dynamite',artist:'BTS',palette:'gold',note:'适合高光时刻'},
  {id:'s07',title:'晚婚',artist:'李宗盛',palette:'olive',note:'适合安静聆听'},
  {id:'s08',title:'光年之外',artist:'邓紫棋',palette:'violet',note:'适合电影感'},
  {id:'s09',title:'至少还有你',artist:'林忆莲',palette:'rose',note:'情绪避风港'},
  {id:'s10',title:'刻在我心底的名字',artist:'卢广仲',palette:'teal',note:'适合回忆片段'},
  {id:'s11',title:'起风了',artist:'买辣椒也用券',palette:'sky',note:'适合重新出发'},
  {id:'s12',title:'小美满',artist:'周深',palette:'peach',note:'意外的好心情'},
  {id:'s13',title:'Shape of You',artist:'Ed Sheeran',palette:'coral',note:'换一种节奏'},
  {id:'s14',title:'LOVE SCENARIO',artist:'iKON',palette:'lavender',note:'一听就有画面'},
  {id:'s15',title:'彩虹',artist:'周杰伦',palette:'rainbow',note:'适合片尾字幕'},
  {id:'s16',title:'慢冷',artist:'梁静茹',palette:'berry',note:'藏起来的情绪'},
  {id:'s17',title:'如果可以',artist:'韦礼安',palette:'emerald',note:'适合一起重听'},
  {id:'s18',title:'普通朋友',artist:'陶喆',palette:'amber',note:'不经意的共鸣'},
]
export const demoA:ASelection[]=[
  {questionId:'A01',songId:'s01'},{questionId:'A03',songId:'s04'},
  {questionId:'A05',songId:'s09'},{questionId:'A06',songId:'s12'},
]
export const demoContributions:Contribution[]=[
  {id:'demo-1',friendName:'小许 · 演示',questionId:'B03',songId:'s02',submittedAt:'2026-10-28T12:00:00+08:00',demo:true},
  {id:'demo-2',friendName:'阿桐 · 演示',questionId:'B04',songId:'s10',submittedAt:'2026-10-28T12:03:00+08:00',demo:true},
  {id:'demo-3',friendName:'Luna · 演示',questionId:'B06',songId:'s08',submittedAt:'2026-10-28T12:06:00+08:00',demo:true},
]
export const songById=(id?:string)=>songs.find(song=>song.id===id)
export const aById=(id:AId)=>aQuestions.find(question=>question.id===id)!
export const bById=(id:BId)=>bQuestions.find(question=>question.id===id)!
export const availableB=(sideA:ASelection[])=>bQuestions.filter(q=>q.availability==='always'||sideA.some(item=>item.questionId==='A01'))
export const defaultBFor=(sideA:ASelection[])=>{
  const available=availableB(sideA)
  const preferred=defaultBIds.map(id=>available.find(q=>q.id===id)).filter((q):q is BQuestion=>Boolean(q))
  return [...preferred,...available.filter(q=>!preferred.some(item=>item.id===q.id))]
}
export const recommendations=(key:string,batch:number)=>{
  const seed=[...key].reduce((sum,char)=>sum+char.charCodeAt(0),0)%songs.length
  const start=(seed+batch*5)%songs.length
  return Array.from({length:4},(_,i)=>songs[(start+i*3)%songs.length])
}
