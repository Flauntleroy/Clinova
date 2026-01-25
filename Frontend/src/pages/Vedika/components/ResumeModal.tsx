import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { vedikaService, MedicalResume } from '../../../services/vedikaService';
import ScrollArea from '../../../components/ui/ScrollArea';

// Custom Icons
const IconX = ({ size = 20 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const IconFileEdit = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const IconSave = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

const IconCheckCircle = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconAlertCircle = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconLoader2 = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const IconUser = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const IconStethoscope = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
);

const IconClipboardList = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01" />
    </svg>
);

const IconPill = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.5l8-8a4.95 4.95 0 117 7l-8 8a4.95 4.95 0 11-7-7z" />
    </svg>
);

const IconHelpingHand = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0V12m-3.5 1.5a1.5 1.5 0 113 0m0-1.5V6a1.5 1.5 0 113 0V11m-3 1.5a1.5 1.5 0 113 0m0-1.5a1.5 1.5 0 113 0V10a1.5 1.5 0 113 0v4.5a6 6 0 11-12 0V11" />
    </svg>
);

interface ResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
    noRawat: string;
    jenis: 'ralan' | 'ranap';
    initialDokter?: string;
    initialKdDokter?: string;
    onSuccess?: () => void;
}

const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose, noRawat, jenis, initialDokter, initialKdDokter, onSuccess }) => {
    const [formData, setFormData] = useState<Partial<MedicalResume>>({
        keluhan_utama: '',
        pemeriksaan_fisik: '',
        diagnosa_akhir: '',
        terapi: '',
        anjuran: '',
        dokter_pj: initialKdDokter || ''
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchResume();
            setSuccess(false);
            setError(null);
        }
    }, [isOpen]);

    const fetchResume = async () => {
        setFetching(true);
        try {
            const data = await vedikaService.getResume(noRawat);
            if (data.success && data.data) {
                setFormData({
                    ...data.data,
                    // Ensure it uses the initial doctor if none found in resume record
                    dokter_pj: data.data.dokter_pj || initialKdDokter || ''
                });
            }
        } catch (err) {
            console.error('Failed to fetch resume:', err);
            // Default to empty/initial data
            setFormData(prev => ({ ...prev, dokter_pj: initialKdDokter || '' }));
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            await vedikaService.saveResume(noRawat, formData);
            setSuccess(true);
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan resume');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const inputClasses = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none min-h-[100px]";
    const labelClasses = "flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 mb-2";

    return createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <IconFileEdit size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {success ? 'Selesai' : `Resume Medis ${jenis === 'ranap' ? 'Rawat Inap' : 'Rawat Jalan'}`}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{noRawat}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                <ScrollArea className="px-6 py-6" containerClassName="max-h-[75vh]">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in zoom-in-90 duration-300">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shadow-inner">
                                <IconCheckCircle size={48} />
                            </div>
                            <div className="text-center">
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Data Tersimpan!</h4>
                                <p className="text-gray-500 dark:text-gray-400">Resume medis telah berhasil diperbarui.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {fetching ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <IconLoader2 size={40} className="text-blue-500" />
                                    <p className="text-gray-500 dark:text-gray-400 animate-pulse font-medium">Mengambil data...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Keluhan */}
                                        <div className="space-y-2">
                                            <label className={labelClasses}>
                                                <IconClipboardList size={16} className="text-blue-500" />
                                                Keluhan Utama
                                            </label>
                                            <textarea
                                                value={formData.keluhan_utama}
                                                onChange={(e) => setFormData({ ...formData, keluhan_utama: e.target.value })}
                                                placeholder="Tuliskan keluhan utama pasien..."
                                                className={inputClasses}
                                            />
                                        </div>

                                        {/* Pemeriksaan Fisik */}
                                        <div className="space-y-2">
                                            <label className={labelClasses}>
                                                <IconStethoscope size={16} className="text-purple-500" />
                                                Pemeriksaan Fisik
                                            </label>
                                            <textarea
                                                value={formData.pemeriksaan_fisik}
                                                onChange={(e) => setFormData({ ...formData, pemeriksaan_fisik: e.target.value })}
                                                placeholder="Tuliskan hasil pemeriksaan fisik..."
                                                className={inputClasses}
                                            />
                                        </div>

                                        {/* Diagnosa */}
                                        <div className="space-y-2">
                                            <label className={labelClasses}>
                                                <IconAlertCircle size={16} className="text-red-500" />
                                                Diagnosa Akhir
                                            </label>
                                            <textarea
                                                value={formData.diagnosa_akhir}
                                                onChange={(e) => setFormData({ ...formData, diagnosa_akhir: e.target.value })}
                                                placeholder="Tuliskan diagnosa akhir..."
                                                className={inputClasses}
                                            />
                                        </div>

                                        {/* Terapi / Obat */}
                                        <div className="space-y-2">
                                            <label className={labelClasses}>
                                                <IconPill size={16} className="text-green-500" />
                                                Terapi / Obat
                                            </label>
                                            <textarea
                                                value={formData.terapi}
                                                onChange={(e) => setFormData({ ...formData, terapi: e.target.value })}
                                                placeholder="Tuliskan daftar obat atau terapi..."
                                                className={inputClasses}
                                            />
                                        </div>
                                    </div>

                                    {/* Anjuran */}
                                    <div className="space-y-2">
                                        <label className={labelClasses}>
                                            <IconHelpingHand size={16} className="text-orange-500" />
                                            Anjuran / Saran
                                        </label>
                                        <textarea
                                            value={formData.anjuran}
                                            onChange={(e) => setFormData({ ...formData, anjuran: e.target.value })}
                                            placeholder="Tuliskan anjuran atau saran bagi pasien..."
                                            className={`${inputClasses} min-h-[80px]`}
                                        />
                                    </div>

                                    {/* Dokter */}
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <IconUser size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Dokter Penanggung Jawab</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{initialDokter || '---'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-mono">ID Dokter</p>
                                            <p className="text-xs font-mono text-gray-600 dark:text-gray-400 font-bold">{formData.dokter_pj || '---'}</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <IconAlertCircle className="text-red-500 shrink-0" size={18} />
                                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-50"
                    >
                        Batal
                    </button>
                    {!success && !fetching && (
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <IconLoader2 size={18} />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <IconSave size={18} />
                                    Simpan Resume
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ResumeModal;
