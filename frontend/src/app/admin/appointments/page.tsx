export default function AppointmentsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Gestion des rendez-vous</h2>
        <button className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700">Nouveau rendez-vous</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <p className="text-slate-500">Liste des rendez-vous à venir...</p>
      </div>
    </div>
  );
}
