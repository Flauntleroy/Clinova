import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    vedikaService,
    type DiagnosisItem,
    type ICD10Item
} from '../../../services/vedikaService';
import authService from '../../../services/authService';

interface DiagnosisModalProps {
    isOpen: boolean;
    onClose: () => void;
    noRawat: string;
    initialDiagnoses: DiagnosisItem[];
    onSuccess: () => void;
}

export default function DiagnosisModal({
    isOpen,
    onClose,
    noRawat,
    initialDiagnoses,
    onSuccess,
}: DiagnosisModalProps) {
    const [tempDiagnoses, setTempDiagnoses] = useState<DiagnosisItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ICD10Item[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeType, setActiveType] = useState<'primary' | 'secondary'>('secondary');
    const [error, setError] = useState<string | null>(null);

    const canEdit = authService.hasPermission('vedika.claim.edit_medical_data');

    useEffect(() => {
        if (isOpen) {
            setTempDiagnoses([...initialDiagnoses]);
            setError(null);
            setSearchQuery('');
            setSearchResults([]);
        }
    }, [isOpen, initialDiagnoses]);

    if (!isOpen) return null;

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const items = await vedikaService.searchICD10(query);
            setSearchResults(items);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setIsSearching(true); // Wait, previous code had setIsSearchingICD(false)
            setIsSearching(false);
        }
    };

    const addDiagnosis = (icd: ICD10Item) => {
        if (activeType === 'primary') {
            const others = tempDiagnoses.filter(d => d.status_dx !== 'Utama');
            setTempDiagnoses([
                {
                    kode_penyakit: icd.kode,
                    nama_penyakit: icd.nama,
                    status_dx: 'Utama',
                    prioritas: 1
                },
                ...others
            ]);
        } else {
            if (tempDiagnoses.some(d => d.kode_penyakit === icd.kode)) return;
            const currentSecondary = tempDiagnoses.filter(d => d.status_dx !== 'Utama');
            setTempDiagnoses([
                ...tempDiagnoses,
                {
                    kode_penyakit: icd.kode,
                    nama_penyakit: icd.nama,
                    status_dx: 'Sekunder',
                    prioritas: currentSecondary.length + 1
                }
            ]);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeDiagnosis = (kode: string) => {
        setTempDiagnoses(prev => prev.filter(d => d.kode_penyakit !== kode));
    };

    const handleSave = async () => {
        const primary = tempDiagnoses.find(d => d.status_dx === 'Utama');
        if (!primary) {
            setError('Diagnosa Utama wajib diisi');
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            await vedikaService.syncDiagnoses(noRawat, {
                diagnoses: tempDiagnoses.map((d, idx) => ({
                    kode_penyakit: d.kode_penyakit,
                    status_dx: d.status_dx as 'Utama' | 'Sekunder',
                    prioritas: idx + 1
                }))
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan diagnosa');
        } finally {
            setIsSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                            Kelola Diagnosa (ICD-10)
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{noRawat}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Current List */}
                    <div className="space-y-4">
                        <section>
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Diagnosa Utama</h4>
                            {tempDiagnoses.filter(d => d.status_dx === 'Utama').map(d => (
                                <div key={d.kode_penyakit} className="flex items-center justify-between p-3 bg-brand-50 dark:bg-brand-500/5 rounded border border-brand-100 dark:border-brand-500/20">
                                    <div className="text-sm">
                                        <span className="font-mono font-bold text-brand-700 dark:text-brand-400 mr-2">{d.kode_penyakit}</span>
                                        <span className="text-gray-700 dark:text-gray-200">{d.nama_penyakit}</span>
                                    </div>
                                    <button onClick={() => removeDiagnosis(d.kode_penyakit)} className="text-gray-400 hover:text-red-500 px-2 font-bold text-lg">×</button>
                                </div>
                            ))}
                            {tempDiagnoses.filter(d => d.status_dx === 'Utama').length === 0 && (
                                <div className="p-3 border border-dashed border-gray-200 dark:border-gray-700 rounded text-center">
                                    <span className="text-xs text-gray-400">Belum ada diagnosa utama</span>
                                </div>
                            )}
                        </section>

                        <section>
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Diagnosa Tambahan</h4>
                            <div className="space-y-2">
                                {tempDiagnoses.filter(d => d.status_dx !== 'Utama').map(d => (
                                    <div key={d.kode_penyakit} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700">
                                        <div className="text-sm">
                                            <span className="font-mono font-bold text-gray-600 dark:text-gray-400 mr-2">{d.kode_penyakit}</span>
                                            <span className="text-gray-600 dark:text-gray-300">{d.nama_penyakit}</span>
                                        </div>
                                        <button onClick={() => removeDiagnosis(d.kode_penyakit)} className="text-gray-400 hover:text-red-500 px-2 font-bold text-lg">×</button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Search Section */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex gap-4 mb-3">
                            <button
                                onClick={() => setActiveType('primary')}
                                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded transition-colors ${activeType === 'primary' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}
                            >
                                Cari Utama
                            </button>
                            <button
                                onClick={() => setActiveType('secondary')}
                                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded transition-colors ${activeType === 'secondary' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}
                            >
                                Cari Tambahan
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder={activeType === 'primary' ? "Cari Diagnosa Utama..." : "Tambah Diagnosa Tambahan..."}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-brand-500 outline-none transition-all dark:text-white"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />

                            {/* Dropdown Results */}
                            {searchQuery.length >= 2 && (
                                <div className="absolute z-[110] left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                                    {isSearching ? (
                                        <div className="p-6 text-center">
                                            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                            <span className="text-xs text-gray-500">Mencari referensi ICD-10...</span>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                            {searchResults.map(res => (
                                                <button
                                                    key={res.kode}
                                                    onClick={() => addDiagnosis(res)}
                                                    className="w-full text-left px-4 py-3 hover:bg-brand-50 dark:hover:bg-brand-500/5 transition-colors group"
                                                >
                                                    <div className="font-mono font-bold text-brand-600 dark:group-hover:text-brand-400 mb-1">[{res.kode}]</div>
                                                    <div className="text-gray-700 dark:text-gray-300 text-xs line-clamp-2 leading-relaxed">{res.nama}</div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center">
                                            <div className="text-2xl mb-2">🔍</div>
                                            <div className="text-xs text-gray-500 font-medium italic">Tidak ada kode yang cocok</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg">
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium">⚠️ {error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-6 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors uppercase tracking-widest disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !canEdit}
                        className="px-8 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest"
                    >
                        {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
