// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { useAuth } from './AuthContext';
// import api from '../services/api';

// const CoinContext = createContext();

// export const useCoins = () => {
//   const context = useContext(CoinContext);
//   if (!context) {
//     throw new Error('useCoins must be used within a CoinProvider');
//   }
//   return context;
// };

// export const CoinProvider = ({ children }) => {
//   const { user, updateUser } = useAuth();
//   const [balance, setBalance] = useState(0);
//   const [totalEarned, setTotalEarned] = useState(0);
//   const [transactions, setTransactions] = useState([]);
//   const [freeServiceUntil, setFreeServiceUntil] = useState(null);
//   const [isServiceFree, setIsServiceFree] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const fetchCoinData = useCallback(async () => {
//     if (!user) return;
    
//     try {
//       setLoading(true);
//       const response = await api.get('/resident/coins');
//       setBalance(response.data.balance || 0);
//       setTotalEarned(response.data.totalEarned || 0);
//       setTransactions(response.data.transactions || []);
//       setFreeServiceUntil(response.data.freeServiceUntil);
//       setIsServiceFree(response.data.isServiceFree || false);
      
//       // Update user in auth context if needed
//       if (user.coins !== response.data.balance) {
//         updateUser({ ...user, coins: response.data.balance });
//       }
//     } catch (error) {
//       console.error('Failed to fetch coin data:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [user, updateUser]);

//   useEffect(() => {
//     fetchCoinData();
//   }, [fetchCoinData]);

//   // Get progress towards next free service
//   const getProgressToFreeService = () => {
//     const needed = 1000 - totalEarned;
//     const percentage = Math.min((totalEarned / 1000) * 100, 100);
//     return {
//       earned: totalEarned,
//       needed: Math.max(0, needed),
//       percentage,
//       canRedeem: totalEarned >= 1000 && !isServiceFree
//     };
//   };

//   // Redeem coins for free service
//   const redeemForFreeService = async () => {
//     try {
//       const response = await api.post('/payments/redeem');
//       await fetchCoinData();
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   };

//   const value = {
//     balance,
//     totalEarned,
//     transactions,
//     freeServiceUntil,
//     isServiceFree,
//     loading,
//     fetchCoinData,
//     getProgressToFreeService,
//     redeemForFreeService
//   };

//   return (
//     <CoinContext.Provider value={value}>
//       {children}
//     </CoinContext.Provider>
//   );
// };






// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { useAuth } from './AuthContext';
// import { socket } from '../services/api';
// import api from '../services/api';
// import { toast } from 'react-toastify';

// const CoinContext = createContext();

// export const useCoins = () => {
//   const context = useContext(CoinContext);
//   if (!context) {
//     throw new Error('useCoins must be used within a CoinProvider');
//   }
//   return context;
// };

// export const CoinProvider = ({ children }) => {
//   const { user } = useAuth();
//   const [balance, setBalance] = useState(0);
//   const [totalEarned, setTotalEarned] = useState(0);
//   const [transactions, setTransactions] = useState([]);
//   const [freeServiceUntil, setFreeServiceUntil] = useState(null);
//   const [isServiceFree, setIsServiceFree] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const fetchCoinData = useCallback(async () => {
//     if (!user) return;
    
//     try {
//       setLoading(true);
//       const response = await api.get('/resident/coins');
      
//       if (response.data.success) {
//         setBalance(response.data.balance || 0);
//         setTotalEarned(response.data.totalEarned || 0);
//         setTransactions(response.data.transactions || []);
//         setFreeServiceUntil(response.data.freeServiceUntil);
//         setIsServiceFree(response.data.isServiceFree || false);
//       }
//     } catch (error) {
//       console.error('Failed to fetch coin data:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchCoinData();
//   }, [fetchCoinData]);

//   // Listen for socket events for coin updates
//   useEffect(() => {
//     if (!user || !socket) return;

//     const handleCoinUpdate = (data) => {
//       setBalance(data.newBalance);
//       setTotalEarned(data.totalEarned);
      
//       if (data.freeServiceUnlocked) {
//         setIsServiceFree(true);
//         setFreeServiceUntil(data.freeServiceUntil);
//         toast.success('🎉 Congratulations! You unlocked 1 month of free service!');
//       }
      
//       fetchCoinData(); // Refresh data
//     };

//     const handleApplicationApproved = (data) => {
//       toast.success(data.message);
//       fetchCoinData();
//     };

//     socket.on('coinUpdate', handleCoinUpdate);
//     socket.on('applicationApproved', handleApplicationApproved);

//     return () => {
//       socket.off('coinUpdate', handleCoinUpdate);
//       socket.off('applicationApproved', handleApplicationApproved);
//     };
//   }, [user, fetchCoinData]);

//   // Get progress towards next free service
//   const getProgressToFreeService = () => {
//     const needed = 1000 - totalEarned;
//     const percentage = Math.min((totalEarned / 1000) * 100, 100);
//     return {
//       earned: totalEarned,
//       needed: Math.max(0, needed),
//       percentage,
//       canRedeem: totalEarned >= 1000 && !isServiceFree
//     };
//   };

//   // Redeem coins for free service
//   const redeemForFreeService = async () => {
//     try {
//       const response = await api.post('/payments/redeem');
      
//       if (response.data.success) {
//         toast.success(response.data.message);
//         await fetchCoinData();
//         return response.data;
//       }
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to redeem coins';
//       toast.error(message);
//       throw error;
//     }
//   };

//   const value = {
//     balance,
//     totalEarned,
//     transactions,
//     freeServiceUntil,
//     isServiceFree,
//     loading,
//     fetchCoinData,
//     getProgressToFreeService,
//     redeemForFreeService
//   };

//   return (
//     <CoinContext.Provider value={value}>
//       {children}
//     </CoinContext.Provider>
//   );
// };


import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CoinContext = createContext();

const THRESHOLD = 1000;

export const CoinProvider = ({ children }) => {
  const { user } = useAuth();

  const [balance,         setBalance]         = useState(0);
  const [totalEarned,     setTotalEarned]     = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [coinsUntilFree,  setCoinsUntilFree]  = useState(THRESHOLD);
  const [isServiceFree,   setIsServiceFree]   = useState(false);
  const [freeServiceUntil,setFreeServiceUntil]= useState(null);
  const [freeMonthsTotal, setFreeMonthsTotal] = useState(0);
  const [loading,         setLoading]         = useState(false);

  const fetchCoinData = useCallback(async () => {
    if (!user || user.role !== 'resident') return;
    try {
      setLoading(true);
      const res = await api.get('/resident/coins');
      const d   = res.data;

      const earned  = d.totalEarned    || 0;
      const pct     = d.progressPercent ?? Math.min(Math.round((earned % THRESHOLD) / THRESHOLD * 100), 100);
      const until   = d.coinsUntilFree  ?? Math.max(0, THRESHOLD - (earned % THRESHOLD));

      setBalance(d.balance           || 0);
      setTotalEarned(earned);
      setProgressPercent(pct);
      setCoinsUntilFree(until);
      setIsServiceFree(d.isServiceFree   || false);
      setFreeServiceUntil(d.freeServiceUntil || null);
      setFreeMonthsTotal(d.freeMonthsTotal   || 0);
    } catch (err) {
      console.error('CoinContext fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on mount and when user changes
  useEffect(() => {
    if (user?.role === 'resident') fetchCoinData();
  }, [user, fetchCoinData]);

  // ── getProgressToFreeService ──────────────────────────────
  // Returns all values the dashboard needs in one object
  const getProgressToFreeService = useCallback(() => {
    const earned     = totalEarned;
    const pct        = progressPercent;
    const canRedeem  = earned >= THRESHOLD;
    const until      = coinsUntilFree;

    return {
      earned,          // total coins earned ever
      percentage: pct, // 0-100 for progress bar
      canRedeem,       // true when earned >= 1000
      coinsUntilFree: until,
      threshold: THRESHOLD
    };
  }, [totalEarned, progressPercent, coinsUntilFree]);

  return (
    <CoinContext.Provider value={{
      balance,
      totalEarned,
      progressPercent,
      coinsUntilFree,
      isServiceFree,
      freeServiceUntil,
      freeMonthsTotal,
      loading,
      fetchCoinData,
      getProgressToFreeService
    }}>
      {children}
    </CoinContext.Provider>
  );
};

export const useCoins = () => {
  const ctx = useContext(CoinContext);
  if (!ctx) throw new Error('useCoins must be used inside CoinProvider');
  return ctx;
};

export default CoinContext;