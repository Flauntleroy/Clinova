import { useState, useEffect, useCallback } from 'react';
import { useUI } from '../../../context/UIContext';
import {
    vedikaService,
    type IndexEpisode,
    type ClaimStatus,
    type DiagnosisItem,
    type ProcedureItem
} from '../../../services/vedikaService';
import authService from '../../../services/authService';
import DiagnosisModal from './DiagnosisModal';
import StatusUpdateModal from './StatusUpdateModal';
import ProcedureModal from './ProcedureModal';
import DigitalDocModal from './DigitalDocModal';
import ResumeModal from './ResumeModal';

// Custom Icons
const IconFileEdit = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const IconUpload = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const IconFileText = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const IconCheckCircle = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconTrash = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const IconExternalLink = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

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
    // UI State
    const { confirm, toast } = useUI();
    const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);
    const [procedures, setProcedures] = useState<ProcedureItem[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
    const [isDigitalDocModalOpen, setIsDigitalDocModalOpen] = useState(false);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [dokterInfo, setDokterInfo] = useState({ nama: '', kode: '' });
    const [dynamicUrl, setDynamicUrl] = useState('');

    const canEdit = authService.hasPermission('vedika.claim.edit_medical_data');

    const fetchData = useCallback(async () => {
        setIsLoadingData(true);
        try {
            const detail = await vedikaService.getClaimDetail(item.no_rawat);
            setDiagnoses(detail.data.diagnoses || []);
            setProcedures(detail.data.procedures || []);
            setDocuments(detail.data.documents || []);
            if (detail.data.legacy_webapp_url) {
                setDynamicUrl(detail.data.legacy_webapp_url);
            }
            setDokterInfo({
                nama: detail.data.dokter || '',
                kode: '' // We don't have doctor code in basic detail yet, but we'll use name
            });
        } catch (error) {
            console.error('Failed to fetch details:', error);
        } finally {
            setIsLoadingData(false);
        }
    }, [item.no_rawat]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteDocument = async (doc: any) => {
        const confirmed = await confirm(`Hapus berkas "${doc.nama || doc.kategori}"?`, {
            title: "Konfirmasi Hapus",
            variant: "danger",
            confirmText: "Hapus",
            cancelText: "Batal"
        });

        if (!confirmed) return;

        try {
            await vedikaService.deleteDocument(item.no_rawat, doc.id, doc.file_path);
            toast("Berkas berhasil dihapus", { type: "success" });
            fetchData();
        } catch (error) {
            console.error('Failed to delete document:', error);
            toast("Gagal menghapus berkas", { type: "error" });
        }
    };

    const handleViewDocument = (path: string) => {
        const url = `${dynamicUrl}berkasrawat/${path}`;
        window.open(url, '_blank');
    };

    const currentStatusConfig = STATUS_OPTIONS.find(o => o.value === item.status) || STATUS_OPTIONS[0];

    return (
        <tr className="bg-gray-50/50 dark:bg-gray-800/30">
            <td colSpan={8} className="px-5 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Card 1: Status Klaim Panel */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col min-h-[220px]">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            STATUS KLAIM
                        </h4>

                        <div className="flex-grow">
                            <section>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 border-b border-gray-50 dark:border-gray-700 pb-1">
                                    Status Saat Ini
                                </div>
                                <div
                                    onClick={() => canEdit && setIsStatusModalOpen(true)}
                                    className={`group flex items-start gap-2 p-1.5 rounded transition-colors ${canEdit ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : 'cursor-default'}`}
                                >
                                    <div className="w-1 self-stretch bg-brand-500/50 rounded-full" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                                            {currentStatusConfig.label}
                                        </div>
                                        <p className="text-[9px] text-gray-500 dark:text-gray-400 font-mono uppercase tracking-tight opacity-70">
                                            {canEdit ? 'Klik untuk mengubah status' : 'Status episode'}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Card 2: Diagnosa Panel (ICD-10) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col min-h-[220px]">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            DIAGNOSA (ICD-10)
                        </h4>

                        <div className="flex-grow">
                            {isLoadingData ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Diagnosa Utama Section */}
                                    <section>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 border-b border-gray-50 dark:border-gray-700 pb-1">
                                            Diagnosa Utama
                                        </div>
                                        {diagnoses.filter(d => d.status_dx === 'Utama').map((d) => (
                                            <div
                                                key={d.kode_penyakit}
                                                onClick={() => canEdit && setIsDiagnosisModalOpen(true)}
                                                className={`group flex items-start gap-2 p-1.5 rounded transition-colors ${canEdit ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : 'cursor-default'}`}
                                                title={d.nama_penyakit}
                                            >
                                                <div className="w-1 self-stretch bg-brand-500/50 rounded-full" />
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-mono font-bold text-gray-900 dark:text-white mr-2">{d.kode_penyakit}</span>
                                                    <span className="text-gray-600 dark:text-gray-300 text-xs truncate block">{d.nama_penyakit}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {diagnoses.filter(d => d.status_dx === 'Utama').length === 0 && (
                                            <div
                                                onClick={() => canEdit && setIsDiagnosisModalOpen(true)}
                                                className={`text-[10px] text-gray-400 italic pl-1 py-1 rounded transition-colors ${canEdit ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-brand-500' : ''}`}
                                            >
                                                {canEdit ? '+ Tambah diagnosa utama (Wajib)' : 'Belum ada diagnosa utama'}
                                            </div>
                                        )}
                                    </section>

                                    {/* Diagnosa Tambahan Section */}
                                    <section>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 border-b border-gray-50 dark:border-gray-700 pb-1">
                                            Diagnosa Tambahan
                                        </div>
                                        <div className="space-y-1">
                                            {diagnoses.filter(d => d.status_dx !== 'Utama').map((d) => (
                                                <div
                                                    key={d.kode_penyakit}
                                                    onClick={() => canEdit && setIsDiagnosisModalOpen(true)}
                                                    className={`group flex items-baseline gap-1.5 py-0.5 px-1 rounded transition-colors ${canEdit ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/20' : 'cursor-default'}`}
                                                    title={d.nama_penyakit}
                                                >
                                                    <span className="font-mono font-bold text-[9px] text-gray-400 dark:text-gray-500 flex-shrink-0 w-8">{d.kode_penyakit}</span>
                                                    <span className="text-gray-500 dark:text-gray-500 text-[10px] truncate block leading-tight">{d.nama_penyakit}</span>
                                                </div>
                                            ))}
                                            {diagnoses.filter(d => d.status_dx !== 'Utama').length === 0 && (
                                                <div
                                                    onClick={() => canEdit && setIsDiagnosisModalOpen(true)}
                                                    className={`text-[10px] text-gray-400 italic pl-1 py-1 rounded transition-colors ${canEdit ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-brand-500' : ''}`}
                                                >
                                                    {canEdit ? '+ Tambah diagnosa tambahan' : 'Tidak ada diagnosa tambahan'}
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 3: Prosedur Panel (ICD-9-CM) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col min-h-[220px]">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            PROSEDUR (ICD-9-CM)
                        </h4>

                        <div className="flex-grow">
                            {isLoadingData ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Prosedur Utama Section */}
                                    <section>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 border-b border-gray-50 dark:border-gray-700 pb-1">
                                            Prosedur Utama
                                        </div>
                                        <div className="space-y-1">
                                            {procedures.filter(p => p.prioritas === 1).map((p) => (
                                                <div
                                                    key={p.kode}
                                                    onClick={() => canEdit && setIsProcedureModalOpen(true)}
                                                    className={`group flex items-start gap-2 p-1.5 rounded transition-colors ${canEdit ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : 'cursor-default'}`}
                                                    title={p.nama}
                                                >
                                                    <div className="w-1 self-stretch bg-brand-500/50 rounded-full" />
                                                    <div className="flex-1 min-w-0">
                                                        <span className="font-mono font-bold text-gray-900 dark:text-white mr-2">{p.kode}</span>
                                                        <span className="text-gray-600 dark:text-gray-300 text-xs truncate block">{p.nama}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {procedures.filter(p => p.prioritas === 1).length === 0 && (
                                                <div
                                                    onClick={() => canEdit && setIsProcedureModalOpen(true)}
                                                    className={`text-[10px] text-gray-400 italic pl-1 py-1 rounded transition-colors ${canEdit ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-brand-500' : ''}`}
                                                >
                                                    {canEdit ? '+ Tambah prosedur utama' : 'Belum ada prosedur utama'}
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {/* Prosedur Tambahan Section */}
                                    <section>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 border-b border-gray-50 dark:border-gray-700 pb-1">
                                            Prosedur Tambahan
                                        </div>
                                        <div className="space-y-1">
                                            {procedures.filter(p => p.prioritas > 1).map((p) => (
                                                <div
                                                    key={p.kode}
                                                    onClick={() => canEdit && setIsProcedureModalOpen(true)}
                                                    className={`group flex items-baseline gap-1.5 py-0.5 px-1 rounded transition-colors ${canEdit ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/20' : 'cursor-default'}`}
                                                    title={p.nama}
                                                >
                                                    <span className="font-mono font-bold text-[9px] text-gray-400 dark:text-gray-500 flex-shrink-0 w-8">{p.kode}</span>
                                                    <span className="text-gray-500 dark:text-gray-500 text-[10px] truncate block leading-tight">{p.nama}</span>
                                                </div>
                                            ))}
                                            {procedures.filter(p => p.prioritas > 1).length === 0 && (
                                                <div
                                                    onClick={() => canEdit && setIsProcedureModalOpen(true)}
                                                    className={`text-[10px] text-gray-400 italic pl-1 py-1 rounded transition-colors ${canEdit ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-brand-500' : ''}`}
                                                >
                                                    {canEdit ? '+ Tambah prosedur tambahan' : 'Tidak ada prosedur tambahan'}
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 4: Berkas Digital & Resume */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col min-h-[220px]">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            BERKAS DIGITAL
                        </h4>

                        <div className="flex-grow space-y-4">
                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => canEdit && setIsResumeModalOpen(true)}
                                    className="w-full flex items-center justify-between gap-3 p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all border border-indigo-100 dark:border-indigo-900/30 group"
                                >
                                    <div className="flex items-center gap-2">
                                        <IconFileEdit size={16} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold">Resume Medis</span>
                                    </div>
                                    <div className="text-[10px] opacity-70 font-mono tracking-tighter">EDIT</div>
                                </button>

                                <button
                                    onClick={() => canEdit && setIsDigitalDocModalOpen(true)}
                                    className="w-full flex items-center justify-between gap-3 p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all border border-blue-100 dark:border-blue-900/30 group"
                                >
                                    <div className="flex items-center gap-2">
                                        <IconUpload size={16} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold">Unggah Berkas</span>
                                    </div>
                                    <div className="text-[10px] opacity-70 font-mono tracking-tighter text-blue-500">
                                        {documents.length > 0 ? `${documents.length} FILE` : 'ADD'}
                                    </div>
                                </button>
                            </div>

                            {/* Document Summary List */}
                            <section>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 border-b border-gray-50 dark:border-gray-700 pb-1 flex justify-between">
                                    <span>Lampiran Berkas</span>
                                    {documents.length > 0 && <IconCheckCircle size={10} className="text-green-500" />}
                                </div>
                                <div className="space-y-1 max-h-[60px] overflow-y-auto custom-scrollbar">
                                    {documents.length > 0 ? (
                                        documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between group/doc py-1 border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded px-1 transition-colors">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <IconFileText size={10} className="shrink-0 text-gray-400" />
                                                    <span className="truncate text-[10px] text-gray-600 dark:text-gray-400" title={doc.nama || doc.kategori}>
                                                        {doc.nama || doc.kategori}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover/doc:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => dynamicUrl && handleViewDocument(doc.file_path)}
                                                        className={`p-1 rounded transition-colors ${dynamicUrl
                                                            ? 'hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500'
                                                            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
                                                        title={dynamicUrl ? "Lihat Berkas" : "Konfigurasi URL WebApps belum diatur (mera_settings)"}
                                                        disabled={!dynamicUrl}
                                                    >
                                                        <IconExternalLink size={10} />
                                                    </button>
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => handleDeleteDocument(doc)}
                                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded transition-colors"
                                                            title="Hapus Berkas"
                                                        >
                                                            <IconTrash size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-[10px] text-gray-400 italic">Belum ada berkas terunggah</div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </td>

            {/* Status Management Modal */}
            <StatusUpdateModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                noRawat={item.no_rawat}
                currentStatus={item.status}
                onSuccess={onRefresh}
            />

            {/* Diagnosis Management Modal */}
            <DiagnosisModal
                isOpen={isDiagnosisModalOpen}
                onClose={() => setIsDiagnosisModalOpen(false)}
                noRawat={item.no_rawat}
                initialDiagnoses={diagnoses}
                onSuccess={fetchData}
            />

            {/* Procedure Management Modal */}
            <ProcedureModal
                isOpen={isProcedureModalOpen}
                onClose={() => setIsProcedureModalOpen(false)}
                noRawat={item.no_rawat}
                initialProcedures={procedures}
                onSuccess={fetchData}
            />

            {/* Digital Document Upload Modal */}
            <DigitalDocModal
                isOpen={isDigitalDocModalOpen}
                onClose={() => setIsDigitalDocModalOpen(false)}
                noRawat={item.no_rawat}
                onSuccess={fetchData}
            />

            {/* View/Delete logic in the card below */}

            {/* Medical Resume Modal */}
            <ResumeModal
                isOpen={isResumeModalOpen}
                onClose={() => setIsResumeModalOpen(false)}
                noRawat={item.no_rawat}
                jenis={item.jenis as 'ralan' | 'ranap'}
                initialDokter={dokterInfo.nama}
                onSuccess={fetchData}
            />
        </tr>
    );
}
