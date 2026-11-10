import test from 'node:test';
import assert from 'node:assert/strict';
import {budgetResult,filterPlaces,escapeHTML,validNote} from '../core.js';
import {places} from '../data.js';

test('预算：备用金不会被重复计入可消耗余额',()=>{
 const r=budgetResult([900,1000,200,200,200,300],2500,30000,2000,3);
 assert.equal(r.monthly,2800);assert.equal(r.reserve,8400);assert.equal(r.usable,19600);
 assert.equal(r.gap,300);assert.equal(r.balance,-300);assert.equal(r.runway,19600/300);
});
test('预算：准备金不足时显示缺口，而不是负数续航',()=>{
 const r=budgetResult([1000],0,100,500,3);
 assert.equal(r.shortfall,3400);assert.equal(r.usable,0);assert.equal(r.runway,0);
});
test('预算：收入覆盖开销与零开销不会发生除零',()=>{
 assert.equal(budgetResult([1000],1000,100,0,0).runway,null);
 assert.equal(budgetResult([0],0,0,0,0).runway,null);
 assert.equal(budgetResult([1000],1500,0,0,0).balance,500);
});
test('筛选：关键词、类别、预算与收藏可组合',()=>{
 assert.equal(filterPlaces(places,{type:'山野'}).length,2);
 assert.equal(filterPlaces(places,{ceiling:3000}).length,3);
 assert.deepEqual(filterPlaces(places,{query:'  远程  ',savedOnly:true,saved:['mountain'],type:'山野',ceiling:3000}).map(p=>p.id),['mountain']);
 assert.equal(filterPlaces(places,{savedOnly:true,saved:[]}).length,0);
 assert.equal(filterPlaces(places,{query:'不存在的条件'}).length,0);
});
test('手记：用户内容作为纯文字呈现，拒绝损坏的备份记录',()=>{
 assert.equal(escapeHTML('<script>"&\''),'&lt;script&gt;&quot;&amp;&#39;');
 const note={id:'a',title:'生活',body:'记录',region:'小城',date:'2026-11-10T00:00:00Z'};
 assert.equal(validNote(note),true);
 for(const patch of [{title:' '},{body:' '},{body:'x'.repeat(6001)},{date:'invalid'},{id:42}])assert.equal(Boolean(validNote({...note,...patch})),false);
});
