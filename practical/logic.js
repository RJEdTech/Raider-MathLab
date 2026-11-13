BioLab.addPractical({
logic:{
 hook:'Your school’s security team checked every scam email from last month and found a pattern: if an email is a scam, then it comes from a sender who is not in your contacts. You are setting up a filter. Should you send every email from an unknown sender to Spam?',
 answer:'No. That is the converse, and the fact does not guarantee it. In this 15-email sample inbox it sends 3 real emails to Spam, including a college confirming your campus visit. The contrapositive follows from the fact: if the sender is in your contacts, the email is not a scam. In this inbox, trusting those and warning on the rest makes 0 mistakes. But a fact is only as good as its counterexamples: one email from a hacked friend’s account breaks it.',
 uses:[
  '<b>Do:</b> set up one email rule: “if from this sender, then move to this folder.” <b>Why:</b> mail apps let you write rules in exactly this form. Each rule is a conditional, and its converse is not automatically true.',
  '<b>Do:</b> when a smart-home automation turns something on, don’t assume the trigger happened. <b>Why:</b> “If motion after 10 p.m., then porch light on” does not mean a lit porch proves motion: that is the converse, and someone may have switched it on by hand.',
  '<b>Do:</b> when you test your own code, look for one input that breaks the claim. <b>Why:</b> every if statement is a conditional. To disprove “if the input is valid, the app saves it,” a tester needs just one valid input that fails to save.'
 ],
 takeaway:'A true if-then rule stays true when you flip and negate it (the contrapositive), not when you just flip it (the converse). Before you build on a rule, look for one counterexample.'
}
});
