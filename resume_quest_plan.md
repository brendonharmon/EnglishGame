# Resume Quest: The College Chronicles
## Game Design Document

---

## 📋 Core Concept

**Resume Quest** is a choose-your-own-adventure game where players navigate four years of college life, making decisions that build both hard and soft skills. The ultimate goal is to craft a resume strong enough to land your dream job, with the game mechanics favoring soft skill development to reinforce their real-world importance.

**Theme**: Soft skills are more important than hard skills in achieving career success.

---

## 🎮 Game Structure

### Phase System

The game spans **4 years (8 semesters)** of college, divided into:

| Year | Focus | Description |
|------|-------|-------------|
| **Freshman Year** | Introduction | Basic choices, low stakes, tutorial mechanics |
| **Sophomore Year** | Complexity | More complex decisions, internship opportunities |
| **Junior Year** | Critical Path | Leadership roles, networking events, critical choices |
| **Senior Year** | Endgame | Job applications, interviews, final skill assessment |

---

## 💼 Skill Categories

### Hard Skills (40% weight in final scoring)

- **Technical Proficiency**: Coding, data analysis, design software
- **Academic Knowledge**: GPA, certifications, specialized training
- **Industry-Specific Tools**: Platform expertise, methodologies
- **Languages**: Programming languages or spoken languages

### Soft Skills (60% weight in final scoring)

- **Communication**: Written, verbal, presentation skills
- **Leadership**: Team management, initiative, delegation
- **Emotional Intelligence**: Empathy, self-awareness, conflict resolution
- **Adaptability**: Problem-solving, creativity, resilience
- **Collaboration**: Teamwork, networking, cultural awareness
- **Time Management**: Prioritization, meeting deadlines, work-life balance

---

## 🎯 Gameplay Mechanics

### Decision Points

Players encounter **3-5 major decisions per semester** across scenarios including:

#### Class Selection
- Technical courses (hard skills) vs. communication/psychology courses (soft skills)
- Electives that balance both or specialize in one area

#### Extracurriculars
- Coding club vs. student government vs. debate team
- Sports teams, volunteer organizations, cultural groups

#### Social Events
- Networking mixer vs. hackathon vs. study group
- Parties, career fairs, community service events

#### Part-time Work
- Technical internship vs. customer service vs. peer mentoring
- Freelance work, research assistant, campus jobs

#### Crisis Management
- Group project conflicts
- Missed deadlines and personal challenges
- Ethical dilemmas and difficult choices

### Skill Building System

**Point Allocation:**
- **Hard skills**: +3 points per relevant choice
- **Soft skills**: +5 points per relevant choice (higher impact reflects real-world importance)
- Skills decay slightly if not maintained (encourages balanced gameplay)
- Some choices have hidden consequences that reveal themselves in later semesters

**Skill Levels:**
- Beginner (0-20 points)
- Intermediate (21-50 points)
- Advanced (51-80 points)
- Expert (81-100 points)

### Resume Builder

Players see their resume update in real-time with:

- **Experience Section**: Automatically populates based on activities chosen
- **Skills Section**: Displays skill levels and proficiencies
- **Achievements**: Unlocked through specific decision paths
- **References**: Earned through relationship-building choices
- **Summary Statement**: Dynamically generated based on player's path

---

## 👥 Narrative Elements

### Character Relationships

Relationship strength directly affects job opportunities and interview performance.

#### Professors
- Mentorship opportunities
- Recommendation letters (crucial for job applications)
- Research positions and academic guidance

#### Peers
- Study partners
- Startup co-founders
- Emotional support and social connections

#### Industry Professionals
- Networking contacts
- Internship sponsors
- Career advice and insider information

#### Family
- Influence on major life decisions
- Financial and emotional support system
- Expectations and pressure management

### Branching Storylines

Multiple paths lead to different outcomes:

#### The Techie
- **Focus**: Hard skills maximization
- **Challenge**: Struggles with team dynamics and communication
- **Outcome**: Strong technical role but limited advancement

#### The Networker
- **Focus**: Relationship building
- **Challenge**: Lacks technical depth
- **Outcome**: Good opportunities but may need skill development

#### The Balanced
- **Focus**: Jack-of-all-trades approach
- **Challenge**: Never fully mastering any one area
- **Outcome**: Optimal path with most opportunities (RECOMMENDED)

#### The Leader
- **Focus**: Soft skills dominance
- **Challenge**: Building credibility without deep technical expertise
- **Outcome**: Highly sought after, fast-track to management

#### The Burnout
- **Focus**: Poor time management
- **Challenge**: Everything falls apart
- **Outcome**: Warning path showing consequences of imbalance

---

## 🏆 Endgame: Job Application Phase

### Resume Scoring Algorithm

```
Final Score = (Hard Skills × 0.4) + (Soft Skills × 0.6) + Relationship Bonus

Where:
- Hard Skills: Average of all hard skill categories (0-100)
- Soft Skills: Average of all soft skill categories (0-100)
- Relationship Bonus: +0 to +15 points based on network strength
```

### Job Tier Unlocked

| Score Range | Outcome |
|-------------|---------|
| **80-100** | Dream job at top company (Google, McKinsey, etc.) |
| **60-79** | Great job with growth potential (solid mid-tier company) |
| **40-59** | Decent entry-level position (career started) |
| **20-39** | Unpaid internship or career pivot needed |
| **0-19** | Back to the drawing board (graduate unemployment) |

### Interview Scenarios

The final challenge uses accumulated soft skills:

#### Behavioral Questions
- **Requires**: High Communication + Emotional Intelligence
- **Tests**: Real-world scenario responses from college experiences

#### Team Fit Assessment
- **Requires**: Collaboration + Adaptability
- **Tests**: How well player works with diverse personalities

#### Problem-Solving Exercise
- **Requires**: Leadership + Creativity
- **Tests**: Innovative thinking under pressure

#### Case Study Presentation
- **Requires**: Communication + Technical Knowledge
- **Tests**: Ability to explain complex ideas simply

**Special Mechanic**: Players with strong soft skills get multiple attempts and helpful hints; those with only hard skills face harsher judgment and limited second chances.

### Multiple Endings

#### "Dream Job Achieved"
- **Path**: Balanced approach with strong soft skills
- **Result**: Top-tier company offer with excellent salary and benefits
- **Message**: "Your well-rounded skills made you an irresistible candidate!"

#### "Technical Expert, Cultural Misfit"
- **Path**: High hard skills, low soft skills
- **Result**: Mediocre outcome—job offer but poor fit, limited growth
- **Message**: "You know your stuff, but companies need team players."

#### "The People Person"
- **Path**: High soft skills compensate for lower hard skills
- **Result**: Good outcome—great company, training program included
- **Message**: "Your ability to connect and lead opened doors others couldn't access!"

#### "The Dropout"
- **Path**: Poor decisions, burnout, imbalance
- **Result**: Cautionary tale—gap year or career reset needed
- **Message**: "Sometimes the path to success requires a detour for reflection."

#### "The Entrepreneur"
- **Path**: Alternative success through leadership and networking
- **Result**: Started own company or joined startup in leadership role
- **Message**: "You didn't need a traditional job—you created your own opportunity!"

---

## 💡 Key Game Messages

Throughout gameplay, subtle (and explicit) hints reinforce the soft skills theme:

### NPC Commentary
- "Your GPA is impressive, but can you work with a team?"
- "We have plenty of smart people. We need someone who can communicate."
- "Leadership isn't taught in textbooks."

### Environmental Storytelling
- Failed interviews despite technical excellence due to poor communication
- Success stories of characters with average GPAs but exceptional people skills
- Job postings emphasizing "cultural fit" and "team player" over technical requirements

### Post-Game Statistics
- Data showing soft skills were decisive in 70% of successful job placements
- Comparison of player's choices vs. optimal path
- "What worked" vs. "What held you back" analysis

---

## 🔄 Replayability Features

### Different Majors
Each major offers unique scenarios and challenges:
- **Business**: Focus on networking and leadership scenarios
- **Engineering**: Heavy technical choices with teamwork challenges
- **Liberal Arts**: Communication-rich with diverse skill building

### Achievement System
- "Renaissance Student": Master 5+ skills across both categories
- "Social Butterfly": Build relationships with 20+ NPCs
- "Tech Wizard": Max out all hard skills (but see the consequences!)
- "Natural Leader": Lead 3+ major organizations
- "Comeback Kid": Recover from a major setback to succeed

### "What If?" Mode
- Replay specific decisions to see alternate outcomes
- Branch comparison showing how different choices cascade
- Unlock after first playthrough

### Leaderboard & Community
- Compare soft vs. hard skill emphasis across players
- Share resume achievements
- Community discussions on optimal strategies

---

## 🎨 Design Philosophy

### Core Principles

1. **Show, Don't Tell**: Let players experience the value of soft skills through gameplay consequences, not lectures
2. **Meaningful Choices**: Every decision should feel impactful and have visible results
3. **Authentic Scenarios**: Base situations on real college experiences and job interview processes
4. **Encouraging Experimentation**: No "game over"—all paths lead somewhere, but some are better than others
5. **Progressive Difficulty**: Start simple, build complexity as players learn the system

### Emotional Journey

- **Act 1** (Freshman): Excitement, exploration, freedom
- **Act 2** (Sophomore): Confusion, choice paralysis, first failures
- **Act 3** (Junior): Confidence building, strategic thinking, stakes rising
- **Act 4** (Senior): Anxiety, culmination, ultimate test, resolution

---

## 📊 Success Metrics

The game successfully conveys its message when players:

1. Understand that soft skills have higher weight in scoring
2. Feel surprised when technical prowess alone doesn't guarantee success
3. Experience "aha moments" when soft skills unlock unexpected opportunities
4. Replay with different strategies, deliberately building soft skills
5. Discuss the game's message about real-world career preparation

---

## 🚀 Implementation Notes

### Technical Considerations
- Save system for long-form gameplay across multiple sessions
- Branching narrative engine to track hundreds of decision permutations
- Dynamic resume generation based on player choices
- Relationship tracking system for all NPCs

### Narrative Tone
- **Encouraging but realistic**: Not preachy, but honest about challenges
- **Humor**: Light touches to keep gameplay fun despite serious theme
- **Diversity**: Represent various backgrounds, majors, and career paths
- **Accessibility**: Clear UI, helpful tooltips, optional difficulty settings

---

## 📝 Sample Decision Example

### Scenario: "The Group Project Disaster"

**Context**: Junior year, major class project. Your teammate isn't pulling their weight.

**Decision Options**:

1. **"Do their work yourself"**
   - +2 Technical Skills
   - -3 Time Management
   - -2 Leadership
   - Consequence: Burnout, missed social event

2. **"Call them out in the group chat"**
   - -5 Emotional Intelligence
   - -3 Collaboration
   - Consequence: Team conflict, professor notices tension

3. **"Have a private conversation to understand what's wrong"**
   - +5 Emotional Intelligence
   - +5 Communication
   - +3 Leadership
   - Consequence: Discover teammate's personal crisis, build trust, successful project

4. **"Report them to the professor"**
   - -2 Collaboration
   - +1 Time Management
   - Consequence: Quick resolution but damaged relationships

**Optimal Choice**: Option 3 demonstrates the game's core message—soft skills turn problems into opportunities.

---

**End of Design Document**

*Version 1.0 | Resume Quest: The College Chronicles*