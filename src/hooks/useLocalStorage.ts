import { useState, useEffect, useCallback } from 'react';
import { AppData, DEFAULT_APP_DATA, DEFAULT_ACCOUNTS, Currency } from '@/types/expense';

const STORAGE_KEY = 'expense-tracker-data';

export function useLocalStorage() {
  const [data, setDataState] = useState<AppData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // handle accounts
        const accounts = (parsed.accounts || []).map((account: any) => {
          const baseAccount = DEFAULT_ACCOUNTS[0];
          
          let newBalances = {};
          if (account.balances) {
            newBalances = account.balances;
          } else {
            // no balances so initialize balanaces for supportedCurrencies
            (account.supportedCurrencies || baseAccount.supportedCurrencies).forEach((currency: Currency) => {
              newBalances[currency] = 0;
            });
          }

          return {
            ...baseAccount,
            ...account,
            balances: newBalances,
            supportedCurrencies: account.supportedCurrencies || baseAccount.supportedCurrencies,
          };
        });

        // push default accounts if no accounts
        if (accounts.length === 0) {
          accounts.push(...DEFAULT_ACCOUNTS);
        }

        const mergedData = {
          ...DEFAULT_APP_DATA,
          ...parsed,
          config: { ...DEFAULT_APP_DATA.config, ...parsed.config },
          categories: parsed.categories?.length > 0 ? parsed.categories : DEFAULT_APP_DATA.categories,
          accounts: accounts,
          monthlyExpenses: parsed.monthlyExpenses?.length > 0 ? parsed.monthlyExpenses : DEFAULT_APP_DATA.monthlyExpenses,
          incomes: parsed.incomes?.length > 0 ? parsed.incomes : DEFAULT_APP_DATA.incomes,
        };
        return mergedData;
      }
    } catch (e) {
      console.error('Failed to parse stored data:', e);
    }
    return DEFAULT_APP_DATA;
  });

  const setData = useCallback((updater: AppData | ((prev: AppData) => AppData)) => {
    setDataState((prev) => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      } catch (e) {
        console.error('Failed to save data:', e);
      }
      return newData;
    });
  }, []);

  // sync on storage events from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          
          // handle accounts
          const accounts = (parsed.accounts || []).map((account: any) => {
            const baseAccount = DEFAULT_ACCOUNTS[0];
            let newBalances: Partial<Record<Currency, number>> = {};
            if (account.balances) {
              newBalances = account.balances;
            } else {
              (account.supportedCurrencies || baseAccount.supportedCurrencies).forEach((currency: Currency) => {
                newBalances[currency] = 0;
              });
            }

            return {
              ...baseAccount,
              ...account,
              balances: newBalances,
              supportedCurrencies: account.supportedCurrencies || baseAccount.supportedCurrencies,
            };
          });

          if (accounts.length === 0) {
            accounts.push(...DEFAULT_ACCOUNTS);
          }

          setData((prev) => ({
            ...DEFAULT_APP_DATA,
            ...parsed,
            config: { ...DEFAULT_APP_DATA.config, ...parsed.config },
            categories: parsed.categories?.length > 0 ? parsed.categories : DEFAULT_APP_DATA.categories,
            accounts: accounts,
            monthlyExpenses: parsed.monthlyExpenses?.length > 0 ? parsed.monthlyExpenses : DEFAULT_APP_DATA.monthlyExpenses,
            incomes: parsed.incomes?.length > 0 ? parsed.incomes : DEFAULT_APP_DATA.incomes,
          }));
        } catch (err) {
          console.error('Failed to parse storage event:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('change', handleStorage);
  }, []);

  return { data, setData };
}