export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status) => {
  const colors = {
    Vacant: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Occupied: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    OccupiedVacant: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Verified: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    Paid: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  };
  return colors[status] || "text-gray-400 bg-gray-400/10 border-gray-400/20";
};

export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
};
