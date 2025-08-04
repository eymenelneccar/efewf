import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import QuickAddModal from "@/components/modals/quick-add-modal";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <p className="text-slate-600 mt-1">{subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setShowQuickAdd(true)}
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة جديد
            </Button>
          </div>
        </div>
      </header>

      <QuickAddModal open={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
    </>
  );
}
