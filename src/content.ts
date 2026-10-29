import { mockReasonFor } from './mockListening'

export type AId = 'A01'|'A02'|'A03'|'A04'|'A05'|'A07'
export type BId = 'B01'|'B02'|'B03'|'B04'|'B05'|'B06'|'B07'
export type ASelection = { questionId:AId; songId?:string }
export type Contribution = { id:string; friendName:string; questionId:BId; songId:string; submittedAt:string; demo?:boolean }
export type Song = { id:string; title:string; artist:string; palette:string; note:string }
export type AQuestion = { id:AId; title:string; prompt:string; isDefault:boolean; availability:'always' }
export type BQuestion = { id:BId; title:string; prompt:string; isDefault:boolean; availability:'always'|'requires:A01'; badge:string; line:string; palette:string }

export const aQuestions: AQuestion[] = [
  {id:'A02',title:'年度本命',prompt:'2026年，哪首歌一响，你就想说：这才是我的菜！',isDefault:true,availability:'always'},
  {id:'A03',title:'年度私藏宝藏',prompt:'2026年，你最想公开安利哪首私藏宝藏歌？',isDefault:true,availability:'always'},
  {id:'A04',title:'最佳现场',prompt:'2026年最难忘的一次现场，哪首歌一响就能让你瞬间回去？',isDefault:false,availability:'always'},
  {id:'A05',title:'独家情绪出口',prompt:'2026年，哪首歌是你的专属情绪避风港？',isDefault:true,availability:'always'},
  {id:'A07',title:'年度精神状态',prompt:'如果只能用一首歌描述你2026年的精神状态，你会选哪首？',isDefault:true,availability:'always'},
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
export const defaultAIds:AId[]=['A02','A03','A05','A07']
export const defaultBIds:BId[]=['B03','B04','B06','B02']
// 本地模拟歌曲和推荐理由；封面由 CSS 绘制，不使用真实专辑素材。
export const songs:Song[]=[
  {id:'s01',title:'晴天',artist:'周杰伦',palette:'sunset',note:'适合片头响起'},
  {id:'s02',title:'若月亮没来',artist:'王宇宙Leto',palette:'indigo',note:'最近发现的新歌'},
  {id:'s03',title:'爱人错过',artist:'告五人',palette:'apricot',note:'适合这道题的氛围'},
  {id:'s04',title:'逆光',artist:'孙燕姿',palette:'azure',note:'你可能喜欢'},
  {id:'s05',title:'Blueming',artist:'IU',palette:'blue',note:'换一种心情'},
  {id:'s06',title:'Dynamite',artist:'BTS',palette:'gold',note:'适合高光时刻'},
  {id:'s07',title:'晚婚',artist:'李宗盛',palette:'olive',note:'适合安静聆听'},
  {id:'s08',title:'光年之外',artist:'G.E.M.邓紫棋',palette:'violet',note:'适合电影感'},
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
  {id:'s19',title:'七里香',artist:'周杰伦',palette:'sunset',note:'年度循环候选'},
  {id:'s20',title:'My Jinji',artist:'落日飞车',palette:'olive',note:'值得分享的宝藏'},
  {id:'s21',title:'爱你',artist:'王心凌',palette:'rose',note:'意外上头的旋律'},
  {id:'s22',title:'好运来',artist:'祖海',palette:'gold',note:'给好运一点仪式感'},
  {id:'s23',title:'孤勇者',artist:'陈奕迅',palette:'coral',note:'电影感开场'},
  {id:'s24',title:'大眠',artist:'王心凌',palette:'indigo',note:'先让我睡会儿'},
  {id:'s25',title:'平凡之路',artist:'朴树',palette:'sky',note:'一起走过的路'},
  {id:'s26',title:'最炫民族风',artist:'凤凰传奇',palette:'lime',note:'反差感十足'},
  {id:'s27',title:'学猫叫',artist:'小潘潘、小峰峰',palette:'peach',note:'耳机里的小秘密'},
  {id:'s28',title:'霓虹甜心',artist:'马赛克乐队',palette:'indigo',note:'适合夜晚重听'},
  {id:'s29',title:'好想爱这个世界啊',artist:'华晨宇',palette:'azure',note:'适合安静聆听'},
  {id:'s30',title:'这世界那么多人',artist:'莫文蔚',palette:'rose',note:'熟悉的旋律'},
  {id:'s31',title:'倔强',artist:'五月天',palette:'coral',note:'适合现场合唱'},
  {id:'s32',title:'突然好想你',artist:'五月天',palette:'sky',note:'听到前奏就想跟唱'},
  {id:'s33',title:'稻香',artist:'周杰伦',palette:'gold',note:'熟悉的夏天'},
]
export const demoA:ASelection[]=[
  {questionId:'A02',songId:'s19'},{questionId:'A03',songId:'s20'},
  {questionId:'A05',songId:'s24'},{questionId:'A07',songId:'s22'},
]
export const demoContributions:Contribution[]=[
  {id:'demo-1',friendName:'小许 · 演示',questionId:'B03',songId:'s24',submittedAt:'2026-10-28T12:00:00+08:00',demo:true},
  {id:'demo-2',friendName:'阿桐 · 演示',questionId:'B04',songId:'s10',submittedAt:'2026-10-28T12:03:00+08:00',demo:true},
  {id:'demo-3',friendName:'Luna · 演示',questionId:'B06',songId:'s22',submittedAt:'2026-10-28T12:06:00+08:00',demo:true},
  {id:'demo-4',friendName:'橙子 · 演示',questionId:'B02',songId:'s17',submittedAt:'2026-10-28T12:09:00+08:00',demo:true},
  {id:'demo-5',friendName:'小岚 · 演示',questionId:'B01',songId:'s26',submittedAt:'2026-10-28T12:12:00+08:00',demo:true},
  {id:'demo-6',friendName:'阿澈 · 演示',questionId:'B05',songId:'s27',submittedAt:'2026-10-28T12:15:00+08:00',demo:true},
]
export const songById=(id?:string)=>songs.find(song=>song.id===id)
export const aById=(id:AId)=>aQuestions.find(question=>question.id===id)!
export const bById=(id:BId)=>bQuestions.find(question=>question.id===id)!
export const availableB=(sideA:ASelection[])=>bQuestions.filter(q=>q.availability==='always'||sideA.some(item=>item.questionId==='A01'))
export const defaultBFor=(sideA:ASelection[])=>{
  const available=availableB(sideA)
  const preferredIds:BId[]=sideA.some(item=>item.questionId==='A01')?defaultBIds:['B03','B04','B01','B02']
  const preferred=preferredIds.map(id=>available.find(q=>q.id===id)).filter((q):q is BQuestion=>Boolean(q))
  return [...preferred,...available.filter(q=>!preferred.some(item=>item.id===q.id))]
}
// A面首批严格对应题目示例；换批只在同题候选池中轮换。
const aRecommendationBatches:Record<string,string[][]> = {
  A02:[['s19','s18','s08','s01'],['s24','s29','s31','s20']],
  A03:[['s20','s28','s03','s17'],['s29','s30','s33','s01']],
  A04:[['s31','s08','s32','s19'],['s18','s01','s20','s24']],
  A05:[['s29','s24','s30','s33'],['s20','s28','s03','s17']],
  A07:[['s22','s23','s21','s24'],['s26','s27','s25','s11']],
}
const firstBatch:Record<string,string[]> = {
  B01:['s21','s25','s17','s26'], B02:['s17','s11','s22','s09'],
  B03:['s24','s26','s27','s21'], B04:['s10','s17','s15','s25'],
  B05:['s20','s05','s18','s02'], B06:['s22','s23','s21','s26'],
  B07:['s26','s27','s22','s24'],
}
const wittyReasons:Record<string,Record<string,string>> = {
  A07:{s22:'🍀 2026主打一个玄学续命',s23:'🔥 每天上班都像在拯救世界',s21:'💗 精神状态稳定地突然发疯',s24:'💤 今年最大的愿望：让我睡会儿'},
  B03:{s24:'表面卷王，背地里只想躺平',s26:'高冷外壳，广场舞灵魂',s27:'外表成熟稳重，耳机里偷偷喵喵喵'},
}
export const recommendations=(key:string,batch:number,hasHistory=true):Song[]=>{
  const aBatches=aRecommendationBatches[key]
  if (aBatches) {
    const ids=aBatches[batch%aBatches.length]
    return ids.map(id=>{
      const song=songById(id)!
      const note=key==='A07' ? (wittyReasons.A07[id]??song.note) :
        hasHistory ? (mockReasonFor(key,id)??'运营主题歌单推荐') : '运营主题歌单推荐'
      return {...song,note}
    })
  }
  const base=firstBatch[key]??firstBatch.B03
  const ids=batch===0?base:Array.from({length:4},(_,i)=>songs[(batch*5+i*4+key.charCodeAt(1))%songs.length].id)
  return ids.map(id=>{
    const song=songById(id)!
    return {...song,note:wittyReasons[key]?.[id]??song.note}
  })
}
