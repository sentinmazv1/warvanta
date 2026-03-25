"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, StickyNote, Search, Loader2, 
  ChevronRight, Calendar, Hash, MoreVertical,
  Edit2, Check
} from "lucide-react";
import { getNotes, addNote, updateNote, deleteNote } from "@/lib/actions/notes";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = [
    { label: 'Mavi', value: 'blue', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', dot: 'bg-blue-400' },
    { label: 'Sarı', value: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-600', dot: 'bg-yellow-400' },
    { label: 'Yeşil', value: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', dot: 'bg-emerald-400' },
    { label: 'Kırmızı', value: 'rose', bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', dot: 'bg-rose-400' },
    { label: 'Mor', value: 'purple', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', dot: 'bg-purple-400' },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [newNote, setNewNote] = useState({ title: "", content: "", color: "blue" });

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAdd() {
    if (!newNote.title.trim()) return;
    setIsAdding(true);
    try {
      const added = await addNote(newNote.title, newNote.content, newNote.color);
      setNotes([added, ...notes]);
      setNewNote({ title: "", content: "", color: "blue" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu notu silmek istediğinize emin misiniz?")) return;
    try {
      await deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
             <StickyNote className="text-blue-600" size={32} /> Kişisel Defter
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Sadece sizin görebileceğiniz özel notlar ve hatırlatıcılar.</p>
        </div>
        
        <div className="relative group min-w-[300px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Notlarda ara..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-blue-500/5 outline-none font-medium text-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Ad New Note Sidebar */}
        <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 space-y-6 sticky top-24">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    <Plus size={14} /> Yeni Not Oluştur
                </div>
                
                <div className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Başlık..."
                        className="w-full bg-slate-50 border-transparent px-5 py-4 rounded-2xl font-bold text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    />
                    <textarea 
                        placeholder="Notunuzu buraya yazın..."
                        rows={5}
                        className="w-full bg-slate-50 border-transparent px-5 py-4 rounded-2xl font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none resize-none"
                        value={newNote.content}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    />
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                        {COLORS.map(c => (
                            <button 
                                key={c.value}
                                onClick={() => setNewNote({ ...newNote, color: c.value })}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${newNote.color === c.value ? 'border-slate-400 scale-110' : 'border-transparent hover:scale-105'} ${c.dot}`}
                                title={c.label}
                            />
                        ))}
                    </div>

                    <button 
                        onClick={handleAdd}
                        disabled={isAdding || !newNote.title.trim()}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs shadow-xl shadow-slate-900/20 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition-all flex items-center justify-center gap-2"
                    >
                        {isAdding ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                        NOTU KAYDET
                    </button>
                </div>
            </div>
        </div>

        {/* Note Grid */}
        <div className="lg:col-span-3">
            {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
            ) : filteredNotes.length > 0 ? (
                <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredNotes.map((note) => {
                            const colorScheme = COLORS.find(c => c.value === note.color) || COLORS[0];
                            return (
                                <motion.div 
                                    key={note.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`relative p-8 rounded-[2.5rem] border ${colorScheme.bg} ${colorScheme.border} flex flex-col h-full min-h-[220px] transition-all hover:shadow-2xl hover:shadow-slate-900/5 group overflow-hidden`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${colorScheme.dot}`}></div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${colorScheme.text}`}>
                                                {new Date(note.created_at).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(note.id)}
                                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 bg-white shadow-sm border border-slate-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    
                                    <h4 className="text-lg font-black text-slate-900 mb-3 leading-tight">{note.title}</h4>
                                    <p className="text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                    
                                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/30 rounded-full blur-2xl"></div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <StickyNote className="text-slate-200" size={32} />
                    </div>
                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">İlk notunuzu soldaki panelden ekleyerek başlayın.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
