// components/UnsavedChangesDialog.tsx

import React from "react";
import { useTranslation } from "react-i18next";

interface UnsavedChangesDialogProps {
  show: boolean;
  pendingChangesCount: number;
  onSave: () => void;
  onDiscard: () => void;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  show,
  pendingChangesCount,
  onSave,
  onDiscard,
}) => {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('CalendarView.unsavedDialog.title')}
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {t('CalendarView.unsavedDialog.message', { count: pendingChangesCount })}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onDiscard}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            {t('CalendarView.unsavedDialog.discard')}
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
          >
            {t('CalendarView.unsavedDialog.saveAndContinue')}
          </button>
        </div>
      </div>
    </div>
  );
};