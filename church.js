/* "What the Church teaches" card (Nov 19, 2026), part of the Raider Labs Catholic-insight pass.
   Each point is a paraphrase in our own words. CCC = Catechism of the Catholic Church (checked against vatican.va, Nov 19, 2026).
   Teach, don't preach: Church teaching is stated as the Church's teaching; applications are left as "Your call" questions. */
(function(){
'use strict';
const P={
"conditions": "Society should help everyone reach the conditions to grow and thrive: food, housing, health care, education, work and social assistance. (CCC 2288)",
"contracts": "Promises and contracts should be kept, as long as what they commit people to is just, and every contract must be made in good faith. (CCC 2410)",
"dignityEqual": "Every human being has equal dignity, whatever their abilities, wealth or usefulness. (<i>Magnifica humanitas</i> 51–53, 2026)",
"hardship": "Paying unjust wages, or forcing up prices by taking advantage of someone’s ignorance or hardship, is a way of taking what belongs to others, even when it is legal. (CCC 2409)",
"imageGod": "A person’s worth comes from being made in the image of God, not from any score, rank or price. (CCC 1700)",
"jubilee": "The Old Testament set a jubilee year when debts were forgiven, banned interest on loans to the poor, and required paying day workers the same day. These laws answer the call to open your hand to the needy. (CCC 2449; Deuteronomy 15)",
"justWage": "A just wage is the legitimate fruit of work. Fair pay should let a worker support a family with dignity, weighing both what they need and what they contribute. (CCC 2434; Leo XIII, <i>Rerum novarum</i>, 1891)",
"missing": "People weighed down by poverty receive a preferential love from the Church (CCC 2448). With data, that love starts with a simple question: who was never counted?",
"notNeutral": "No system is morally neutral: every tool reflects choices about what it measures, what it ignores and how it sorts people. (<i>Magnifica humanitas</i> 104, 2026)",
"option": "People weighed down by poverty receive a preferential love from the Church, because Christ identified himself with the least. (CCC 2448)",
"organ": "Donating organs after death is a noble act of generous solidarity, and it requires the donor’s explicit consent. (CCC 2296)",
"profit": "Treating profit as the only goal of economic life is morally unacceptable, and any practice that turns people into mere means of profit enslaves them. (CCC 2424)",
"solidarity": "Solidarity, also called social friendship, is a direct demand of our shared humanity: we are responsible for one another. (CCC 1939)",
"subsidiarity": "Decisions should be made as close as possible to the people affected, with larger institutions helping local communities, not replacing them. (CCC 1883; <i>Magnifica humanitas</i> 68–72, 2026)",
"temperanceGoods": "Temperance keeps our attachment to money and things in check; justice gives others what they are due; solidarity shares as Christ shared. (CCC 2407)",
"truth": "Truth is a common good. Tools and messages that blur truth and falsehood harm everyone, not just the person fooled. (<i>Magnifica humanitas</i> 132–134, 2026)",
"usury": "The Church condemns lending that preys on people’s need: usurious, greedy dealings and abusive financial systems that keep poor people and poor countries poor. (CCC 2269, 2438)",
"workDignity": "Work is not just a way to earn money: it expresses and builds up human dignity. (Leo XIV, <i>Magnifica humanitas</i> 149, 2026)"
};
const C={
"survey": [
[
"missing",
"truth"
],
"Who is missing from this sample, and how might the answer change if they were counted?"
],
"pollmargin": [
[
"truth",
"missing"
],
"A poll is reported without its margin of error. Is that a lie, or just incomplete?"
],
"livessaved": [
[
"dignityEqual",
"solidarity"
],
"When we count lives saved, does every life count the same? Should it?"
],
"kidneyswap": [
[
"organ",
"solidarity"
],
"Would you sign up to be an organ donor? What would you weigh?"
],
"aidoptimizer": [
[
"profit",
"option"
],
"Should a college aim its aid at the students it most wants, or the students who most need it?"
],
"fairscore": [
[
"notNeutral",
"dignityEqual"
],
"What should a score never be allowed to decide about a person?"
],
"rankcolleges": [
[
"imageGod",
"notNeutral"
],
"What matters most to you in a school that no ranking measures?"
],
"schoolmatch": [
[
"option",
"subsidiarity"
],
"A matching rule is fair on paper. Who might still be left out?"
],
"livingwage": [
[
"justWage",
"workDignity"
],
"What should a full-time job pay, and who should decide?"
],
"povertypremium": [
[
"hardship",
"option"
],
"Who pays more for being poor here, and who could change that?"
],
"minutesofwork": [
[
"workDignity",
"temperanceGoods"
],
"Is this purchase worth the minutes of your life it costs?"
],
"creditcard": [
[
"usury",
"contracts"
],
"When does lending at interest help someone, and when does it take advantage of them?"
],
"debtfit": [
[
"jubilee",
"contracts"
],
"Should some debts ever be forgiven? Which ones, and why?"
],
"costofliving": [
[
"conditions",
"option"
],
"What should every family be able to afford, no matter where they live?"
]
};
const css=`.chur{margin-top:14px;background:var(--card);border:1px solid var(--line);border-left:5px solid #b08d2e;border-radius:12px;padding:12px 16px}
.chur h3{margin:0 0 6px;font-size:1.02rem}.chur p.chur-sub{margin:0 0 8px;color:var(--muted);font-size:.92rem}
.chur ul{margin:0 0 8px;padding-left:1.2em}.chur li{margin:0 0 6px;line-height:1.4}
.chur .chur-call{margin:8px 0 0;padding:8px 12px;background:var(--card2,var(--bg));border-radius:8px}.chur .chur-src{margin:8px 0 0;font-size:.9rem;color:var(--muted)}
.chur a{color:var(--rj-ink,var(--rj));font-weight:600}`;
function card(id){const c=C[id];if(!c)return null;const box=document.createElement('section');box.className='chur';box.setAttribute('aria-label','What the Church teaches');
 box.innerHTML=`<h3>What the Church teaches</h3><p class="chur-sub">Regis Jesuit is a Catholic school. Here is what the Church teaches on this question, offered to every student to think through.</p><ul>${c[0].map(k=>'<li>'+P[k]+'</li>').join('')}</ul><p class="chur-call"><b>Your call:</b> ${c[1]}</p><p class="chur-src">CCC = <a href="https://www.vatican.va/archive/ENG0015/_INDEX.HTM" target="_blank" rel="noopener">Catechism of the Catholic Church</a>. Numbers are paragraphs.</p>`;
 return box;}
function add(sec){if(!sec||!sec.classList||sec.querySelector('.chur'))return;const id=(sec.id||'').replace(/^sim-/,'');const sid=sec.dataset.id||id;
 const b=card(sid);if(!b)return;const anchor=sec.querySelector('.about.terms')||sec.querySelector('details.about');if(!anchor)return;anchor.parentNode.insertBefore(b,anchor);}
function scan(){document.querySelectorAll('#sims > section, #sims > .sim').forEach(add);}
function init(){const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const root=document.getElementById('sims');if(!root)return;scan();new MutationObserver(scan).observe(root,{childList:true,subtree:false});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
