"use client";

import { useEffect, useState } from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesModalProps {
  isDirty: boolean;
  onNavigate: () => void;
}

export function UnsavedChangesModal({ isDirty, onNavigate }: UnsavedChangesModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    // Intercept default beforeunload for browser refresh/close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Expose a method to UI components to check navigation
  // Note: in Next.js App Router, intercepting next/link is tricky. 
  // We recommend wrapping action buttons that change route.

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
      <div className="relative z-[101] w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Modifications non enregistrées</h3>
            <p className="text-sm text-gray-500 mt-2">
              Si vous quittez cette page, vous perdrez toutes les données non sauvegardées.
            </p>
          </div>
          <div className="flex flex-col w-full gap-2 mt-4">
            <Button 
              variant="default" 
              className="w-full bg-amber-500 hover:bg-amber-600"
              onClick={() => {
                setShowModal(false);
                onNavigate();
              }}
            >
              Ignorer et Quitter
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowModal(false)}
            >
              Rester sur la page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
