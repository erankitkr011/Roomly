const EmptyState = ({ icon: Icon, title, description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            {Icon && (
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 mb-4">
                    <Icon className="w-10 h-10 text-slate-500" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-500 text-center max-w-sm mb-6">{description}</p>
            {action && action}
        </div>
    );
};

export default EmptyState;
