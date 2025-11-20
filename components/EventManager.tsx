import React, { useState } from 'react';
import { Calendar, CheckSquare, Heart, Plus } from 'lucide-react';
import { storageService } from '../services/storageService';

export const EventManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'tasks' | 'donate'>('events');
  const events = storageService.getEvents();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
       <div className="flex flex-wrap gap-4 mb-8 justify-center">
         <button 
           onClick={() => setActiveTab('events')}
           className={`px-6 py-2 rounded-full flex items-center gap-2 transition ${activeTab === 'events' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 shadow-sm'}`}
         >
           <Calendar size={18} /> Events
         </button>
         <button 
           onClick={() => setActiveTab('tasks')}
           className={`px-6 py-2 rounded-full flex items-center gap-2 transition ${activeTab === 'tasks' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-600 shadow-sm'}`}
         >
           <CheckSquare size={18} /> Tasks
         </button>
         <button 
           onClick={() => setActiveTab('donate')}
           className={`px-6 py-2 rounded-full flex items-center gap-2 transition ${activeTab === 'donate' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white text-gray-600 shadow-sm'}`}
         >
           <Heart size={18} /> Donate
         </button>
       </div>

       {activeTab === 'events' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                <div className="h-40 bg-gray-200 relative overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                    {event.date}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{event.description}</p>
                  <div className="flex items-center text-xs text-gray-400 mb-4">
                    <span className="uppercase font-semibold">{event.location}</span>
                  </div>
                  <button className="w-full py-2 bg-primary/10 text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                    RSVP Now
                  </button>
                </div>
              </div>
            ))}
            
            {/* Add Event Mock */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-400 hover:bg-white hover:border-primary hover:text-primary transition cursor-pointer h-full min-h-[300px]">
               <Plus size={48} className="mb-2" />
               <span className="font-medium">Create New Event</span>
            </div>
         </div>
       )}

       {activeTab === 'tasks' && (
         <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-fade-in">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 className="text-lg font-bold text-gray-800">Community Tasks</h3>
             <button className="text-sm text-primary font-medium hover:underline">+ Assign Task</button>
           </div>
           <div className="divide-y divide-gray-100">
             {[1, 2, 3].map(i => (
               <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                 <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-red-500' : i === 2 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                 <div className="flex-1">
                   <h4 className="text-sm font-semibold text-gray-900">Update Community Guidelines</h4>
                   <p className="text-xs text-gray-500">Assigned to: Admin User</p>
                 </div>
                 <span className="text-xs bg-gray-100 px-2 py-1 rounded">Due Tomorrow</span>
               </div>
             ))}
           </div>
         </div>
       )}

       {activeTab === 'donate' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
           <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-8 text-white shadow-xl">
             <h3 className="text-2xl font-bold mb-4">Support Our Cause</h3>
             <p className="mb-6 opacity-90">Your donations help us organize better events and maintain this platform.</p>
             <div className="bg-white/20 backdrop-blur rounded-xl p-6 mb-6">
               <div className="flex justify-between mb-2 text-sm font-medium">
                 <span>Goal: $10,000</span>
                 <span>65% Raised</span>
               </div>
               <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                 <div className="h-full bg-white w-[65%] rounded-full"></div>
               </div>
             </div>
             <button className="w-full bg-white text-pink-600 py-3 rounded-xl font-bold text-lg hover:bg-pink-50 transition shadow-lg">
               Donate Now
             </button>
           </div>

           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
             <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Donors</h3>
             <div className="space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                       {i === 1 ? 'JD' : i === 2 ? 'AS' : 'MK'}
                     </div>
                     <div>
                       <p className="font-medium text-gray-900">Anonymous Donor</p>
                       <p className="text-xs text-gray-400">2 hours ago</p>
                     </div>
                   </div>
                   <span className="font-bold text-green-600">+$50.00</span>
                 </div>
               ))}
             </div>
           </div>
         </div>
       )}
    </div>
  );
};
