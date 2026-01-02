// components/UnsavedChangesDialog.tsx

import React from "react";

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
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Unsaved Changes
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          You have {pendingChangesCount} unsaved changes. Do you want to save them before continuing?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onDiscard}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Discard
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};