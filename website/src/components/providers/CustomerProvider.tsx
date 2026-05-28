// src/components/providers/CustomerProvider.tsx
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCustomer, setLoading } from "@/src/store/customerSlice";
import { customerMeApi } from "@/src/app/(auth)/login/api";
import { RootState } from "@/src/store/store";

const CustomerProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => (state as any).customer.isAuthenticated);

  useEffect(() => {
    // Only fetch if not already authenticated in store
    if (!isAuthenticated) {
      const fetchCustomer = async () => {
        dispatch(setLoading(true));
        try {
          const res = await customerMeApi();
          if (res.success && res.data) {
            dispatch(setCustomer(res.data));
          }
        } catch (error) {
          // Not logged in, do nothing
        } finally {
          dispatch(setLoading(false));
        }
      };
      fetchCustomer();
    }
  }, []);

  return <>{children}</>;
};

export default CustomerProvider;