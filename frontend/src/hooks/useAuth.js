import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";

/**
 * Custom hook: returns loading/error/data for any async fetch function.
 */
export const useFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchFn();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
};

/**
 * Hook to check if the current user has a given role
 */
export const useAuth = () => {
  const { user, token } = useSelector((state) => state.auth);

  return {
    user,
    token,
    isAuthenticated: !!token,
    isLandlord: user?.roles?.isLandlord || false,
    isRenter: user?.roles?.isRenter || false,
    isAdmin: user?.accountType === "Admin",
  };
};
