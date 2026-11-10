export const total=values=>values.reduce((sum,n)=>sum+n,0);
export function budgetResult(costs,income,savings,moving,reserveMonths){
 const monthly=total(costs),gap=Math.max(0,monthly-income),reserve=monthly*reserveMonths,usable=Math.max(0,savings-moving-reserve);
 return {monthly,gap,reserve,usable,shortfall:Math.max(0,moving+reserve-savings),runway:gap?usable/gap:null,balance:income-monthly};
}
export function filterPlaces(items,{query='',type='全部',ceiling=0,savedOnly=false,saved=[]}={}){
 const q=query.trim().toLocaleLowerCase();
 return items.filter(p=>(type==='全部'||p.type===type)&&(!ceiling||total(p.costs)<=ceiling)&&(!savedOnly||saved.includes(p.id))&&(!q||[p.name,p.subtitle,p.type,...p.tags].join(' ').toLocaleLowerCase().includes(q)));
}
export function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function validNote(n){return n&&typeof n==='object'&&typeof n.id==='string'&&n.id.length<=100&&typeof n.title==='string'&&n.title.trim().length>0&&n.title.length<=80&&typeof n.body==='string'&&n.body.trim().length>0&&n.body.length<=6000&&typeof n.region==='string'&&n.region.length<=50&&typeof n.date==='string'&&Number.isFinite(Date.parse(n.date));}
