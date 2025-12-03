# Choices

## A) Major-Dependent Systems

### Included Majors
| Major | Hard Skill Focus | Soft Skill Challenges |
|------|------------------|---------------------|
| Engineering | Math, coding, tools | Team communication issues |
| Business | Strategy, finance | Leadership & networking |
| Computer Science | Software, logic | Collaboration + clarity |
| Liberal Arts | Writing, analysis | Time mgmt & confidence |
| Creative Arts | Design, creation | Critique handling & marketing |

---

## Year-by-Year Class Pools by Major
*Note: Each major still has access to general education courses.*

### Freshman Year
| Major | Class Options | Skills |
|-------|--------------|-------|
| Engineering | Intro Engineering, Physics I | Hard: analytics |
| Business | Marketing Intro, Microeconomics | Hard: business reasoning |
| Computer Science | Programming Logic, CS Fundamentals | Hard: coding basics |
| Liberal Arts | Literature, Philosophy 101 | Soft: writing & reasoning |
| Creative Arts | Drawing & Form, Digital Media | Hard: design tools |

### Sophomore Year
| Major | Class Options | Skills |
|-------|--------------|-------|
| Engineering | Statics, Circuit Theory | Hard: systems thinking |
| Business | Accounting, Org Behavior | Soft: persuasion & teamwork |
| Computer Science | Data Structures, Web Dev | Hard: code fluency |
| Liberal Arts | Research & Rhetoric | Soft: writing mastery |
| Creative Arts | Branding, Design II | Hard: audience focus |

### Junior Year
| Major | Class Options | Skills |
|-------|--------------|-------|
| Engineering | Thermodynamics, Lab | Hard + Soft: collaboration |
| Business | Finance, Negotiation | Soft: leadership |
| Computer Science | Databases, Software Engineering | Hard: dev teamwork |
| Liberal Arts | Communication for Impact | Soft: presentation |
| Creative Arts | Client Project, Portfolio Lab | Soft: feedback handling |

### Senior Year
| Major | Class Options | Skills |
|-------|--------------|-------|
| Engineering | Ethics, Capstone Design | Soft: decisions |
| Business | Strategy, Capstone Simulation | Soft: delegation |
| Computer Science | AI/ML Intro, Cybersecurity | Hard: advanced tech |
| Liberal Arts | Thesis, Publication | Hard: academic showcase |
| Creative Arts | Showcase, Freelancing | Soft: marketing self |

---

# B) Event Scripts & Skill Impacts

## Freshman Scenarios
### Dorm Drama
Roommate playing loud music before a quiz.
- Ignore it → +Resilience, -GPA
- Ask politely → +Communication, relationship boost
- Contact RA → -Relationship, +Organization

## Sophomore Scenarios
### Internship Tryouts
Career fair rep asks about a missing skill.
- Bluff → +Confidence, -Integrity
- Admit & plan growth → +Communication, +Adaptability
- Redirect conversation → +Networking

## Junior Scenarios
### Leading the Disaster
Team loses a key document.
- Blame teammate → -Emotional Intelligence
- Take responsibility → +Leadership, +Collaboration
- Redo work solo → +Technical, -Time Management

## Senior Scenarios
### Dream Job Offer
High-pay toxic vs. low-pay growth.
- High pay → +Prestige, -Soft Skill bonus
- Growth role → +Relationship bonus, +Career Happiness
- Stall both → +Strategy, risk losing both

---

# C) Randomization System

## Class Selection RNG
```
{
  year: "Sophomore",
  major: "Business",
  numClasses: 4,
  pools: [
    { type: "Major Core", weight: 0.55 },
    { type: "Gen Ed", weight: 0.25 },
    { type: "Soft Skill Elective", weight: 0.20 }
  ],
  prerequisites: checkCompleted(year-1)
}
```

## Challenge RNG
```
{
  year: 3,
  minEvents: 2,
  maxEvents: 4,
  weightModifiers: {
    lowSoftSkills: +20% conflict events,
    lowHardSkills: +20% technical events,
    highStress: burnout events appear
  }
}
```

## Skill Rewards
| Difficulty | Hard Gain | Soft Gain |
|-----------|----------|-----------|
| Easy | +1 to +2 | +2 to +3 |
| Medium | +2 to +4 | +3 to +6 |
| Hard | +3 to +6 | +5 to +10 |

---

# Data Structure Example
```
{
  event_id: 104,
  title: "Group Project Showdown",
  year_available: [2,3],
  major_bias: ["Engineering","CS"],
  difficulty: "medium",
  choices: [
    {
      text: "Confront teammate privately",
      skill_gains: { EI: +4, Leadership: +3 },
      relationship_change: +10
    },
    {
      text: "Redo work yourself",
      skill_gains: { Technical: +4, TimeMgmt: -3 },
      burnoutRisk: true
    }
  ]
}
```

---

# Next Options
- Expand event database (50–200 events)
- Add NPC relationship arcs
- Include personality-based path modifiers
- Export to JSON or integrate in your engine

---

**End of Choices File**

