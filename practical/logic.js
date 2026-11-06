BioLab.addPractical({
logic:{
 hook:'Your school’s security team checked every scam email from last month and found a pattern: if an email is a scam, then it comes from a sender who is not in your contacts. You are setting up a filter. Should you send every email from an unknown sender to Spam?',
 answer:'No. That is the converse, and the fact does not guarantee it. In this 15-email sample inbox it sends 3 real emails to Spam, including a college confirming your campus visit. The contrapositive follows from the fact: if the sender is in your contacts, the email is not a scam. In this inbox, trusting those and warning on the rest makes 0 mistakes. But a fact is only as good as its counterexamples: one email from a hacked friend’s account breaks it.',
 uses:[
  'Email rules: mail apps let you write rules in exactly this form, such as “if a message is from this sender or contains these words, then move it to this folder.” Each rule is a conditional statement, and its converse is not automatically true.',
  'Smart-home and phone automations: “If motion is detected after 10 p.m., then turn on the porch light.” Seeing the porch light on does not prove there was motion; that is the converse, and someone may have switched the light on by hand.',
  'Software testing: every if statement in a program is a conditional. When a programmer claims “if the input is valid, then the app saves it,” a tester needs only one valid input that fails to save. One counterexample proves the claim false.'
 ],
 takeaway:'A true if-then rule stays true when you flip and negate it (the contrapositive), not when you just flip it (the converse). Before you build on a rule, look for one counterexample.'
}
});
