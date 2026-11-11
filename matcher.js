import {places} from './data.js';
import {escapeHTML as esc,total} from './core.js';
import {questions,isPreferencesComplete,matchPlaces} from './matcher-core.js';

const money=n=>new Intl.NumberFormat('zh-CN').format(n);
const budgetOptions=p=>[0,3000,3500,4000].map(n=>`<option value="${n}" ${p.ceiling===n?'selected':''}>${n?`¥${money(n)} 以内`:'暂不限制'}</option>`).join('');
const answerLabel=(q,p)=>q.options.find(o=>o.value===p[q.id])?.label||'还没选择';

export function mountMatcher({getPreferences,savePreferences,card,renderTray,toast,download,showDialog}){
 const root=document.querySelector('#main');
 let preferences={...getPreferences()},step=Math.max(0,questions.findIndex(q=>!preferences[q.id]));
 let showingResults=isPreferencesComplete(preferences);
 root.innerHTML=`<section class="container page-heading match-heading"><p class="eyebrow">生活偏好测试 / FIND YOUR EVERYDAY</p><h1>先想怎样生活，<span>再想去哪里。</span></h1><p>五个小选择，把模糊的向往，变成值得亲自了解的方向。</p></section><section id="matcher" class="container" aria-label="生活偏好测试"></section>`;
 const target=root.querySelector('#matcher');
 const persist=()=>savePreferences({...preferences});
 function summary(){return `<ol class="preference-summary">${questions.map((q,i)=>`<li class="${preferences[q.id]?'answered':''}" ${!showingResults&&step===i?'aria-current="step"':''}><span class="summary-number">0${i+1}</span><div><span>${esc(q.title)}</span><strong>${esc(answerLabel(q,preferences))}</strong></div></li>`).join('')}</ol>`;}
 function drawQuestion(focus=false){
  showingResults=false;
  const q=questions[step],answered=questions.filter(q=>preferences[q.id]).length;
  target.innerHTML=`<div class="matcher-layout"><form id="preference-form" class="panel quiz-panel"><div class="quiz-topline"><p class="eyebrow">第 ${step+1} / ${questions.length} 个选择</p><span>约 2 分钟 · 没有标准答案</span></div><progress class="quiz-progress" value="${answered}" max="${questions.length}" aria-label="已回答 ${answered} 个，共 ${questions.length} 个问题"></progress><fieldset class="quiz-question"><legend id="question-title" tabindex="-1">${esc(q.title)}</legend><p id="question-description">${esc(q.description)}</p><div class="quiz-options">${q.options.map(o=>`<label class="quiz-option"><input type="radio" name="${q.id}" value="${o.value}" ${preferences[q.id]===o.value?'checked':''} required aria-describedby="question-description"><span><strong>${esc(o.label)}</strong><small>${esc(o.description)}</small></span><span class="option-check" aria-hidden="true">✓</span></label>`).join('')}</div></fieldset>${step===questions.length-1?`<div class="quiz-budget"><label class="field" for="match-ceiling">可选：用示例月开销缩小范围<select id="match-ceiling">${budgetOptions(preferences)}</select></label><p class="caption">这里只筛选六种画像的演算示例，不代表实际物价。暂时不确定，可以不限制。</p></div>`:''}<div class="quiz-actions"><button class="quiet-link" type="button" id="quiz-back" ${step===0?'disabled':''}>← 上一个选择</button><button class="button" type="submit">${step===questions.length-1?'看看适合我的生活方式':'下一个选择'} <span aria-hidden="true">→</span></button></div><p class="quiz-save-hint">选择自动保存在当前浏览器，下次可以继续。</p></form><aside class="quiz-sidebar"><div class="quiz-note"><p class="eyebrow">慢慢想，也没关系</p><h2>找到方向之前，<br>先听听自己。</h2><p>选你现在最需要的，不必选别人期待的生活。</p></div><div id="preference-summary">${summary()}</div><div class="quiz-local"><span aria-hidden="true">↟</span><p>偏好只保存在当前浏览器。<br>你可以随时修改，也可以随个人数据备份。</p></div></aside></div>`;
  const form=target.querySelector('#preference-form');
  form.addEventListener('change',e=>{
   if(e.target.type==='radio'){
    preferences[q.id]=e.target.value;persist();
    const count=questions.filter(x=>preferences[x.id]).length;
    form.querySelector('progress').value=count;
    form.querySelector('progress').setAttribute('aria-label',`已回答 ${count} 个，共 ${questions.length} 个问题`);
    target.querySelector('#preference-summary').innerHTML=summary();
   }
   if(e.target.id==='match-ceiling'){preferences.ceiling=Number(e.target.value);persist();}
  });
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;if(step<questions.length-1){step++;drawQuestion(true);}else if(isPreferencesComplete(preferences)){persist();drawResults(true);}});
  target.querySelector('#quiz-back').addEventListener('click',()=>{if(step>0){step--;drawQuestion(true);}});
  if(focus)target.querySelector('#question-title').focus();
 }
 function resultText(results){return `# 胡不归 · 我的生活偏好\n\n${questions.map(q=>`- ${q.title}：${answerLabel(q,preferences)}`).join('\n')}\n- 示例月开销上限：${preferences.ceiling?`¥${preferences.ceiling}`:'不限'}\n\n${results.slice(0,3).map((r,i)=>`## ${i+1}. ${r.place.name}\n\n${r.place.subtitle}\n\n契合之处：\n${r.reasons.map(s=>`- ${s}`).join('\n')}\n\n现实取舍：\n${r.tradeoffs.map(s=>`- ${s}`).join('\n')}\n\n出发前核实：\n${r.place.checks.map(s=>`- ${s}`).join('\n')}\n\n示例月开销：¥${total(r.place.costs)}`).join('\n\n')}\n\n结果来自六种生活方式画像的公开规则比较，不是科学测评、具体城市推荐或实际物价。请亲自核实后再决定。\n`;}
 function drawResults(focus=false){
  showingResults=true;
  const results=matchPlaces(places,preferences),top=results.slice(0,3);
  target.innerHTML=`<div class="match-result-intro"><div><p class="eyebrow">你的生活方向 / A PLACE TO BEGIN</p><h2 id="match-results-title" tabindex="-1">${top.length?'这几种日常，值得先去了解。':'这个开销范围内，暂时没有画像。'}</h2><p>从 ${places.length} 种生活方式画像中，按你的选择排列。每种生活都有取舍。</p></div><button id="edit-preferences" class="quiet-link">调整我的选择 ↗</button></div><div class="answer-tags" aria-label="我的生活偏好">${questions.map(q=>`<span>${esc(answerLabel(q,preferences))}</span>`).join('')}</div><div class="match-result-toolbar"><p id="match-count" role="status">${results.length?`范围内有 ${results.length} 种画像，优先看看前 ${top.length} 种。`:'可以放宽开销范围，或者返回调整生活偏好。'}</p><label class="budget-filter">示例月开销<select id="result-ceiling">${budgetOptions(preferences)}</select></label></div>${top.length?`<div class="match-results">${top.map((r,i)=>`<article class="match-result"><div class="match-rank"><span>0${i+1}</span><p>${i===0?'优先了解':'也值得看看'}</p></div><div class="match-place">${card(r.place)}</div><div class="match-reasons"><h3>与你契合的地方</h3><ul>${r.reasons.length?r.reasons.map(s=>`<li>${esc(s)}</li>`).join(''):'<li>与你的偏好交集有限，可先作为比较参照。</li>'}</ul><div class="match-tradeoffs"><h3>也请认真想一想</h3><ul>${r.tradeoffs.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div><a class="quiet-link" href="plan.html?place=${r.place.id}">以这里开始试住计划 ↗</a></div></article>`).join('')}</div><div class="match-next"><div><h3>有一点心动，也留一点核实。</h3><p>收藏值得了解的画像，选 2–3 种比较，再亲自验证工作、房租和日常条件。</p></div><div class="inline-actions"><a href="regions.html" class="button secondary">看看全部生活方式 ↗</a><button id="export-match" class="quiet-link">导出我的匹配结果 ↓</button></div></div>`:`<div class="empty"><span>↟</span><h3>给选择留一点空间</h3><p>这里比较的是示例开销。你也可以到预算页，把实际询价填进去重新算算。</p><button id="relax-budget" class="button">暂不限制示例开销</button></div>`}<details class="match-method"><summary>这些结果是怎样得出的？</summary><p>按五个问题与你选择的交集进行规则排序：环境、工作方式、城市联系、日常便利和生活节奏。每个回答按与画像的交集记分：环境、工作与城市联系各最多 4 分，日常便利最多 3 分，生活节奏最多 2 分，合计 17 分。具体贡献可以查看。</p><p>开销上限会先排除超过示例金额的画像；同分时保留原有画像顺序。排名只帮助你缩小探索范围，不表示适合某个具体城市的概率。没有选择会被用于广告或上传服务器。</p><button class="quiet-link" id="show-match-rules">查看我的选择如何参与排序 →</button></details><div id="compare-tray" class="compare-tray" hidden></div>`;
  target.querySelector('#edit-preferences').addEventListener('click',()=>{step=0;drawQuestion(true);});
  target.querySelector('#result-ceiling').addEventListener('change',e=>{preferences.ceiling=Number(e.target.value);persist();drawResults();target.querySelector('#result-ceiling').focus();});
  target.querySelector('#export-match')?.addEventListener('click',()=>{download('胡不归-生活偏好与匹配.md',resultText(results));toast('已导出生活偏好与匹配结果。');});
  target.querySelector('#relax-budget')?.addEventListener('click',()=>{preferences.ceiling=0;persist();drawResults(true);});
  target.querySelector('#show-match-rules').addEventListener('click',()=>showDialog('我的偏好如何参与排序',`<p>以下是当前范围内所有画像的规则得分。分数只用于排序，不是适合程度百分比。</p><div class="table-scroll" tabindex="0" aria-label="画像规则得分"><table><thead><tr><th scope="col">生活方式</th>${questions.map(q=>`<th scope="col">${esc(answerLabel(q,preferences))}<small>（满分 ${q.weight}）</small></th>`).join('')}<th scope="col">总分</th></tr></thead><tbody>${results.map(r=>`<tr><th scope="row">${r.place.name}</th>${questions.map(q=>`<td>${q.options.find(o=>o.value===preferences[q.id]).points[r.place.id]??0}</td>`).join('')}<td>${r.score} / ${r.maxScore}</td></tr>`).join('')}</tbody></table></div><p class="caption">这是对六种抽象画像的比较。具体地点的工作、医疗和交通条件需要另行核实。</p>`));
  renderTray();
  if(focus)target.querySelector('#match-results-title').focus();
 }
 if(showingResults)drawResults();else drawQuestion();
}
