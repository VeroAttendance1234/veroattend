/**
 * Initial seed data for stateful features (messages, absence requests, etc.)
 * Lifted to App.jsx so the same store is visible across all role views.
 */

/* ── Absence requests ────────────────────────────── */
export const initialAbsenceRequests = [
  {
    id: 'AR-1041',
    student:    'Aisha Patel',
    studentId:  'S001',
    year:       11,
    class:      '11A',
    parent:     'J. Patel',
    type:       'sick',
    fromDate:   '2026-05-21',
    toDate:     '2026-05-21',
    reason:     'Strep throat — GP appointment in the morning. Will return tomorrow.',
    submitted:  '2026-05-19 08:14',
    status:     'pending',
    medical:    true,
  },
  {
    id: 'AR-1040',
    student:    'Liam Chen',
    studentId:  'S002',
    year:       11,
    class:      '11B',
    parent:     'Wei Chen',
    type:       'family',
    fromDate:   '2026-05-22',
    toDate:     '2026-05-22',
    reason:     'Grandfather\'s funeral. We will be travelling to Melbourne.',
    submitted:  '2026-05-18 19:32',
    status:     'approved',
    medical:    false,
  },
  {
    id: 'AR-1039',
    student:    'Sofia Nguyen',
    studentId:  'S003',
    year:       12,
    class:      '12A',
    parent:     'Linh Nguyen',
    type:       'appointment',
    fromDate:   '2026-05-20',
    toDate:     '2026-05-20',
    reason:     'Specialist orthodontist appointment, will return after lunch.',
    submitted:  '2026-05-17 14:02',
    status:     'approved',
    medical:    true,
  },
  {
    id: 'AR-1038',
    student:    'Marcus Williams',
    studentId:  'S004',
    year:       12,
    class:      '12A',
    parent:     'D. Williams',
    type:       'sport',
    fromDate:   '2026-05-23',
    toDate:     '2026-05-23',
    reason:     'Representative rugby fixture — Sydney Schools selection.',
    submitted:  '2026-05-17 09:45',
    status:     'approved',
    medical:    false,
  },
];

/* ── Messages / threads ────────────────────────────
   Each thread has participants and a list of messages.
   Roles can be 'parent', 'teacher', 'student', 'admin'.
*/
export const initialThreads = [
  {
    id: 'T-001',
    title: 'Aisha — Maths progress',
    participants: [
      { role: 'parent',  name: 'J. Patel' },
      { role: 'teacher', name: 'Mr David Chen' },
    ],
    unread: 1,
    messages: [
      { id: 'M-1', from: 'parent',  text: 'Hi Mr Chen — just wanted to thank you for the extra help with Aisha\'s trig assignment last week.', time: 'Mon 9:14am' },
      { id: 'M-2', from: 'teacher', text: 'You\'re very welcome — she did a great job once she got the unit-circle approach. Her test mark reflected the effort.', time: 'Mon 11:02am' },
      { id: 'M-3', from: 'parent',  text: 'That\'s wonderful. She mentioned the Yr 11 maths competition is coming up — any prep you\'d recommend?', time: 'Tue 7:48am' },
      { id: 'M-4', from: 'teacher', text: 'I\'ll send the past papers home with her today. The 2024 Year 11 paper is the closest to this year\'s style.', time: 'Tue 8:30am' },
    ],
  },
  {
    id: 'T-002',
    title: 'Aisha — Today',
    participants: [
      { role: 'parent',  name: 'J. Patel' },
      { role: 'student', name: 'Aisha Patel' },
    ],
    unread: 0,
    messages: [
      { id: 'M-1', from: 'student', text: 'Mum, do you have soccer training picking up tonight or is it Dad?', time: 'Today 12:14pm' },
      { id: 'M-2', from: 'parent',  text: 'Dad will pick you up — 6pm sharp. Don\'t forget your boots.', time: 'Today 12:22pm' },
      { id: 'M-3', from: 'student', text: 'Got it 👍', time: 'Today 12:23pm' },
    ],
  },
  {
    id: 'T-003',
    title: 'Year 11 parent–teacher night',
    participants: [
      { role: 'admin',   name: 'Admin Office' },
      { role: 'parent',  name: 'J. Patel' },
    ],
    unread: 0,
    messages: [
      { id: 'M-1', from: 'admin',  text: 'Hi Mr/Mrs Patel — the Year 11 parent–teacher night is on Thursday 22 May. Booking link inside the portal.', time: '14 May' },
      { id: 'M-2', from: 'parent', text: 'Thanks, just booked a slot with Mr Chen for 6:40pm.', time: '14 May' },
    ],
  },
];

/* ── Extra notifications (more variety) ───────────── */
export const extraNotifications = [
  { id: 'N-001', type: 'absence', icon: '📝', title: 'Absence request submitted',  text: 'J. Patel requested an absence for Aisha (sick — strep throat)', time: '2 min ago' },
  { id: 'N-002', type: 'message', icon: '💬', title: 'New message from parent',    text: 'Wei Chen replied to Liam\'s Maths thread',                       time: '14 min ago' },
  { id: 'N-003', type: 'alert',   icon: '⚠️', title: 'Late arrival flagged',       text: 'James Park scanned in 12 minutes after Period 1 started',         time: '38 min ago' },
  { id: 'N-004', type: 'system',  icon: '🟢', title: 'ACR122U reconnected',        text: 'Hardware bridge restored after brief drop',                       time: '1 hr ago'   },
  { id: 'N-005', type: 'milestone', icon: '🎉', title: '95% milestone reached',    text: 'Class 7A hit 95% weekly average — top in school',                 time: '2 hrs ago'  },
  { id: 'N-006', type: 'wellbeing', icon: '💚', title: 'Wellbeing check-in submitted', text: 'Aisha logged her mood: Great',                                time: '3 hrs ago'  },
  { id: 'N-007', type: 'event',   icon: '📅', title: 'Parent–teacher night',      text: 'Reminders sent to 1,050 families for Thursday',                   time: 'Yesterday'  },
  { id: 'N-008', type: 'alert',   icon: '⚠️', title: 'Low attendance alert',       text: 'Year 12 below 88% — second day running',                          time: 'Yesterday'  },
  { id: 'N-009', type: 'absence', icon: '✅', title: 'Absence approved',           text: 'Linh Nguyen\'s request for Sofia approved by admin',              time: 'Yesterday'  },
];
