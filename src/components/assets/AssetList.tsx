"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, Filter, Shield, User, 
  MapPin, Clock, MoreHorizontal, ArrowRightLeft,
  Loader2, Laptop, Smartphone, Monitor, Briefcase, Trash2
} from "lucide-react";
import { getAssets, returnAsset } from "@/lib/actions/assets";
import { Asset } from "@/lib/types";
import AddAssetModal from "./AddAssetModal";
import AssetAssignmentModal from "./AssetAssignmentModal";

export default function AssetList() {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleReturn = async (id: string) => {
    if (!confirm("Bu zimmeti iade almak istediğinize emin misiniz?")) return;
    try {
      await returnAsset(id);
      loadAssets();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.serial_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Ürün adı veya seri no ile ara..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={18} />
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={18} /> Yeni Varlık Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((asset) => (
            <div key={asset.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all group border-b-4 border-b-transparent hover:border-b-blue-500">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                     asset.status === 'ASSIGNED' ? 'bg-orange-50 border-orange-100 text-orange-500' : 'bg-emerald-50 border-emerald-100 text-emerald-500'
                  }`}>
                    <AssetIcon type={asset.type} />
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-900">{asset.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{asset.serial_no || 'SERİ NO BELİRTİLMEDİ'}</p>
                  </div>

                  {asset.status === 'ASSIGNED' ? (
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                           <User size={14} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Zimmet Sahibi</p>
                          <p className="text-xs font-bold text-slate-900">{asset.employee?.first_name} {asset.employee?.last_name}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleReturn(asset.id)}
                        className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                      >
                        İade Al
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/30 rounded-2xl p-4 flex items-center justify-between border border-emerald-100/50">
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Envanterde Boşta</span>
                       <button 
                        onClick={() => { setSelectedAsset(asset); setIsAssignModalOpen(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-900/10 hover:bg-emerald-700 transition-all"
                       >
                         <ArrowRightLeft size={10} /> Zimmetle
                       </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                     <span className="text-[9px] font-bold text-slate-400">Eklendi: {new Date(asset.created_at).toLocaleDateString('tr-TR')}</span>
                     <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
                        <MapPin size={10} /> {asset.location || 'Depo'}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-slate-400">
             Varlık kaydı bulunamadı.
          </div>
        )}
      </div>

      <AddAssetModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={loadAssets} 
      />

      <AssetAssignmentModal 
        isOpen={isAssignModalOpen} 
        asset={selectedAsset}
        onClose={() => setIsAssignModalOpen(false)} 
        onSuccess={loadAssets} 
      />
    </div>
  );
}

function AssetIcon({ type }: { type: string }) {
  switch (type) {
    case 'COMPUTER': return <Laptop size={24} />;
    case 'PHONE': return <Smartphone size={24} />;
    case 'MONITOR': return <Monitor size={24} />;
    default: return <Briefcase size={24} />;
  }
}
