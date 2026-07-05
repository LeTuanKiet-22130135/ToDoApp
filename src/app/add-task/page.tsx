"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTasks } from '@/components/TaskProvider';

export default function AddTaskPage() {
  const router = useRouter();
  const { addTask, isAuth } = useTasks();
  
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Med');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    setIsSubmitting(true);
    try {
      await addTask({
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
        tags
      });
      router.push('/');
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
  };
  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white h-16 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <Link href="/" className="text-2xl font-bold text-brand-900 text-decoration-none hover:text-brand-800 transition">TaskFlow</Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-2 text-decoration-none hover:underline">
            <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
          </Link>
          {isAuth ? (
            <Link href="/auth" className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden cursor-pointer border border-slate-200 ml-4 block hover:ring-2 hover:ring-brand-500 transition">
              <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Avatar" className="w-full h-full object-cover" />
            </Link>
          ) : (
            <Link href="/auth" className="bg-brand-900 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-brand-800 transition hover:shadow-md hover:underline ml-4">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8 flex justify-center items-start bg-[#fafafa]">
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-sm mt-4">
          <form id="add-task-form" onSubmit={handleSubmit}>
            <div className="border-b border-slate-100 px-8 py-6">
              <h2 className="text-2xl font-bold text-slate-900">Create New Task</h2>
              <p className="text-sm text-slate-500 mt-1">Fill in the details below to add a new task to your dashboard.</p>
            </div>
            
            <div className="px-8 py-6 flex flex-col gap-6">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Task Name</label>
                <input type="text" required placeholder="e.g. Redesign landing page"
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition shadow-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea placeholder="Add any extra details, notes, or links..."
                  value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition shadow-sm min-h-[120px] resize-y"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                  <div className="relative">
                    <i className="fa-regular fa-calendar-days absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition shadow-sm text-slate-600 cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                  <div className="flex text-sm font-medium shadow-sm rounded-xl">
                    <button type="button" onClick={() => setPriority('Low')} className={`flex-1 py-3 border text-slate-600 rounded-l-xl transition ${priority === 'Low' ? 'border-brand-500 text-brand-900 bg-brand-50 z-10 shadow-[inset_0_0_0_1px_#6b66fa]' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>Low</button>
                    <button type="button" onClick={() => setPriority('Med')} className={`flex-1 py-3 border text-slate-600 transition -mx-px ${priority === 'Med' ? 'border-brand-500 text-brand-900 bg-brand-50 z-10 shadow-[inset_0_0_0_1px_#6b66fa]' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>Med</button>
                    <button type="button" onClick={() => setPriority('High')} className={`flex-1 py-3 border text-slate-600 rounded-r-xl transition ${priority === 'High' ? 'border-brand-500 text-brand-900 bg-brand-50 z-10 shadow-[inset_0_0_0_1px_#6b66fa]' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>High</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
                <div className="flex flex-wrap items-center gap-2 p-2.5 w-full rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-brand-500 transition cursor-text shadow-sm">
                  {tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-100 text-brand-700 text-xs font-semibold cursor-default">
                      {tag} <button type="button" onClick={() => removeTag(tag)} className="hover:text-brand-900"><i className="fa-solid fa-xmark"></i></button>
                    </span>
                  ))}
                  <input type="text" placeholder="Add a tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput.trim()); setTagInput(''); } }} className="flex-1 bg-transparent border-0 min-w-[120px] text-sm focus:ring-0 outline-none px-2 text-slate-700 placeholder-slate-400" />
                  
                  <div className="relative">
                    <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="bg-slate-100 hover:bg-slate-200 border-0 text-slate-600 rounded-lg px-3 py-1.5 shadow-none flex items-center gap-2 font-medium text-sm transition" type="button">
                      <i className="fa-solid fa-tag text-[10px]"></i> Select Existing
                    </button>
                    {isDropdownOpen && (
                      <ul className="absolute right-0 top-full mt-1 p-2 text-sm shadow-lg border-0 ring-1 ring-slate-200 rounded-xl min-w-[160px] bg-white z-10 animate-in fade-in zoom-in-95 duration-100">
                        <li><h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">Recent Tags</h6></li>
                        <li><button type="button" onClick={() => { addTag('Design'); setDropdownOpen(false); }} className="w-full text-left rounded-lg flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-slate-600"><i className="fa-solid fa-plus text-brand-500 text-xs"></i> Design</button></li>
                        <li><button type="button" onClick={() => { addTag('Research'); setDropdownOpen(false); }} className="w-full text-left rounded-lg flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-slate-600"><i className="fa-solid fa-plus text-brand-500 text-xs"></i> Research</button></li>
                        <li><button type="button" onClick={() => { addTag('Personal'); setDropdownOpen(false); }} className="w-full text-left rounded-lg flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-slate-600"><i className="fa-solid fa-plus text-brand-500 text-xs"></i> Personal</button></li>
                      </ul>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3 pl-1">
                  <span className="text-xs text-slate-500 font-medium">Suggested:</span>
                  <button type="button" onClick={() => addTag('Urgent')} className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition shadow-sm bg-white"><i className="fa-solid fa-plus text-[10px] mr-1 text-slate-400"></i>Urgent</button>
                  <button type="button" onClick={() => addTag('Frontend')} className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition shadow-sm bg-white"><i className="fa-solid fa-plus text-[10px] mr-1 text-slate-400"></i>Frontend</button>
                  <button type="button" onClick={() => addTag('Backend')} className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition shadow-sm bg-white"><i className="fa-solid fa-plus text-[10px] mr-1 text-slate-400"></i>Backend</button>
                </div>
              </div>
              
            </div>
            
            <div className="border-t border-slate-100 px-8 py-5 bg-slate-50 rounded-b-2xl flex justify-end gap-3 mt-2">
              <Link href="/" className="rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition text-decoration-none border border-transparent">Cancel</Link>
              <button type="submit" disabled={isSubmitting} className="rounded-xl px-6 py-2.5 text-sm font-semibold bg-brand-900 hover:bg-brand-800 text-white transition shadow-sm disabled:opacity-50">{isSubmitting ? 'Creating...' : 'Create Task'}</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
