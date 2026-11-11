import {total} from './core.js';

// These are editorial rules for the six fictional lifestyle profiles in data.js.
// Points describe overlap with answers; they are not probabilities or city ratings.
export const questions = [
 {id:'environment',title:'你最向往怎样的生活环境？',description:'先选一个最想亲自体验的场景。',options:[
  {value:'mountain',label:'山野之间',description:'看得见山，也留一点小城日常'},
  {value:'coast',label:'海边散步',description:'愿意体验海风与淡旺季变化'},
  {value:'water',label:'水岸小镇',description:'沿河走走，在街巷里生活'},
  {value:'countryside',label:'田野与村庄',description:'靠近自然，接受更分散的日常'},
  {value:'open',label:'环境都可以',description:'比风景更在意日子是否合适'}
 ]},
 {id:'work',title:'目前，你打算怎样维持收入？',description:'按现在能落实的方式选择。',options:[
  {value:'remote',label:'已有远程收入',description:'希望保持线上工作与现有客户'},
  {value:'local',label:'寻找本地工作',description:'愿意实地了解服务、店铺或技能工作'},
  {value:'hybrid',label:'仍需进城工作',description:'需要兼顾通勤、混合办公或原有工作'},
  {value:'explore',label:'还在探索',description:'先短住验证，暂不依靠未落实的收入'}
 ]},
 {id:'connection',title:'你需要多频繁地连接城市？',description:'把工作、家人、交通与常用资源一起考虑。',options:[
  {value:'frequent',label:'经常往返',description:'每周多次，需要保留城市连接'},
  {value:'occasional',label:'偶尔进城',description:'有需要时出发，能提前安排'},
  {value:'rare',label:'可以少进城',description:'更愿意在当地建立自己的日常'}
 ]},
 {id:'services',title:'对日常便利，你最在意什么？',description:'这里表达的是你的需要，具体服务仍需到当地核实。',options:[
  {value:'convenient',label:'便利和服务优先',description:'重视采购、交通与常用医疗服务'},
  {value:'walkable',label:'生活半径小一点',description:'希望步行买菜，日常不必奔波'},
  {value:'selfSufficient',label:'能自己多安排',description:'接受补给、维修与出行需要额外准备'}
 ]},
 {id:'rhythm',title:'怎样的相处节奏让你舒服？',description:'独处和与人连接，都可以是生活的一部分。',options:[
  {value:'connected',label:'有邻里，也有照应',description:'希望更容易参与当地的日常生活'},
  {value:'balanced',label:'安静与连接都有',description:'平时自在独处，也愿意主动认识人'},
  {value:'independent',label:'更享受独立生活',description:'能主动处理事务，也接受较少的社交'}
 ]}
];

const weights={environment:4,work:4,connection:4,services:3,rhythm:2};
// Column order is explicit so each rule can be reviewed alongside data.js.
const placeIds=['mountain','coast','village','river','plain','forest'];
const rules={
 environment:{
  mountain:[4,0,1,1,0,3],coast:[0,4,0,1,0,0],water:[1,2,0,4,0,1],
  countryside:[2,0,4,1,0,4],open:[4,4,4,4,4,4]
 },
 work:{
  remote:[4,3,2,4,3,4],local:[2,4,3,3,4,1],
  hybrid:[1,1,4,1,2,0],explore:[2,2,3,3,4,0]
 },
 connection:{frequent:[1,1,4,1,2,0],occasional:[4,3,3,4,4,1],rare:[3,3,1,3,3,4]},
 services:{convenient:[1,1,2,2,3,0],walkable:[3,3,1,3,3,0],selfSufficient:[2,2,2,2,1,3]},
 rhythm:{connected:[1,1,2,2,2,0],balanced:[2,2,2,2,2,1],independent:[2,1,1,1,1,2]}
};
// Expose the same weights and option-by-profile points used below for the UI's
// explanation table, so the displayed method cannot drift from the algorithm.
for(const question of questions){
 question.weight=weights[question.id];
 for(const option of question.options){
  option.points=Object.fromEntries(placeIds.map((id,index)=>[id,rules[question.id][option.value][index]]));
 }
}
const positive={
 environment:{mountain:'你想亲近山野，这类自然环境值得先去体验。',coast:'你向往海边散步，可以先了解沿海生活的日常节奏。',water:'你偏爱水岸与街巷，可以先从水乡生活了解起。',countryside:'你向往田野与村庄，这类环境贴近你想体验的场景。',open:'你对环境保持开放，可以把注意力放在工作与日常条件上。'},
 work:{remote:'你已有远程收入，这份画像包含线上工作的生活方向。',local:'你愿意寻找本地工作，可以先核实画像中的服务与技能工作方向。',hybrid:'你需要保留原有工作，城郊过渡的方向更值得优先核实。',explore:'收入仍在探索时，可以先从有日常服务连接的短住方向开始了解。'},
 connection:{frequent:'你需要经常往返城市，保留城市连接是这份画像的重点。',occasional:'你可以提前安排进城，适合继续核实小城或小镇的交通条件。',rare:'你能减少进城次数，可以把更多时间留给当地生活。'},
 services:{convenient:'你重视日常便利，这份画像把市场、交通与服务作为重点。',walkable:'你希望缩小生活半径，这份画像适合优先验证步行日常。',selfSufficient:'你能多做补给与事务安排，可以进一步了解服务较分散的生活。'},
 rhythm:{connected:'你希望有邻里连接，可以从居民日常与社区生活开始体验。',balanced:'你愿意兼顾独处与连接，可以在试住时主动建立自己的节奏。',independent:'你能适应独立生活，也愿意自己处理日常事务。'}
};
const mismatch={
 environment:{mountain:'这类画像的主要环境并非山野，建议先确认你是否愿意调整这一偏好。',coast:'这类画像并非海边生活；如果海岸是必要条件，需要重新比较。',water:'这类画像不以水岸生活为重点，建议先核实环境是否符合期待。',countryside:'这类画像不以村庄与田野为重点，建议先体验环境再决定。'},
 work:{remote:'线上工作需要逐一测试网络、电力与工作空间，不能从风景推断条件。',local:'这类画像更依赖已有收入，本地工作机会应先落实再考虑长期迁居。',hybrid:'你仍需进城工作，这类画像的通勤条件可能不合适，务必实走往返路线。',explore:'收入尚未落实时，不宜仅凭环境偏好决定长期迁居，先验证收入与退路。'},
 connection:{frequent:'你需要经常进城，请特别核实门到门时间、末班车和往返开销。',occasional:'即使偶尔进城，也要先验证可用班次、补给与应急路线。',rare:'这类画像强调与城市连接，你可以再比较是否需要承担这部分通勤安排。'},
 services:{convenient:'你重视便利，而这类生活可能需要额外安排服务与出行，先核实常用需求。',walkable:'你希望步行完成日常，这类画像可能需要更多接驳或补给安排。',selfSufficient:'你能独立安排日常，也可以比较是否更想体验服务密度较低的环境。'},
 rhythm:{connected:'你希望有邻里照应，这类生活更需要主动建立社交和求助联系。',balanced:'请试住确认独处时间与社交连接是否舒适。',independent:'这类生活仍有邻里与社区连接，可以试住确认是否适合自己的节奏。'}
};

export function defaultPreferences(){return Object.fromEntries([...questions.map(q=>[q.id,'']),['ceiling',0]]);}

export function normalizePreferences(raw,strict=false){
 const result=defaultPreferences();
 if(raw===undefined)return result;
 if(!raw||typeof raw!=='object'||Array.isArray(raw)){
  if(strict)throw Error('生活偏好格式不正确');
  return result;
 }
 for(const q of questions){
  const value=raw[q.id];
  if(value===undefined)continue;
  if(value===''||q.options.some(option=>option.value===value))result[q.id]=value;
  else if(strict)throw Error(`生活偏好中的「${q.title}」选项不正确`);
 }
 if(raw.ceiling!==undefined){
  if([0,3000,3500,4000].includes(raw.ceiling))result.ceiling=raw.ceiling;
  else if(strict)throw Error('生活偏好的示例月开销上限不正确');
 }
 return result;
}

export function isPreferencesComplete(preferences){
 return Boolean(preferences&&questions.every(q=>q.options.some(option=>option.value===preferences[q.id])));
}

export function matchPlaces(places,preferences){
 const normalized=normalizePreferences(preferences);
 if(!isPreferencesComplete(normalized))return [];
 const maxScore=Object.values(weights).reduce((sum,weight)=>sum+weight,0);
 return places.map((place,index)=>{
  const column=placeIds.indexOf(place.id),reasons=[],tradeoffs=[];
  let score=0;
  for(const q of questions){
   const answer=normalized[q.id],points=rules[q.id][answer][column]??0;
   score+=points;
   if(points>=weights[q.id]-1)reasons.push(positive[q.id][answer]);
   if(points<=1&&points<weights[q.id]-1&&mismatch[q.id][answer])tradeoffs.push(mismatch[q.id][answer]);
  }
  if(place.caution&&!tradeoffs.includes(place.caution))tradeoffs.push(place.caution);
  return {place,score,maxScore,reasons:reasons.slice(0,3),tradeoffs,overBudget:Boolean(normalized.ceiling&&total(place.costs)>normalized.ceiling),index};
 }).filter(result=>!result.overBudget)
  .sort((a,b)=>b.score-a.score||a.index-b.index)
  .map(({index,...result})=>result);
}
