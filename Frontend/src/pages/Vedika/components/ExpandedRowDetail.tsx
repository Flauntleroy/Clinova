import { useState } from 'react';
import {
    vedikaService,
    type IndexEpisode,
    type ClaimStatus
} from '../../../services/vedikaService';

interface ExpandedRowDetailProps {
    item: IndexEpisode;
    onRefresh: () => void;
}

const STATUS_OPTIONS: { value: ClaimStatus; label: string; color: string }[] = [
    { value: 'RENCANA', label: 'Rencana', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
    { value: 'PENGAJUAN', label: 'Pengajuan', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { value: 'PERBAIKAN', label: 'Perbaikan', color: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300' },
    { value: 'LENGKAP', label: 'Lengkap', color: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300' },
    { value: 'SETUJU', label: 'Disetujui', color: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' },
];

export default function ExpandedRowDetail({ item, onRefresh }: ExpandedRowDetailProps) {
    const [selectedStatus, setSelectedStatus] = useState<ClaimStatus>(item.status);
    const [statusNote, setStatusNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleStatusUpdate = async () => {
        if (selectedStatus === item.status && !statusNote) return;

        setIsUpdating(true);
        setUpdateMessage(null);

        try {
            await vedikaService.updateClaimStatus(item.no_rawat, {
                status: selectedStatus,
                catatan: statusNote || undefined,
            });
            setUpdateMessage({ type: 'success', text: 'Status berhasil diperbarui!' });
            setStatusNote('');
            onRefresh();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal memperbarui status';
            setUpdateMessage({ type: 'error', text: message });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <tr className="bg-gray-50/50 dark:bg-gray-800/30">
            <td colSpan={8} className="px-5 py-4">
                {/* 4 Cards Grid - Clean Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Card 1: Ubah Status */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Ubah Status
                        </h4>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    Pilih Status Baru
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {STATUS_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setSelectedStatus(option.value)}
                                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${selectedStatus === option.value
                                                ? `${option.color} ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-gray-800`
                                                : `${option.color} opacity-60 hover:opacity-100`
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">
                                    Catatan (opsional)
                                </label>
                                <textarea
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    placeholder="Tambahkan catatan untuk perubahan status..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                />
                            </div>

                            {updateMessage && (
                                <div className={`px-3 py-2 rounded-lg text-xs ${updateMessage.type === 'success'
                                    ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400'
                                    : 'bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400'
                                    }`}>
                                    {updateMessage.text}
                                </div>
                            )}

                            <button
                                onClick={handleStatusUpdate}
                                disabled={isUpdating || (selectedStatus === item.status && !statusNote)}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isUpdating ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Simpan Status
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Card 2: Ubah Diagnosa */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Ubah Diagnosa
                        </h4>

                        <div className="flex flex-col items-center justify-center h-32 text-center">
                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                Fitur edit diagnosa (ICD-10)<br />akan segera tersedia
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Ubah Prosedur */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Ubah Prosedur
                        </h4>

                        <div className="flex flex-col items-center justify-center h-32 text-center">
                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                Fitur edit prosedur (ICD-9-CM)<br />akan segera tersedia
                            </p>
                        </div>
                    </div>

                    {/* Card 4: Unggah Berkas */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Unggah Berkas
                        </h4>

                        <div className="flex flex-col items-center justify-center h-32 text-center">
                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                Fitur upload keperawatan &amp; resume<br />akan segera tersedia
                            </p>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
}
