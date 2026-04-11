// server/models
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

/**
 * ENUMS & helpers
 */
const USER_ROLES = ['student','faculty','supervisor','administrator','ST','RA'];
const PROJECT_STATUS = ['uploaded','under_review','graded','proposal','in-progress','completed'];
const PROJECT_STAGE = ['proposal','midterm','final'];
const RESERVATION_STATUS = ['confirmed','pending','cancelled','rejected'];
const MESSAGE_VISIBILITY = ['members','faculty','admins'];

/**
 * User
 * - supports multiple roles
 * - profile, availability, google sync tokens (optional)
 */
const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  universityId: { type: String, required: true, index: true }, // student/faculty ID
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },

  roles: [{ type: String, enum: USER_ROLES, required: true }], // e.g. ['student'] or ['ST','RA']

  profile: {
    department: String,
    program: String,
    bio: String,
    phone: String,
    avatarUrl: String,
    office: String // optional room/office number
  },

  // For supervisors: capacity & preferences
  supervisorProfile: {
    isSupervisor: { type: Boolean, default: false },
    maxStudents: { type: Number, default: 3 },
    preferredTimes: [{
      dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Sun
      from: String, // e.g. "09:00"
      to: String
    }]
  },

  // Availability status can be updated by faculty/supervisor
  availability: {
    status: { type: String, enum: ['available','busy','away'], default: 'available' },
    windows: [{
      start: Date,
      end: Date
    }]
  },

  // For Google Calendar sync / OAuth (optional)
  google: {
    calendarSyncEnabled: { type: Boolean, default: false },
    refreshToken: String, // encrypt in production
    accessToken: String,
    tokenExpiry: Date
  },

  // metadata
  lastLogin: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

UserSchema.index({ name: 'text', email: 'text', 'profile.department': 'text' });

/**
 * Project
 * - supports team, supervisor(s), stages, status, tags, search-friendly fields
 * - text index for search
 */
const ProjectSchema = new Schema({
  title: { type: String, required: true, index: true },
  description: String,
  tags: [String], // e.g. ['react','ml']
  stack: [String],
  department: String,
  courseCode: String,

  // team: array of student refs
  team: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  // supervisors/co-supervisors
  supervisors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  coSupervisors: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  // lifecycle
  status: { type: String, enum: PROJECT_STATUS, default: 'proposal' },
  stage: { type: String, enum: PROJECT_STAGE, default: 'proposal' },

  // file uploads / submission history
  submissions: [{
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: Date,
    fileUrl: String,
    notes: String,
    stage: { type: String, enum: PROJECT_STAGE }
  }],

  // aggregated evaluation info (kept denormalized for quick queries)
  evaluationSummary: {
    averageScore: { type: Number, default: 0 },
    totalAssessments: { type: Number, default: 0 },
    lastEvaluatedAt: Date
  },

  // audit & activity log reference (kept in AuditLog collection)
  meta: {
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastUpdatedAt: Date
  },

  // soft-delete or archival
  archived: { type: Boolean, default: false }
}, { timestamps: true });

// Text index for search across title, description, tags, stack
ProjectSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  stack: 'text'
}, { weights: { title: 5, tags: 3, description: 1 } });

/**
 * Reservation (Room/Lab/Desk/Meeting room booking)
 * - Prevent double booking with a compound unique index on resource + time window
 * - Use application-level check + index for safety
 */
const ReservationSchema = new Schema({
  resourceType: { type: String, required: true }, // 'desk','room','lab'
  resourceId: { type: String, required: true }, // e.g. 'lab-A-1' or DB ref if you have resource collection
  reservedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  forProject: { type: Schema.Types.ObjectId, ref: 'Project' }, // optional
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  status: { type: String, enum: RESERVATION_STATUS, default: 'pending' },
  attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdVia: { type: String, enum: ['web','mobile','api','import'], default: 'web' },

  // google event id if synced
  googleEventId: String
}, { timestamps: true });

// To help prevent exact duplicate reservations for same resource & overlapping times,
// create indexes for queries. Note: Mongo can't enforce no-overlap; you'll enforce overlap checks before save.
// Index by resource and startAt to make overlapping queries efficient.
ReservationSchema.index({ resourceId: 1, startAt: 1, endAt: 1 });
ReservationSchema.index({ reservedBy: 1 });

/**
 * SupervisorAssignment
 * - Admins assign supervisors to projects; changes are logged in AuditLog as well
 */
const SupervisorAssignmentSchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  supervisor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['supervisor','co-supervisor','external'], default: 'supervisor' },
  notes: String
}, { timestamps: true });

SupervisorAssignmentSchema.index({ project: 1, supervisor: 1 }, { unique: true });

/**
 * Application (for ST / RA / TA)
 */
const ApplicationSchema = new Schema({
  student: { type: String, required: true }, // Demo: using string IDs instead of ObjectId refs
  positionId: { type: String, required: true },
  positionType: { type: String, enum: ['ST', 'RA', 'TA'], required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'PENDING', 'ACCEPTED', 'REJECTED'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
  reviewedBy: { type: String }, // Demo: using string IDs instead of ObjectId refs
  reviewedAt: { type: Date },
  // Additional fields for detailed application
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  studentId: { type: String, required: true },
  gpa: { type: String, required: true },
  expertise: { type: [String], required: true },
  availability: { type: String, required: true },
  experience: { type: String, required: true },
  coverLetter: { type: String, required: true }
}, { timestamps: true });

/**
 * ConsultationRequest & Session
 * - students request, faculty accepts/declines
 * - link STs as assistants
 */
const ConsultationRequestSchema = new Schema({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // typically student
  faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project' },
  preferredStart: Date,
  preferredEnd: Date,
  confirmedStart: Date,
  confirmedEnd: Date,
  status: { type: String, enum: ['requested','accepted','declined','completed','cancelled'], default: 'requested' },
  assignedSTs: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  notes: String,
  feedbackForST: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    submittedAt: Date
  },
  googleEventId: String
}, { timestamps: true });

ConsultationRequestSchema.index({ faculty: 1, status: 1 });
ConsultationRequestSchema.index({ requester: 1, status: 1 });

/**
 * Evaluation / Assessment
 * - multiple assessors, scores, comments
 */
const EvaluationSchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  assessor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['supervisor','co-supervisor','ST','RA','TA','external'], required: true },
  scores: Schema.Types.Mixed, // { design: 8, implementation: 9, report: 7 }
  overallScore: { type: Number, min: 0 },
  comments: String,
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

EvaluationSchema.index({ project: 1, assessor: 1 }, { unique: true });

/**
 * AuditLog
 * - generic audit/activity log for important actions
 */
const AuditLogSchema = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: 'User' }, // who performed
  action: { type: String, required: true }, // e.g. 'assign_supervisor','submit_project'
  targetModel: String,
  targetId: Schema.Types.ObjectId,
  meta: Schema.Types.Mixed, // extra context
  ip: String,
  userAgent: String
}, { timestamps: true });

AuditLogSchema.index({ actor: 1, action: 1 });
AuditLogSchema.index({ targetModel: 1, targetId: 1 });

/**
 * GroupPost (Group finder)
 */
const GroupPostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  goal: String,
  neededSkills: [String],
  stack: [String],
  preferredRole: { type: String, enum: ['leader','member','any'], default: 'any' },
  maxMembers: Number,
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isOpen: { type: Boolean, default: true }
}, { timestamps: true });

GroupPostSchema.index({ title: 'text', description: 'text', neededSkills: 'text', stack: 'text' });

/**
 * Messaging: Conversation + Message
 * - supports one-to-one and group
 * - access controlled by conversation.members
 */
const ConversationSchema = new Schema({
  type: { type: String, enum: ['one-to-one','group','project'], default: 'one-to-one' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }], // who can see messages
  project: { type: Schema.Types.ObjectId, ref: 'Project' }, // optional bind to project
  title: String,
  isMutedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

ConversationSchema.index({ members: 1 });

const MessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  body: String,
  attachments: [{ url: String, filename: String }],
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  visibility: { type: String, enum: MESSAGE_VISIBILITY, default: 'members' }
}, { timestamps: true });

/**
 * Notifications
 */
const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: String, // e.g. 'proposal_accepted','deadline_approaching'
  data: Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
  channel: { type: String, enum: ['in-app','email','push'], default: 'in-app' }
}, { timestamps: true });

/**
 * QR Location map (for QR mapping)
 */
const QRLocationSchema = new Schema({
  qrId: { type: String, required: true, unique: true }, // printed QR id
  label: String,
  floor: String,
  coordinates: { // optional precise mapping
    x: Number,
    y: Number
  },
  mappedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

/**
 * Lab / Resource Availability (optional resource collection)
 */
const ResourceSchema = new Schema({
  resourceId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['lab','desk','room','computer'], required: true },
  capacity: Number,
  location: String,
  tags: [String],
  schedule: [{
    start: Date,
    end: Date,
    isAvailable: Boolean
  }]
}, { timestamps: true });

/**
 * Model exports
 */
const User = model('User', UserSchema);
const Project = model('Project', ProjectSchema);
const Reservation = model('Reservation', ReservationSchema);
const SupervisorAssignment = model('SupervisorAssignment', SupervisorAssignmentSchema);
const Application = model('Application', ApplicationSchema);
const ConsultationRequest = model('ConsultationRequest', ConsultationRequestSchema);
const Evaluation = model('Evaluation', EvaluationSchema);
const AuditLog = model('AuditLog', AuditLogSchema);
const GroupPost = model('GroupPost', GroupPostSchema);
const Conversation = model('Conversation', ConversationSchema);
const Message = model('Message', MessageSchema);
const Notification = model('Notification', NotificationSchema);
const QRLocation = model('QRLocation', QRLocationSchema);
const Resource = model('Resource', ResourceSchema);

export {
  User, Project, Reservation, SupervisorAssignment, Application,
  ConsultationRequest, Evaluation, AuditLog, GroupPost,
  Conversation, Message, Notification, QRLocation, Resource
};
