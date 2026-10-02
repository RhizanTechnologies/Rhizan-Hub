export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  title: string;
  weeklyCapacityHours: number;
  status: 'ACTIVE' | 'AWAY' | 'OFFLINE';
  avatar?: string;
  mustChangePassword?: boolean;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskComment {
  _id?: string;
  author: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo?: User;
  project?: {
    _id: string;
    name: string;
    clientName: string;
    status: string;
  };
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  comments: TaskComment[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceLink {
  _id?: string;
  id?: string;
  title: string;
  url: string;
  category?: 'CONTRACT' | 'DESIGN' | 'GITHUB' | 'DRIVE' | 'DOCS' | 'LIVE' | 'INVOICE' | 'OTHER' | string;
}

export interface ClientMeeting {
  _id?: string;
  id?: string;
  title: string;
  date: string;
  time?: string;
  linkOrLocation?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface ClientPayment {
  _id?: string;
  id?: string;
  invoiceNumber?: string;
  title: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  notes?: string;
}

export interface Project {
  _id: string;
  name: string;
  clientName: string;
  clientId?: string | Client;
  description: string;
  members: User[];
  status: 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  progress: number;
  startDate?: string;
  deadline?: string;
  budget?: number;
  totalTasks?: number;
  completedTasks?: number;
  notes?: string;
  links?: ResourceLink[];
  createdAt: string;
  updatedAt: string;
}

export type ClientStatus =
  | 'LEAD'
  | 'CONTACTED'
  | 'MEETING'
  | 'PROPOSAL'
  | 'ACTIVE'
  | 'COMPLETED';

export interface Client {
  _id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: ClientStatus;
  serviceInterested: string;
  assignedTo?: User;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  notes: string;
  dealValue?: number;
  paidAmount?: number;
  currency?: string;
  projects?: Project[];
  meetings?: ClientMeeting[];
  payments?: ClientPayment[];
  links?: ResourceLink[];
  createdAt: string;
  updatedAt: string;
}

export interface Niche {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ApproachStatus =
  | 'PROSPECT'
  | 'CONTACTED'
  | 'PITCHED'
  | 'IN_DISCUSSION'
  | 'DEAL_WON'
  | 'NOT_INTERESTED';

export type ContactChannel = 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'OTHER';

export interface ContactInteraction {
  _id?: string;
  date: string;
  channel: ContactChannel;
  notes: string;
  nextFollowUpDate?: string;
  loggedBy?: {
    _id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  createdAt?: string;
}

export interface Approach {
  _id: string;
  businessName: string;
  niche: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  location?: string;
  status: ApproachStatus;
  notes?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  contactHistory?: ContactInteraction[];
  convertedClientId?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  _id: string;
  user: User;
  project: {
    _id: string;
    name: string;
    clientName?: string;
  };
  task?: {
    _id: string;
    title: string;
  };
  description: string;
  date: string;
  hours: number;
  minutes: number;
  createdAt: string;
}

export interface Activity {
  _id: string;
  user: string;
  userName: string;
  action: string;
  entityType: 'TASK' | 'PROJECT' | 'CLIENT' | 'TIME';
  entityTitle: string;
  createdAt: string;
}

export interface DashboardSummary {
  stats: {
    totalTasks: number;
    tasksDueToday: number;
    overdueTasks: number;
    activeProjectsCount: number;
    activeClientsCount: number;
    teamMembersCount: number;
    hoursThisWeek: number;
  };
  activeProjects: Array<{
    id: string;
    name: string;
    clientName: string;
    progress: number;
    totalTasks: number;
    status: string;
    deadline?: string;
  }>;
  myTasks: Task[];
  recentActivities: Activity[];
  upcomingDeadlines: Task[];
}
