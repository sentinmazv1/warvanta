import LeaveList from "@/components/hr/LeaveList";
import { Calendar } from "lucide-react";

export default function LeavesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
           İzin & Talep Yönetimi
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Personel izin taleplerini inceleyin, onaylayın ve yıllık izin bakiyelerini takip edin.</p>
      </div>
      
      <LeaveList />
    </div>
  );
}
