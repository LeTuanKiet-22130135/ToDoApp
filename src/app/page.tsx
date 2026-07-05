"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import Offcanvas from '@/components/Offcanvas';
import { useTasks } from '@/components/TaskProvider';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [isSortModalOpen, setSortModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const router = useRouter();
  const { tasks, isLoading, updateStatus, removeTask, isAuth, logoutUser } = useTasks();

  // Search & Tab Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Completed'>('All');

  // Modal Filters
  const [filterDate, setFilterDate] = useState('All Time');
  const [filterPriority, setFilterPriority] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  
  // Sort
  const [sortOption, setSortOption] = useState<'priority-desc' | 'priority-asc' | 'date-desc' | 'date-asc'>('priority-desc');

  const togglePriority = (p: string) => setFilterPriority(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleTag = (t: string) => setFilterTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleLogout = async () => {
    await logoutUser();
    setProfileDropdownOpen(false);
  };

  const allTags = Array.from(new Set((tasks || []).flatMap((t: any) => t.tags || [])));

  const filteredTasks = (tasks || [])
    .filter(task => {
      // Search
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      // Tab
      if (activeTab === 'Active' && task.status === 'completed') return false;
      if (activeTab === 'Completed' && task.status !== 'completed') return false;
      // Modal Filters
      if (filterPriority.length > 0 && !filterPriority.includes(task.priority || 'Med')) return false;
      if (filterTags.length > 0 && !filterTags.some(tag => (task.tags || []).includes(tag))) return false;
      
      if (filterDate !== 'All Time' && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        if (filterDate === 'Today') {
          if (dueDate.toDateString() !== now.toDateString()) return false;
        } else if (filterDate === 'This Month') {
          if (dueDate.getMonth() !== now.getMonth() || dueDate.getFullYear() !== now.getFullYear()) return false;
        } else if (filterDate === 'This Year') {
          if (dueDate.getFullYear() !== now.getFullYear()) return false;
        }
      } else if (filterDate !== 'All Time' && !task.dueDate) {
        // If they filter by a date but task has no due date, hide it
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const pOrder: Record<string, number> = { 'High': 3, 'Med': 2, 'Low': 1 };
      const pA = pOrder[a.priority || 'Med'] || 0;
      const pB = pOrder[b.priority || 'Med'] || 0;
      
      const dateA = new Date(a.createdAt || a.dueDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.dueDate || 0).getTime();
      
      if (sortOption === 'priority-desc') {
        if (pA !== pB) return pB - pA;
        return dateB - dateA;
      }
      if (sortOption === 'priority-asc') {
        if (pA !== pB) return pA - pB;
        return dateB - dateA;
      }
      if (sortOption === 'date-desc') {
        if (dateA !== dateB) return dateB - dateA;
        return pB - pA;
      }
      if (sortOption === 'date-asc') {
        if (dateA !== dateB) return dateA - dateB;
        return pB - pA;
      }
      return 0;
    });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-200 h-16 flex items-center justify-between px-8 flex-shrink-0 bg-white">
        <div>
          <Link href="/" className="text-2xl font-bold text-brand-900 text-decoration-none hover:text-brand-800 transition">TaskFlow</Link>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tasks..." className="bg-slate-100 rounded-lg pl-9 pr-8 py-2 text-sm w-64 border-0 focus:ring-2 focus:ring-brand-500 placeholder-slate-400 outline-none" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark"></i></button>}
          </div>
          <button className="text-slate-500 hover:text-slate-800 text-lg transition"><i className="fa-regular fa-bell"></i></button>
          {isAuth ? (
            <div className="relative">
              <button onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)} className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden cursor-pointer border border-slate-200 block hover:ring-2 hover:ring-brand-500 transition focus:outline-none">
                <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Avatar" className="w-full h-full object-cover" />
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 transition flex items-center gap-2">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" className="bg-brand-900 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-brand-800 transition hover:shadow-md hover:underline">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Content Scrollable */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Page Title & Filters */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-1">Today's Focus</h2>
              <p className="text-slate-500 text-sm">You have {filteredTasks.filter(t => t.status !== 'completed').length || 0} tasks to complete.</p>
            </div>
            <div className="flex gap-2 text-sm font-medium">
              <button onClick={() => setActiveTab('All')} className={`filter-btn px-5 py-1.5 border border-transparent rounded-full transition ${activeTab === 'All' ? 'active' : 'hover:bg-slate-100'}`}>All</button>
              <button onClick={() => setActiveTab('Active')} className={`filter-btn px-4 py-1.5 border border-transparent rounded-full transition ${activeTab === 'Active' ? 'active' : 'hover:bg-slate-100'}`}>Active</button>
              <button onClick={() => setActiveTab('Completed')} className={`filter-btn px-4 py-1.5 border border-transparent rounded-full transition ${activeTab === 'Completed' ? 'active' : 'hover:bg-slate-100'}`}>Completed</button>
            </div>
          </div>

          {/* Add Task Trigger */}
          <Link href="/add-task" className="bg-white rounded-xl border border-slate-200 p-2 mb-8 flex items-center shadow-sm cursor-pointer group hover:border-brand-500 transition text-decoration-none">
            <div className="text-slate-400 pl-3">
              <i className="fa-regular fa-square-plus text-lg"></i>
            </div>
            <div className="flex-1 bg-transparent border-0 px-3 py-2 text-slate-400">Add a new task...</div>
            <button className="bg-brand-900 hover:bg-brand-600 text-white w-10 h-10 rounded-lg flex items-center justify-center transition pointer-events-none">
              <i className="fa-solid fa-plus"></i>
            </button>
          </Link>

          {/* Sort & Filter Bar */}
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setFilterModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition">
              <i className="fa-solid fa-filter text-slate-400"></i> Filter Tasks
            </button>
            <button onClick={() => setSortModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition">
              <i className="fa-solid fa-arrow-down-wide-short text-slate-400"></i> Sort Tasks
            </button>
          </div>

          {/* Task List */}
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No tasks found.</div>
            ) : (
              filteredTasks.map((task: any) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div key={task.id} className={`task-item bg-white rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition border border-slate-200 ${isCompleted ? 'opacity-75 bg-white/60' : ''}`} onClick={() => setEditingTask(task)}>
                    <button className="text-slate-300 hover:text-slate-500 cursor-grab" onClick={(e) => e.stopPropagation()}><i className="fa-solid fa-grip-vertical"></i></button>
                    <input 
                      type="checkbox" 
                      checked={isCompleted}
                      onChange={() => updateStatus(task.id, isCompleted ? 'todo' : 'completed')}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded border-slate-300 text-brand-500 focus:ring-brand-500 cursor-pointer" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold truncate task-title ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.title}</h4>
                      <div className={`flex items-center text-xs mt-1 gap-1 ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                        {task.dueDate && <><i className="fa-regular fa-calendar"></i> {new Date(task.dueDate).toLocaleDateString()}</>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-600' : task.priority === 'Low' ? 'bg-slate-100 text-slate-600' : 'bg-brand-50 text-brand-700'}`}>
                        {task.priority || 'Med'}
                      </span>
                      {task.tags?.map((tag: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 text-xs font-semibold rounded-full bg-brand-500 text-white">{tag}</span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-8 text-sm font-medium border-t border-slate-200 pt-6">
            <button className="text-slate-400 flex items-center gap-1 hover:text-slate-600 transition" disabled><i className="fa-solid fa-chevron-left text-xs"></i> Previous</button>
            <div className="flex items-center gap-1">
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <span className="text-slate-400 mx-1">...</span>
              <button className="page-btn">10</button>
            </div>
            <button className="text-brand-600 hover:text-brand-900 flex items-center gap-1 transition">Next <i className="fa-solid fa-chevron-right text-xs"></i></button>
          </div>

        </div>
      </main>

      {/* Filter Modal */}
      <Modal isOpen={isFilterModalOpen} onClose={() => setFilterModalOpen(false)}>
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h5 className="text-lg font-bold text-slate-900"><i className="fa-solid fa-filter text-slate-400 mr-2"></i>Filter Tasks</h5>
          <button onClick={() => setFilterModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5 flex-1 overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
            <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition">
              <option>All Time</option>
              <option>Today</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                <input type="checkbox" checked={filterPriority.includes('Low')} onChange={() => togglePriority('Low')} className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 border-slate-300" />
                <span className="text-sm font-medium text-slate-700">Low</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                <input type="checkbox" checked={filterPriority.includes('Med')} onChange={() => togglePriority('Med')} className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 border-slate-300" />
                <span className="text-sm font-medium text-slate-700">Medium</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                <input type="checkbox" checked={filterPriority.includes('High')} onChange={() => togglePriority('High')} className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 border-slate-300" />
                <span className="text-sm font-medium text-slate-700">High</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {allTags.length === 0 ? (
                <span className="text-sm text-slate-500">No tags found.</span>
              ) : (
                allTags.map((tag: any, i: number) => (
                  <label key={i} className="cursor-pointer">
                    <input type="checkbox" checked={filterTags.includes(tag)} onChange={() => toggleTag(tag)} className="peer sr-only" />
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-sm font-medium peer-checked:bg-brand-50 peer-checked:text-brand-700 peer-checked:border-brand-500 hover:bg-slate-50 transition">{tag}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 rounded-b-2xl flex">
          <button onClick={() => { setFilterDate('All Time'); setFilterPriority([]); setFilterTags([]); }} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition mr-auto">Clear All</button>
          <button onClick={() => setFilterModalOpen(false)} className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-brand-900 hover:bg-brand-800 text-white transition shadow-sm">Apply Filters</button>
        </div>
      </Modal>

      {/* Sort Modal */}
      <Modal isOpen={isSortModalOpen} onClose={() => setSortModalOpen(false)} size="sm">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h5 className="text-lg font-bold text-slate-900"><i className="fa-solid fa-arrow-down-wide-short text-slate-400 mr-2"></i>Sort Tasks</h5>
          <button onClick={() => setSortModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="px-6 py-5">
          <div className="flex flex-col gap-2">
            <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition ${sortOption === 'priority-desc' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input type="radio" name="sortOptions" checked={sortOption === 'priority-desc'} onChange={() => setSortOption('priority-desc')} className="w-4 h-4 text-brand-500 focus:ring-brand-500 border-brand-500" />
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${sortOption === 'priority-desc' ? 'text-brand-900' : 'text-slate-800'}`}>Priority</span>
                <span className={`text-xs font-medium ${sortOption === 'priority-desc' ? 'text-brand-600' : 'text-slate-500'}`}>High to Low</span>
              </div>
            </label>
            <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition ${sortOption === 'priority-asc' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input type="radio" name="sortOptions" checked={sortOption === 'priority-asc'} onChange={() => setSortOption('priority-asc')} className="w-4 h-4 text-brand-500 focus:ring-brand-500 border-brand-500" />
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${sortOption === 'priority-asc' ? 'text-brand-900' : 'text-slate-800'}`}>Priority</span>
                <span className={`text-xs font-medium ${sortOption === 'priority-asc' ? 'text-brand-600' : 'text-slate-500'}`}>Low to High</span>
              </div>
            </label>
            <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition ${sortOption === 'date-desc' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input type="radio" name="sortOptions" checked={sortOption === 'date-desc'} onChange={() => setSortOption('date-desc')} className="w-4 h-4 text-brand-500 focus:ring-brand-500 border-slate-300" />
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${sortOption === 'date-desc' ? 'text-brand-900' : 'text-slate-800'}`}>Date</span>
                <span className={`text-xs font-medium ${sortOption === 'date-desc' ? 'text-brand-600' : 'text-slate-500'}`}>Newest first</span>
              </div>
            </label>
            <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition ${sortOption === 'date-asc' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input type="radio" name="sortOptions" checked={sortOption === 'date-asc'} onChange={() => setSortOption('date-asc')} className="w-4 h-4 text-brand-500 focus:ring-brand-500 border-slate-300" />
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${sortOption === 'date-asc' ? 'text-brand-900' : 'text-slate-800'}`}>Date</span>
                <span className={`text-xs font-medium ${sortOption === 'date-asc' ? 'text-brand-600' : 'text-slate-500'}`}>Oldest first</span>
              </div>
            </label>
          </div>
        </div>
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 rounded-b-2xl">
          <button onClick={() => setSortModalOpen(false)} className="rounded-xl w-full py-2.5 text-sm font-semibold bg-brand-900 hover:bg-brand-800 text-white transition shadow-sm">Apply Sort</button>
        </div>
      </Modal>

      {/* Edit Task Offcanvas */}
      <Offcanvas isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task">
        {editingTask && (
          <div className="flex flex-col h-full" key={editingTask.id}>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-6 border-b border-slate-100">{editingTask.title}</h2>
            
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea 
              className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-brand-500 outline-none mb-8 min-h-[140px] resize-y" 
              defaultValue={editingTask.description || ""} 
            />

            <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
            <div className="flex flex-wrap items-center gap-2 p-2 mb-8 w-full rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-brand-500 transition cursor-text">
              {editingTask.tags?.map((tag: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500 text-white text-xs font-medium cursor-default">
                  {tag} <button className="hover:text-slate-200"><i className="fa-solid fa-xmark text-[10px]"></i></button>
                </span>
              ))}
              <input type="text" placeholder="Add a tag..." className="flex-1 bg-transparent border-0 min-w-[120px] text-sm focus:ring-0 outline-none px-2 text-slate-700 placeholder-slate-400" />
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                <div className="relative">
                  <i className="fa-regular fa-calendar-days absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base pointer-events-none"></i>
                  <input type="text" defaultValue={editingTask.dueDate ? new Date(editingTask.dueDate).toLocaleDateString() : ""} placeholder="No due date" className="w-full rounded-lg border border-slate-200 py-2.5 pr-4 pl-12 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-500 outline-none bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <div className="flex text-sm font-medium">
                  <button className={`flex-1 py-2.5 border ${editingTask.priority === 'Low' ? 'border-brand-500 text-brand-900 bg-brand-50 shadow-sm' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition'} rounded-l-lg`} style={editingTask.priority === 'Low' ? { boxShadow: 'inset 0 0 0 1px #6b66fa' } : {}}>Low</button>
                  <button className={`flex-1 py-2.5 border ${(!editingTask.priority || editingTask.priority === 'Med') ? 'border-brand-500 text-brand-900 bg-brand-50 shadow-sm' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition'} -mx-px z-10`} style={(!editingTask.priority || editingTask.priority === 'Med') ? { boxShadow: 'inset 0 0 0 1px #6b66fa' } : {}}>Med</button>
                  <button className={`flex-1 py-2.5 border ${editingTask.priority === 'High' ? 'border-brand-500 text-brand-900 bg-brand-50 shadow-sm' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition'} rounded-r-lg`} style={editingTask.priority === 'High' ? { boxShadow: 'inset 0 0 0 1px #6b66fa' } : {}}>High</button>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer border-b border-slate-100 pb-8 mt-auto">
              <input type="checkbox" defaultChecked={editingTask.status === 'completed'} className="w-5 h-5 rounded border-slate-300 text-brand-500 focus:ring-brand-500" />
              <span className="text-sm font-medium text-slate-700">Mark as Complete</span>
            </label>

            <div className="pt-5 flex justify-between items-center mt-6">
              <button onClick={() => { removeTask(editingTask.id); setEditingTask(null); }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition">
                <i className="fa-regular fa-trash-can"></i> Delete Task
              </button>
              <div className="flex gap-3">
                <button onClick={() => setEditingTask(null)} className="px-6 py-2.5 rounded-xl bg-brand-100 text-brand-900 text-sm font-semibold hover:bg-brand-200 transition">Cancel</button>
                <button onClick={() => setEditingTask(null)} className="px-6 py-2.5 rounded-xl bg-brand-900 text-white text-sm font-semibold hover:bg-brand-800 transition shadow-sm">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </Offcanvas>

    </div>
  );
}
