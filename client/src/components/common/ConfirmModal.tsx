"use client";

import { useConfirmStore } from "@/store/confirm.store";

export default function ConfirmModal() {
  const { isOpen, message, resolve, close } = useConfirmStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    resolve?.(true);
    close();
  };

  const handleCancel = () => {
    resolve?.(false);
    close();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card rounded-2xl p-6 w-[90%] max-w-sm space-y-4 border-2 border-border">
        <p className="text-sm text-foreground">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-border text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-destructive text-white text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}