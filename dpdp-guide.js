/* DPDP Act field guide — interactive parts (timeline, applicability check, consent tests, penalties, myths, self-check) */
(function(){
/* ---------- Timeline ---------- */
const now=new Date();const stops=[...document.querySelectorAll('#tl .stop')];
let lastDone=-1;stops.forEach((s,i)=>{if(new Date(s.dataset.d)<=now){s.classList.add('done');lastDone=i}});
if(stops[lastDone+1])stops[lastDone+1].classList.add('next');
const bar=document.getElementById('tlbar');
if(bar){const n=stops.length;let pct=lastDone<0?0:(lastDone)/(n-1)*100+(100/(n-1))*0.5;if(lastDone>=n-1)pct=100;bar.style.width=Math.min(pct,100)+'%'}
const p3=new Date('2027-05-13'),p2=new Date('2026-11-13');const days=d=>Math.ceil((d-now)/864e5);
const t=document.getElementById('today');
if(now<p2)t.innerHTML='<b>Where we are now:</b> Phase 1 is live. Consent Manager provisions start in about '+days(p2)+' days, and full compliance is due in about '+days(p3)+' days.';
else if(now<p3)t.innerHTML='<b>Where we are now:</b> Phases 1 and 2 are live. Full compliance is due in about '+days(p3)+' days.';
else t.innerHTML='<b>Where we are now:</b> All provisions are in force.';

/* ---------- Applicability wizard ---------- */
const Q={
 q1:{q:'Is the data about an individual who can be identified from it?',h:'Name, phone, Aadhaar, IP address, device ID, photos. Anonymised data that cannot be linked back is outside the Act. §2(t)',y:'q2',n:'out_pd'},
 q2:{q:'Is it in digital form, or collected on paper and later digitised?',h:'§3(a). Purely paper records that are never digitised are outside the Act.',y:'q3',n:'out_digital'},
 q3:{q:'Is the data processed within India?',h:'§3(a). Includes Indian companies and Indian servers.',y:'q4',n:'q3b'},
 q3b:{q:'Is the processing connected with offering goods or services to people in India?',h:'§3(b). This is the extra-territorial reach. Mere profiling of Indians without an offering is not covered.',y:'q4',n:'out_terr'},
 q4:{q:'Is an individual processing it purely for personal or domestic purposes?',h:'§3(c)(i). Your phone contacts, family photos, a wedding guest list.',y:'out_personal',n:'q5'},
 q5:{q:'Was the data made public by the person it relates to, or by someone legally required to publish it?',h:'§3(c)(ii). For example, a blogger\'s own public post, or a company register published under law.',y:'out_public',n:'q6'},
 q6:{q:'Does the purpose fall within a §17 exemption?',h:'Legal claims, courts, offence prevention, outsourcing of foreigners\' data, approved mergers, loan-defaulter tracing, notified research or State bodies.',y:'part',n:'in'}
};
const V={
 out_pd:['v-out','Not personal data','The Act protects only data about identifiable individuals. Truly anonymised or aggregated data is outside it.'],
 out_digital:['v-out','Outside the Act','Non-digital data that is never digitised is not covered. The moment you scan or key it in, the Act applies.'],
 out_terr:['v-out','Outside the Act','Processing abroad with no link to offering goods or services in India is not covered by §3(b).'],
 out_personal:['v-out','Outside the Act','Personal or domestic processing by an individual is excluded under §3(c)(i).'],
 out_public:['v-out','Outside the Act','Publicly available data of this kind is excluded under §3(c)(ii). Data scraped from elsewhere does not automatically qualify.'],
 part:['v-part','Partly exempt','Most of Chapter II and III (consent, notice, rights) is switched off for that purpose, but security safeguards under §8(5) still apply. Check the exact conditions in §17.'],
 in:['v-in','The DPDP Act applies','Whoever decides why and how this data is processed is a Data Fiduciary. Next: find a lawful ground (Chapter 04) and meet the §8 duties.']
};
let path=[];const trail=document.getElementById('trail'),ask=document.getElementById('ask');
function draw(key){
  trail.innerHTML=path.length?path.map((p,i)=>'<div class="step"><span class="g-dot">'+(i+1)+'</span><div>'+Q[p.k].q+'<small class="ans" style="color:'+(p.a?'var(--accent)':'var(--red)')+'">'+(p.a?'Yes':'No')+'</small></div></div>').join(''):'<p style="color:var(--muted);font-size:.92rem">Your answers will appear here as a path through the flowchart.</p>';
  if(Q[key]){
    ask.innerHTML='<span class="g-eyebrow">Question '+(path.length+1)+'</span><h3>'+Q[key].q+'</h3><p class="hint">'+Q[key].h+'</p><div class="btns"><button class="b pri" id="by">Yes</button><button class="b" id="bn">No</button>'+(path.length?'<button class="b" id="bb">Back</button>':'')+'</div>';
    document.getElementById('by').onclick=()=>{path.push({k:key,a:true});draw(Q[key].y)};
    document.getElementById('bn').onclick=()=>{path.push({k:key,a:false});draw(Q[key].n)};
    const bb=document.getElementById('bb');if(bb)bb.onclick=back;
  }else{
    const v=V[key];
    ask.innerHTML='<span class="g-eyebrow">Verdict</span><div class="verdict '+v[0]+'"><h3>'+v[1]+'</h3><p>'+v[2]+'</p></div><div class="btns"><button class="b pri" id="br">Start again</button><button class="b" id="bb">Back</button></div>';
    document.getElementById('br').onclick=()=>{path=[];draw('q1')};
    document.getElementById('bb').onclick=back;
  }
}
function back(){const p=path.pop();draw(p?p.k:'q1')}
draw('q1');

/* ---------- Consent pills ---------- */
const C=[
 ['Free','no coercion','Consent given voluntarily, with a real choice.','Service refused unless you also agree to unrelated marketing.'],
 ['Specific','tied to a purpose','Separate consent for delivery and for marketing emails.','"We may use your data for any business purpose."'],
 ['Informed','after the notice','User saw an itemised notice before agreeing.','Consent collected before any notice is shown.'],
 ['Unconditional','no forced bundling','Consent limited to what the stated purpose needs.','Consent that also waives the user\'s rights under the Act; such parts are invalid (§6(2)).'],
 ['Unambiguous','clear affirmative act','User ticks an unticked box or taps "I agree".','Pre-ticked boxes, silence, or continuing to scroll.']
];
const pills=document.getElementById('pills'),po=document.getElementById('pillout');
function pick(i){
  [...pills.children].forEach((b,j)=>b.setAttribute('aria-pressed',j===i?'true':'false'));
  po.innerHTML='<div><div class="g-ok">Passes</div><p>'+C[i][2]+'</p></div><div><div class="g-bad">Fails</div><p>'+C[i][3]+'</p></div>';
}
C.forEach((c,i)=>{const b=document.createElement('button');b.className='pill';b.id='pill'+i;b.innerHTML='<b>'+c[0]+'</b><span>'+c[1]+'</span>';b.onclick=()=>pick(i);pills.appendChild(b)});
pick(0);

/* ---------- Penalties ---------- */
const P=[
 ['Failure to take reasonable security safeguards to prevent a breach','Schedule item 1 · §8(5)',250],
 ['Failure to notify the Board or affected persons of a breach','Item 2 · §8(6)',200],
 ['Breach of obligations for children','Item 3 · §9',200],
 ['Breach of additional SDF obligations','Item 4 · §10',150],
 ['Breach of a voluntary undertaking accepted by the Board','Item 6 · §32',null],
 ['Any other breach of the Act or Rules by a fiduciary','Item 7',50],
 ['Breach of duties by a Data Principal','Item 5 · §15',0.001]
];
const pen=document.getElementById('pen');
P.forEach(p=>{const r=document.createElement('div');r.className='prow';
  const amt=p[2]===null?'<small>Up to the cap for the original breach</small>':p[2]>=1?'₹'+p[2]+' cr':'₹10,000';
  r.innerHTML='<div class="what">'+p[0]+'<small>'+p[1]+'</small></div><div class="track"><div class="fill" style="width:0"></div></div><div class="amt">'+amt+'</div>';
  pen.appendChild(r);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const f=r.querySelector('.fill');if(p[2]===null){f.classList.add('var');f.style.width='100%'}else f.style.width=Math.max(p[2]/250*100,0.6)+'%'}));
});

/* ---------- Myths ---------- */
const M=[
 ['The DPDP Rules came into force in January 2025.','Only the draft Rules were published on 3 January 2025. The final Rules were notified in November 2025, with most obligations applying from May 2027.'],
 ['Health and financial data are a special "sensitive" category.','The Act has no separate category of sensitive personal data. All personal data gets the same baseline protection. Sector regulators may add more.'],
 ['A breach only has to be reported within 72 hours.','Rule 7 requires intimation to the Board and to each affected person without delay. The 72-hour window is for the detailed follow-up report to the Board.'],
 ['Violating children\'s data rules costs up to ₹150 crore.','The Schedule caps it at ₹200 crore. ₹150 crore is the cap for breaching the additional obligations of Significant Data Fiduciaries.'],
 ['Mergers and acquisitions are a "legitimate use" that needs no consent.','§7 does not list them. Court- or tribunal-approved schemes of merger, demerger or amalgamation are instead an exemption under §17(1)(e).'],
 ['Notices must be given in English and a regional language.','§5(3) gives the person the option to access the notice in English or any of the 22 languages in the Eighth Schedule.'],
 ['Breaking the Act can lead to imprisonment.','The Act creates no offences. Consequences are monetary penalties, Board directions and, in repeated cases, blocking. Separate IT Act offences such as §72A remain.'],
 ['Individuals can claim compensation from the Board.','Penalties go to the Consolidated Fund of India. The Act removed §43A compensation from the IT Act, and civil courts cannot hear matters within the Board\'s remit.']
];
document.getElementById('myths-list').innerHTML=M.map(m=>'<div class="myth"><div class="m"><span class="g-eyebrow">Misreading</span><p>'+m[0]+'</p></div><div class="f"><span class="g-eyebrow">What the law says</span><p>'+m[1]+'</p></div></div>').join('');

/* ---------- Quiz ---------- */
const QZ=[
 ['Up to what age is a person treated as a child under DPDPA?',['13','16','18','21'],2,'§2(f): anyone who has not completed 18 years.'],
 ['A courier software vendor stores addresses for an online retailer. Who is the Data Fiduciary?',['The vendor','The retailer','Both equally','Neither'],1,'The retailer decides purpose and means. The vendor is a Processor working under contract.'],
 ['Which of these is NOT a right under the Act?',['Access','Erasure','Data portability','Nomination'],2,'Portability exists under GDPR but not DPDPA.'],
 ['What is the maximum penalty for failing to take reasonable security safeguards?',['₹50 crore','₹150 crore','₹200 crore','₹250 crore'],3,'Schedule item 1 sets the highest cap in the Act.'],
 ['When must affected individuals be told about a breach?',['Within 7 days','Within 72 hours','Without delay','Only if the breach is material'],2,'Rule 7: without delay. There is no materiality threshold.'],
 ['Where do appeals against Board orders go?',['High Court','NCLAT','TDSAT','Civil court'],2,'§29: Telecom Disputes Settlement and Appellate Tribunal, within 60 days.'],
 ['How does India regulate cross-border transfers?',['Adequacy whitelist','Blanket localisation','Negative list of restricted countries','Standard contractual clauses'],2,'§16: transfers are allowed except to countries the Government restricts.'],
 ['Which is a valid way to obtain consent?',['Pre-ticked checkbox','User keeps scrolling','User taps an unticked "I agree"','Consent hidden in terms of service'],2,'§6(1) needs a clear affirmative action after a stand-alone notice.']
];
let qi=0,score=0;const qz=document.getElementById('qz');
function q(){
  if(qi>=QZ.length){qz.innerHTML='<span class="g-eyebrow">Result</span><h3 style="font-size:1.6rem">'+score+' / '+QZ.length+'</h3><p class="expl">'+(score===QZ.length?'Full marks. You have the key features down.':'Revisit the chapters linked in the explanations for the ones you missed.')+'</p><div class="btns"><button class="b pri" id="qr">Try again</button></div>';document.getElementById('qr').onclick=()=>{qi=0;score=0;q()};return}
  const x=QZ[qi];
  qz.innerHTML='<div class="qmeta"><span>Question '+(qi+1)+' of '+QZ.length+'</span><span>Score '+score+'</span></div><h3 style="font-size:1.2rem">'+x[0]+'</h3><div class="opts">'+x[1].map((o,i)=>'<button class="opt" id="o'+qi+'_'+i+'" data-i="'+i+'">'+o+'</button>').join('')+'</div><div id="qf"></div>';
  qz.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i;qz.querySelectorAll('.opt').forEach(o=>o.disabled=true);
    qz.querySelectorAll('.opt')[x[2]].classList.add('right');
    if(i===x[2])score++;else b.classList.add('wrong');
    document.getElementById('qf').innerHTML='<p class="expl">'+x[3]+'</p><div class="btns" style="margin-top:12px"><button class="b pri" id="qn">'+(qi===QZ.length-1?'See result':'Next')+'</button></div>';
    document.getElementById('qn').onclick=()=>{qi++;q()};
  });
}
q();

/* ---------- Nav highlight ---------- */
const links=[...document.querySelectorAll('nav.rail a')];
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.toggle('on',l.getAttribute('href')==='#'+e.target.id))}})},{rootMargin:'-40% 0px -55% 0px'});
document.querySelectorAll('section.ch').forEach(s=>io.observe(s));
})();
