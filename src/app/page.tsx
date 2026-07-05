"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import Offcanvas from '@/components/Offcanvas';
import { useTasks } from '@/components/TaskProvider';

export default function Home() {
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [isSortModalOpen, setSortModalOpen] = useState(false);
  const [isEditTaskOpen, setEditTaskOpen] = useState(false);
  const { tasks, isLoading, updateStatus, removeTask } = useTasks();

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
            <input type="text" placeholder="Search tasks..." className="bg-slate-100 rounded-lg pl-9 pr-8 py-2 text-sm w-64 border-0 focus:ring-2 focus:ring-brand-500 placeholder-slate-400 outline-none" />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark"></i></button>
          </div>
          <button className="text-slate-500 hover:text-slate-800 text-lg"><i className="fa-regular fa-bell"></i></button>
          <Link href="/auth" className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden cursor-pointer border border-slate-200 block">
            <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Avatar" className="w-full h-full object-cover" />
          </Link>
        </div>
      </header>

      {/* Content Scrollable */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Page Title & Filters */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-1">Today's Focus</h2>
              <p className="text-slate-500 text-sm">You have {tasks?.filter(t => t.status !== 'completed').length || 0} tasks to complete.</p>
            </div>
            <div className="flex gap-2 text-sm font-medium">
              <button className="filter-btn active px-5 py-1.5 border border-transparent rounded-full transition">All</button>
              <button className="filter-btn px-4 py-1.5 border border-transparent rounded-full hover:bg-slate-100 transition">Active</button>
              <button className="filter-btn px-4 py-1.5 border border-transparent rounded-full hover:bg-slate-100 transition">Completed</button>
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
            ) : tasks?.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No tasks yet. Create one!</div>
            ) : (
              tasks?.map((task: any) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div key={task.id} className={`task-item bg-white rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition border border-slate-200 ${isCompleted ? 'opacity-75 bg-white/60' : ''}`} onClick={() => setEditTaskOpen(true)}>
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
            <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition">
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
                <input type="checkbox" className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 border-slate-300" />
                <span className="text-sm font-medium text-slate-700">Low</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                <input type="checkbox" className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 border-slate-300" />
                <span className="text-sm font-medium text-slate-700">Medium</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                <input type="checkbox" className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 border-slate-300" />
                <span className="text-sm font-medium text-slate-700">High</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <input type="checkbox" className="peer sr-only" />
                <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-sm font-medium peer-checked:bg-brand-50 peer-checked:text-brand-700 peer-checked:border-brand-500 hover:bg-slate-50 transition">Work</span>
              </label>
              <label className="cursor-pointer">
                <input type="checkbox" className="peer sr-only" />
                <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-sm font-medium peer-checked:bg-brand-50 peer-checked:text-brand-700 peer-checked:border-brand-500 hover:bg-slate-50 transition">Design</span>
              </label>
              <label className="cursor-pointer">
                <input type="checkbox" className="peer sr-only" />
                <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-sm font-medium peer-checked:bg-brand-50 peer-checked:text-brand-700 peer-checked:border-brand-500 hover:bg-slate-50 transition">Research</span>
              </label>
              <label className="cursor-pointer">
                <input type="checkbox" className="peer sr-only" />
                <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-sm font-medium peer-checked:bg-brand-50 peer-checked:text-brand-700 peer-checked:border-brand-500 hover:bg-slate-50 transition">Personal</span>
              </label>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 rounded-b-2xl flex">
          <button onClick={() => setFilterModalOpen(false)} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition mr-auto">Clear All</button>
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
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-brand-500 bg-brand-50 hover:bg-brand-50 transition">
              <input type="radio" name="sortOptions" defaultChecked className="w-4 h-4 text-brand-500 focus:ring-brand-500 border-brand-500" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-brand-900">Priority</span>
                <span className="text-xs text-brand-600 font-medium">High to Low</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
              <input type="radio" name="sortOptions" className="w-4 h-4 text-brand-500 focus:ring-brand-500 border-slate-300" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">Date</span>
                <span className="text-xs text-slate-500 font-medium">Newest first</span>
              </div>
            </label>
          </div>
        </div>
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 rounded-b-2xl">
          <button onClick={() => setSortModalOpen(false)} className="rounded-xl w-full py-2.5 text-sm font-semibold bg-brand-900 hover:bg-brand-800 text-white transition shadow-sm">Apply Sort</button>
        </div>
      </Modal>

      {/* Edit Task Offcanvas */}
      <Offcanvas isOpen={isEditTaskOpen} onClose={() => setEditTaskOpen(false)} title="Edit Task">
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-6 border-b border-slate-100">Review Q3 Performance Metrics</h2>
          
          <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
          <textarea 
            className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-brand-500 outline-none mb-8 min-h-[140px] resize-y" 
            defaultValue="Compile and analyze the data from all regional offices regarding the Q3 performance. Specifically, look into the unexpected dip in the EMEA region and provide a summary of potential causes based on the CRM logs." 
          />

          <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
          <div className="flex flex-wrap items-center gap-2 p-2 mb-8 w-full rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-brand-500 transition cursor-text">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500 text-white text-xs font-medium cursor-default">
              Work <button className="hover:text-slate-200"><i className="fa-solid fa-xmark text-[10px]"></i></button>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500 text-white text-xs font-medium cursor-default">
              Urgent <button className="hover:text-slate-200"><i className="fa-solid fa-xmark text-[10px]"></i></button>
            </span>
            <input type="text" placeholder="Add a tag..." className="flex-1 bg-transparent border-0 min-w-[120px] text-sm focus:ring-0 outline-none px-2 text-slate-700 placeholder-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
              <div className="relative">
                <i className="fa-regular fa-calendar-days absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base pointer-events-none"></i>
                <input type="text" defaultValue="15/11/2023" className="w-full rounded-lg border border-slate-200 py-2.5 pr-4 pl-12 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-500 outline-none bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
              <div className="flex text-sm font-medium">
                <button className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-l-lg hover:bg-slate-50 transition bg-white">Low</button>
                <button className="flex-1 py-2.5 border border-brand-500 text-brand-900 bg-brand-50 -mx-px z-10 shadow-sm" style={{ boxShadow: 'inset 0 0 0 1px #6b66fa' }}>Med</button>
                <button className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-r-lg hover:bg-slate-50 transition bg-white">High</button>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer border-b border-slate-100 pb-8 mt-auto">
            <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-brand-500 focus:ring-brand-500" />
            <span className="text-sm font-medium text-slate-700">Mark as Complete</span>
          </label>

          <div className="pt-5 flex justify-between items-center mt-6">
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition">
              <i className="fa-regular fa-trash-can"></i> Delete Task
            </button>
            <div className="flex gap-3">
              <button onClick={() => setEditTaskOpen(false)} className="px-6 py-2.5 rounded-xl bg-brand-100 text-brand-900 text-sm font-semibold hover:bg-brand-200 transition">Cancel</button>
              <button onClick={() => setEditTaskOpen(false)} className="px-6 py-2.5 rounded-xl bg-brand-900 text-white text-sm font-semibold hover:bg-brand-800 transition shadow-sm">Save Changes</button>
            </div>
          </div>
        </div>
      </Offcanvas>

    </div>
  );
}
