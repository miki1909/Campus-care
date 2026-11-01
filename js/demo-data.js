/**
 * CampusSetu / CampusCare - Demo Data Store
 * All records here are strictly DEMO / SAMPLE DATA for hackathon demonstration.
 * Standard Statuses: "Submitted", "In Progress", "Resolved", "Flagged for Review"
 */

const INITIAL_DEMO_ISSUES = [
  {
    id: "CS-101",
    title: "Wi-Fi router in Block C 2nd Floor dropping connections constantly",
    description: "Students in rooms 201 to 215 lose network connection every 5 minutes during lectures. Both Eduroam and Campus_Student SSIDs fail DNS lookups.",
    category: "IT & Wi-Fi",
    location: "Academic Block C, 2nd Floor Corridor",
    urgency: "high",
    status: "In Progress",
    statusNote: "Local demo prototype: Diagnostics simulated. No claim made that issue is sent to college management.",
    createdAt: "2026-10-29T10:15:00Z",
    displayDate: "Yesterday at 10:15 AM",
    upvotes: 46,
    userUpvoted: false,
    isDuplicate: false,
    duplicateOf: null,
    duplicateReason: null,
    hasPrivacyFlag: false,
    flaggedForHumanReview: false,
    reviewReason: null,
    author: "Anonymous Student (CS Dept)",
    timeline: [
      { step: "Submitted", time: "Oct 29, 10:15 AM", text: "Report submitted via student portal. (DEMO DATA)" },
      { step: "Community Verified", time: "Oct 29, 11:30 AM", text: "25+ students upvoted and confirmed identical outage in Block C." },
      { step: "In Progress", time: "Oct 29, 02:00 PM", text: "Status changed to In Progress for demonstration simulation." }
    ]
  },
  {
    id: "CS-102",
    title: "Internet not working on 2nd floor Block C near Room 204",
    description: "No Wi-Fi access since morning in front of room 204. Can someone reset the access point?",
    category: "IT & Wi-Fi",
    location: "Academic Block C, 2nd Floor Corridor",
    urgency: "medium",
    status: "Submitted",
    statusNote: "Identified by Duplicate Guard: Same area (Block C 2nd Floor) and category (IT & Wi-Fi). Linked with #CS-101.",
    createdAt: "2026-10-29T11:45:00Z",
    displayDate: "Yesterday at 11:45 AM",
    upvotes: 9,
    userUpvoted: false,
    isDuplicate: true,
    duplicateOf: "CS-101",
    duplicateReason: "Same area (Block C, 2nd Floor) and same category (IT & Wi-Fi) with matching network outage symptoms.",
    hasPrivacyFlag: false,
    flaggedForHumanReview: false,
    reviewReason: null,
    author: "Student #842 (Civil Eng.)",
    timeline: [
      { step: "Submitted", time: "Oct 29, 11:45 AM", text: "Report submitted into local triage queue." },
      { step: "Duplicate Detected", time: "Oct 29, 11:46 AM", text: "Heuristic detected matching area and category to #CS-101." }
    ]
  },
  {
    id: "CS-103",
    title: "Water cooler on Ground Floor Engineering Wing leaking water",
    description: "Cold water dispenser pipe is cracked at the bottom valve. Water has flooded the main walkway creating a slip hazard for passing students.",
    category: "Sanitation & Water",
    location: "Engineering Wing, Ground Floor near Lab 2",
    urgency: "high",
    status: "Submitted",
    statusNote: "Submitted and verified by 30+ peer upvotes. Local prototype queue only.",
    createdAt: "2026-10-30T07:20:00Z",
    displayDate: "Today at 07:20 AM",
    upvotes: 34,
    userUpvoted: false,
    isDuplicate: false,
    duplicateOf: null,
    duplicateReason: null,
    hasPrivacyFlag: false,
    flaggedForHumanReview: false,
    reviewReason: null,
    author: "Anonymous Student",
    timeline: [
      { step: "Submitted", time: "Today, 07:20 AM", text: "Report logged with high urgency due to wet floor hazard." },
      { step: "Community Verified", time: "Today, 08:00 AM", text: "Quickly reached threshold upvotes from morning lab batches." }
    ]
  },
  {
    id: "CS-104",
    title: "Flickering streetlights on dark pathway to Girls Hostel Gate",
    description: "Two solar street poles between sports pavilion and Girls Hostel 3 gate are completely unlit after 7:30 PM. Road is pitch black.",
    category: "Campus Safety",
    location: "North Campus, Pathway to Girls Hostel Gate",
    urgency: "high",
    status: "Submitted",
    statusNote: "Submitted under Campus Safety triage queue. Awaiting maintenance inspection.",
    createdAt: "2026-10-29T20:10:00Z",
    displayDate: "Yesterday at 08:10 PM",
    upvotes: 78,
    userUpvoted: false,
    isDuplicate: false,
    duplicateOf: null,
    duplicateReason: null,
    hasPrivacyFlag: false,
    flaggedForHumanReview: false,
    reviewReason: null,
    author: "Girls Hostel Council Rep (Demo)",
    timeline: [
      { step: "Submitted", time: "Oct 29, 08:10 PM", text: "Submitted under Campus Safety queue." }
    ]
  },
  {
    id: "CS-105",
    title: "Projector lamp burnt out in Seminar Hall 3",
    description: "The ceiling mounted Epson projector turns on with red indicator lamp and shuts down automatically after 30 seconds. Final year presentation scheduled here.",
    category: "Academic & Labs",
    location: "Main Academic Building, Seminar Hall 3",
    urgency: "medium",
    status: "Resolved",
    statusNote: "Sample record demonstrating resolved workflow. Verified by demo testing team only; not an official institute signoff.",
    createdAt: "2026-10-28T14:00:00Z",
    displayDate: "2 days ago",
    upvotes: 18,
    userUpvoted: false,
    isDuplicate: false,
    duplicateOf: null,
    duplicateReason: null,
    hasPrivacyFlag: false,
    flaggedForHumanReview: false,
    reviewReason: null,
    author: "ECE Student Committee",
    timeline: [
      { step: "Submitted", time: "Oct 28, 02:00 PM", text: "Logged before seminar session." },
      { step: "In Progress", time: "Oct 28, 04:15 PM", text: "Spare projector bulb replacement tested in demo simulation." },
      { step: "Resolved", time: "Oct 29, 09:00 AM", text: "Resolution confirmed by student organizer. (DEMO DATA)" }
    ]
  },
  {
    id: "CS-106",
    title: "Lost scientific calculator in Physics Lab 1 - contact at [PHONE REDACTED]",
    description: "I forgot my Casio fx-991CW on table 4 during practicals. Please call or WhatsApp me at [PHONE REDACTED: 9876543210] or roll [ROLL NUMBER REDACTED: 23CS041] if found.",
    category: "Academic & Labs",
    location: "Science Block, Physics Lab 1",
    urgency: "low",
    status: "Flagged for Review",
    statusNote: "Flagged for human review: Scanner detected unmasked personal phone and roll number. Auto-sanitized to protect student privacy.",
    createdAt: "2026-10-29T16:30:00Z",
    displayDate: "Yesterday at 04:30 PM",
    upvotes: 5,
    userUpvoted: false,
    isDuplicate: false,
    duplicateOf: null,
    duplicateReason: null,
    hasPrivacyFlag: true,
    flaggedForHumanReview: true,
    reviewReason: "Contains raw personal phone number and roll ID. Flagged for human review under privacy & safety policy.",
    author: "Physics Student (Redacted)",
    timeline: [
      { step: "Submitted", time: "Oct 29, 04:30 PM", text: "Report submitted." },
      { step: "Auto-Sanitized", time: "Oct 29, 04:30 PM", text: "Privacy scanner identified unmasked phone number and redacted details." },
      { step: "Flagged for Review", time: "Oct 29, 04:30 PM", text: "Held for moderator verification to prevent privacy leakage." }
    ]
  },
  {
    id: "CS-107",
    title: "Mess dinner food counter queue causing 40-minute backlog",
    description: "Only one roti counter open during peak hours 8:00 PM - 9:00 PM for over 600 students. Line extends out to the courtyard entrance.",
    category: "Hostel & Mess",
    location: "Central Dining Hall, Counter 2",
    urgency: "medium",
    status: "In Progress",
    statusNote: "Community trend recognized. Simulating mess committee schedule discussion.",
    createdAt: "2026-10-29T20:45:00Z",
    displayDate: "Yesterday at 08:45 PM",
    upvotes: 62,
    userUpvoted: false,
    isDuplicate: false,
    duplicateOf: null,
    duplicateReason: null,
    hasPrivacyFlag: false,
    flaggedForHumanReview: false,
    reviewReason: null,
    author: "Hostel 4 Resident",
    timeline: [
      { step: "Submitted", time: "Oct 29, 08:45 PM", text: "High community engagement registered." },
      { step: "In Progress", time: "Oct 29, 09:15 PM", text: "Simulated triage update." }
    ]
  },
  {
    id: "CS-108",
    title: "Broken window latch in Boys Hostel 1 Room 312 causing rain seepage",
    description: "The metal latch on the left window casement is rusted and will not lock shut. Rain water enters room during windy showers.",
    category: "Hostel & Mess",
    location: "Boys Hostel 1, 3rd Floor Room 312",
    urgency: "medium",
    status: "Submitted",
    statusNote: "Recently logged report. Peer verification pending.",
    createdAt: "2026-10-30T08:00:00Z",
    displayDate: "Today at 08:00 AM",
    upvotes: 7,
    userUpvoted: false,
    isDuplicate: false,
    duplicateOf: null,
    duplicateReason: null,
    hasPrivacyFlag: false,
    flaggedForHumanReview: false,
    reviewReason: null,
    author: "Hostel 1 Student",
    timeline: [
      { step: "Submitted", time: "Today, 08:00 AM", text: "Logged for hostel caretaker queue. (DEMO DATA)" }
    ]
  }
];

const CATEGORIES_LIST = [
  { id: "IT & Wi-Fi", label: "IT & Wi-Fi", icon: "📶", color: "#0284C7" },
  { id: "Sanitation & Water", label: "Sanitation & Water", icon: "🚰", color: "#0D9488" },
  { id: "Campus Safety", label: "Campus Safety", icon: "🛡️", color: "#DC2626" },
  { id: "Hostel & Mess", label: "Hostel & Mess", icon: "🏢", color: "#D97706" },
  { id: "Academic & Labs", label: "Academic & Labs", icon: "🔬", color: "#7C3AED" },
  { id: "Transport & Parking", label: "Transport & Parking", icon: "🚌", color: "#059669" }
];

const CAMPUS_LOCATIONS = [
  "Academic Block A - Ground Floor",
  "Academic Block A - 1st Floor",
  "Academic Block B - Central Atrium",
  "Academic Block C, 2nd Floor Corridor",
  "Engineering Wing, Ground Floor near Lab 2",
  "Science Block, Physics Lab 1",
  "Main Academic Building, Seminar Hall 3",
  "Central Library - 1st Floor Reading Room",
  "Central Dining Hall, Counter 2",
  "North Campus, Pathway to Girls Hostel Gate",
  "Boys Hostel 1, 3rd Floor Room 312",
  "Boys Hostel 2 - Common Lounge",
  "Girls Hostel 1 - Courtyard",
  "Sports Ground / Gymnasium",
  "Campus Main Gate & Parking Lot"
];
