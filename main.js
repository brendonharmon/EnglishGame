// Resume Quest - simplified playable implementation
(() => {
  const SEMESTERS = 8; // 4 years
  const DECISIONS_PER_SEM = 5;

  // Helper to convert semester index to academic year and semester
  function getSemesterLabel(semesterIndex) {
    const year = Math.floor(semesterIndex / 2) + 1;
    const semesterNum = (semesterIndex % 2) + 1;
    const yearNames = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
    return `${yearNames[year - 1]} Semester ${semesterNum}`;
  }

  const skillCategories = {
    hard: ["Technical", "Academic", "Tools", "Intellect"],
    soft: ["Communication", "Leadership", "Emotional", "Adaptability", "Collaboration", "TimeManagement"]
  };

  // Year-end facts about soft skills
  const yearEndFacts = {
    Freshman: [
      "📊 85% of job success comes from soft skills, while only 15% comes from technical skills (Harvard University & Carnegie Foundation). Your foundation matters!",
      "🤝 92% of hiring managers say soft skills are equally important as hard skills. Building these now puts you ahead of the competition.",
      "🎯 Communication skills appear in 35% of all job training opportunities. Prioritizing this skill in your first year pays dividends later."
    ],
    Sophomore: [
      "📈 Teams with high emotional intelligence perform 30% better than those with lower EQ. Your ability to manage emotions impacts team success.",
      "💼 73% of employers struggle to find candidates with strong soft skills—even more than they struggle to find technical talent. You're becoming rare!",
      "🚀 Problem-solving is the #1 soft skill sought by 91% of employers. The decisions you make now build this critical ability."
    ],
    Junior: [
      "🏆 94% of recruiting professionals believe employees with stronger soft skills are MORE LIKELY to be promoted than those with more experience but weaker soft skills.",
      "🌟 80% of employers said adaptability is essential for navigating workplace challenges. Your flexibility is a superpower.",
      "💡 Companies emphasizing soft skills training see 50% higher employee engagement and 30% better retention. These skills = job satisfaction."
    ],
    Senior: [
      "👑 Your soft skills determine your leadership potential. The most in-demand skills for senior positions are problem-solving (38%), communication (26%), and adaptability (17%).",
      "✅ 90% of employers value candidates who demonstrate reliability and dedication—qualities built through consistent soft skill development.",
      "🎓 As you enter the workforce, remember: 58% of professionals rank communication as THE most important soft skill. Master it, and doors open everywhere."
    ]
  };

  function newSkillState() {
    const state = { hard: {}, soft: {} };
    skillCategories.hard.forEach(k => state.hard[k]=0);
    skillCategories.soft.forEach(k => state.soft[k]=0);
    return state;
  }

  // Initial game state
  const game = {
    semesterIndex: 0,
    decisionIndex: 0,
    major: null,
    started: false,
    eventCache: {},
    choiceCache: { classes: {}, extras: {} },
    used: { events: {}, classes: {}, extras: {}, crisis: {} },
    shuffled: { eventsByYear: {}, classesByMajor: {}, extras: [], crisis: [] },
    skills: newSkillState(),
    experience: [],
    relationships: 0,
    history: [],
    achievements: [],
    showingYearEnd: false
  };

  // Utility: shuffle array in-place and return it
  function shuffleArray(arr){
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  }

  // Helper to check if current semester is a year-end (semester 2, 4, 6, 8)
  function isYearEnd(semesterIndex) {
    return (semesterIndex + 1) % 2 === 0; // semester 2, 4, 6, 8 are at indices 1, 3, 5, 7
  }

  // Helper to get year name from semester index
  function getYearName(semesterIndex) {
    const year = Math.floor(semesterIndex / 2) + 1;
    const yearNames = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
    return yearNames[year - 1];
  }

  // Initialize shuffled pools for events/classes/extras for this run
  function initShuffledPools(){
    // events by year
    game.shuffled.eventsByYear = {};
    for(let y=1;y<=4;y++){
      const list = events.filter(e=>e.year_available.includes(y)).map(e=>e.id);
      game.shuffled.eventsByYear[y] = shuffleArray(list.slice());
    }
    // classes per major per year
    game.shuffled.classesByMajor = {};
    Object.keys(classPools).forEach(maj=>{
      game.shuffled.classesByMajor[maj] = {};
      for(let y=1;y<=4;y++){
        const arr = (classPools[maj] && classPools[maj][y]) ? classPools[maj][y].slice() : [];
        game.shuffled.classesByMajor[maj][y] = shuffleArray(arr.slice());
      }
    });
    // extras
    game.shuffled.extras = shuffleArray(extrasPool.common.map(p=>p.name).slice());
    // gen-ed and soft electives shuffled
    game.shuffled.genEds = shuffleArray(genEdPool.slice());
    game.shuffled.softElectives = shuffleArray(softElectives.slice());
    // crisis scenarios - will be filled in after crisisScenarios is defined
  }

  // Helper to clamp values
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}

  // Event database (built from choices.md)
  const events = [
      // Rare/secret event
      { id: 99, title: 'Secret Mentor Encounter', year_available:[2,3,4], major_bias:[], difficulty:'special', description:'A mysterious professor offers you a unique opportunity.', choices:[
          { text:'Accept mentorship', hard:{Academic:4}, soft:{Leadership:4, Communication:4}, experience:'Accepted secret mentorship', relationship:9 },
          { text:'Decline politely', hard:{}, soft:{Communication:1}, experience:'Declined mentorship', relationship:1 },
          { text:'Ignore the offer', hard:{}, soft:{}, experience:'Ignored secret mentor', relationship:-3 }
        ] },
    // Expanded event pool across years and majors. Each event has a unique id.
    { id: 1, title: 'Dorm Drama', year_available:[1], major_bias:[], difficulty:'easy', description:'Roommate playing loud music before a quiz.', choices:[
        { text:'Ignore it', hard:{}, soft:{}, experience:'Ignored roommate', relationship:0 },
        { text:'Ask politely', hard:{}, soft:{Communication:4}, experience:'Asked roommate politely', relationship:4 },
        { text:'Contact RA', hard:{}, soft:{}, experience:'Contacted RA for noise', relationship:-4 }
      ] },
    { id: 2, title: 'Hall Fundraiser Conflict', year_available:[1], major_bias:[], difficulty:'easy', description:'Two dorm committees argue over funds.', choices:[
        { text:'Mediating meeting', hard:{}, soft:{Communication:3}, experience:'Mediated a meeting', relationship:2 },
        { text:'Let them fight', hard:{}, soft:{Emotional:-3}, experience:'Let conflict burn', relationship:-3 },
        { text:'Organize alternate event', hard:{}, soft:{TimeManagement:0}, experience:'Organized alternate event', relationship:1 }
      ] },
    { id: 3, title: 'Study Group Dynamics', year_available:[1,2], major_bias:[], difficulty:'easy', description:'Study group member dominates discussion.', choices:[
        { text:'Step up and organize', hard:{}, soft:{Leadership:2, Communication:1}, experience:'Organized study group', relationship:1 },
        { text:'Let them', hard:{}, soft:{}, experience:'Let dominant member lead', relationship:-2 },
        { text:'Invite quieter members', hard:{}, soft:{Collaboration:2}, experience:'Balanced group participation', relationship:2 }
      ] },
    { id: 4, title: 'Internship Tryouts', year_available:[2], major_bias:[], difficulty:'medium', description:'Career fair rep asks about a missing skill.', choices:[
        { text:'Bluff', hard:{}, soft:{}, experience:'Bluffed in interview', relationship:0 },
        { text:'Admit & plan growth', hard:{}, soft:{Communication:3, Adaptability:2}, experience:'Admitted and planned growth', relationship:1 },
        { text:'Redirect conversation', hard:{}, soft:{Networking:2}, experience:'Redirected to networking', relationship:3 }
      ] },
    { id: 5, title: 'Group Project Deadline', year_available:[2,3], major_bias:['Computer Science','Engineering'], difficulty:'medium', description:'Your team is behind schedule on a technical deliverable.', choices:[
        { text:'Work nights with team', hard:{Technical:2}, soft:{Collaboration:2}, experience:'Pulled late nights with team', relationship:2 },
        { text:'Divide and conquer', hard:{}, soft:{Leadership:3}, experience:'Delegated tasks effectively', relationship:1 },
        { text:'Do it yourself', hard:{Technical:3}, soft:{TimeManagement:-3}, experience:'Completed it solo', relationship:-3 }
      ] },
    { id: 6, title: 'Professor Office Hours', year_available:[2,3], major_bias:[], difficulty:'easy', description:'Talk to a professor for guidance.', choices:[
        { text:'Ask for mentorship', hard:{}, soft:{Communication:2}, experience:'Secured professor mentorship', relationship:4 },
        { text:'Just collect assignment info', hard:{Academic:1}, soft:{}, experience:'Got assignment clarification', relationship:0 },
        { text:'Skip office hours', hard:{}, soft:{}, experience:'Missed mentorship opportunity', relationship:-2 }
      ] },
    { id: 7, title: 'Leadership Opportunity', year_available:[3], major_bias:['Business','Liberal Arts'], difficulty:'medium', description:'Opportunity to lead a student org.', choices:[
        { text:'Run for president', hard:{}, soft:{Leadership:5}, experience:'Elected organization president', relationship:5 },
        { text:'Support role', hard:{}, soft:{Collaboration:2}, experience:'Served on exec team', relationship:2 },
        { text:'Avoid politics', hard:{}, soft:{}, experience:'Stayed low profile', relationship:-2 }
      ] },
    { id: 8, title: 'Research Presentation', year_available:[3,4], major_bias:['Liberal Arts','Computer Science'], difficulty:'hard', description:'Present research at a student symposium.', choices:[
        { text:'Practice presentation', hard:{}, soft:{Communication:4}, experience:'Practiced presentation', relationship:1 },
        { text:'Wing it', hard:{}, soft:{}, experience:'Improvised at symposium', relationship:-2 },
        { text:'Collaborate on slides', hard:{}, soft:{Collaboration:3}, experience:'Built slides with team', relationship:2 }
      ] },
    { id: 9, title: 'Company Coding Challenge', year_available:[3,4], major_bias:['Computer Science'], difficulty:'hard', description:'Company challenge requires teamwork under time.', choices:[
        { text:'Lead the team', hard:{Technical:3}, soft:{Leadership:2}, experience:'Led coding challenge', relationship:2 },
        { text:'Focus on own module', hard:{Technical:2}, soft:{TimeManagement:2}, experience:'Delivered own module', relationship:0 },
        { text:'Offer help to others', hard:{}, soft:{Collaboration:3}, experience:'Helped teammates', relationship:3 }
      ] },
    { id: 10, title: 'Ethical Dilemma', year_available:[4], major_bias:[], difficulty:'hard', description:'A senior project has ethically questionable data.', choices:[
        { text:'Report concerns', hard:{}, soft:{Emotional:2}, experience:'Reported ethical concerns', relationship:-2 },
        { text:'Proceed quietly', hard:{}, soft:{}, experience:'Ignored ethical concerns', relationship:-4 },
        { text:'Discuss with team', hard:{}, soft:{Communication:3, Leadership:1}, experience:'Opened team discussion', relationship:1 }
      ] },
    { id: 11, title: 'Network Mixer', year_available:[1,2,3], major_bias:[], difficulty:'easy', description:'Career fair mixer with professionals.', choices:[
        { text:'Collect contacts', hard:{}, soft:{Networking:3}, experience:'Collected contacts', relationship:3 },
        { text:'Skip it', hard:{}, soft:{}, experience:'Missed networking chance', relationship:-2 },
        { text:'Help run the event', hard:{}, soft:{Leadership:2}, experience:'Helped host mixer', relationship:2 }
      ] },
    { id: 12, title: 'Side Project Launch', year_available:[2,3,4], major_bias:['Computer Science','Creative Arts'], difficulty:'medium', description:'Launch a small side project/startup idea.', choices:[
        { text:'Build MVP quickly', hard:{Technical:3}, soft:{TimeManagement:2}, experience:'Built MVP', relationship:0 },
        { text:'Recruit team', hard:{}, soft:{Leadership:3, Collaboration:2}, experience:'Recruited teammates', relationship:3 },
        { text:'Pivot idea', hard:{}, soft:{Adaptability:2}, experience:'Pivoted project', relationship:-1 }
      ] },
    { id: 13, title: 'Critique Night', year_available:[2,3], major_bias:['Creative Arts','Liberal Arts'], difficulty:'medium', description:'Peer critiques of creative work.', choices:[
        { text:'Accept feedback graciously', hard:{}, soft:{Emotional:3, Communication:2}, experience:'Handled critique well', relationship:2 },
        { text:'Defend work aggressively', hard:{}, soft:{Emotional:-4}, experience:'Defended work defensively', relationship:-3 },
        { text:'Offer constructive feedback', hard:{}, soft:{Collaboration:2}, experience:'Gave helpful critique', relationship:1 }
      ] },
    { id: 14, title: 'Part-time Job Conflict', year_available:[2,3], major_bias:[], difficulty:'medium', description:'Work schedule clashes with exams.', choices:[
        { text:'Negotiate schedule', hard:{}, soft:{TimeManagement:3, Communication:1}, experience:'Negotiated schedule', relationship:0 },
        { text:'Quit job', hard:{}, soft:{}, experience:'Quit job to focus', relationship:-2 },
        { text:'Ignore consequences', hard:{}, soft:{TimeManagement:-4}, experience:'Missed deadlines', relationship:-3 }
      ] },
    { id: 15, title: 'Startup Interview', year_available:[4], major_bias:['Computer Science','Business'], difficulty:'hard', description:'Final round interview at a startup.', choices:[
        { text:'Show leadership', hard:{}, soft:{Leadership:3, Communication:2}, experience:'Demonstrated leadership', relationship:2 },
        { text:'Discuss technical depth', hard:{Technical:4}, soft:{}, experience:'Showed technical depth', relationship:0 },
        { text:'Ask insightful questions', hard:{}, soft:{Communication:3}, experience:'Asked good questions', relationship:3 }
      ] },
    { id: 16, title: 'Academic Probation', year_available:[1,2,3,4], major_bias:[], difficulty:'hard', description:'Low grades trigger probation.', choices:[
        { text:'Seek tutoring', hard:{Academic:2}, soft:{TimeManagement:2}, experience:'Started tutoring', relationship:0 },
        { text:'Appeal the decision', hard:{}, soft:{Communication:2}, experience:'Appealed probation', relationship:-1 },
        { text:'Ignore and continue', hard:{}, soft:{TimeManagement:-2}, experience:'Ignored academic warning', relationship:-2 }
      ] },
    { id: 17, title: 'Collaboration Breakthrough', year_available:[3,4], major_bias:[], difficulty:'medium', description:'A team member brings a great idea.', choices:[
        { text:'Champion the idea', hard:{}, soft:{Leadership:2, Collaboration:3}, experience:'Championed team idea', relationship:3 },
        { text:'Hesitate', hard:{}, soft:{}, experience:'Hesitated to act', relationship:-2 },
        { text:'Take credit', hard:{}, soft:{Emotional:-5}, experience:'Took credit for idea', relationship:-4 }
      ] },
    { id: 18, title: 'Mental Health Crunch', year_available:[2,3,4], major_bias:[], difficulty:'hard', description:'Burnout symptoms during finals.', choices:[
        { text:'Seek counseling', hard:{}, soft:{Emotional:4, TimeManagement:3}, experience:'Sought counseling', relationship:1 },
        { text:'Power through', hard:{}, soft:{TimeManagement:-3}, experience:'Pushed through burnout', relationship:-3 },
        { text:'Drop a course', hard:{}, soft:{}, experience:'Dropped a course', relationship:-1 }
      ] },
    { id: 19, title: 'Alumni Networking', year_available:[3,4], major_bias:[], difficulty:'easy', description:'Alumni mentor offers coffee chat.', choices:[
        { text:'Schedule chat', hard:{}, soft:{Networking:3}, experience:'Chatted with alumni', relationship:3 },
        { text:'Ignore', hard:{}, soft:{}, experience:'Missed alumni meeting', relationship:-2 },
        { text:'Bring portfolio', hard:{}, soft:{Communication:1}, experience:'Showed portfolio', relationship:2 }
      ] },
    { id: 20, title: 'Final Presentation', year_available:[4], major_bias:[], difficulty:'hard', description:'Capstone presentation to industry judges.', choices:[
        { text:'Rehearse with peers', hard:{}, soft:{Communication:4}, experience:'Rehearsed presentation', relationship:2 },
        { text:'Focus on slides only', hard:{}, soft:{}, experience:'Polished slides', relationship:-1 },
        { text:'Ignore feedback', hard:{}, soft:{Emotional:-4}, experience:'Ignored feedback', relationship:-3 }
      ] }
  ];

  function chooseRandomEventForSemester(semIndex){
    const year = Math.floor(semIndex/2) + 1; // 0-1 -> 1 (Freshman), 2-3->2 (Sophomore), etc.
    // filter events available for this year
      let pool = events.filter(e => e.year_available.includes(year));
      // 10% chance to inject rare event if not already used
      if (!game.used.events[99] && Math.random() < 0.1 && year > 1) {
        pool.push(events.find(e => e.id === 99));
      }
    // if player has a major, prefer events that match or are neutral
    if(game.major){
      const biased = pool.filter(e => !e.major_bias.length || e.major_bias.includes(game.major));
      if(biased.length) pool = biased;
    }
    if(pool.length===0) return null;
    const prev = game.eventCache[semIndex-1];
    // try to use the shuffled queue for this year if present
    const queue = (game.shuffled && game.shuffled.eventsByYear && game.shuffled.eventsByYear[year]) ? game.shuffled.eventsByYear[year] : null;
    let ev = null;
    if(queue && queue.length>0){
      // find first queued event id that exists in current pool and is not used
      let pickIdx = -1;
      for(let i=0;i<queue.length;i++){
        const id = queue[i];
        const candidate = pool.find(e=>e.id===id);
        if(!candidate) continue; // not in current pool (due to bias filtering)
        if(game.used.events[id]) continue; // already used
        // prefer events that match major bias or are neutral
        if(candidate.major_bias.length===0 || (game.major && candidate.major_bias.includes(game.major))){ pickIdx = i; break; }
        if(pickIdx===-1) pickIdx = i; // fallback to first available
      }
      if(pickIdx>=0){
        const id = queue.splice(pickIdx,1)[0];
        ev = events.find(e=>e.id===id) || null;
      }
    }
    // fallback: if nothing from shuffled queue, pick randomly avoiding used and immediate prev
    if(!ev){
      let filtered = pool.filter(e => !game.used.events[e.id]);
      if(filtered.length === 0){
        filtered = pool.filter(e => !(prev && (e.id === (prev.id||prev.title))));
      }
      if(filtered.length === 0) return null;
      const idx = Math.floor(Math.random()*filtered.length);
      ev = filtered[idx];
      // if we had a queue, also remove this id from it to keep consistency
      if(queue){ const qix = queue.indexOf(ev.id); if(qix>=0) queue.splice(qix,1); }
    }
    // mark event used for this run so it won't repeat
    if(ev && ev.id) game.used.events[ev.id] = true;
    // Convert to decision-like object for the UI
    return {
      id: ev.id,
      prompt: `${ev.title}: ${ev.description}`,
      options: ev.choices.map(c=>({ text: c.text, hard: c.hard||{}, soft: c.soft||{}, exp: c.experience||'', relationship: c.relationship||0, meta:{type:'event', eventId:ev.id} }))
    };
  }

  // Class and extracurricular pools (simple mapping from choices.md)
  const classPools = {
    Engineering: {
      1: ['Intro Engineering','Physics I','Calculus I'],
      2: ['Statics','Circuit Theory','Calculus II'],
      3: ['Thermodynamics','Lab','Systems Design'],
      4: ['Ethics','Capstone Design','Advanced Mechanics']
    },
    Business: {
      1: ['Marketing Intro','Microeconomics','Business Writing'],
      2: ['Accounting','Org Behavior','Statistics'],
      3: ['Finance','Negotiation','Leadership in Orgs'],
      4: ['Strategy','Capstone Simulation','Corporate Ethics']
    },
    'Computer Science': {
      1: ['Programming Logic','CS Fundamentals','Discrete Math'],
      2: ['Data Structures','Web Dev','Algorithms I'],
      3: ['Databases','Software Engineering','Systems Programming'],
      4: ['AI/ML Intro','Cybersecurity','Advanced Algorithms']
    },
    'Liberal Arts': {
      1: ['Literature','Philosophy 101','Intro Writing'],
      2: ['Research & Rhetoric','History Survey','Creative Writing'],
      3: ['Communication for Impact','Sociology','Cultural Studies'],
      4: ['Thesis','Publication','Advanced Seminar']
    },
    'Creative Arts': {
      1: ['Drawing & Form','Digital Media','Intro Design'],
      2: ['Branding','Design II','Color Theory'],
      3: ['Client Project','Portfolio Lab','Studio Practice'],
      4: ['Showcase','Freelancing','Advanced Studio']
    }
  };
    // Expanded pools
    Object.keys(classPools).forEach(maj => {
      classPools[maj][1].push('Freshman Seminar');
      classPools[maj][2].push('Public Policy');
      classPools[maj][3].push('Entrepreneurship');
      classPools[maj][4].push('Capstone Project');
    });

  const genEdPool = ['Intro Psychology','Statistics','World History','Environmental Science','Public Speaking','Philosophy of Science','Art History','Global Issues','Health & Wellness','Digital Literacy'];
  const softElectives = ['Debate','Speech & Communication','Leadership Workshop','Creative Writing','Community Service','Peer Mediation','Conflict Resolution','Team Building','Mindfulness','Improv Theater'];

  // maps class names to approximate skill deltas
  function classSkillEffects(className){
    // basic heuristic: if name contains keywords
    const effects = { hard:{}, soft:{} };
    const n = className.toLowerCase();
    if(/intro|fundamentals|programming|data|calculus|algorithms|physics|thermo|systems|ai|cybersecurity|design|studio|branding|drawing|statistics|finance|accounting/.test(n)){
      effects.hard = { Technical: 2 };
    }
    if(/writing|communication|rhetoric|debate|speech|creative writing|literature/.test(n)){
      effects.soft = { Communication: 3 };
    }
    if(/leadership|negotiation|org|student government|leadership workshop/.test(n)){
      effects.soft = { Leadership: 4 };
    }
    return effects;
  }

  function pickClassesForSemester(semIndex){
    // return a decision-like object with 3 options (major core, gen ed, elective)
    const year = Math.floor(semIndex/2) + 1;
    const major = game.major || 'Engineering';
    const pool = (classPools[major] && classPools[major][year]) || classPools['Engineering'][year];
    // pick one major core class, one gen ed, one soft elective; avoid repeats across recent semesters
    if(!game.choiceCache.classes) game.choiceCache.classes = {};
    if(game.choiceCache.classes[semIndex]) return game.choiceCache.classes[semIndex];

    const pickUnique = (arr, forbidden=[] , usedMap={})=>{
      // prefer items not in forbidden and not in usedMap
      let candidates = arr.filter(x=>!forbidden.includes(x));
      const notUsed = candidates.filter(x => !(usedMap && usedMap[x]));
      if(notUsed.length>0) candidates = notUsed;
      if(candidates.length===0) return arr[Math.floor(Math.random()*arr.length)];
      return candidates[Math.floor(Math.random()*candidates.length)];
    };

    // gather forbiddens from previous semester to reduce repeats
    const prev = game.choiceCache.classes[semIndex-1] || null;
    const forb = prev ? prev._picked || [] : [];

    // try to consume from shuffled pools first
    const majQueue = (game.shuffled && game.shuffled.classesByMajor && game.shuffled.classesByMajor[major] && game.shuffled.classesByMajor[major][year]) ? game.shuffled.classesByMajor[major][year] : null;
    let majorClass = null;
    if(majQueue && majQueue.length>0){
      // find first not used and not forbidden
      let qi = -1;
      for(let i=0;i<majQueue.length;i++){
        const cand = majQueue[i];
        if(forb.includes(cand)) continue;
        if(game.used.classes[cand]) continue;
        qi = i; break;
      }
      if(qi>=0) majorClass = majQueue.splice(qi,1)[0];
    }
    if(!majorClass) majorClass = pickUnique(pool, forb, game.used.classes);

    // gen-ed from shuffled genEds
    let gen = null;
    if(game.shuffled && game.shuffled.genEds && game.shuffled.genEds.length>0){
      // pop first not used and not forbidden
      let gi = -1;
      for(let i=0;i<game.shuffled.genEds.length;i++){
        const cand = game.shuffled.genEds[i];
        if(forb.includes(cand)) continue;
        if(game.used.classes[cand]) continue;
        gi = i; break;
      }
      if(gi>=0) gen = game.shuffled.genEds.splice(gi,1)[0];
    }
    if(!gen) gen = pickUnique(genEdPool, forb, game.used.classes);

    // elective from shuffled softElectives
    let elective = null;
    if(game.shuffled && game.shuffled.softElectives && game.shuffled.softElectives.length>0){
      let ei = -1;
      for(let i=0;i<game.shuffled.softElectives.length;i++){
        const cand = game.shuffled.softElectives[i];
        if([majorClass,gen].includes(cand)) continue;
        if(game.used.classes[cand]) continue;
        ei = i; break;
      }
      if(ei>=0) elective = game.shuffled.softElectives.splice(ei,1)[0];
    }
    if(!elective) elective = pickUnique(softElectives, forb.concat([majorClass,gen]), game.used.classes);

    const options = [majorClass, gen, elective].map(name=>{
      const eff = classSkillEffects(name);
      return { text: name, hard: eff.hard||{}, soft: eff.soft||{}, exp: `Took ${name}`, meta: { type: 'class', id: name } };
    });

    const decision = { prompt: `Choose a class for Semester ${semIndex+1}`, options };
    // cache with picked list
  decision._picked = [majorClass, gen, elective];
  // mark the picked options as reserved in the cache (not yet used until player picks)
  // do not mark as used until player actually chooses them (handled in applyChoice)
    game.choiceCache.classes[semIndex] = decision;
    return decision;
  }

  // extracurricular pool and picker
  const extrasPool = {
    common: [
      {name:'Coding Club / Internship', hard:{Technical:2, Tools:1}, soft:{Collaboration:0, TimeManagement:0, Adaptability:-1}, exp:'Joined coding club/internship'},
      {name:'Student Government / Leadership', hard:{}, soft:{Leadership:4, Communication:1, TimeManagement:0, Collaboration:-1}, exp:'Elected to student government'},
      {name:'Volunteer / Mentoring', hard:{}, soft:{Communication:2, Emotional:2, Collaboration:1, TimeManagement:-1}, exp:'Volunteered/mentored'},
      {name:'Sports Team', hard:{}, soft:{TimeManagement:1, Collaboration:1, Emotional:0, Adaptability:-1}, exp:'Joined sports team'},
      {name:'Research Assistant', hard:{Academic:1, Tools:1}, soft:{Communication:0, TimeManagement:0, Collaboration:-1}, exp:'Research assistant'},
      {name:'Freelance/Part-time Work', hard:{Tools:0, Intellect:-1}, soft:{TimeManagement:2, Collaboration:-1, Leadership:-1}, exp:'Part-time job'},
      {name:'Art Club', hard:{}, soft:{Emotional:1, Collaboration:0, Adaptability:-1, TimeManagement:-1}, exp:'Joined art club'},
      {name:'Music Ensemble', hard:{}, soft:{Emotional:1, Collaboration:1, TimeManagement:-1, Adaptability:-1}, exp:'Played in music ensemble'},
      {name:'Debate Team', hard:{}, soft:{Communication:3, Leadership:0, TimeManagement:-1, Emotional:-1}, exp:'Joined debate team'},
      {name:'Hackathon', hard:{Technical:1, Tools:0}, soft:{Collaboration:1, TimeManagement:0, Adaptability:-1}, exp:'Participated in hackathon'},
      {name:'Language Exchange', hard:{Intellect:2, Academic:-1}, soft:{Adaptability:1, Communication:0, TimeManagement:-1}, exp:'Joined language exchange'},
      {name:'Startup / Entrepreneurship Club', hard:{Technical:0, Tools:0}, soft:{Leadership:2, Collaboration:1, TimeManagement:0, Adaptability:0}, exp:'Co-founded startup club'},
      {name:'Environmental Initiative', hard:{Academic:0}, soft:{Leadership:1, Collaboration:2, Emotional:0, TimeManagement:-1}, exp:'Led environmental project'},
      {name:'Peer Mentorship Program', hard:{Academic:0}, soft:{Communication:3, Emotional:1, TimeManagement:0, Leadership:-1}, exp:'Mentored younger students'},
      {name:'Consulting Club', hard:{Academic:1, Tools:0}, soft:{Communication:2, Leadership:0, Adaptability:-1, TimeManagement:-1}, exp:'Joined consulting club'},
      {name:'Writing/Publication Club', hard:{Academic:0, Intellect:0}, soft:{Communication:2, Emotional:-1, TimeManagement:-1, Leadership:-1}, exp:'Published student writing'},
      {name:'Gaming/Esports Club', hard:{Technical:-1}, soft:{Collaboration:2, TimeManagement:0, Adaptability:-1, Emotional:-1}, exp:'Joined esports team'},
      {name:'Film/Media Production', hard:{Technical:1, Tools:1}, soft:{Emotional:0, Collaboration:1, Communication:0, TimeManagement:-1}, exp:'Produced student media'},
      {name:'Community Service Organization', hard:{}, soft:{Leadership:1, Collaboration:2, Emotional:2, TimeManagement:-1}, exp:'Led community service'},
      {name:'Cultural/International Club', hard:{Intellect:1, Academic:-1}, soft:{Communication:1, Adaptability:2, Collaboration:0, TimeManagement:-1}, exp:'Joined cultural club'},
      {name:'Science/STEM Outreach', hard:{Technical:1, Academic:0}, soft:{Communication:2, Leadership:0, TimeManagement:-1, Collaboration:-1}, exp:'Taught STEM outreach'},
      {name:'Business Competition Team', hard:{Academic:1, Tools:0}, soft:{Leadership:2, Communication:0, Collaboration:1, TimeManagement:-1}, exp:'Competed in business competition'},
      {name:'Wellness/Fitness Coach', hard:{}, soft:{Leadership:2, Emotional:2, TimeManagement:1, Communication:0}, exp:'Became fitness coach'},
      {name:'Data Analytics Project', hard:{Technical:2, Tools:2, Academic:0}, soft:{TimeManagement:0, Collaboration:0, Leadership:-1}, exp:'Led data analytics project'},
      {name:'Case Study Competition', hard:{Academic:1, Tools:0}, soft:{Communication:1, Leadership:0, TimeManagement:0, Collaboration:1}, exp:'Competed in case studies'},
      {name:'Robotics Club', hard:{Technical:2, Tools:1, Academic:-1}, soft:{Collaboration:1, TimeManagement:0, Leadership:-1}, exp:'Built robots with team'},
      {name:'Finance Club', hard:{Academic:2, Tools:0}, soft:{Leadership:0, Communication:0, TimeManagement:-1, Collaboration:-1}, exp:'Analyzed financial markets'},
      {name:'UX/UI Design Club', hard:{Tools:1, Technical:0}, soft:{Communication:1, Collaboration:0, Emotional:-1, TimeManagement:-1}, exp:'Designed user experiences'},
      {name:'Public Speaking Workshop', hard:{}, soft:{Communication:3, Leadership:0, Emotional:0, TimeManagement:-1}, exp:'Improved public speaking'},
      {name:'Innovation Lab', hard:{Technical:1, Tools:1, Academic:-1}, soft:{Leadership:1, Collaboration:0, Adaptability:0, TimeManagement:0}, exp:'Launched innovation project'},
      {name:'Cybersecurity Club', hard:{Technical:2, Tools:1}, soft:{Leadership:0, Collaboration:1, TimeManagement:0, Adaptability:0}, exp:'Joined cybersecurity club'},
      {name:'Podcast/Media Production', hard:{Tools:1, Technical:0}, soft:{Communication:2, Emotional:1, Leadership:0, TimeManagement:0}, exp:'Produced podcast series'},
      {name:'Product Management Lab', hard:{Academic:1, Tools:1, Technical:0}, soft:{Leadership:2, Communication:1, TimeManagement:1, Collaboration:0}, exp:'Learned product management'},
      {name:'Volunteer Tech Teaching', hard:{Technical:1, Academic:0}, soft:{Communication:3, Leadership:1, Emotional:0, TimeManagement:0}, exp:'Taught tech to underserved communities'},
      {name:'Graduate Research Program', hard:{Academic:2, Technical:0, Tools:0}, soft:{Leadership:0, Communication:0, TimeManagement:1, Collaboration:1}, exp:'Led graduate-level research'},
      {name:'Diversity and Inclusion Initiative', hard:{}, soft:{Leadership:2, Communication:2, Emotional:2, Collaboration:1, TimeManagement:0}, exp:'Led DEI programming'},
      {name:'Investment Club', hard:{Academic:2, Tools:1}, soft:{Leadership:1, Communication:1, TimeManagement:0, Collaboration:0}, exp:'Managed investment portfolio'},
      {name:'Social Impact Startup', hard:{Technical:1, Tools:0}, soft:{Leadership:3, Collaboration:2, Communication:1, TimeManagement:1}, exp:'Founded impact startup'},
      {name:'Academic Coaching Program', hard:{Academic:1}, soft:{Communication:3, Leadership:1, Emotional:1, TimeManagement:0, Collaboration:0}, exp:'Coached peers academically'},
      {name:'Industry Mentorship Network', hard:{}, soft:{Leadership:2, Communication:3, Emotional:1, TimeManagement:0, Collaboration:1}, exp:'Built mentorship connections'}
    ]
  };

  function pickExtraForSemester(semIndex){
    if(!game.choiceCache.extras) game.choiceCache.extras = {};
    if(game.choiceCache.extras[semIndex]) return game.choiceCache.extras[semIndex];
    const pool = extrasPool.common.slice();
    // avoid last semester pick when possible
    const prev = game.choiceCache.extras[semIndex-1];
    if(prev && pool.length>1){ pool.splice(pool.findIndex(p=>p.name===prev._picked),1); }
  // try to use shuffled extras queue first
  let chosen = null;
  const queue = (game.shuffled && game.shuffled.extras) ? game.shuffled.extras : null;
  if(queue && queue.length>0){
    // find first not previously used and not the immediate prev
    let qi = -1;
    for(let i=0;i<queue.length;i++){
      const name = queue[i];
      if(prev && prev._picked === name) continue;
      if(game.used.extras[name]) continue;
      qi = i; break;
    }
    if(qi>=0) chosen = queue.splice(qi,1)[0];
  }
  if(!chosen){
    const available = pool.filter(p => !game.used.extras[p.name]);
    const poolToUse = available.length? available : pool;
    const idx = Math.floor(Math.random()*poolToUse.length);
    chosen = poolToUse[idx].name;
  }
    const decision = { prompt: `Pick an extracurricular/part-time role`, options: [
      // chosen is a name string here
      { text: chosen, hard: (extrasPool.common.find(p=>p.name===chosen)||{}).hard||{}, soft: (extrasPool.common.find(p=>p.name===chosen)||{}).soft||{}, exp: (extrasPool.common.find(p=>p.name===chosen)||{}).exp||'', meta:{ type:'extra', id: chosen } },
      // add two alternative generic choices to keep options length consistent
      { text: 'Peer Tutoring / Mentoring', hard:{Academic:1}, soft:{Communication:2}, exp:'Peer tutor', meta:{ type:'extra', id:'Peer Tutoring / Mentoring' } },
      { text: 'Hackathon / Short Project', hard:{Technical:1}, soft:{Collaboration:1}, exp:'Participated in a hackathon', meta:{ type:'extra', id:'Hackathon / Short Project' } }
    ] };
  decision._picked = chosen;
    game.choiceCache.extras[semIndex] = decision;
    return decision;
  }

  // Some special semester events (junior year group project scenario)
  function specialEventForSemester(sem){
    // sem 4-6 are sophomore/junior
    if(sem===4){
      return {
        prompt: 'Major group project: teammate not contributing',
        options:[
          {text:'Do their work yourself', hard:{Technical:1}, soft:{TimeManagement:-5}, exp:'Solo-saved project (burnout)'},
          {text:'Confront in group chat', hard:{}, soft:{Emotional:-6, Collaboration:-4}, exp:'Conflict logged publicly'},
          {text:'Private conversation to support them', hard:{}, soft:{Communication:4, Emotional:4, Leadership:2}, exp:'Built trust and fixed team dynamics'}
        ]
      };
    }
    return null;
  }

  function pickSingleCrisisScenario(sem){
    // Define crisis scenarios with indices for tracking
    const crisisScenarios = [
      {
        id: 0,
        prompt: 'A teammate is not pulling their weight on a group project',
        options: [
          {text:'Do their work yourself (quick fix)', hard:{Technical:1, Tools:0}, soft:{TimeManagement:-3, Leadership:-2, Emotional:-2}, exp:'Covered teammate work (burnout)', relationship:-2},
          {text:'Private conversation to help them', hard:{}, soft:{Emotional:3, Communication:3, Leadership:1, TimeManagement:1}, exp:'Resolved conflict and built trust', relationship:2},
          {text:'Escalate to professor/manager', hard:{}, soft:{Communication:1, Leadership:1, TimeManagement:0}, exp:'Involved authority figure', relationship:0}
        ]
      },
      {
        id: 1,
        prompt: 'You discovered a conflict between two team members',
        options: [
          {text:'Call them out publicly', hard:{}, soft:{Emotional:-3, Collaboration:-3, Communication:-2}, exp:'Created social tension', relationship:-3},
          {text:'Mediate between conflicting parties', hard:{}, soft:{Communication:2, Emotional:1, Leadership:1, TimeManagement:0}, exp:'Successfully mediated conflict', relationship:1},
          {text:'Suggest team restructuring', hard:{}, soft:{Leadership:2, Collaboration:1, TimeManagement:1}, exp:'Reorganized team responsibilities', relationship:1}
        ]
      },
      {
        id: 2,
        prompt: 'Your project is behind schedule and quality is suffering',
        options: [
          {text:'Create detailed project plan', hard:{Tools:1, Academic:0}, soft:{Leadership:1, TimeManagement:2, Collaboration:1}, exp:'Improved project planning', relationship:0},
          {text:'Implement quality control process', hard:{Tools:1, Academic:0}, soft:{Leadership:1, TimeManagement:2, Collaboration:1}, exp:'Improved quality standards', relationship:0},
          {text:'Create contingency backup plan', hard:{Tools:1, Academic:0}, soft:{Leadership:0, TimeManagement:3, Collaboration:1}, exp:'Prepared risk mitigation plan', relationship:0}
        ]
      },
      {
        id: 3,
        prompt: 'You need to upskill quickly to help your team succeed',
        options: [
          {text:'Learn new skill to help team', hard:{Technical:2, Intellect:0}, soft:{Adaptability:3, Collaboration:1, TimeManagement:0}, exp:'Upskilled to help team', relationship:1},
          {text:'Propose skill-swap partnerships', hard:{}, soft:{Leadership:1, Collaboration:2, TimeManagement:0, Communication:1}, exp:'Created peer learning system', relationship:1},
          {text:'Organize knowledge-sharing session', hard:{Academic:1, Tools:0}, soft:{Communication:3, Leadership:1, Collaboration:2, TimeManagement:0}, exp:'Built team knowledge', relationship:1}
        ]
      },
      {
        id: 4,
        prompt: 'Your team is stuck and needs fresh ideas to move forward',
        options: [
          {text:'Take initiative to find solution', hard:{Technical:1, Academic:0}, soft:{Leadership:2, Adaptability:1, TimeManagement:1}, exp:'Led problem-solving effort', relationship:1},
          {text:'Propose innovative workflow change', hard:{Tools:0, Technical:0}, soft:{Leadership:1, Adaptability:2, TimeManagement:1, Communication:0}, exp:'Optimized team workflow', relationship:0},
          {text:'Address root cause analysis', hard:{Technical:1, Academic:1}, soft:{Leadership:0, Communication:2, TimeManagement:1}, exp:'Solved underlying problem', relationship:0}
        ]
      },
      {
        id: 5,
        prompt: 'Morale is low and team dynamics are strained',
        options: [
          {text:'Organize team building activity', hard:{}, soft:{Leadership:1, Collaboration:2, Emotional:1, TimeManagement:0}, exp:'Strengthened team bonds', relationship:1},
          {text:'Seek mentorship from senior colleague', hard:{}, soft:{Communication:2, Leadership:0, TimeManagement:0, Emotional:0}, exp:'Got guidance from mentor', relationship:1},
          {text:'Propose temporary resource increase', hard:{Academic:0, Tools:0}, soft:{Leadership:1, Communication:1, TimeManagement:1}, exp:'Secured additional resources', relationship:0}
        ]
      },
      {
        id: 6,
        prompt: 'Your team lacks clear structure and accountability',
        options: [
          {text:'Document issue for later review', hard:{Tools:1, Academic:0}, soft:{Communication:1, TimeManagement:1, Collaboration:0}, exp:'Documented team issues', relationship:0},
          {text:'Propose mentoring structured pathway', hard:{Academic:0, Tools:0}, soft:{Leadership:2, Communication:2, TimeManagement:0, Emotional:1}, exp:'Built development program', relationship:1},
          {text:'Create detailed project plan', hard:{Tools:1, Academic:0}, soft:{Leadership:1, TimeManagement:2, Collaboration:1}, exp:'Improved project planning', relationship:0}
        ]
      }
    ];
    
    // Initialize shuffled crisis list if needed
    if(!game.shuffled.crisis || game.shuffled.crisis.length === 0){
      game.shuffled.crisis = shuffleArray(crisisScenarios.map(c => c.id).slice());
    }
    
    // Find first unused crisis scenario from shuffled list
    let selectedScenario = null;
    let selectedIdx = -1;
    for(let i = 0; i < game.shuffled.crisis.length; i++){
      const crisisId = game.shuffled.crisis[i];
      if(!game.used.crisis[crisisId]){
        selectedScenario = crisisScenarios.find(c => c.id === crisisId);
        selectedIdx = i;
        break;
      }
    }
    
    // If all used, reset and pick randomly
    if(!selectedScenario){
      game.shuffled.crisis = shuffleArray(crisisScenarios.map(c => c.id).slice());
      game.used.crisis = {};
      selectedScenario = crisisScenarios.find(c => c.id === game.shuffled.crisis[0]);
      selectedIdx = 0;
    }
    
    // Mark as used
    if(selectedScenario){
      game.used.crisis[selectedScenario.id] = true;
    }
    
    return {
      prompt: selectedScenario.prompt,
      options: selectedScenario.options
    };
  }

  function generateSemesterDecisions(sem){
    const decisions = [];
    // tutorial simpler in first semester
  // class and extracurricular decisions generated from pools
  decisions.push(pickClassesForSemester(sem));
  decisions.push(pickExtraForSemester(sem));
    // choose a dynamic event for this semester (from events DB)
    if(!game.eventCache[sem]){
      const dynamicEvent = chooseRandomEventForSemester(sem);
      game.eventCache[sem] = dynamicEvent || null;
    }
    const dynamicEvent = game.eventCache[sem];
    if(dynamicEvent) decisions.push(dynamicEvent);
    else {
      const special = specialEventForSemester(sem);
      if(special) decisions.push(special);
      else decisions.push(pickSingleCrisisScenario(sem));
    }
    
    // Add 2 random decisions from classes, extras, or single crisis options
    // Track which types we've already used to avoid duplicates
    const usedTypes = new Set(['class', 'extra']); // Already added above
    for(let i = 0; i < 2; i++){
      let decisionType;
      // Pick a random type that we haven't used yet, or cycle through all 3
      const availableTypes = [0, 1, 2].filter(t => {
        if(t === 0) return !usedTypes.has('class');
        if(t === 1) return !usedTypes.has('extra');
        return true; // crisis can always be added
      });
      
      if(availableTypes.length > 0){
        decisionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      } else {
        // If we've used both class and extra, must pick crisis
        decisionType = 2;
      }
      
      if(decisionType === 0){
        // Random class decision - need to create a fresh one for this extra slot
        // by temporarily clearing the cache for this semester
        const cached = game.choiceCache.classes[sem];
        delete game.choiceCache.classes[sem];
        decisions.push(pickClassesForSemester(sem));
        usedTypes.add('class');
      } else if(decisionType === 1){
        // Random extra decision - need to create a fresh one for this extra slot
        const cached = game.choiceCache.extras[sem];
        delete game.choiceCache.extras[sem];
        decisions.push(pickExtraForSemester(sem));
        usedTypes.add('extra');
      } else {
        // Random crisis scenario with 3 options
        decisions.push(pickSingleCrisisScenario(sem));
      }
    }
    
    return decisions;
  }

  // Apply a chosen option
  function applyChoice(option){
    // apply hard skills with overflow logic
    Object.entries(option.hard||{}).forEach(([k,v])=>{
      if(game.skills.hard[k]===undefined) game.skills.hard[k]=0;
      game.skills.hard[k] += v;
      
      // Cap at 20, overflow to random other hard skill
      if(game.skills.hard[k] > 20){
        const overflow = game.skills.hard[k] - 20;
        game.skills.hard[k] = 20;
        // pick random other hard skill and add overflow
        const otherHardSkills = skillCategories.hard.filter(sk => sk !== k);
        if(otherHardSkills.length > 0){
          const randomSkill = otherHardSkills[Math.floor(Math.random() * otherHardSkills.length)];
          if(game.skills.hard[randomSkill]===undefined) game.skills.hard[randomSkill]=0;
          game.skills.hard[randomSkill] += overflow;
          // recursive cap check for the overflow skill
          if(game.skills.hard[randomSkill] > 20){
            game.skills.hard[randomSkill] = 20;
          }
        }
      }
    });
    
    // apply soft skills with overflow logic
    Object.entries(option.soft||{}).forEach(([k,v])=>{
      if(game.skills.soft[k]===undefined) game.skills.soft[k]=0;
      game.skills.soft[k] += v;
      
      // Cap at 20, overflow to random other soft skill
      if(game.skills.soft[k] > 20){
        const overflow = game.skills.soft[k] - 20;
        game.skills.soft[k] = 20;
        // pick random other soft skill and add overflow
        const otherSoftSkills = skillCategories.soft.filter(sk => sk !== k);
        if(otherSoftSkills.length > 0){
          const randomSkill = otherSoftSkills[Math.floor(Math.random() * otherSoftSkills.length)];
          if(game.skills.soft[randomSkill]===undefined) game.skills.soft[randomSkill]=0;
          game.skills.soft[randomSkill] += overflow;
          // recursive cap check for the overflow skill
          if(game.skills.soft[randomSkill] > 20){
            game.skills.soft[randomSkill] = 20;
          }
        }
      }
    });

    if(option.exp) game.experience.push(option.exp);
    if(typeof option.relationship === 'number'){
      game.relationships = clamp(game.relationships + option.relationship, -100, 100);
    }
    // If option has meta info, mark it used so it won't appear again this run
    if(option.meta && option.meta.type){
      if(option.meta.type === 'class' && option.text){ game.used.classes[option.text] = true; }
      if(option.meta.type === 'extra' && option.text){ game.used.extras[option.text] = true; }
      if(option.meta.type === 'event' && option.meta.eventId){ game.used.events[option.meta.eventId] = true; }
    }
    // relationships increase if choice emphasised people
    if((option.soft && (option.soft.Communication || option.soft.Leadership || option.soft.Collaboration || option.soft.Emotional)) ){
      game.relationships += 21;
    }

    // Branching: if secret mentor event accepted, unlock bonus event next semester
    if(option.exp === 'Accepted secret mentorship'){
      game.eventCache[game.semesterIndex+1] = {
        id: 100,
        prompt: 'Mentor Project: Your mentor gives you a special project.',
        options: [
          { text: 'Complete project with excellence', hard:{Academic:4}, soft:{Leadership:4}, exp:'Completed mentor project', relationship:7 },
          { text: 'Struggle with project', hard:{Academic:1}, soft:{}, exp:'Struggled with mentor project', relationship:1 },
          { text: 'Decline project', hard:{}, soft:{}, exp:'Declined mentor project', relationship:-3 }
        ]
      };
    }

    game.history.push({semester: game.semesterIndex+1, choice: option.text, changes: {hard: option.hard||{}, soft: option.soft||{}}, exp: option.exp||null});

    // move to next decision/semester
    game.decisionIndex += 1;
    if(game.decisionIndex >= DECISIONS_PER_SEM){
      // decay small amount for unattended skills
      decaySkills();
      game.decisionIndex = 0;
      game.semesterIndex += 1;
      
      // Check if this is a year-end (after semester 2, 4, 6, 8)
      if(isYearEnd(game.semesterIndex - 1) && game.semesterIndex < SEMESTERS){
        game.showingYearEnd = true;
      }
    }

    saveStateAuto();
    render();
  }

  function decaySkills(){
    // small decay to encourage maintenance
    Object.keys(game.skills.hard).forEach(k=>{ game.skills.hard[k] = Math.round(game.skills.hard[k] * 0.98); });
    Object.keys(game.skills.soft).forEach(k=>{ game.skills.soft[k] = Math.round(game.skills.soft[k] * 0.985); });
  }

  // Resume builder (simple)
  function buildResume(){
    const skills = {};
    // compute category averages 0-100 scaling (range from -10 to 25 per skill)
    const hardValues = Object.values(game.skills.hard);
    const softValues = Object.values(game.skills.soft);
    const hardAvg = hardValues.length? Math.round( mapRange(average(hardValues), -10, 25, 0,100) ) : 0;
    const softAvg = softValues.length? Math.round( mapRange(average(softValues), -10, 25, 0,100) ) : 0;
    const relBonus = Math.round( clamp(game.relationships,0,350) / 350 * 15 ); // Scale relationship bonus to 0-15 per design plan
    // New weighting: Soft Skills 75%, Hard Skills 25% - heavily favors soft skills
    // This allows good soft skills to carry a mediocre hard skill score, but not vice versa
    const finalScore = Math.round((hardAvg * 0.25) + (softAvg * 0.75) + relBonus);

    let outcome='';
    let endingType='';
    let endingMessage='';
    
    // Determine ending based on skill balance, not just score
    const skillGap = Math.abs(hardAvg - softAvg);
    const isHighSoft = softAvg > hardAvg + 15;
    const isHighHard = hardAvg > softAvg + 15;
    const isBalanced = skillGap <= 15;
    
    // Score ranges with new weighting: max soft-heavy score is ~79 (75*86/100 + 25*86/100 + 15)
    // Adjusted thresholds for new soft-skill weighting
    if(finalScore>=75 && isBalanced) {
      outcome='Dream job at top company';
      endingType='Dream Job Achieved';
      endingMessage='Your exceptional people skills combined with solid technical foundation made you an irresistible candidate! Top-tier company offer with excellent salary.';
    } else if(finalScore>=70 && isHighSoft) {
      outcome='Great job with strong team fit';
      endingType='The People Person';
      endingMessage='Your ability to connect and lead opened doors others couldn\'t access! Great company with training program included.';
    } else if(finalScore>=65) {
      outcome='Great job with growth potential';
      endingType='Solid Success';
      endingMessage='Your strong interpersonal skills and collaborative approach have secured a solid career start. Mid-tier company with good growth opportunity.';
    } else if(finalScore>=50) {
      outcome='Decent entry-level position';
      endingType='Starting Out';
      endingMessage='Career path is open. You\'re entering the job market with decent fundamentals.';
    } else if(finalScore>=35) {
      outcome='Unpaid internship or career pivot needed';
      endingType='The Struggle';
      endingMessage='Your lack of soft skills has limited your opportunities. Consider developing better communication and collaboration abilities. Consider a gap year to refocus.';
    } else {
      outcome='Back to the drawing board';
      endingType='Burnout';
      endingMessage='The imbalance and poor decisions have caught up. Soft skills are critical in today\'s job market. Time for a serious career pivot.';
    }

    return {hardAvg, softAvg, relBonus, finalScore, outcome, endingType, endingMessage};
  }

  // Check and award achievements
  function checkAchievements(){
    const hardAvg = Object.values(game.skills.hard).length ? Math.round(average(Object.values(game.skills.hard)) / 15) : 0; // scale to 0-100
    const softAvg = Object.values(game.skills.soft).length ? Math.round(average(Object.values(game.skills.soft)) / 15) : 0;
    
    // Achievement 1: Renaissance Student - Master 5+ skills (avg > 15 with cap at 20)
    const masteredSkills = Object.entries(game.skills.hard).filter(([k,v]) => v > 15).length +
                           Object.entries(game.skills.soft).filter(([k,v]) => v > 15).length;
    if(masteredSkills >= 5 && !game.achievements.includes('Renaissance Student')){
      game.achievements.push('Renaissance Student');
    }
    
    // Achievement 2: Tech Wizard - High hard skills (all hard > 18 near max with cap)
    const allHardSkillsHigh = Object.values(game.skills.hard).every(v => v > 18);
    if(allHardSkillsHigh && !game.achievements.includes('Tech Wizard')){
      game.achievements.push('Tech Wizard');
    }
    
    // Achievement 3: Natural Leader - High Leadership and Communication (both > 15)
    const hasLeadership = (game.skills.soft.Leadership || 0) > 15 && (game.skills.soft.Communication || 0) > 15;
    if(hasLeadership && !game.achievements.includes('Natural Leader')){
      game.achievements.push('Natural Leader');
    }
    
    // Achievement 4: Social Butterfly - High relationships and diverse experience
    if(game.relationships > 80 && game.experience.length > 20 && !game.achievements.includes('Social Butterfly')){
      game.achievements.push('Social Butterfly');
    }
    
    // Achievement 5: Comeback Kid - Low score early but good score at end (adjusted for new range)
    const avgEarlySemesterScore = game.history.slice(0, 6).reduce((sum, h) => {
      const changes = Object.values(h.changes.hard || {}).concat(Object.values(h.changes.soft || {}));
      return sum + changes.reduce((s, v) => s + v, 0);
    }, 0) / 6;
    const r = buildResume();
    if(avgEarlySemesterScore < 100 && r.finalScore >= 70 && !game.achievements.includes('Comeback Kid')){
      game.achievements.push('Comeback Kid');
    }
  }

  // UI helpers
  function average(arr){return arr.reduce((a,b)=>a+b,0)/arr.length}
  function mapRange(v,inMin,inMax,outMin,outMax){return (v-inMin)*(outMax-outMin)/(inMax-inMin)+outMin}

  // Get achievement description for tooltip
  function getAchievementDescription(achievementName) {
    const descriptions = {
      'Renaissance Student': 'Master 5+ different skills across the game',
      'Tech Wizard': 'Developed all hard skills to high levels',
      'Natural Leader': 'Excelled at both Leadership and Communication',
      'Social Butterfly': 'Built strong relationships and diverse experiences',
      'Comeback Kid': 'Started slow but finished strong'
    };
    return descriptions[achievementName] || 'Special achievement unlocked!';
  }

  // Persistence
  function saveStateAuto(){
    try{localStorage.setItem('resumeQuestSave', JSON.stringify(game));}catch(e){}
  }
  function loadState(){
    try{
      const raw = localStorage.getItem('resumeQuestSave');
      if(raw){
        const obj = JSON.parse(raw);
        Object.assign(game, obj);
        // ensure functions exist
        if(!game.skills) game.skills = newSkillState();
        // ensure shuffled pools exist for this run; if not, initialize
        if(!game.shuffled || !game.shuffled.eventsByYear) initShuffledPools();
      }
    }catch(e){console.warn('load failed',e)}
    render();
  }
  function resetState(){
    game.semesterIndex=0;game.decisionIndex=0;game.skills=newSkillState();game.experience=[];game.relationships=0;game.history=[];game.major=null;game.started=false;game.eventCache={};game.choiceCache={ classes: {}, extras: {} };game.used={ events:{}, classes:{}, extras:{}, crisis:{} };game.shuffled={ eventsByYear:{}, classesByMajor:{}, extras:[], crisis:[] };game.achievements=[];game.showingYearEnd=false;
    // initialize shuffled pools for new run
    initShuffledPools();
    saveStateAuto();render();
  }

  // Render loop
  function render(){
    const semesterInfo = document.getElementById('semester-info');
    const scenario = document.getElementById('scenario');
    const optionsEl = document.getElementById('options');
  const skillsList = document.getElementById('skills-list');
  const experienceList = document.getElementById('experience-list');
    const finalOutcome = document.getElementById('final-outcome');
  const endPanel = document.getElementById('end-outcome-panel');

    if(game.semesterIndex >= SEMESTERS){
      // endgame: show final outcome and resume
      semesterInfo.textContent = 'Game Complete!';
      scenario.innerHTML = '<strong>All semesters complete! Here\'s your final outcome:</strong>';
      optionsEl.innerHTML = '<div style="padding: 20px; text-align: center;"><em style="color: #333333; font-size: 16px;">Click anywhere or press Escape to return home</em></div>';
      optionsEl.addEventListener('click', ()=>{ showHome(); }, {once: true});
      if(endPanel){ endPanel.innerHTML = renderFinal(); endPanel.style.display = 'block'; }
      // clear sidebar final outcome (do not render there)
      if(finalOutcome) finalOutcome.innerHTML = '';
      return;
    }

    // Year-end screen
    if(game.showingYearEnd){
      const yearName = getYearName(game.semesterIndex - 1);
      const facts = yearEndFacts[yearName] || [];
      semesterInfo.textContent = `${yearName} Year Complete!`;
      scenario.innerHTML = `<strong style="font-size: 18px; color: #F66733;">🎓 Completed ${yearName} Year</strong>
        <div style="margin-top: 20px; font-size: 14px; color: #333333; line-height: 1.8;">
          <div style="margin-bottom: 12px; padding: 12px; background: #F5F5F5; border-radius: 6px; border-left: 4px solid #F66733;">
            <strong>💡 Fact 1:</strong> ${facts[0] || ''}
          </div>
          <div style="margin-bottom: 12px; padding: 12px; background: #F5F5F5; border-radius: 6px; border-left: 4px solid #F66733;">
            <strong>💡 Fact 2:</strong> ${facts[1] || ''}
          </div>
          <div style="padding: 12px; background: #F5F5F5; border-radius: 6px; border-left: 4px solid #F66733;">
            <strong>💡 Fact 3:</strong> ${facts[2] || ''}
          </div>
        </div>`;
      optionsEl.innerHTML = '<div style="padding: 20px; text-align: center;"><button id="year-end-continue-btn" style="background: #F66733; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 16px;">Continue to Next Year</button></div>';
      const btn = document.getElementById('year-end-continue-btn');
      if(btn){
        btn.addEventListener('click', ()=>{
          game.showingYearEnd = false;
          saveStateAuto();
          render();
        }, {once: true});
      }
      return;
    }

    // during normal play ensure the end panel is hidden
    if(endPanel){ endPanel.style.display = 'none'; endPanel.innerHTML = ''; }

    semesterInfo.textContent = `${getSemesterLabel(game.semesterIndex)}`;

    // get decisions for this semester
    const decisions = generateSemesterDecisions(game.semesterIndex);
    const decision = decisions[game.decisionIndex];
    scenario.innerHTML = `<strong>${decision.prompt}</strong>`;

    optionsEl.innerHTML = '';
    decision.options.forEach((opt, idx)=>{
      const div = document.createElement('div');
      div.className='option';
      div.innerHTML = `<div class="opt-text">${opt.text}</div>`;
      div.addEventListener('click',()=> applyChoice(opt));
      optionsEl.appendChild(div);
    });

    // render skills without progress bars
    skillsList.innerHTML='';
    skillCategories.hard.forEach(k=>{
      const v = game.skills.hard[k]||0;
      const bar = document.createElement('div');
      bar.className='skill-bar';
      bar.innerHTML = `<span style='color:#F66733;font-weight:600'>${k}:</span> <span style='font-size:14px;color:#333333'>${v}</span>`;
      skillsList.appendChild(bar);
    });
    skillCategories.soft.forEach(k=>{
      const v = game.skills.soft[k]||0;
      const bar = document.createElement('div');
      bar.className='skill-bar';
      bar.innerHTML = `<span style='color:#F66733;font-weight:600'>${k}:</span> <span style='font-size:14px;color:#333333'>${v}</span>`;
      skillsList.appendChild(bar);
    });

    // experience
    experienceList.innerHTML='';
    // Show all experiences for 8 semesters (max 24 choices)
    game.experience.slice(-18).forEach(e=>{
      const li = document.createElement('li'); li.className='experience-item'; li.textContent = e; experienceList.appendChild(li);
    });

    // resume summary removed per request: we no longer show hard/soft breakdown or achievements here
    finalOutcome.innerHTML = '';
  }

  function renderFinal(){
    checkAchievements(); // Award any achievements earned
    const r = buildResume();
    const skillSoftImpact = Math.round((r.softAvg / (r.softAvg + r.hardAvg || 1)) * 100);
    
    // Calculate what worked and what didn't
    const bestSkill = Object.entries(game.skills.soft).sort((a, b) => b[1] - a[1])[0];
    // Find worst skill across both hard and soft skills
    const allSkills = [
      ...Object.entries(game.skills.hard),
      ...Object.entries(game.skills.soft)
    ];
    const worstSkill = allSkills.sort((a, b) => a[1] - b[1])[0];
    const mostCommonChoice = game.history.length > 0 ? game.history[0].choice : 'Unknown';
    
    const achievementsList = game.achievements.length > 0 
      ? `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #E0E0E0;">
           <div style="color: #F66733; font-weight: bold; margin-bottom: 8px;">🏆 Achievements Unlocked:</div>
           ${game.achievements.map(a => `<div style="font-size: 12px; color: #F66733; margin-bottom: 4px;"><span class="achievement-item">✓ ${a}<span class="achievement-tooltip">${getAchievementDescription(a)}</span></span></div>`).join('')}
         </div>`
      : '';
    
    const whatWorked = bestSkill ? `<div style="color: #34d399; font-size: 12px; margin-top: 8px;">
      <strong>✓ What Worked:</strong> Your ${bestSkill[0]} (${bestSkill[1]}) was a major asset!</div>` : '';
    
    const whatDidntWork = worstSkill && worstSkill[1] < 100 ? `<div style="color: #f87171; font-size: 12px; margin-top: 4px;">
      <strong>✗ Area to Develop:</strong> ${worstSkill[0]} (${worstSkill[1]}) needs more attention.</div>` : '';
    
    return `
      <div style="padding: 20px; line-height: 1.6;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #F66733;">${r.endingType}</div>
        <div style="font-size: 14px; margin-bottom: 15px; color: #333333;">${r.endingMessage}</div>
        <div style="font-size: 13px; color: #666666;">
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #E0E0E0;"><strong>📊 Impact Analysis:</strong> Soft skills heavily weighted in hiring decisions!</div>
          ${whatWorked}
          ${whatDidntWork}
        </div>
        ${achievementsList}
      </div>
    `;
  }

  // Wire up buttons
  document.addEventListener('DOMContentLoaded', ()=>{
    // No menu overlay: pressing Escape always brings the player to the Home screen
    document.addEventListener('keydown', (ev)=>{
      if(ev.key === 'Escape'){
        try{ showHome(); }catch(e){}
      }
    });

    // Home screen (separate screen) / major selection (uses the start-overlay element as the home screen)
    const startOverlay = document.getElementById('start-overlay');
    const startBtn = document.getElementById('start-game-btn');
    const contBtn = document.getElementById('continue-btn');

    function showHome(){
      const main = document.querySelector('main.container');
      if(main) main.style.display = 'none';
      if(startOverlay) startOverlay.style.display = 'flex';
    }
    function hideHome(){
      const main = document.querySelector('main.container');
      if(main) main.style.display = 'flex';
      if(startOverlay) startOverlay.style.display = 'none';
    }

    // Start New Game: resets progress and begins
    if(startBtn && startOverlay){
      startBtn.addEventListener('click', ()=>{
        const selected = document.querySelector('input[name="major"]:checked');
        const majorChoice = selected ? selected.value : 'Engineering';
        // reset progress for a new game
        resetState();
        game.major = majorChoice;
        game.started = true;
        hideHome();
        saveStateAuto();
        render();
      });
    }

    // Continue: load saved state (if present) and resume
    if(contBtn && startOverlay){
      contBtn.addEventListener('click', ()=>{
        loadState();
        if(!game.started) game.started = true;
        hideHome();
        // menu overlay removed — nothing to hide here
      });
    }

    // On initial load decide whether to show home or game
    try{
      const raw = localStorage.getItem('resumeQuestSave');
      if(raw){
        const obj = JSON.parse(raw);
        if(obj && obj.started){ hideHome(); } else { showHome(); }
      } else { showHome(); }
    }catch(e){ showHome(); }

    // initial render
    render();
  });

  // expose for debugging
  window.ResumeQuest = { game, saveStateAuto, loadState, resetState };
})();
