// ProcedureModal - Modal for editing procedure (ICD-9)
// Allows adding/editing procedure code

import { useState } from 'react';
import type { ProcedureUpdateRequest } from '../../../services/vedikaService';

interface ProcedureModalProps {
    isOpen: boolean;
    onClose: () => void;
    noRawat: string;
    onSubmit: (data: ProcedureUpdateRequest) => Promise<void>;
    isLoading?: boolean;
}

export default function ProcedureModal({
    isOpen,
    onClose,
    noRawat,
    onSubmit,
    isLoading = false,
}: ProcedureModalProps) {
    const [kode, setKode] = useState('');
    const [prioritas, setPrioritas] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!kode.trim()) {
            setError('Kode prosedur (ICD-9) wajib diisi');
            return;
        }

        try {
            await onSubmit({
                kode: kode.trim(),
                prioritas,
            });
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan prosedur');
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setKode('');
            setPrioritas(1);
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
                            Edit Prosedur (ICD-9)
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
                    {/* Kode Prosedur */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Kode Prosedur (ICD-9) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={kode}
                            onChange={(e) => setKode(e.target.value)}
                            placeholder="Contoh: 99.25, 88.72"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-700 placeholder:text-gray-400 placeholder:normal-case focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Masukkan kode ICD-9 sesuai tindakan yang dilakukan
                        </p>
                    </div>

                    {/* Prioritas */}
                    <div className="mb-5">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Prioritas
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={prioritas}
                            onChange={(e) => setPrioritas(Number(e.target.value))}
                            className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            1 = prioritas tertinggi (prosedur utama)
                        </p>
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
                            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
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
                                'Simpan Prosedur'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
