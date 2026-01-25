import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { vedikaService, ICD10Item } from '../../../services/vedikaService';
import ScrollArea from '../../../components/ui/ScrollArea';
import Combobox from '../../../components/ui/Combobox';

// Custom Icons
const IconX = ({ size = 20 }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const IconUpload = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const IconFileText = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

interface DigitalDocModalProps {
    isOpen: boolean;
    onClose: () => void;
    noRawat: string;
    onSuccess?: () => void;
}

const DigitalDocModal: React.FC<DigitalDocModalProps> = ({ isOpen, onClose, noRawat, onSuccess }) => {
    const [categories, setCategories] = useState<ICD10Item[]>([]);
    const [selectedKode, setSelectedKode] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingMaster, setFetchingMaster] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMaster();
            setSuccess(false);
            setError(null);
            setSelectedFile(null);
            setSelectedKode('');
        }
    }, [isOpen]);

    const fetchMaster = async () => {
        setFetchingMaster(true);
        try {
            const data = await vedikaService.getMasterDigitalDocs();
            setCategories(data);
        } catch (err) {
            console.error('Failed to fetch master docs:', err);
        } finally {
            setFetchingMaster(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedKode) {
            setError('Pilih kategori berkas terlebih dahulu');
            return;
        }
        if (!selectedFile) {
            setError('Pilih berkas yang akan diunggah');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await vedikaService.uploadDocument(noRawat, selectedKode, selectedFile);
            setSuccess(true);
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Gagal mengunggah berkas');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <IconUpload size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Unggah Berkas Digital</h3>
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

                <ScrollArea className="p-6 space-y-6" containerClassName="max-h-[70vh]">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in zoom-in-90 duration-300">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shadow-inner">
                                <IconCheckCircle size={40} />
                            </div>
                            <div className="text-center">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Unggah Berhasil!</h4>
                                <p className="text-gray-500 dark:text-gray-400">Berkas telah disimpan ke server.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Category Selection - Standardized Combobox */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Kategori Berkas</label>
                                <Combobox
                                    options={categories.map(cat => ({
                                        value: cat.kode,
                                        label: cat.nama,
                                        icon: <IconFileText size={18} />
                                    }))}
                                    value={selectedKode}
                                    onChange={setSelectedKode}
                                    placeholder="Pilih Kategori..."
                                    searchPlaceholder="Cari kategori berkas..."
                                    loading={fetchingMaster}
                                    disabled={loading}
                                />
                            </div>

                            {/* File Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Pilih Berkas (PDF/Gambar)</label>
                                <div
                                    className={`relative border-2 border-dashed rounded-2xl transition-all p-8 flex flex-col items-center justify-center gap-3 group
                                        ${selectedFile ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'}`}
                                >
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*,.pdf"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={loading}
                                    />
                                    <div className={`p-4 rounded-full transition-transform group-hover:scale-110 
                                        ${selectedFile ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                        <IconUpload size={32} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {selectedFile ? selectedFile.name : 'Klik atau seret berkas ke sini'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Mendukung Image dan PDF'}
                                        </p>
                                    </div>
                                </div>
                            </div>

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
                        Tutup
                    </button>
                    {!success && (
                        <button
                            onClick={handleUpload}
                            disabled={loading || !selectedFile || !selectedKode}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <IconLoader2 size={18} />
                                    Mengunggah...
                                </>
                            ) : (
                                <>
                                    <IconUpload size={18} />
                                    Unggah Berkas
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

export default DigitalDocModal;
