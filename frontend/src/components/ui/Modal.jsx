import { HiXMark } from "react-icons/hi2";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            {/* Modal */}
            <div
                className={`relative ${sizeClasses[size]} w-full bg-slate-800 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-200`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <HiXMark className="w-5 h-5" />
                    </button>
                </div>
                {/* Body */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
