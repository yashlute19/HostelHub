/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Bell, 
  Calendar, 
  FileText, 
  User, 
  LogOut, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Menu,
  X,
  MapPin,
  CalendarDays,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Priority = 'High' | 'Medium' | 'Low';

interface Task {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'info' | 'warning' | 'urgent';
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
}

interface LeaveRequest {
  id: string;
  reason: string;
  departureDate: string;
  returnDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

// --- Mock Data ---

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Submit Physics Lab Report', priority: 'High', completed: false },
  { id: '2', title: 'Clean Room 302', priority: 'Medium', completed: true },
  { id: '3', title: 'Pay Mess Bill', priority: 'High', completed: false },
  { id: '4', title: 'Laundry Pickup', priority: 'Low', completed: false },
];

const NOTICES: Notice[] = [
  { id: '1', title: 'Water Maintenance', content: 'Water supply will be suspended today from 4 PM to 6 PM for tank cleaning.', date: 'Today', type: 'warning' },
  { id: '2', title: 'Mess Menu Change', content: 'Special dinner served tonight on the occasion of the cultural fest.', date: 'Today', type: 'info' },
  { id: '3', title: 'Hostel Night Registration', content: 'Final call for registrations for the annual hostel night.', date: 'Yesterday', type: 'urgent' },
];

const EVENTS: Event[] = [
  { id: '1', title: 'Inter-Hostel Cricket', date: '2026-02-25', location: 'Main Ground' },
  { id: '2', title: 'Tech Talk: AI in 2026', date: '2026-02-28', location: 'Seminar Hall' },
  { id: '3', title: 'Movie Night', date: '2026-03-02', location: 'Common Room' },
  { id: '4', title: 'Hostel Cleaning Drive', date: '2026-02-22', location: 'All Blocks' },
  { id: '5', title: 'Cultural Fest Meeting', date: '2026-02-15', location: 'Auditorium' },
];

const INITIAL_LEAVE: LeaveRequest[] = [
  { id: '1', reason: 'Family Wedding', departureDate: '2026-03-10', returnDate: '2026-03-15', status: 'Approved', appliedDate: '2026-02-18' },
  { id: '2', reason: 'Weekend Outing', departureDate: '2026-02-22', returnDate: '2026-02-23', status: 'Pending', appliedDate: '2026-02-20' },
];

// --- Components ---

const Card = ({ children, className = "", title, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any, key?: string | number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
  >
    {title && (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
          <h3 className="font-semibold text-slate-800 tracking-tight">{title}</h3>
        </div>
      </div>
    )}
    {children}
  </motion.div>
);

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = {
    High: 'bg-rose-100 text-rose-600 border-rose-200',
    Medium: 'bg-amber-100 text-amber-600 border-amber-200',
    Low: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }: { status: LeaveRequest['status'] }) => {
  const colors = {
    Approved: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    Rejected: 'bg-rose-100 text-rose-700',
  };
  const icons = {
    Approved: CheckCircle2,
    Pending: Clock,
    Rejected: XCircle,
  };
  const Icon = icons[status];

  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${colors[status]}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

const CalendarComponent = ({ events }: { events: Event[] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // Feb 2026
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 21));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const eventsOnSelectedDate = events.filter(event => 
    isSameDay(new Date(event.date), selectedDate)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="text-xl font-bold text-slate-800">{format(currentMonth, 'MMMM yyyy')}</h3>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 bg-slate-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <div 
                key={day.toString()} 
                onClick={() => setSelectedDate(day)}
                className={`min-h-[100px] p-2 border-b border-r border-slate-100 cursor-pointer transition-all hover:bg-indigo-50/30 group ${
                  !isCurrentMonth ? 'bg-slate-50/30 text-slate-300' : 'text-slate-700'
                } ${isSelected ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-500/20' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                    isTodayDate ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 
                    isSelected ? 'text-indigo-600' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div key={event.id} className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md truncate font-medium border border-indigo-200">
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-slate-400 pl-1 font-medium">
                      + {dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="space-y-6">
        <Card title={`Events for ${format(selectedDate, 'MMM dd, yyyy')}`} icon={CalendarDays}>
          <div className="space-y-4">
            {eventsOnSelectedDate.length > 0 ? (
              eventsOnSelectedDate.map(event => (
                <div key={event.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      10:00 AM
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Join us for this exciting event in the {event.location}. All residents are welcome!</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 font-medium">No events scheduled for this day.</p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Monthly Highlights" icon={AlertCircle}>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Cultural Fest</p>
                <p className="text-xs text-slate-500">The biggest event of the semester starts next week!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Guest Lecture</p>
                <p className="text-xs text-slate-500">Industry experts visiting on Feb 28.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    reason: '',
    departureDate: '',
    returnDate: ''
  });

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      priority: 'Medium',
      completed: false
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.reason || !leaveForm.departureDate || !leaveForm.returnDate) return;
    
    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      ...leaveForm,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    
    setLeaveRequests([newRequest, ...leaveRequests]);
    setLeaveForm({ reason: '', departureDate: '', returnDate: '' });
    alert('Leave application submitted successfully!');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Task Manager', icon: CheckSquare },
    { id: 'notices', label: 'Notice Board', icon: Bell },
    { id: 'events', label: 'Events Calendar', icon: Calendar },
    { id: 'leave', label: 'Leave Module', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* --- Mobile Header --- */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">HostelHub</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* --- Sidebar --- */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-[60] lg:z-40 p-6 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'block' : 'hidden lg:flex'}`}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight">HostelHub</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                    activeTab === item.id 
                      ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  JS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">John Smith</p>
                  <p className="text-xs text-slate-500 truncate">Room 302 • B.Tech</p>
                </div>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors font-medium">
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* --- Overlay for Mobile Sidebar --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- Main Content --- */}
      <main className="lg:ml-72 p-4 lg:p-10 max-w-7xl mx-auto">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' ? 'Welcome back, John!' : navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="text-slate-500 mt-1">
              {activeTab === 'dashboard' ? "Here's what's happening in your hostel today." : `Manage your ${activeTab} and stay updated.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
              <Plus className="w-5 h-5" />
              Quick Action
            </button>
          </div>
        </div>

        {/* --- Dashboard View --- */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Tasks & Notices */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Task Summary */}
              <Card title="Today's Tasks" icon={CheckSquare}>
                <div className="space-y-3">
                  {tasks.slice(0, 3).map(task => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors group cursor-pointer"
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                          {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {task.title}
                        </span>
                      </div>
                      <PriorityBadge priority={task.priority} />
                    </div>
                  ))}
                  <button 
                    onClick={() => setActiveTab('tasks')}
                    className="w-full py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors"
                  >
                    View All Tasks
                  </button>
                </div>
              </Card>

              {/* Notice Board */}
              <Card title="Recent Notices" icon={Bell}>
                <div className="space-y-4">
                  {NOTICES.map(notice => (
                    <div key={notice.id} className="flex gap-4 group">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        notice.type === 'urgent' ? 'bg-rose-500 animate-pulse' : 
                        notice.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{notice.title}</h4>
                          <span className="text-xs text-slate-400">{notice.date}</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">{notice.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column: Events & Profile */}
            <div className="space-y-6">
              
              {/* Upcoming Events */}
              <Card title="Upcoming Events" icon={Calendar}>
                <div className="space-y-4">
                  {EVENTS.filter(e => new Date(e.date) >= new Date()).slice(0, 3).map(event => (
                    <div key={event.id} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                          {format(new Date(event.date), 'MMM dd')}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800">{event.title}</h4>
                    </div>
                  ))}
                  <button 
                    onClick={() => setActiveTab('events')}
                    className="w-full py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors"
                  >
                    View Full Calendar
                  </button>
                </div>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance</p>
                  <p className="text-2xl font-bold text-slate-900">92%</p>
                </div>
                <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mess Dues</p>
                  <p className="text-2xl font-bold text-slate-900">$0</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Task Manager View --- */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <Card>
              <form onSubmit={addTask} className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Add a new task..." 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                  Add Task
                </button>
              </form>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Pending Tasks" icon={Clock}>
                <div className="space-y-3">
                  {tasks.filter(t => !t.completed).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleTask(task.id)} className="w-6 h-6 rounded-lg border-2 border-slate-300 hover:border-indigo-500 transition-colors" />
                        <span className="font-medium text-slate-700">{task.title}</span>
                      </div>
                      <PriorityBadge priority={task.priority} />
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Completed" icon={CheckCircle2}>
                <div className="space-y-3 opacity-60">
                  {tasks.filter(t => t.completed).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleTask(task.id)} className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </button>
                        <span className="font-medium text-slate-400 line-through">{task.title}</span>
                      </div>
                      <PriorityBadge priority={task.priority} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* --- Notice Board View --- */}
        {activeTab === 'notices' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {NOTICES.map(notice => (
              <Card key={notice.id} className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                    notice.type === 'urgent' ? 'bg-rose-100 text-rose-600 border-rose-200' : 
                    notice.type === 'warning' ? 'bg-amber-100 text-amber-600 border-amber-200' : 
                    'bg-indigo-100 text-indigo-600 border-indigo-200'
                  }`}>
                    {notice.type}
                  </span>
                  <span className="text-xs text-slate-400">{notice.date}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{notice.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">{notice.content}</p>
                <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Read Full Notice
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        )}

        {/* --- Events Calendar View --- */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <CalendarComponent events={EVENTS} />
          </div>
        )}

        {/* --- Leave Module View --- */}
        {activeTab === 'leave' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Leave Form */}
            <div className="lg:col-span-1">
              <Card title="Apply for Leave" icon={FileText}>
                <form onSubmit={handleLeaveSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Reason for Leave</label>
                    <textarea 
                      required
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                      placeholder="e.g., Visiting home for weekend"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Departure Date</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="date" 
                          required
                          value={leaveForm.departureDate}
                          onChange={(e) => setLeaveForm({...leaveForm, departureDate: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Return Date</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="date" 
                          required
                          value={leaveForm.returnDate}
                          onChange={(e) => setLeaveForm({...leaveForm, returnDate: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Applications must be submitted at least 24 hours before departure. Late submissions may be rejected.
                    </p>
                  </div>
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98]">
                    Submit Application
                  </button>
                </form>
              </Card>
            </div>

            {/* Status Tracker */}
            <div className="lg:col-span-2">
              <Card title="Application History" icon={Clock}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-slate-100">
                        <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Reason</th>
                        <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Dates</th>
                        <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Applied</th>
                        <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {leaveRequests.map(req => (
                        <tr key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pr-4">
                            <p className="font-semibold text-slate-800 text-sm">{req.reason}</p>
                          </td>
                          <td className="py-4 pr-4">
                            <p className="text-xs text-slate-500 font-medium">
                              {new Date(req.departureDate).toLocaleDateString()} - {new Date(req.returnDate).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="py-4 pr-4">
                            <p className="text-xs text-slate-400">{req.appliedDate}</p>
                          </td>
                          <td className="py-4">
                            <StatusBadge status={req.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
