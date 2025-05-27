import { create } from 'zustand';
import { Consultant } from '@/types/consultant';

interface StateStore {
  consultant: Consultant | null;
  setConsultant: (consultant: Consultant) => void;
  phoneAndEmailVerify: {
    isOpen: boolean;
    phone: string;
    email: string;
    verifiedNumber: { phone_number: string; updated_at: string }[] | undefined;
    verifiedEmail: { email: string; updated_at: string }[] | undefined;
    isRequired: boolean;
    onClose: () => void;
  };
  setPhoneAndEmailVerify: (
    phoneAndEmailVerify: StateStore['phoneAndEmailVerify']
  ) => void;
}

export const useStateStore = create<StateStore>((set) => ({
  consultant: null,
  setConsultant: (consultant) => set({ consultant }),
  phoneAndEmailVerify: {
    isOpen: false,
    phone: '',
    email: '',
    verifiedNumber: [],
    verifiedEmail: [],
    isRequired: false,
    onClose: () => {}
  },
  setPhoneAndEmailVerify: (phoneAndEmailVerify) => set({ phoneAndEmailVerify })
}));
