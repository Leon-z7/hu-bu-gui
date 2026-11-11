import test from 'node:test';
import assert from 'node:assert/strict';
import {places} from '../data.js';
import {questions,defaultPreferences,normalizePreferences,isPreferencesComplete,matchPlaces} from '../matcher-core.js';

const answers=patch=>({environment:'mountain',work:'remote',connection:'occasional',services:'walkable',rhythm:'balanced',ceiling:0,...patch});

test('偏好问卷：五题都选择有效选项才完整，默认值相互独立',()=>{
 assert.equal(questions.length,5);
 assert.deepEqual(questions.map(question=>question.weight),[4,4,4,3,2]);
 for(const question of questions)for(const option of question.options){
  assert.deepEqual(Object.keys(option.points),places.map(place=>place.id));
  assert.ok(Object.values(option.points).every(points=>Number.isInteger(points)&&points>=0&&points<=question.weight));
 }
 assert.equal(isPreferencesComplete(defaultPreferences()),false);
 assert.equal(isPreferencesComplete(answers()),true);
 for(const q of questions){
  assert.equal(isPreferencesComplete(answers({[q.id]:''})),false);
  assert.equal(isPreferencesComplete(answers({[q.id]:'invalid'})),false);
 }
 const first=defaultPreferences();first.environment='coast';
 assert.equal(defaultPreferences().environment,'');
});

test('偏好恢复：兼容旧备份缺失字段，严格拒绝损坏的选项与预算',()=>{
 assert.deepEqual(normalizePreferences(undefined,true),defaultPreferences());
 assert.deepEqual(normalizePreferences({},true),defaultPreferences());
 assert.deepEqual(normalizePreferences(answers(),true),answers());
 assert.deepEqual(normalizePreferences({environment:'invalid',ceiling:-1}),defaultPreferences());
 for(const raw of [null,[],true,'mountain',{environment:42},{work:'invalid'},{ceiling:3001},{ceiling:'3000'}]){
  assert.throws(()=>normalizePreferences(raw,true),/生活偏好/);
 }
});

test('偏好匹配：山野远程、海边生活与城市通勤得到不同优先方向',()=>{
 assert.equal(matchPlaces(places,answers())[0].place.id,'mountain');
 assert.equal(matchPlaces(places,answers({environment:'coast',work:'local'}))[0].place.id,'coast');
 assert.equal(matchPlaces(places,answers({environment:'countryside',work:'hybrid',connection:'frequent',services:'convenient',rhythm:'connected'}))[0].place.id,'village');
 assert.equal(matchPlaces(places,answers({environment:'countryside',connection:'rare',services:'selfSufficient',rhythm:'independent'}))[0].place.id,'forest');
 assert.equal(matchPlaces(places,answers({environment:'open',work:'local',services:'convenient',rhythm:'connected'}))[0].place.id,'plain');
});

test('偏好匹配：预算是硬筛选，无符合示例的画像时返回空结果',()=>{
 const results=matchPlaces(places,answers({environment:'coast',ceiling:3000}));
 assert.equal(results.length,3);
 assert.equal(results.some(result=>result.place.id==='coast'),false);
 assert.equal(results.every(result=>!result.overBudget&&result.place.costs.reduce((sum,cost)=>sum+cost,0)<=3000),true);
 const expensive=places.map(place=>({...place,costs:[5000,0,0,0,0,0]}));
 assert.deepEqual(matchPlaces(expensive,answers({ceiling:4000})),[]);
 assert.deepEqual(matchPlaces(places,defaultPreferences()),[]);
});

test('偏好匹配：评分、解释与取舍可检查，不修改原始回答或画像',()=>{
 const preferences=Object.freeze(answers()),original=JSON.stringify(places);
 const results=matchPlaces(Object.freeze([...places]),preferences);
 assert.equal(results.length,6);
 assert.equal(results[0].score,17);assert.equal(results[0].maxScore,17);
 for(const result of results){
  assert.ok(result.score>=0&&result.score<=result.maxScore);
  assert.ok(result.reasons.length<=3);
  assert.ok(result.tradeoffs.includes(result.place.caution));
 }
 const low=matchPlaces(places,answers({work:'hybrid',connection:'frequent'})).find(result=>result.place.id==='forest');
 assert.ok(low.tradeoffs.some(text=>text.includes('进城')));
 assert.equal(JSON.stringify(places),original);
 assert.deepEqual(preferences,answers());
});

test('偏好匹配：同分保持输入次序，重复计算不改变顺序',()=>{
 const twins=[{...places[0],name:'先输入'},{...places[0],name:'后输入'}];
 const results=matchPlaces(twins,answers());
 assert.deepEqual(results.map(result=>result.place.name),['先输入','后输入']);
 assert.deepEqual(matchPlaces(twins,answers()),results);
});
