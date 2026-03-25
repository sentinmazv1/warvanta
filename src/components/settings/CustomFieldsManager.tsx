"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Settings2, Save, X, List, Hash, Calendar, Type } from "lucide-react";
import { CustomFieldDefinition } from "@/lib/types";
import { getCustomFieldDefinitions, saveCustomFieldDefinition } from "@/lib/actions/fields";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomFieldsManager() {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [newField, setNewField] = useState<Partial<CustomFieldDefinition>>({
    name: "",
    label: "",
    field_type: "TEXT",
    is_required: false,
    options: []
  });

  const [optionInput, setOptionInput] = useState("");

  useEffect(() => {
    loadFields();
  }, []);

  async function loadFields() {
    const data = await getCustomFieldDefinitions();
    setFields(data);
    setIsLoading(false);
  }

  async function handleSave() {
    if (!newField.name || !newField.label) return;
    
    // Auto-generate name from label if empty
    const finalName = newField.name || newField.label.toLowerCase().replace(/\s+/g, '_');
    
    await saveCustomFieldDefinition({ ...newField, name: finalName });
    setIsAdding(false);
    setNewField({ name: "", label: "", field_type: "TEXT", is_required: false, options: [] });
    loadFields();
  }

  const addOption = () => {
    if (!optionInput.trim()) return;
    setNewField({ ...newField, options: [...(newField.options || []), optionInput.trim()] });
    setOptionInput("");
  };

  const removeOption = (idx: number) => {
    const next = [...(newField.options || [])];
    next.splice(idx, 1);
    setNewField({ ...newField, options: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings2 className="text-blue-600" size={24} /> Dinamik Personel Alanları
          </h2>
          <p className="text-slate-500 text-xs mt-1">Personel kartlarına eklemek istediğiniz özel parametreleri buradan tanımlayın.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-900/10 hover:bg-blue-700 transition-all"
        >
          <Plus size={18} /> Yeni Alan Ekle
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl overflow-hidden border border-slate-800"
          >
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-lg font-bold tracking-tight">Yeni Özel Alan Tanımla</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Alan Etiketi (Görünen İsim)</label>
                  <input 
                    type="text" 
                    placeholder="Örn: Ayakkabı Numarası"
                    className="w-full bg-slate-800/50 border border-slate-700 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    value={newField.label}
                    onChange={(e) => setNewField({...newField, label: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Veri Tipi</label>
                  <div className="grid grid-cols-2 gap-3">
                    <TypeButton active={newField.field_type === 'TEXT'} onClick={() => setNewField({...newField, field_type: 'TEXT'})} icon={<Type size={16}/>} label="Metin" />
                    <TypeButton active={newField.field_type === 'NUMBER'} onClick={() => setNewField({...newField, field_type: 'NUMBER'})} icon={<Hash size={16}/>} label="Sayı" />
                    <TypeButton active={newField.field_type === 'DATE'} onClick={() => setNewField({...newField, field_type: 'DATE'})} icon={<Calendar size={16}/>} label="Tarih" />
                    <TypeButton active={newField.field_type === 'SELECT'} onClick={() => setNewField({...newField, field_type: 'SELECT'})} icon={<List size={16}/>} label="Seçim Listesi" />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                   <div className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={newField.is_required}
                        onChange={(e) => setNewField({...newField, is_required: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-bold text-slate-300">Zorunlu Alan</span>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                {newField.field_type === 'SELECT' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Liste Seçenekleri</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text" 
                        className="flex-1 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        placeholder="Seçenek ekle..."
                        value={optionInput}
                        onChange={(e) => setOptionInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addOption()}
                      />
                      <button onClick={addOption} className="bg-slate-700 p-2 rounded-xl hover:bg-slate-600"><Plus size={20} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newField.options?.map((opt, i) => (
                        <span key={i} className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                          {opt} <button onClick={() => removeOption(i)}><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="p-6 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700 text-slate-500 text-xs italic">
                   Bu alan kaydedildikten sonra tüm personel kartlarında görünecektir.
                </div>

                <div className="flex justify-end gap-3 pt-6">
                    <button onClick={handleSave} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-900/40 transition-all flex items-center justify-center gap-2">
                      <Save size={18} /> Özellik Kaydet
                    </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map(field => (
          <motion.div 
            layout
            key={field.id}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  {field.field_type === 'TEXT' && <Type size={18}/>}
                  {field.field_type === 'NUMBER' && <Hash size={18}/>}
                  {field.field_type === 'DATE' && <Calendar size={18}/>}
                  {field.field_type === 'SELECT' && <List size={18}/>}
                </div>
                {field.is_required && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">ZORUNLU</span>
                )}
              </div>
              <h4 className="font-bold text-slate-900">{field.label}</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">{field.name}</p>
              
              {field.field_type === 'SELECT' && (
                <div className="flex flex-wrap gap-1 mt-4">
                  {field.options?.slice(0, 3).map((opt, i) => (
                    <span key={i} className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-medium">{opt}</span>
                  ))}
                  {(field.options?.length || 0) > 3 && <span className="text-[9px] text-slate-400">+{field.options!.length - 3} daha</span>}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {fields.length === 0 && !isLoading && !isAdding && (
          <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
            Henüz dinamik alan tanımlanmamış.
          </div>
        )}
      </div>
    </div>
  );
}

function TypeButton({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 ${
        active 
          ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20' 
          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
      }`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
