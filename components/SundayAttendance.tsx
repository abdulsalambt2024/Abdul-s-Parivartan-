import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { AttendanceRecord, UserRole, User } from '../types';
import { Calendar, UserCheck, Plus, MapPin } from 'lucide-react';

interface Props {
  currentUser: User;
}

export const SundayAttendance: React.FC<Props> = ({ currentUser }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    villageName: '',
    attendees: '',
    notes: ''
  });

  useEffect(() => {
    setRecords(storageService.getAttendance());
  }, []);

  if (currentUser.role === UserRole.USER) {
    return <div className="p-8 text-center text-gray-500">Access Restricted. Authorized personnel only.</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: AttendanceRecord = {
      id: Date.now().toString(),
      date: newRecord.date,
      villageName: newRecord.villageName,
      attendees: newRecord.attendees.split(',').map(s => s.trim()),
      notes: newRecord.notes
    };
    
    const updated = storageService.saveAttendance(record);
    setRecords(updated);
    setIsAdding(false);
    setNewRecord({ date: new Date().toISOString().split('T')[0], villageName: '', attendees: '', notes: '' });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-primary" /> Sunday Visits
          </h2>
          <p className="text-gray-500">Track weekly village visits and attendance</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Log Visit
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8 animate-fade-in">
          <h3 className="font-semibold mb-4">New Visit Record</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full border p-2 rounded-lg"
                  value={newRecord.date}
                  onChange={e => setNewRecord({...newRecord, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Village Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rampur"
                  className="w-full border p-2 rounded-lg"
                  value={newRecord.villageName}
                  onChange={e => setNewRecord({...newRecord, villageName: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendees (Comma separated)</label>
              <textarea 
                className="w-full border p-2 rounded-lg"
                placeholder="John Doe, Jane Smith, ..."
                value={newRecord.attendees}
                onChange={e => setNewRecord({...newRecord, attendees: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Outcomes</label>
              <textarea 
                className="w-full border p-2 rounded-lg"
                placeholder="Brief summary of activities..."
                value={newRecord.notes}
                onChange={e => setNewRecord({...newRecord, notes: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save Record</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {records.map(rec => (
          <div key={rec.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                 <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                   <MapPin size={16} className="text-gray-400" /> {rec.villageName}
                 </h4>
                 <span className="text-sm text-gray-500">{rec.date}</span>
              </div>
              <div className="bg-blue-50 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <UserCheck size={12} /> {rec.attendees.length} Present
              </div>
            </div>
            <div className="mb-3">
              <p className="text-sm text-gray-700"><span className="font-medium">Present:</span> {rec.attendees.join(', ')}</p>
            </div>
            {rec.notes && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic">
                "{rec.notes}"
              </div>
            )}
          </div>
        ))}
        {records.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
             <p className="text-gray-400">No visit records found.</p>
          </div>
        )}
      </div>
    </div>
  );
};