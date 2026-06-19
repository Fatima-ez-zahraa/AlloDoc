export default function WaitlistPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">File d&apos;attente (annulations)</h2>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <p className="text-slate-500">Patients en attente de créneaux libérés...</p>
      </div>
    </div>
  );
}
