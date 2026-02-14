const StatCard = ({ icon: Icon, label, value, subValue, color = "violet" }) => {
  const colorMap = {
    violet:
      "from-violet-500/10 to-violet-600/5 border-violet-500/20 text-violet-400",
    sky: "from-sky-500/10 to-sky-600/5 border-sky-500/20 text-sky-400",
    emerald:
      "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    amber:
      "from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400",
    rose: "from-rose-500/10 to-rose-600/5 border-rose-500/20 text-rose-400",
  };

  const iconBg = {
    violet: "bg-violet-500/10 text-violet-400",
    sky: "bg-sky-500/10 text-sky-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    rose: "bg-rose-500/10 text-rose-400",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colorMap[color]} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subValue && (
            <p className="text-xs text-slate-500 mt-1">{subValue}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconBg[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {/* Decorative gradient orb */}
      <div
        className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${colorMap[color]} opacity-20 blur-2xl`}
      />
    </div>
  );
};

export default StatCard;
