// ─── Name pools ───────────────────────────────────────────────
const MALE = ['James','Oliver','William','Noah','Jack','Lucas','Ethan','Liam','Mason','Logan','Ryan','Dylan','Nathan','Samuel','Benjamin','Thomas','Daniel','Matthew','Joshua','Connor','Finn','Harry','Leo','Charlie','Archie','Max','Hugo','Oscar','Aiden','Hunter','Jasper','Sebastian','Xavier','Theo','Zack','Lachlan','Mitchell','Jake','Tyler','Caleb','Aaron','Adam','Alex','Andrew','Anthony','Blake','Brandon','Brayden','Brian','Cameron','Carter','Christian','Christopher','Cole','Corey','Damian','Dean','Declan','Derek','Dominic','Elliot','Eric','Evan','Felix','Frankie','Gabriel','Gavin','George','Grant','Hayden','Ian','Isaiah','Ivan','Jacob','Jared','Jason','Jesse','Joel','Jonathan','Jordan','Julian','Justin','Kevin','Kyle'];
const FEMALE = ['Emma','Olivia','Ava','Isabella','Sophia','Mia','Charlotte','Amelia','Harper','Evelyn','Aria','Scarlett','Grace','Zoe','Chloe','Lily','Hannah','Aisha','Priya','Sofia','Maya','Sarah','Jessica','Emily','Abigail','Natalie','Ella','Luna','Layla','Nora','Riley','Zara','Lucy','Ruby','Isla','Stella','Violet','Aurora','Sienna','Jasmine','Mei','Fatima','Aaliyah','Leila','Nina','Tara','Jade','Brooke','Alexis','Allison','Amanda','Amy','Andrea','Angela','Anna','Ashley','Brianna','Brittany','Camille','Caroline','Catherine','Claire','Crystal','Diana','Elena','Elise','Elizabeth','Fiona','Georgia','Hailey','Holly','Imogen','Isabel','Jade','Jamie','Jenna','Jennifer','Jessica','Julia','Kaitlyn','Karen','Katherine','Kayla','Kelly','Kiera','Kirra'];
const LAST = ['Johnson','Smith','Williams','Brown','Jones','Miller','Davis','Garcia','Wilson','Martinez','Anderson','Taylor','Thomas','Hernandez','Moore','Jackson','Martin','Lee','Thompson','White','Harris','Clark','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Green','Adams','Baker','Nelson','Mitchell','Campbell','Chen','Kim','Patel','Singh','Ahmad','Hassan',"O'Brien",'Murphy','Kelly','Ryan','Walsh','McCarthy','Sullivan','Flynn','Dunne','Burke','Lynch','Jordan','Murray','Robertson','Patterson','Hunter','Graham','Ferguson','Henderson','Morrison','Boyd','Phillips','Watson','Diaz','Rogers','Edwards','Stewart','Morris','Sanchez','Reed','Cook','Rogers','Cooper','Bailey','Richardson','Cox','Howard','Ward','Peterson'];

// ─── Student generator (1050 students) ───────────────────────
function generateStudents() {
  const years = [7, 8, 9, 10, 11, 12];
  const letters = ['A','B','C','D','E','F','G'];
  const PER_CLASS = 25;
  const list = [];
  let idx = 0;

  for (const year of years) {
    for (const letter of letters) {
      for (let i = 0; i < PER_CLASS; i++) {
        idx++;
        const isMale = idx % 2 === 0;
        const pool = isMale ? MALE : FEMALE;
        const firstName = pool[idx % pool.length];
        const lastName  = LAST[idx % LAST.length];
        const uid = idx.toString(16).padStart(8, '0').toUpperCase();
        const present = (idx % 11 !== 0); // ~91% attendance
        list.push({
          id:      `S${idx.toString().padStart(4,'0')}`,
          name:    `${firstName} ${lastName}`,
          year,
          class:   `${year}${letter}`,
          uid,
          present,
        });
      }
    }
  }
  return list;
}

const _raw = generateStudents();

// Override first students in key classes with real RFID card UIDs
function overrideStudent(students, classCode, position, overrides) {
  const classStudents = students.filter(s => s.class === classCode);
  if (classStudents[position]) {
    const target = students.find(s => s.id === classStudents[position].id);
    if (target) Object.assign(target, overrides);
  }
}

overrideStudent(_raw, '11A', 0, { id: 'S001', name: 'Toby Crowther',   year: 12, class: '12A', house: 'Dixon', email: 'tc.160138@student.shore.nsw.edu.au', uid: '67BDE33D', present: false });
overrideStudent(_raw, '11B', 0, { id: 'S002', name: 'Liam Chen',       uid: 'A139E43D', present: false });
overrideStudent(_raw, '12A', 0, { id: 'S003', name: 'Sofia Nguyen',    uid: 'C92BE43D', present: true  });
overrideStudent(_raw, '12A', 1, { id: 'S004', name: 'Marcus Williams', uid: '1CC9E33D', present: false });

export const students = _raw;

// ─── Teachers ─────────────────────────────────────────────────
export const teachers = [
  { id:'T001', name:'Ms Emma Richards',   subject:'English',              classes:['7A','7D','8B','9F','10C','11E'],       avatar:'ER' },
  { id:'T002', name:'Mr David Chen',      subject:'Mathematics',          classes:['7B','8A','9C','10D','11A','12B'],      avatar:'DC' },
  { id:'T003', name:'Ms Priya Sharma',    subject:'Science',              classes:['7C','8D','9A','10E','11B','12C'],      avatar:'PS' },
  { id:'T004', name:'Mr James Murphy',    subject:'History',              classes:['7E','8F','9D','10A','11C','12D'],      avatar:'JM' },
  { id:'T005', name:'Ms Laura Walsh',     subject:'Geography',            classes:['7F','8G','9B','10F','11D'],            avatar:'LW' },
  { id:'T006', name:'Mr Tom Henderson',   subject:'PDHPE',                classes:['7G','8C','9G','10G','11F','12E'],      avatar:'TH' },
  { id:'T007', name:'Ms Zoe Campbell',    subject:'Visual Arts',          classes:['7A','8E','9E','10B','11G','12A'],      avatar:'ZC' },
  { id:'T008', name:'Mr Sam O\'Brien',    subject:'Music',                classes:['7B','7E','8B','9C','10C','11B'],       avatar:'SO' },
  { id:'T009', name:'Ms Nina Patel',      subject:'Drama',                classes:['7C','7G','8F','9D','10D','11C'],       avatar:'NP' },
  { id:'T010', name:'Mr Alex Torres',     subject:'Commerce',             classes:['7D','8C','9F','10E','11D','12F'],      avatar:'AT' },
  { id:'T011', name:'Ms Jade Morrison',   subject:'English',              classes:['7E','7F','8A','9B','10A','11F'],       avatar:'JM' },
  { id:'T012', name:'Mr Ethan Boyd',      subject:'Mathematics',          classes:['7C','7G','8E','9G','10F','11G','12G'], avatar:'EB' },
  { id:'T013', name:'Ms Chloe Scott',     subject:'Biology / Chemistry',  classes:['9E','10G','11A','11D','12A','12D'],    avatar:'CS' },
  { id:'T014', name:'Mr Ryan Kim',        subject:'Physics',              classes:['10B','10E','11B','11E','12B','12E'],   avatar:'RK' },
  { id:'T015', name:'Ms Mei Nguyen',      subject:'Languages (Japanese)', classes:['7A','7B','8A','8B','9A','9B'],         avatar:'MN' },
  { id:'T016', name:'Mr Daniel Wright',   subject:'Economics',            classes:['10A','11A','11C','12A','12C'],         avatar:'DW' },
  { id:'T017', name:'Ms Hannah Lawson',   subject:'Legal Studies',        classes:['10B','11B','11F','12B','12F'],         avatar:'HL' },
  { id:'T018', name:'Mr Marcus Reed',     subject:'Design & Technology',  classes:['7B','8C','9D','10C','11E','12C'],      avatar:'MR' },
  { id:'T019', name:'Ms Sarah Williams',  subject:'English',              classes:['8C','9E','10E','11D','12D','12E'],     avatar:'SW' },
  { id:'T020', name:'Mr Andrew Hughes',   subject:'Biology',              classes:['9G','10F','11G','12A','12B','12F'],    avatar:'AH' },
  { id:'T021', name:'Ms Olivia Park',     subject:'Modern History',       classes:['9F','10B','11E','11F','12E','12G'],    avatar:'OP' },
  { id:'T022', name:'Mr Benjamin Lee',    subject:'Information Tech',     classes:['7E','8D','9C','10D','11C','12C'],      avatar:'BL' },
  { id:'T023', name:'Ms Rachel Goldman',  subject:'Careers / Wellbeing',  classes:['11A','11B','11C','12A','12B','12C'],   avatar:'RG' },
  { id:'T024', name:'Mr Hugo Pereira',    subject:'Languages (French)',   classes:['7F','7G','8E','8F','9D','9E'],         avatar:'HP' },
  { id:'T025', name:'Ms Karen Robinson',  subject:'Wellbeing Coordinator',classes:['11A','11B','11C','11D','11E','11F','11G'], avatar:'KR' },
  { id:'T026', name:'Mr Liam Foster',     subject:'PE / Sport',           classes:['7A','7B','7C','7D','8A','8B','8C'],    avatar:'LF' },
  { id:'T027', name:'Ms Yui Tanaka',      subject:'Visual Arts',          classes:['8D','9F','10A','11B','11G','12D'],     avatar:'YT' },
  { id:'T028', name:'Mr Patrick O\'Neill',subject:'Mathematics Extension',classes:['11A','12A','12B'],                     avatar:'PO' },
  { id:'T029', name:'Ms Beatrice Adams',  subject:'Music',                classes:['7D','7F','8G','9A','10C','11D'],       avatar:'BA' },
  { id:'T030', name:'Mr Gabriel Santos',  subject:'Geography',            classes:['7E','8B','9C','10D','11E','12E'],      avatar:'GS' },
];

export const DEMO_TEACHER_ID = 'T002'; // Mr David Chen · Maths

// ─── Teacher timetable (per class, per day) ───────────────────
// Shows what Mr David Chen (T002) teaches each day
export const teacherTimetable = {
  Mon: { 'Period 1':'7B Maths', 'Period 2':'8A Maths', 'Recess':'·',    'Period 3':'10D Maths', 'Period 4':'Preparation'  },
  Tue: { 'Period 1':'9C Maths', 'Period 2':'Preparation','Recess':'·',  'Period 3':'12B Maths', 'Period 4':'11A Maths'    },
  Wed: { 'Period 1':'11A Maths','Period 2':'7B Maths',  'Recess':'·',   'Period 3':'Preparation','Period 4':'9C Maths'    },
  Thu: { 'Period 1':'10D Maths','Period 2':'12B Maths', 'Recess':'·',   'Period 3':'8A Maths',  'Period 4':'Preparation'  },
  Fri: { 'Period 1':'Preparation','Period 2':'9C Maths','Recess':'·',   'Period 3':'11A Maths', 'Period 4':'10D Maths'    },
};

// ─── Student timetable (Toby Crowther, 12A) ─────────────────────
export const timetable = {
  Mon: ['English',    'Mathematics','Recess','Science',    'PDHPE'      ],
  Tue: ['History',    'English',   'Recess','Visual Arts','Mathematics' ],
  Wed: ['Science',    'PDHPE',     'Recess','English',    'History'     ],
  Thu: ['Mathematics','Visual Arts','Recess','Science',   'English'     ],
  Fri: ['PDHPE',      'History',   'Recess','Mathematics','Science'     ],
};

export const periods = [
  { label:'Period 1', time:'9:00-10:00'  },
  { label:'Period 2', time:'10:00-11:00' },
  { label:'Recess',   time:'11:00-11:30' },
  { label:'Period 3', time:'11:30-12:30' },
  { label:'Period 4', time:'12:30-1:30'  },
];

// ─── Wellbeing & student data ─────────────────────────────────
export const goals = [
  { id:1, text:'Complete maths assignment',     due:'Fri', done:false, category:'Academic', priority:'high'   },
  { id:2, text:'Study for English essay',       due:'Wed', done:true,  category:'Academic', priority:'medium' },
  { id:3, text:'Finish science report',         due:'Mon', done:false, category:'Academic', priority:'high'   },
  { id:4, text:'Go for a run 3x this week',     due:'Fri', done:false, category:'Health',   priority:'medium' },
  { id:5, text:'Call grandma',                  due:'Sun', done:true,  category:'Personal', priority:'low'    },
  { id:6, text:'10 min mindfulness each morning',due:'Daily',done:false,category:'Wellbeing',priority:'medium'},
];

export const journalEntries = [
  { id:1, date:'Mon 6 May',  mood:3, text:'Had a good maths lesson today. Feeling more confident about the exam.' },
  { id:2, date:'Tue 7 May',  mood:4, text:'English was fun · we started a new novel study. Really enjoying it.' },
  { id:3, date:'Wed 8 May',  mood:1, text:'Tough day. Science test didn\'t go as well as I hoped. Need to study more.' },
  { id:4, date:'Thu 9 May',  mood:3, text:'Better today. Talked to Ms Richards about my essay and feel clearer now.' },
  { id:5, date:'Fri 10 May', mood:4, text:'Great week overall. Looking forward to the weekend and catching up with friends.' },
];

export const notifications = [
  { id:1, text:'Toby Crowther marked absent Period 2',  time:'10:05 AM', type:'warn' },
  { id:2, text:'12B · 3 students absent today',         time:'9:30 AM',  type:'warn' },
  { id:3, text:'Wellbeing check submitted · Toby',      time:'9:02 AM',  type:'info' },
  { id:4, text:'New journal entry added',               time:'8:45 AM',  type:'info' },
  { id:5, text:'7C · 100% attendance today 🎉',         time:'9:10 AM',  type:'info' },
];

export const attendanceHistory = [
  { date:'Mon 6 May',  status:'present' },
  { date:'Tue 7 May',  status:'present' },
  { date:'Wed 8 May',  status:'absent'  },
  { date:'Thu 9 May',  status:'present' },
  { date:'Fri 10 May', status:'present' },
];

// ─── Historical attendance (monthly, 2021-2026) ───────────────
export const monthlyAttendance = [
  { period:'Feb 21', rate:91.2, enrolled:987  }, { period:'Mar 21', rate:89.5, enrolled:995  },
  { period:'Apr 21', rate:88.9, enrolled:995  }, { period:'May 21', rate:87.2, enrolled:998  },
  { period:'Jun 21', rate:85.8, enrolled:1000 }, { period:'Jul 21', rate:84.1, enrolled:1002 },
  { period:'Aug 21', rate:85.6, enrolled:1002 }, { period:'Sep 21', rate:88.3, enrolled:1005 },
  { period:'Oct 21', rate:90.1, enrolled:1008 }, { period:'Nov 21', rate:89.7, enrolled:1008 },
  { period:'Feb 22', rate:92.4, enrolled:1015 }, { period:'Mar 22', rate:91.0, enrolled:1018 },
  { period:'Apr 22', rate:90.2, enrolled:1020 }, { period:'May 22', rate:88.9, enrolled:1020 },
  { period:'Jun 22', rate:86.5, enrolled:1022 }, { period:'Jul 22', rate:85.3, enrolled:1022 },
  { period:'Aug 22', rate:87.8, enrolled:1025 }, { period:'Sep 22', rate:90.4, enrolled:1028 },
  { period:'Oct 22', rate:91.8, enrolled:1030 }, { period:'Nov 22', rate:90.9, enrolled:1030 },
  { period:'Feb 23', rate:93.1, enrolled:1032 }, { period:'Mar 23', rate:91.6, enrolled:1035 },
  { period:'Apr 23', rate:91.0, enrolled:1035 }, { period:'May 23', rate:89.4, enrolled:1038 },
  { period:'Jun 23', rate:87.2, enrolled:1038 }, { period:'Jul 23', rate:86.0, enrolled:1040 },
  { period:'Aug 23', rate:88.5, enrolled:1040 }, { period:'Sep 23', rate:91.2, enrolled:1042 },
  { period:'Oct 23', rate:92.3, enrolled:1044 }, { period:'Nov 23', rate:91.7, enrolled:1044 },
  { period:'Feb 24', rate:93.8, enrolled:1045 }, { period:'Mar 24', rate:92.4, enrolled:1046 },
  { period:'Apr 24', rate:91.8, enrolled:1046 }, { period:'May 24', rate:90.1, enrolled:1048 },
  { period:'Jun 24', rate:87.9, enrolled:1048 }, { period:'Jul 24', rate:86.8, enrolled:1048 },
  { period:'Aug 24', rate:89.3, enrolled:1048 }, { period:'Sep 24', rate:91.9, enrolled:1050 },
  { period:'Oct 24', rate:92.7, enrolled:1050 }, { period:'Nov 24', rate:92.1, enrolled:1050 },
  { period:'Feb 25', rate:94.2, enrolled:1050 }, { period:'Mar 25', rate:92.8, enrolled:1050 },
  { period:'Apr 25', rate:92.0, enrolled:1050 }, { period:'May 25', rate:90.5, enrolled:1050 },
  { period:'Jun 25', rate:88.3, enrolled:1050 }, { period:'Jul 25', rate:87.1, enrolled:1050 },
  { period:'Aug 25', rate:89.8, enrolled:1050 }, { period:'Sep 25', rate:92.4, enrolled:1050 },
  { period:'Oct 25', rate:93.1, enrolled:1050 }, { period:'Nov 25', rate:92.6, enrolled:1050 },
  { period:'Feb 26', rate:93.5, enrolled:1050 }, { period:'Mar 26', rate:92.1, enrolled:1050 },
  { period:'Apr 26', rate:91.4, enrolled:1050 }, { period:'May 26', rate:91.8, enrolled:1050 },
];

export const yearlyStats = [
  { year:'2021', rate:88.4 }, { year:'2022', rate:89.3 },
  { year:'2023', rate:90.8 }, { year:'2024', rate:91.7 },
  { year:'2025', rate:92.3 }, { year:'2026', rate:91.8 },
];

export const yearGroupRates = [
  { label:'Year 7',  rate:94.2 }, { label:'Year 8',  rate:93.1 },
  { label:'Year 9',  rate:91.8 }, { label:'Year 10', rate:91.2 },
  { label:'Year 11', rate:90.5 }, { label:'Year 12', rate:88.9 },
];

// Generated class leaderboard (42 classes, realistic variance)
const CLASS_RATES = {
  '7A':97.2,'7B':96.4,'7C':95.8,'7D':95.1,'7E':94.6,'7F':94.0,'7G':93.3,
  '8A':95.5,'8B':94.8,'8C':93.9,'8D':93.2,'8E':92.7,'8F':92.0,'8G':91.4,
  '9A':93.8,'9B':92.9,'9C':92.1,'9D':91.5,'9E':90.8,'9F':90.2,'9G':89.6,
  '10A':92.4,'10B':91.7,'10C':90.9,'10D':90.2,'10E':89.5,'10F':88.9,'10G':88.2,
  '11A':91.2,'11B':90.5,'11C':89.8,'11D':89.1,'11E':88.5,'11F':87.9,'11G':87.2,
  '12A':90.1,'12B':89.3,'12C':88.6,'12D':87.8,'12E':87.1,'12F':86.4,'12G':85.8,
};
export const classLeaderboard = Object.entries(CLASS_RATES)
  .map(([cls, rate]) => ({ class: cls, year: parseInt(cls), rate }))
  .sort((a,b) => b.rate - a.rate);

// ─── Assessments ──────────────────────────────────────────────
export const assessments = [
  { id:'A001', subject:'English Advanced',  task:'Module A · Textual Analysis Essay',    type:'Essay',      due:'15 Mar', weight:'15%', score:82, grade:'A',  status:'submitted', feedback:'Excellent analysis. Work on thesis clarity.' },
  { id:'A002', subject:'Mathematics Adv',   task:'Functions & Calculus Assignment',        type:'Assignment', due:'22 Mar', weight:'10%', score:78, grade:'B+', status:'submitted', feedback:'Strong calculus section.' },
  { id:'A003', subject:'Modern History',    task:'WWI Depth Study',                        type:'Project',    due:'5 Apr',  weight:'20%', score:85, grade:'A-', status:'submitted', feedback:'Impressive primary source analysis.' },
  { id:'A004', subject:'PDHPE',             task:'Fitness Component Testing',              type:'Practical',  due:'20 May', weight:'10%', score:null, grade:null, status:'upcoming', feedback:null },
  { id:'A005', subject:'Mathematics Adv',   task:'Calculus & Series In-Class Test',        type:'Test',       due:'25 May', weight:'15%', score:null, grade:null, status:'upcoming', feedback:null },
  { id:'A006', subject:'English Advanced',  task:'Module B · Creative Writing Piece',      type:'Creative',   due:'30 May', weight:'20%', score:null, grade:null, status:'upcoming', feedback:null },
  { id:'A007', subject:'Modern History',    task:'WWII Causes Research Essay',             type:'Essay',      due:'6 Jun',  weight:'25%', score:null, grade:null, status:'upcoming', feedback:null },
];

// ─── Homework ─────────────────────────────────────────────────
export const homework = [
  { id:'H001', subject:'Mathematics', task:'Exercise 5.3 · Integration by Parts', due:'Tomorrow', done:false, urgent:true  },
  { id:'H002', subject:'English',     task:'Read Chapters 6-8 of set text',        due:'Thu',      done:false, urgent:false },
  { id:'H003', subject:'History',     task:'Research notes on WWII causes',         due:'Fri',      done:true,  urgent:false },
  { id:'H004', subject:'Science',     task:'Lab report write-up (titration)',        due:'Mon',      done:false, urgent:false },
  { id:'H005', subject:'PDHPE',       task:'Weekly training log entry',             due:'Fri',      done:true,  urgent:false },
];

// ─── Extracurriculars ─────────────────────────────────────────
export const extracurriculars = [
  { id:'E001', name:'Debating Club',     role:'Member',       next:'Tue lunch · Room 14',    icon:'🎙️', season:'Year-round' },
  { id:'E002', name:'Environmental Club',role:'Vice Captain', next:'Thu lunch · Oval',       icon:'🌱', season:'Year-round' },
  { id:'E003', name:'Girls Soccer',      role:'Midfielder',   next:'Wed 3:30pm · Main Oval', icon:'⚽', season:'Term 1-2'  },
];

export const sportsFixtures = [
  { sport:'Girls Soccer', opponent:'Westfield HS',     date:'Sat 24 May', time:'2:00 PM', venue:'Home - Main Oval', result:null     },
  { sport:'Girls Soccer', opponent:'Shore Grammar',    date:'Sat 10 May', time:'10:00 AM',venue:'Away',             result:'W 3-1'  },
  { sport:'Girls Soccer', opponent:'Northern Beaches', date:'Sat 3 May',  time:'11:00 AM',venue:'Home',             result:'D 1-1'  },
  { sport:'Girls Soccer', opponent:'Manly Selective',  date:'Sat 26 Apr', time:'9:00 AM', venue:'Away',             result:'W 2-0'  },
];

// ─── School fun facts ─────────────────────────────────────────
export const funFacts = [
  { icon:'🏫', label:'Founded',              value:'1924',   sub:'102 years of excellence'    },
  { icon:'🎓', label:'University Acceptance', value:'97%',    sub:'Class of 2025'              },
  { icon:'🏆', label:'Sports Premierships',   value:'23',     sub:'All-time record'            },
  { icon:'📚', label:'Library Collection',    value:'48,500', sub:'Physical & digital titles'  },
  { icon:'🌍', label:'Exchange Students',      value:'12',     sub:'From 8 countries this year' },
  { icon:'👩‍🏫', label:'Teaching Staff',        value:'47',     sub:'Full & part-time combined'  },
];

// ─── Weekly class trend (last 8 weeks, for teacher view) ──────
export const classWeeklyTrend = [
  { week:'Wk 1', rate:96 }, { week:'Wk 2', rate:94 },
  { week:'Wk 3', rate:95 }, { week:'Wk 4', rate:92 },
  { week:'Wk 5', rate:90 }, { week:'Wk 6', rate:93 },
  { week:'Wk 7', rate:91 }, { week:'Wk 8', rate:92 },
];
