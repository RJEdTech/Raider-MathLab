BioLab.addReview({
logic:{
 questions:[
  {id:'porch',kind:'real',lvl:'bio',
   q:'A smart-home rule says: if motion is detected after 10 p.m., then the porch light turns on. At 11 p.m. you see the porch light on. Does that prove there was motion?',
   choices:['Yes: the rule says so','No: that reasons from the converse, which the rule does not guarantee','Yes, but only after 10 p.m.'],correct:1,
   steps:['The rule is P → Q, with P = motion after 10 p.m. and Q = light on.','Seeing Q and concluding P uses the converse, Q → P.','The light could be on for another reason, like someone switching it on by hand. The rule only promises what happens when there is motion.']},
  {id:'conv',kind:'real',lvl:'bio',
   q:'Fact: if an email is a scam, then it comes from an unknown sender. You build a filter from the converse: every email from an unknown sender goes to Spam. In this tool’s 15-email inbox, how many real emails go to Spam?',
   num:{ans:3,tol:0,unit:'emails'},
   steps:['The converse filter sends everything inside the Unknown sender circle to Spam.','Three real emails are in that circle: the college admissions email, the summer job interview and the carpool sign-up.','So 3 real emails are wrongly blocked. No scam slips through, because every scam has an unknown sender.'],
   lab:{set:{cond:'unk',use:'conv',hack:false},look:'Read <b>Real emails sent to Spam</b>.'},verify:[['blocked',3,0],['mist',3,0]]},
  {id:'six',kind:'test',lvl:'honors',
   q:'Statement: if a number is divisible by 6, then it is divisible by 3. Which related statement is false?',
   choices:['The contrapositive: if a number is not divisible by 3, then it is not divisible by 6','The converse: if a number is divisible by 3, then it is divisible by 6','The original statement'],correct:1,
   steps:['The original is true: 6 = 2 × 3, so any multiple of 6 is a multiple of 3.','The contrapositive is equivalent to the original, so it is true too.','The converse is false. Counterexample: 9 is divisible by 3 but not by 6.']},
  {id:'urg',kind:'real',lvl:'honors',
   q:'Test the fact “if an email is a scam, then it says urgent or act now” against the 15-email inbox. How many counterexamples are there?',
   num:{ans:1,tol:0,unit:''},
   steps:['A counterexample is a scam that does not say urgent.','Four of the five scams say urgent or act now. The Loan Relief Office email does not.','So there is 1 counterexample, and the fact is false. A contrapositive filter built on it would trust that scam.'],
   lab:{set:{cond:'urg',use:'contra',hack:false},look:'Read <b>Counterexamples to the fact</b> and <b>Scams delivered with no warning</b>.'},verify:[['cx',1,0],['missed',1,0]]},
  {id:'tt',kind:'test',lvl:'ap',
   q:'For the conditional P → Q, suppose P is false and Q is true. What is the truth value of P → Q?',
   choices:['True','False','It cannot be determined'],correct:0,
   steps:['P → Q is false only when P is true and Q is false.','Here P is false, so the conditional makes no promise that could be broken.','So P → Q is true.']},
  {id:'hack',kind:'real',lvl:'ap',
   q:'Turn on the email from a hacked friend’s account. Which fact still has no counterexamples, so its contrapositive filter makes 0 mistakes?',
   choices:['Scams come from unknown senders','Scams ask you to click a link','Scams say urgent or act now'],correct:1,
   steps:['The hacked account sends from a sender in your contacts, so it is a counterexample to the unknown-sender fact.','It is calm, so it is also a counterexample to the urgent fact.','It does ask you to click a link, like every other scam here. So the link fact holds, and the filter “if no link, trust it; otherwise warn” makes 0 mistakes.'],
   lab:{set:{cond:'link',use:'contra',hack:true},look:'Read <b>Counterexamples to the fact</b> and <b>Total mistakes</b>.'},verify:[['cx',0,0],['mist',0,0]]}
 ]
}
});
