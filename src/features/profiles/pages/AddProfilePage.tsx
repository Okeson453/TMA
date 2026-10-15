import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AddProfileForm } from '../components/AddProfileForm';
import { useProfiles } from '../hooks/useProfiles';
import { CreateProfile } from '../../../types/api';
import { telegram } from '../../../shared/lib/telegram';

export const AddProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { add } = useProfiles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    telegram.haptic.impact('light');
    navigate('/');
  };

  const handleSubmit = async (data: CreateProfile) => {
    setIsSubmitting(true);
    try {
      await add(data);
      telegram.haptic.notification('success');
      navigate('/');
    } catch (err: any) {
      telegram.haptic.notification('error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#17212b] text-white flex flex-col font-sans">
      <header className="sticky top-0 z-30 bg-[#17212b]/95 backdrop-blur-md border-b border-white/10 px-4 py-3.5">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-1 -ml-1 text-[#708499] hover:text-white rounded-lg active:scale-95 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white">Add Target Account</h1>
            <p className="text-[11px] text-[#708499]">Configure Cookie Vault & Fingerprint</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-4">
        <AddProfileForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </main>
    </div>
  );
};
