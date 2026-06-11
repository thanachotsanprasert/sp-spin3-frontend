import { useState, useEffect, useCallback } from 'react';
import { getStaff, updateStaffStatus, inviteStaff, deleteStaff as deleteStaffAPI } from '../api/staff';

export const useStaff = () => {
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchStaff = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const data = await getStaff();
      setStaff(data ?? []);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const toggleLock = async ({ id, isLocked }) => {
    await updateStaffStatus(id, isLocked);
    await fetchStaff();
  };

  const inviteStaffFn = async ({ email, role }) => {
    await inviteStaff(email, role);
    await fetchStaff();
  };

  const removeStaff = async ({ id }) => {
    try {
      await deleteStaffAPI(id)
      await fetchStaff()
    } catch (err) {
      console.error('Delete staff failed:', err.message)
      throw err
    }
  }

  return {
    staff,
    isLoading,
    isError,
    toggleLock,
    inviteStaff: inviteStaffFn,
    removeStaff,
  };
};
