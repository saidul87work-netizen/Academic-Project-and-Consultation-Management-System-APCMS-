import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { projectApi } from '../services/projectService';

interface CalendarEvent {
  _id: string; title: string;
  type: 'task' | 'submission_deadline' | 'defense' | 'checkpoint';
  description: string; dueDate: string;
  status: 'upcoming' | 'completed' | 'overdue';
  createdBy?: string;
  createdByName?: string;
}
interface ProjectOption { id: string; title: string; studentName?: string; }

const TYPE_DOT: Record<string, string> = {
  task: '#60a5fa', submission_deadline: '#fbbf24', defense: '#f87171', checkpoint: '#34d399',
};
const TYPE_LABEL: Record<string, string> = {
  task: 'Task', submission_deadline: 'Submission Deadline', defense: 'Defense', checkpoint: 'Checkpoint',
};
const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const DAY_NAMES_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_NAMES_FULL_UPPER = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
const HEADERS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

export function ProjectCalendar({ projectId, userRole, currentUserId }: { projectId: string; userRole: string; currentUserId: string }) {
  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [allProjectEvents, setAllProjectEvents] = useState<{event: CalendarEvent; project: ProjectOption}[]>([]);
  const [myProjects, setMyProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', type: 'task', date: '', time: '', selectedProjectId: projectId });

  const isStudent = userRole === 'student';
  const isFaculty = userRole === 'faculty';
  const isAdmin = userRole === 'admin';
  const isFacultyOrAdmin = userRole === 'faculty' || userRole === 'admin';
  const canCreateEvent = isStudent || isFaculty || isAdmin;

  // Calendar math (Monday-first)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const offset = (firstDow + 6) % 7; // Mon=0

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/calendar/${projectId}`, { headers: { 'x-user-id': currentUserId, 'x-user-role': userRole } });
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events for project', projectId, err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjectEvents = async (projects: ProjectOption[]) => {
    const results: {event: CalendarEvent; project: ProjectOption}[] = [];
    await Promise.all(projects.map(async (proj) => {
      try {
        const r = await axios.get(`${API_BASE}/calendar/${proj.id}`, { headers: { 'x-user-id': currentUserId, 'x-user-role': userRole } });
        (r.data as CalendarEvent[]).forEach(e => results.push({ event: e, project: proj }));
      } catch {}
    }));
    results.sort((a,b) => new Date(a.event.dueDate).getTime() - new Date(b.event.dueDate).getTime());
    setAllProjectEvents(results);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const projectList = isStudent
          ? await projectApi.listMyProjects()
          : await projectApi.listAllProjects();
        const opts: ProjectOption[] = projectList.map((x: any) => ({
          id: x._id,
          title: x.title,
          studentName: x.studentName || x.student || '',
        }));
        setMyProjects(opts);
        await fetchAllProjectEvents(opts);
      } catch (err) {
        console.error('Failed to load projects list', err);
      }
      await fetchEvents();
    };
    init();
  }, [projectId, userRole]);

  const prevMonth = () => { if (viewMonth===0){setViewYear(y=>y-1);setViewMonth(11);}else setViewMonth(m=>m-1); setSelectedDay(1); };
  const nextMonth = () => { if (viewMonth===11){setViewYear(y=>y+1);setViewMonth(0);}else setViewMonth(m=>m+1); setSelectedDay(1); };

  const eventsForDay = (y:number,m:number,d:number): CalendarEvent[] =>
    allProjectEvents
      .filter(({ event: e }) => { const dt=new Date(e.dueDate); return dt.getFullYear()===y&&dt.getMonth()===m&&dt.getDate()===d; })
      .map(x => x.event);

  const selectedEvents = allProjectEvents
    .filter(({ event: e }) => { const dt=new Date(e.dueDate); return dt.getFullYear()===viewYear&&dt.getMonth()===viewMonth&&dt.getDate()===selectedDay; });

  const isToday = (d:number) => d===now.getDate()&&viewMonth===now.getMonth()&&viewYear===now.getFullYear();

  // Build 42-cell grid (Mon-first, show prev/next month dates)
  const cells: {day:number; month:number; year:number; current:boolean}[] = [];
  for(let i=0;i<offset;i++){
    const d=daysInPrevMonth-offset+1+i;
    const m=viewMonth===0?11:viewMonth-1;
    const y=viewMonth===0?viewYear-1:viewYear;
    cells.push({day:d,month:m,year:y,current:false});
  }
  for(let d=1;d<=daysInMonth;d++) cells.push({day:d,month:viewMonth,year:viewYear,current:true});
  const remaining = 42 - cells.length;
  for(let i=1;i<=remaining;i++){
    const m=viewMonth===11?0:viewMonth+1;
    const y=viewMonth===11?viewYear+1:viewYear;
    cells.push({day:i,month:m,year:y,current:false});
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newEvent.title.trim()) return;
    setSubmitting(true);
    try {
      const dueDate = newEvent.time ? `${newEvent.date}T${newEvent.time}:00` : `${newEvent.date}T00:00:00`;
      const createdByName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'Unknown';
      await axios.post(
        `${API_BASE}/calendar/${newEvent.selectedProjectId}`,
        { title: newEvent.title, type: newEvent.type, dueDate, description: '', createdByName },
        { headers: { 'x-user-id': currentUserId, 'x-user-role': userRole } }
      );
      toast.success('Event added!');
      setShowModal(false);
      await fetchEvents();                         // refresh calendar dots
      await fetchAllProjectEvents(myProjects);     // refresh All Events list (all roles)
    } catch { toast.error('Failed to add event'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (eventId: string, projId: string) => {
    try {
      await axios.delete(`${API_BASE}/calendar/${projId}/${eventId}`, { headers: { 'x-user-id': currentUserId, 'x-user-role': userRole } });
      toast.success('Event deleted');
      await fetchEvents();
      setAllProjectEvents(prev => prev.filter(x => x.event._id !== eventId));
    } catch { toast.error('Failed to delete event'); }
  };

  const openModal = () => {
    setNewEvent({ title:'', type:'task', date: toDateStr(viewYear,viewMonth,selectedDay), time:'', selectedProjectId: projectId });
    setShowModal(true);
  };

  const selectedDateObj = new Date(viewYear, viewMonth, selectedDay);
  const selDayName = DAY_NAMES_FULL_UPPER[selectedDateObj.getDay()];

  // Input style reuse
  const inp: React.CSSProperties = { width:'100%', padding:'9px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.12)', background:'#111', color:'#fff', fontSize:13, outline:'none' };

  return (
    <div style={{ fontFamily:"'Inter',sans-serif" }}>
      {/* ── MAIN CALENDAR WIDGET ── */}
      <div style={{ display:'flex', borderRadius:16, overflow:'hidden', boxShadow:'0 8px 40px rgba(0,0,0,0.4)' }}>

        {/* LEFT: Red Calendar */}
        <div style={{ flex:1, background:'#e74c3c', padding:'24px 20px 20px' }}>
          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
            <div>
              <div style={{ color:'#fff', fontWeight:800, fontSize:18, letterSpacing:1 }}>{MONTHS[viewMonth]}</div>
              <div style={{ color:'rgba(255,255,255,0.55)', fontWeight:400, fontSize:13, marginTop:2 }}>{viewYear}</div>
            </div>
            <div style={{ display:'flex', gap:4, alignItems:'center', marginTop:4 }}>
              <button onClick={prevMonth} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:16, padding:'4px 8px', borderRadius:6 }}>‹</button>
              <button onClick={nextMonth} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:16, padding:'4px 8px', borderRadius:6 }}>›</button>
            </div>
          </div>

          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:8 }}>
            {HEADERS.map(h => (
              <div key={h} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:1, paddingBottom:4 }}>{h}</div>
            ))}
          </div>

          {/* Day cells — 42-cell grid, row by row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', rowGap:2 }}>
            {cells.map((cell, idx) => {
              const isSelected = cell.current && cell.day === selectedDay;
              const todayCell = cell.current && isToday(cell.day);
              const dots = cell.current ? eventsForDay(cell.year, cell.month, cell.day) : [];
              return (
                <button key={idx} onClick={() => { if(cell.current){setSelectedDay(cell.day);} }}
                  style={{ background:'none', border:'none', cursor: cell.current?'pointer':'default', display:'flex', flexDirection:'column', alignItems:'center', padding:'4px 0' }}>
                  <span style={{
                    width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center',
                    borderRadius:'50%', fontSize:13, fontWeight: isSelected?700:400,
                    background: isSelected ? '#1a1a1a' : todayCell ? 'rgba(255,255,255,0.2)' : 'none',
                    color: !cell.current ? 'rgba(255,255,255,0.25)' : '#fff',
                    transition:'background 0.15s'
                  }}>{cell.day}</span>
                  {dots.length > 0 && (
                    <div style={{ display:'flex', gap:2, marginTop:1 }}>
                      {dots.slice(0,3).map(e => (
                        <span key={e._id} style={{ width:4, height:4, borderRadius:'50%', background: TYPE_DOT[e.type]||'#fff' }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Event List */}
        <div style={{ width:280, background:'#1a1a1a', display:'flex', flexDirection:'column', minWidth:0 }}>
          {/* Selected day header */}
          <div style={{ padding:'20px 18px 14px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ color:'#fff', fontWeight:800, fontSize:15, letterSpacing:0.5 }}>
              {selDayName} {selectedDay}
            </div>
          </div>

          {/* Events for selected day */}
          <div style={{ padding:'10px 18px', display:'flex', flexDirection:'column', gap:10, borderBottom:'1px solid rgba(255,255,255,0.07)', minHeight:80 }}>
            {loading ? (
              <div style={{ color:'rgba(255,255,255,0.25)', fontSize:12, paddingTop:10 }}>Loading...</div>
            ) : selectedEvents.length > 0 ? selectedEvents.map(({ event: ev, project: proj }) => {
              const d = new Date(ev.dueDate);
              const hasTime = d.getHours()!==0||d.getMinutes()!==0;
              return (
                <div key={ev._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    {hasTime && <div style={{ color:'rgba(255,255,255,0.35)', fontSize:10, fontWeight:600, marginBottom:1 }}>
                      {d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false})}
                    </div>}
                    <div style={{ color:'#fff', fontSize:12, fontWeight:500, lineHeight:1.3 }}>{ev.title}</div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{proj.title}</div>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDelete(ev._id, proj.id)}
                      style={{ background:'none', border:'none', color:'rgba(255,100,100,0.5)', cursor:'pointer', fontSize:14, padding:'0 0 0 8px', lineHeight:1, flexShrink:0 }}
                      title="Delete event">✕</button>
                  )}
                </div>
              );
            }) : (
              <div style={{ color:'rgba(255,255,255,0.2)', fontSize:11, fontStyle:'italic', paddingTop:8 }}>No events on this day</div>
            )}
          </div>

          {/* ALL EVENTS list — all projects, auto-updates on add/delete */}
          <div style={{ flex:1, overflowY:'auto' }}>
            <div style={{ padding:'10px 18px 4px', fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.15em' }}>All Events · Project</div>
            {allProjectEvents.length === 0 ? (
              <div style={{ padding:'8px 18px', fontSize:11, color:'rgba(255,255,255,0.15)', fontStyle:'italic' }}>No events yet</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column' }}>
                {allProjectEvents.map(({ event: ev, project: proj }) => {
                  const d = new Date(ev.dueDate);
                  const isPast = d < now;
                  return (
                    <div key={ev._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ minWidth:0, flex:1, marginRight:6 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <span style={{ width:5, height:5, borderRadius:'50%', background:TYPE_DOT[ev.type]||'#888', flexShrink:0 }} />
                          <span style={{ fontSize:11, color:'#fff', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ev.title}</span>
                        </div>
                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:2, paddingLeft:10 }}>
                          {proj.title} · <span style={{ color: isPast?'#f87171':'#34d399' }}>{d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <button onClick={() => handleDelete(ev._id, proj.id)}
                          style={{ background:'none', border:'none', color:'rgba(255,100,100,0.4)', cursor:'pointer', fontSize:13, padding:0, flexShrink:0 }}
                          title="Delete">✕</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add button — all roles */}
          {canCreateEvent && (
            <button onClick={openModal} style={{ padding:'13px 18px', background:'none', border:'none', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', color:'#fff', fontSize:10, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase' }}>
              Add an Event <span style={{ fontSize:16, lineHeight:1 }}>+</span>
            </button>
          )}
        </div>
      </div>

      {/* ── EVENT HISTORY (faculty + admin only) ── */}
      {isFacultyOrAdmin && (
        <div style={{ marginTop:20, borderRadius:14, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)', background:'#1a1a1a' }}>
          <div style={{ padding:'13px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <span style={{ color:'#fff', fontWeight:700, fontSize:13 }}>Event History</span>
              <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginLeft:10 }}>who created each event · sorted by date</span>
            </div>
            {isAdmin && (
              <button onClick={openModal}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, border:'none', background:'#e74c3c', color:'#fff', fontSize:11, fontWeight:800, cursor:'pointer', letterSpacing:'0.08em', textTransform:'uppercase' }}>
                <Plus size={12}/> Add Event
              </button>
            )}
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                {['Event Name','Date','Project','Created By',...(isAdmin?['Actions']:[])] .map(h => (
                  <th key={h} style={{ padding:'10px 20px', textAlign:'left', color:'rgba(255,255,255,0.25)', fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allProjectEvents.length === 0 ? (
                <tr><td colSpan={5} style={{ padding:'28px 20px', textAlign:'center', color:'rgba(255,255,255,0.15)', fontStyle:'italic' }}>No events found across projects</td></tr>
              ) : allProjectEvents.map(({ event, project }) => {
                const d = new Date(event.dueDate);
                const isPast = d < now;
                return (
                  <tr key={event._id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding:'10px 20px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:TYPE_DOT[event.type]||'#888', flexShrink:0 }} />
                        <span style={{ color:'rgba(255,255,255,0.85)', fontWeight:500 }}>{event.title}</span>
                      </div>
                    </td>
                    <td style={{ padding:'10px 20px', color: isPast?'#f87171':'#34d399', fontWeight:600 }}>
                      {d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    </td>
                    <td style={{ padding:'10px 20px', color:'rgba(255,255,255,0.45)', fontSize:11 }}>{project.title}</td>
                    <td style={{ padding:'10px 20px', color:'rgba(255,255,255,0.45)', fontSize:11 }}>
                      {event.createdByName || project.studentName || '—'}
                    </td>
                    {isAdmin && (
                      <td style={{ padding:'10px 20px' }}>
                        <button onClick={() => handleDelete(event._id, project.id)}
                          style={{ padding:'4px 10px', borderRadius:6, border:'1px solid rgba(255,80,80,0.3)', background:'rgba(255,80,80,0.08)', color:'#f87171', fontSize:10, fontWeight:700, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ADD EVENT MODAL ── */}
      {showModal && (
        <div style={{ position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:16,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)' }}>
          <div style={{ width:'100%',maxWidth:420,borderRadius:16,overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.6)',border:'1px solid rgba(255,255,255,0.08)',background:'#1a1a1a' }}>
            {/* Modal header */}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 24px',background:'#e74c3c' }}>
              <span style={{ color:'#fff',fontWeight:800,fontSize:14,letterSpacing:'0.1em',textTransform:'uppercase' }}>Add an Event</span>
              <button onClick={()=>setShowModal(false)} style={{ background:'none',border:'none',color:'rgba(255,255,255,0.7)',cursor:'pointer',padding:4,display:'flex' }}><X size={16}/></button>
            </div>

            <form onSubmit={handleSave} style={{ padding:24, display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ display:'block',fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:1,marginBottom:6 }}>Event Name *</label>
                <input required autoFocus value={newEvent.title} onChange={e=>setNewEvent({...newEvent,title:e.target.value})} placeholder="e.g. Submit draft" style={inp} />
              </div>
              <div>
                <label style={{ display:'block',fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:1,marginBottom:6 }}>Event Type</label>
                <select value={newEvent.type} onChange={e=>setNewEvent({...newEvent,type:e.target.value})} style={{...inp,colorScheme:'dark',cursor:'pointer'}}>
                  <option value="task">Task</option>
                  <option value="submission_deadline">Submission Deadline</option>
                  <option value="defense">Defense</option>
                  <option value="checkpoint">Checkpoint</option>
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block',fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:1,marginBottom:6 }}>Date *</label>
                  <input required type="date" value={newEvent.date} onChange={e=>setNewEvent({...newEvent,date:e.target.value})} style={{...inp,colorScheme:'dark'}} />
                </div>
                <div>
                  <label style={{ display:'block',fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:1,marginBottom:6 }}>Time</label>
                  <input type="time" value={newEvent.time} onChange={e=>setNewEvent({...newEvent,time:e.target.value})} style={{...inp,colorScheme:'dark'}} />
                </div>
              </div>
              {myProjects.length > 1 && (
                <div>
                  <label style={{ display:'block',fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:1,marginBottom:6 }}>Project</label>
                  <select value={newEvent.selectedProjectId} onChange={e=>setNewEvent({...newEvent,selectedProjectId:e.target.value})} style={{...inp,colorScheme:'dark',cursor:'pointer'}}>
                    {myProjects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display:'flex', gap:10, paddingTop:6 }}>
                <button type="button" onClick={()=>setShowModal(false)} style={{ padding:'10px 20px',borderRadius:10,border:'1px solid rgba(255,255,255,0.12)',background:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:12,fontWeight:600 }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex:1,padding:'10px 20px',borderRadius:10,border:'none',background:'#e74c3c',color:'#fff',cursor:'pointer',fontSize:12,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:submitting?0.6:1 }}>
                  {submitting?<Loader2 size={14} className="animate-spin"/>:<Plus size={14}/>}
                  {submitting?'Saving...':'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
