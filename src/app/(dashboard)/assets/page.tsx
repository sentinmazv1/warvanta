import AssetList from "@/components/assets/AssetList";
import { Box } from "lucide-react";

export default function AssetsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Box className="text-blue-600" size={28} /> Zimmet & Varlık Takibi
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Şirket envanterindeki donanım ve yazılım varlıklarını personellere zimmetleyin.</p>
      </div>
      
      <AssetList />
    </div>
  );
}
