// StatusModal - Modal for updating claim status
// Includes status dropdown and optional catatan/feedback

import { useState } from 'react';
import type { ClaimStatus, StatusUpdateRequest } from '../../../services/vedikaService';

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    noRawat: string;
    currentStatus?: ClaimStatus;
    onSubmit: (data: StatusUpdateRequest) => Promise<void>;
    isLoading?: boolean;
}

const STATUS_OPTIONS: { value: ClaimStatus; label: string; description: string }[] = [
    { value: 'RENCANA', label: 'Rencana', description: 'Episode siap diklaim' },
    { value: 'PENGAJUAN', label: 'Pengajuan', description: 'Sudah diajukan ke BPJS' },
    { value: 'PERBAIKAN', label: 'Perbaikan', description: 'Dikembalikan untuk koreksi' },
    { value: 'LENGKAP', label: 'Lengkap', description: 'Berkas lengkap' },
    { value: 'SETUJU', label: 'Disetujui', description: 'Klaim disetujui BPJS' },
];

export default function StatusModal({
    isOpen,
    onClose,
    noRawat,
    currentStatus = 'RENCANA',
    onSubmit,
    isLoading = false,
}: StatusModalProps) {
    const [status, setStatus] = useState<ClaimStatus>(currentStatus);
    const [catatan, setCatatan] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await onSubmit({ status, catatan: catatan.trim() || undefined });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal mengubah status');
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setStatus(currentStatus);
            setCatatan('');
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Ubah Status Klaim
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No. Rawat: <span className="font-mono">{noRawat}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Status Selection */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status Klaim
                        </label>
                        <div className="space-y-2">
                            {STATUS_OPTIONS.map((opt) => (
                                <label
                                    key={opt.value}
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${status === opt.value
                                            ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/20'
                                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={opt.value}
                                        checked={status === opt.value}
                                        onChange={() => setStatus(opt.value)}
                                        className="h-4 w-4 border-gray-300 text-brand-500 focus:ring-brand-500"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {opt.label}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {opt.description}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Catatan */}
                    <div className="mb-5">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Catatan / Umpan Balik (opsional)
                        </label>
                        <textarea
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            rows={3}
                            placeholder="Tambahkan catatan jika diperlukan..."
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Status'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
