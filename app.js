'use strict';
const $=id=>document.getElementById(id);
const names={2:'二進制',10:'十進制',16:'十六進制'};
const digit=n=>n.toString(16).toUpperCase();
const num=(s,b)=>`${s}<sub>${b}</sub>`;
const panel=html=>`<div class="math-panel">${html}</div>`;
const equation=html=>`<div class="large-equation">${html}</div>`;
const note=s=>`<div class="note">${s}</div>`;
const bitRow=(s,prev='',signed=false)=>`<div class="bits">${[...s].map((b,i)=>`<span class="bit ${b==='1'?'on':''} ${prev&&prev[i]!==b?'changed':''} ${signed&&i===0?'sign':''}">${b}</span>`).join('')}</div>`;
const flip=s=>[...s].map(b=>b==='1'?'0':'1').join('');
const bin=(n,w)=>n.toString(2).padStart(w,'0');
const step=(title,text,html='')=>({title,text,html});
function conversion(raw,from,to){
 const input=raw.replace(/\s/g,'').toUpperCase();
 if(!input)throw Error('請先輸入要轉換的整數。');
 if(!({2:/^[01]+$/,10:/^\d+$/,16:/^[0-9A-F]+$/}[from]).test(input))throw Error(from===2?'二進制只可使用 0 和 1。':from===16?'十六進制只可使用 0–9 和 A–F。':'請輸入非負十進制整數，不含小數點。');
 const n=parseInt(input,from);if(!Number.isSafeInteger(n)||n>65535)throw Error('此示範支援 0 至 65535，請輸入較小的數值。');
 if(from===to)throw Error('請選擇不同的原本進制及目標進制。');
 const s=n.toString(from).toUpperCase(),answer=n.toString(to).toUpperCase(),steps=[];let method;
 if(to===10){
  method='位值展開法';const chars=[...s];
  const terms=(active=-1,reveal=0)=>panel(`<div class="term-row">${chars.map((d,i)=>{const p=chars.length-1-i,v=parseInt(d,from);return `<div class="term ${i===active?'active':''}"><small>第 ${p} 位</small>${d} × ${from}<sup>${p}</sup><strong>${i<reveal?v*from**p:'?'}</strong></div>`}).join('')}</div>`);
  steps.push(step('從最右邊的第 0 位開始','每個數字的位置決定它的位值。由右至左，位值每次乘以基底。',terms()));
  let sum=0;
  chars.forEach((d,i)=>{const p=chars.length-1-i,v=parseInt(d,from),value=v*from**p;sum+=value;steps.push(step(`計算數字 ${d} 的貢獻`,`${d===String(v)?'':`${d} 代表十進制 ${v}。`}${v} × ${from}^${p} = ${value}。即使數字是 0，它仍佔一個位置。`,terms(i,i+1)+`<p>目前總和：<b>${sum}</b></p>`));});
  steps.push(step('把所有位值貢獻相加','加起來，就是相同數值的十進制表示。',terms(-1,chars.length)+equation(chars.map((d,i)=>parseInt(d,from)*from**(chars.length-1-i)).join(' + '))));
 }else if(from===10){
  method='連除取餘數';let q=n;const rows=[];
  const table=()=>panel(`<table class="step-table"><thead><tr><th>被除數</th><th>÷ 基底</th><th>商</th><th>餘數</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${i===rows.length-1?'current':''}"><td>${r.n}</td><td>÷ ${to}</td><td>${r.q}</td><td class="rem">${r.r}${r.r>=10?' = '+digit(r.r):''}</td></tr>`).join('')}</tbody></table>`);
  steps.push(step(`不斷除以 ${to}`,`每次記下商和餘數，再用商繼續除以 ${to}，直至商小於 ${to}。`,panel(equation(`${n} ÷ ${to}`))+note('餘數先算出的是最右邊的數字，答案要由下而上讀。')));
  while(q>=to){const r=q%to,next=Math.floor(q/to);rows.push({n:q,q:next,r});steps.push(step(`第 ${rows.length} 次除法`,`${q} ÷ ${to} = ${next}，餘 ${r}${r>=10?`（以 ${digit(r)} 表示）`:''}。${next<to?'商已小於基底，可以停止除法。':'下一步把商繼續除以基底。'}`,table()));q=next;}
  const result=[digit(q),...rows.map(r=>digit(r.r)).reverse()];
  steps.push(step('先讀最後的商，再倒序讀餘數',rows.length?`最後的商是 ${q}${q>=10?'（'+digit(q)+'）':''}。由下而上把餘數接在後面。`:`${n} 小於 ${to}，可直接用一個數字表示${n>=10?'：'+digit(n):''}。`,(rows.length?table():'')+panel(equation(result.join(' → ')))+note('不是把餘數由上而下照抄；最後的商在最左邊。')));
 }else if(from===2){
  method='四位分組法';const padded=s.padStart(Math.ceil(s.length/4)*4,'0'),zeros=padded.length-s.length,groups=padded.match(/.{4}/g);
  const show=count=>panel(`<div class="groups">${groups.map((g,i)=>`<div class="group">${i===0&&zeros?`<span class="pad">${g.slice(0,zeros)}</span>${g.slice(zeros)}`:g}<b>${i<count?digit(parseInt(g,2)):'?'}</b></div>`).join('')}</div>`);
  steps.push(step('由右至左，每四位分一組',`因為 2⁴ = 16，一組四個二進制位元剛好對應一個十六進制數字。${zeros?`最左邊不足四位，在左方補 ${zeros} 個 0。`:'這個數字不需要補零。'}`,show(0)+note('補零只加在整個數字最左邊；在右邊加零會改變數值。')));
  groups.forEach((g,i)=>{const vals=[...g].map((b,j)=>Number(b)*2**(3-j));steps.push(step(`轉換第 ${i+1} 組：${g}`,`${vals.join(' + ')} = ${parseInt(g,2)}，對應十六進制 ${digit(parseInt(g,2))}。`,show(i+1)));});
 }else{
  method='四位分組法';const chars=[...s];
  const show=count=>panel(`<div class="groups">${chars.map((d,i)=>`<div class="group">${d}<b>${i<count?bin(parseInt(d,16),4):'????'}</b></div>`).join('')}</div>`);
  steps.push(step('每一個十六進制數字，換成四個位元','由左至右逐個轉換；每組必須保留四位，才不會改變後面數字的位置。',show(0)));
  chars.forEach((d,i)=>{const v=parseInt(d,16),bits=bin(v,4);steps.push(step(`轉換 ${d}：十進制 ${v}`,`${v} = ${[...bits].map((b,j)=>+b*2**(3-j)).join(' + ')}，所以這一組寫成 ${bits}。`,show(i+1)));});
  steps.push(step('按原有次序連接各組','只可以省略整個答案最左邊的零；中間各組的零必須保留。',show(chars.length)+note('例如 0 必須先寫成 0000，不能在組合時把整組省略。')));
 }
 steps.push(step('轉換完成','換了表示方式，但數值完全相同。你可以交換進制，檢查反向轉換。',`<div class="result">${equation(`${num(s,from)} = ${num(answer,to)}`)}</div>`));
 return {steps,method,problem:`${num(s,from)} <span class="arrow">→</span> <span class="question">?<sub>${to}</sub></span>`,answer,n};
}
function twos(raw,w,direction){
 const text=raw.replace(/\s/g,''),min=-(2**(w-1)),max=2**(w-1)-1,mod=2**w;let value,bits;const steps=[];
 if(direction==='encode'){
  if(!/^-?\d+$/.test(text))throw Error('請輸入十進制整數，例如 -14、0 或 27。');
  value=Number(text);if(!Number.isSafeInteger(value)||value<min||value>max)throw Error(`${w} 位元二補碼只能表示 ${min} 至 ${max}。請改變數字或選擇較長字長。`);
  bits=bin((value+mod)%mod,w);const magnitude=bin(Math.abs(value),w);
  steps.push(step('先確認字長和可表示範圍',`${w} 位元二補碼的範圍是 −2^${w-1} 至 2^${w-1} − 1，即 ${min} 至 ${max}。${value} 在範圍內。`,panel(equation(`${min} ≤ ${value} ≤ ${max}`))+note('二補碼的字長是固定的；先選字長，才可以取反及加一。')));
  if(value<0){
   steps.push(step('① 把絕對值轉為二進制，補足位數',`|${value}| = ${Math.abs(value)}。在左邊補零，寫成 ${w} 個位元。`,panel(bitRow(magnitude))+(value===min?note(`此處 ${Math.abs(value)} 是無符號的大小。它不能作為 ${w} 位元二補碼的正數；這是最小負數的特殊情況。`):'')));
   const inverted=flip(magnitude);
   steps.push(step('② 逐位取反：0 變 1，1 變 0','把所有位元（包括最左邊的一位）反轉，得到一補碼。亮綠色標示有改變的位元。',panel(bitRow(magnitude))+`<p style="text-align:center">每一位取反 ↓</p>`+panel(bitRow(inverted,magnitude))));
   steps.push(step('③ 加 1：從最右邊開始','接着按二進制加法加 1。遇到 1 + 1，該位寫 0，向左進 1。',panel(bitRow(inverted))+equation('+ 1')));
   let work=[...inverted];let j=w-1;
   while(j>=0){const old=work.join('');const carry=work[j]==='1';work[j]=carry?'0':'1';steps.push(step(`處理第 ${w-1-j} 位：${carry?'1 + 1 = 10₂':'0 + 1 = 1'}`,carry?'本位寫 0，進位 1 交給左邊一位。':'本位寫 1，不再進位；其餘位元保留。',panel(bitRow(work.join(''),old))));if(!carry)break;j--;}
   if(j<0)steps.push(step('只保留固定字長','最左邊以外的進位不儲存在這個字長內。',panel(bitRow(bits))));
  }else steps.push(step('非負整數：直接轉二進制，再補零',`${value===0?'零只有一個二補碼表示。':'非負整數不需要取反或加一。'}補足 ${w} 位後，最左邊必須為 0。`,panel(bitRow(bits,'',true))));
 }else{
  if(!/^[01]+$/.test(text)||text.length!==w)throw Error(`請輸入剛好 ${w} 個 0 或 1（可用空格分組）。`);
  bits=text;const unsigned=parseInt(bits,2);value=bits[0]==='1'?unsigned-mod:unsigned;
  steps.push(step('① 先看最左邊的位元',`固定 ${w} 位元下，最左位是 ${bits[0]}，所以這是${bits[0]==='1'?'負數':'非負整數'}。`,panel(bitRow(bits,'',true))+note('二補碼的最高位權重是負數；不是刪掉最高位後，就得到負數的大小。')));
  if(bits[0]==='1'){
   const inverted=flip(bits),magnitude=bin(parseInt(inverted,2)+1,w);
   steps.push(step('② 全部取反','為了找出負數的大小，先把所有位元取反。',panel(bitRow(inverted,bits))));
   steps.push(step('③ 加 1，得到大小','把取反結果加 1。這一步讀取的是無符號大小，最後須加回負號。',panel(bitRow(magnitude,inverted))+equation(`${num(magnitude,2)} = ${Math.abs(value)}`)+(value===min?note(`大小 ${Math.abs(value)} 須按無符號數讀取；它超過 ${w} 位元二補碼的最大正數。`):'')));
   steps.push(step('④ 加回負號',`原本最高位是 1，所以答案是 −${Math.abs(value)}。`,panel(equation(`−${Math.abs(value)}`))));
  }else steps.push(step('② 直接按位值換成十進制','最高位是 0，不需要取反或加一。把各位的值相加即可。',panel(equation([...bits].map((b,i)=>Number(b)*2**(w-1-i)).join(' + ')))));
 }
 const contributions=[...bits].map((b,i)=>Number(b)*(i===0?min:2**(w-1-i)));
 steps.push(step('用負權重驗證答案',`二補碼最左位的權重是 ${min}，其餘位值仍為正的 2 的次方。`,panel(`<div class="term-row">${[...bits].map((b,i)=>`<div class="term ${i===0?'active':''}"><small>權重 ${i===0?min:2**(w-1-i)}</small>${b}<strong>${contributions[i]}</strong></div>`).join('')}</div>`)+`<p>${contributions.filter(x=>x!==0).join(' + ')||'0'} = <b>${value}</b></p>`));
 steps.push(step('轉換完成',`同一組位元 ${bits}，當作無符號整數是 ${parseInt(bits,2)}；當作 ${w} 位元二補碼是 ${value}。解讀方式很重要。`,`<div class="result">${equation(`${bits}<sub>二補碼</sub> = ${num(value,10)}`)}</div>`));
 return {steps,method:`${w} 位元二補碼`,problem:direction==='encode'?`${num(value,10)} <span class="arrow">→</span> <span class="question">?<sub>二補碼</sub></span>`:`${bits}<sub>二補碼</sub> <span class="arrow">→</span> <span class="question">?<sub>10</sub></span>`,value,bits};
}
let mode='convert',model,index=0,timer=null;
function stop(){if(timer)clearInterval(timer);timer=null;$('play').textContent='▷ 自動播放';}
function render(){const s=model.steps[index];$('stage').innerHTML=`<h3>${s.title}</h3><p>${s.text}</p>${s.html}`;$('step-label').textContent=index===model.steps.length-1?'完成 · 數值不變':'逐步拆解';$('progress-text').textContent=`${index+1} / ${model.steps.length}`;$('progress').style.width=`${(index+1)/model.steps.length*100}%`;$('prev').disabled=index===0;$('next').disabled=index===model.steps.length-1;if(index===model.steps.length-1)stop();}
function start(){stop();try{model=mode==='convert'?conversion($('value').value,+$('from').value,+$('to').value):twos($('signed-value').value,+$('width').value,$('direction').value);$('error').hidden=true;index=0;$('problem').innerHTML=model.problem;$('method-badge').textContent=model.method;render();}catch(e){$('error').hidden=false;$('error').textContent=e.message;}}
function hints(){const w=+$('width').value;$('range-note').textContent=$('direction').value==='encode'?`可表示範圍：${-(2**(w-1))} 至 ${2**(w-1)-1}。`:`輸入剛好 ${w} 個位元；最左位是符號位。`;$('signed-label').textContent=$('direction').value==='encode'?'十進制整數':'二補碼位元';
 let examples;if(mode==='convert'){const f=+$('from').value,t=+$('to').value;examples=f===10?(t===16?['420','1036','0']:['37','25','0']):f===2?(t===16?['111011','10011111','1010001100']:['1101','11001','0']):(t===2?['E05','A7','30D']:['20BF','1FA','0']);$('method-name').textContent=t===10?'每一位，都有自己的權重':f===10?'餘數告訴你最右邊的數字':'四個位元，剛好是一組';$('method-note').textContent=t===10?'由右邊的第 0 位開始，以「數字 × 基底的次方」計算，再把結果相加。':f===10?'每次除以目標基底。商小於基底便停止；先讀最後的商，再倒序讀取餘數。':'2⁴ = 16，所以四個二進制位元可表示 0–15，恰好對應十六進制的 0–F。';}
 else{examples=$('direction').value==='encode'?(w===4?['-3','-8','7','0']:w===8?['-14','-29','-128','127','0']:['-29','-32768','32767','0']):(w===4?['1101','1000','0111']:w===8?['11100011','01000011','10000000']:['1111111111100011','1000000000000000']);$('method-name').textContent='先確定字長，才解讀符號';$('method-note').textContent='負數：取絕對值、補足位數、全部取反，再加 1。非負數直接補零；不需要取反。';}
 $('examples').innerHTML=examples.map(v=>`<button data-example="${v}">${v}</button>`).join('');
}
function knowledge(){ $('knowledge-title').textContent=mode==='convert'?'看懂背後的原理':'二補碼：記住這三件事';$('knowledge-body').innerHTML=mode==='convert'?`<div class="principles"><article><h3>01　基底決定可用的數字</h3><p>二進制只有 0、1；十進制用 0–9。十六進制多出來的六個值，用字母表示。</p><div class="hex-key">${['A','B','C','D','E','F'].map((v,i)=>`<span>${v}<small>${i+10}</small></span>`).join('')}</div></article><article><h3>02　位置決定數字的價值</h3><code>… 2³　2²　2¹　2⁰</code><p>二進制由右至左的位值是 1、2、4、8……。十六進制則是 1、16、256……。</p></article><article><h3>03　四位對一位的原因</h3><code>1111₂ = 15₁₀ = F₁₆</code><p>四個位元有 16 種組合。補零要在最左邊，並保留中間各組的四個位元。</p></article></div>`:`<div class="principles"><article><h3>01　最高位有負的權重</h3><code>1000 0000 → −128</code><p>8 位元二補碼的位值是 −128、64、32、16、8、4、2、1。最高位 1 代表負數，0 代表非負數。</p></article><article><h3>02　負數比正數多一個</h3><table class="range-table"><tr><th>字長</th><th>可表示範圍</th></tr><tr><td>4 位元</td><td>−8 至 7</td></tr><tr><td>8 位元</td><td>−128 至 127</td></tr><tr><td>16 位元</td><td>−32768 至 32767</td></tr></table><p>一般範圍：−2<sup>n−1</sup> 至 2<sup>n−1</sup> − 1。</p></article><article><h3>03　零與最小負數</h3><p>零只有一種表示：全為 0。8 位元的 −128 是 1000 0000；同一字長不能表示 +128。</p><p>固定字長可捨棄最外面的進位，但「有進位」不等於「有符號溢出」。</p></article></div>`;}
function setMode(m){mode=m;stop();$('nav-convert').classList.toggle('active',m==='convert');$('nav-twos').classList.toggle('active',m==='twos');$('nav-convert').setAttribute('aria-current',m==='convert'?'page':'false');$('nav-twos').setAttribute('aria-current',m==='twos'?'page':'false');$('convert-controls').hidden=m!=='convert';$('twos-controls').hidden=m!=='twos';$('eyebrow').textContent=m==='convert'?'01 / NUMBER SYSTEMS':'02 / TWO’S COMPLEMENT';$('title').innerHTML=(m==='convert'?'進制轉換實驗室':'用二補碼表示負數')+'<span class="title-dot">.</span>';$('subtitle').textContent=m==='convert'?'讓每個位值、每個餘數，都有跡可循。':'從取反到加一，看見負數如何存進電腦。';hints();knowledge();start();}
if(typeof document!=='undefined'){
 document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
 $('start').addEventListener('click',start);['value','signed-value'].forEach(id=>$(id).addEventListener('keydown',e=>{if(e.key==='Enter')start();}));
 $('examples').addEventListener('click',e=>{const b=e.target.closest('[data-example]');if(b){$(mode==='convert'?'value':'signed-value').value=b.dataset.example;start();}});
 ['from','to'].forEach(id=>$(id).addEventListener('change',()=>{if($('from').value===$('to').value)$(id==='from'?'to':'from').value=$('from').value==='10'?'2':'10';hints();const first=$('examples').querySelector('button');$('value').value=first.dataset.example;start();}));
 $('swap').addEventListener('click',()=>{try{const current=conversion($('value').value,+$('from').value,+$('to').value);const old=$('from').value;$('from').value=$('to').value;$('to').value=old;$('value').value=current.answer;hints();start();}catch(e){$('error').hidden=false;$('error').textContent=e.message;}});
 $('width').addEventListener('change',()=>{hints();if($('direction').value==='decode')$('signed-value').value=$('examples').querySelector('button').dataset.example;start();});
 $('direction').addEventListener('change',()=>{hints();$('signed-value').value=$('examples').querySelector('button').dataset.example;start();});
 $('next').addEventListener('click',()=>{stop();if(index<model.steps.length-1){index++;render();}});$('prev').addEventListener('click',()=>{stop();if(index>0){index--;render();}});$('reset').addEventListener('click',()=>{stop();index=0;render();});
 $('play').addEventListener('click',()=>{if(timer){stop();return;}if(index===model.steps.length-1){index=0;render();}$('play').textContent='Ⅱ 暫停';timer=setInterval(()=>{if(index<model.steps.length-1){index++;render();}else stop();},2500);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});setMode('convert');
}
if(typeof module!=='undefined')module.exports={conversion,twos};
