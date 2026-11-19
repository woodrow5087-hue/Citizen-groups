/* Fictional people and opportunities; original demo editorial, not church announcements. */
window.CitizenData = {
  members: [
    {id:'anna',name:'Anna L.',first:'Anna',photo:'anna',role:'Group host',activity:'Praying with you',bio:'Coffee, long walks, and making room at the table. Anna hosts our fictional Wednesday Group.',prompt:'A little encouragement for a busy season.',prayer:'For patience and presence in a busy season.'},
    {id:'jess',name:'Jess W.',first:'Jess',photo:'jess',role:'Group member',activity:'Shared a reflection',bio:'A thoughtful listener who loves honest conversations and a good book.',prompt:'Ask what has been meaningful in this week’s passage.',prayer:'For a friend going through a hard time.'},
    {id:'marcus',name:'Marcus C.',first:'Marcus',photo:'marcus',role:'Group member',activity:'Serving this week',bio:'Usually the first to lend a hand. Marcus helps organize our sample food drive.',prompt:'Thank Marcus for showing up for others.',prayer:'For wisdom with a family decision.'},
    {id:'taylor',name:'Taylor D.',first:'Taylor',photo:'taylor',role:'Group member',activity:'Reading Romans',bio:'New to the group and looking forward to getting to know everyone.',prompt:'Help Taylor feel welcome at the next gathering.',prayer:'For courage to take a new step.'}
  ],
  reflections: [
    {id:'jess',member:'jess',reference:'Romans 8:26',book:'Romans',chapter:8,verses:[26],text:'This reminded me that prayer doesn’t have to be perfect. I can show up honestly, even when I don’t have the words.',prompt:'What helps you begin praying when words feel hard to find?',sample:true},
    {id:'marcus-reflection',member:'marcus',reference:'Romans 8:28',book:'Romans',chapter:8,verses:[28],text:'I don’t have to call every situation good to trust that God is at work. That changes how I want to show up for my family this week.',prompt:'Where are you learning to trust God in the middle of something unfinished?',sample:true},
    {id:'anna-reflection',member:'anna',reference:'Romans 8:27',book:'Romans',chapter:8,verses:[27],text:'Being known by God is a quiet kind of relief. I want our table to feel like a place where people can be known, too.',prompt:'How can our group make room for an honest conversation?',sample:true}
  ],
  opportunities: [
    {id:'food',title:'Make room at the table.',name:'Community food drive',category:'Community',photo:true,group:true,duration:'2 hours',location:'North Commons · fictional demo location',description:'Pack pantry boxes alongside your Wednesday Group. A practical morning of care for neighbors, with a place for everyone to help.',tasks:['Sort shelf-stable food and check dates.','Pack balanced pantry boxes in teams of two.','Help prepare the pickup tables.'],requirements:'Wear closed-toe shoes. Ages 14+ with an adult. No experience required.',bring:'A water bottle and a willingness to help.',capacity:'Sample team of 12'},
    {id:'meals',title:'A warm meal. A warm welcome.',name:'Community meals',category:'Hospitality',photo:false,group:false,duration:'2.5 hours',location:'Community kitchen · fictional demo location',description:'Prepare a simple meal and help create a welcoming space for neighbors. There are roles in food preparation, serving and cleanup.',tasks:['Prepare vegetables with the team.','Set tables and welcome guests.','Help clean and reset the kitchen.'],requirements:'Ages 16+. Food-safety orientation is included in this fictional event.',bring:'Comfortable shoes; aprons provided.',capacity:'Sample team of 8'},
    {id:'outreach',title:'Good neighbors start here.',name:'Neighborhood care walk',category:'Community',photo:false,group:true,duration:'90 minutes',location:'North Commons courtyard · fictional demo location',description:'Take a gentle neighborhood walk with your group, pick up litter and notice practical ways to care for the place we call home.',tasks:['Walk a short, accessible neighborhood route.','Collect litter safely with provided supplies.','Share one idea for caring for our neighbors.'],requirements:'All ages with adult supervision. Choose a seated supply role if preferred.',bring:'Sun protection and a refillable water bottle.',capacity:'Sample team of 15'}
  ],
  content: [
    {id:'room-for-spirit',title:'Room for the Spirit.',category:'Devotionals',minutes:4,kicker:'THIS WEEK’S READING',art:'spirit',reference:'Romans 8:26–28',intro:'You don’t have to have the perfect words to begin.',paragraphs:[
      'Some days, prayer comes easily. Other days, it feels like standing in a doorway with nothing to say. Romans 8 meets us in that doorway. Our weakness is not a reason to stay away from God.',
      'Paul describes the Spirit helping us in the very place where we feel least able. We are invited to bring our actual lives: the busy morning, the unanswered question, the person we are worried about. We can begin with an honest sentence, or a moment of silence.',
      'This isn’t a promise that every circumstance will feel good. It is an invitation to trust that we are held while God is at work. We can make room for that trust in small, ordinary ways.',
      'Try this today: pause before your next task. Name one thing that feels heavy. Ask for help without editing your words. Then consider who might need the same room to be honest with you.'
    ],question:'What would it look like to bring your real self to prayer today?'},
    {id:'table-guide',title:'A better conversation starts here.',category:'Guides',minutes:5,kicker:'WEDNESDAY GROUP GUIDE',art:'table',reference:'Romans 8:26–28',intro:'Three questions. Room for every voice.',paragraphs:[
      'Begin around the table with a simple check-in: what gave you life this week, and what felt heavy? Listening is part of the practice. No one needs to fix another person’s answer.',
      'Read Romans 8:26–28 aloud slowly. Invite a second person to read it again. Notice a word or phrase before moving toward an explanation.',
      'Ask: When have you found it difficult to know what to pray? What does it mean to you that the Spirit helps in weakness? How might this passage shape the way we care for one another this week?',
      'Close by inviting each person to name one intention. Offer prayer with permission. Keep personal details within the group and never pressure anyone to share.',
      'Put it into practice: choose one practical act of encouragement before the next gathering. It might be a thoughtful note, a shared meal or joining the group at the sample food drive.'
    ],question:'Who could you make a little more room for this week?'},
    {id:'small-things',title:'The good in showing up.',category:'Stories',minutes:3,kicker:'AN ORIGINAL DEMO STORY',art:'showup',intro:'A fictional story about ordinary, faithful presence.',paragraphs:[
      'In our sample Wednesday Group, Marcus almost skipped the food drive. His week had been full, and he didn’t feel like he had much left to offer. Anna suggested a small job: help set up one table.',
      'One table became a conversation. A conversation became a shared laugh while packing boxes. Nothing spectacular happened. He simply discovered that community can grow while our hands are busy with something useful.',
      'The point isn’t to do more things. It is to notice where our presence can become a gift. Sometimes the next meaningful step is smaller than we expect.',
      'This week, look for one place where you can show up with what you have. Bring a friend. Leave room to listen. Let the ordinary work matter.'
    ],question:'What is one small way you could show up for someone?'},
    {id:'quiet-prayer',title:'When you have no words.',category:'Guides',minutes:2,kicker:'A SIMPLE PRAYER PRACTICE',art:'quiet',reference:'Romans 8:26',intro:'A short practice for a full mind.',paragraphs:[
      'Set down your phone for a moment. Relax your shoulders and take three unhurried breaths. You don’t need a special mood to begin.',
      'Name one thing you are grateful for. Name one thing you can’t carry alone. Let each name be enough, without turning it into a speech.',
      'Recall the promise in Romans 8:26: the Spirit helps our weaknesses. Sit with that thought for a minute. When your attention wanders, gently return.',
      'Finish with one intention for the next part of your day. If someone came to mind, consider a quiet act of encouragement. Keep their story private unless they invite you to share it.'
    ],question:'What is one intention you want to carry into the day?'}
  ]
};
