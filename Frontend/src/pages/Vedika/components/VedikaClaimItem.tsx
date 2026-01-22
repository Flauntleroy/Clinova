// VedikaClaimItem - Dense card/row layout for each claim episode
// Displays: SEP/No.Rawat, patient info, unit, doctor, status, Dx, Pros

import type { IndexEpisode, ClaimStatus } from '../../../services/vedikaService';

interface VedikaClaimItemProps {
    episode: IndexEpisode;
    onViewDetail: (noRawat: string) => void;
    onUpdateStatus: (noRawat: string) => void;
    onEditDiagnosis: (noRawat: string) => void;
    onEditProcedure: (noRawat: string) => void;
    onUploadDocument: (noRawat: string) => void;
    onViewResume: (noRawat: string) => void;
    permissions: {
        canRead: boolean;
        canUpdateStatus: boolean;
        canEditMedical: boolean;
        canUpload: boolean;
        canViewResume: boolean;
    };
}

const STATUS_BADGE_STYLES: Record<ClaimStatus, string> = {
    RENCANA: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    PENGAJUAN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    PERBAIKAN: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    LENGKAP: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    SETUJU: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
};

const STATUS_LABELS: Record<ClaimStatus, string> = {
    RENCANA: 'Rencana',
    PENGAJUAN: 'Pengajuan',
    PERBAIKAN: 'Perbaikan',
    LENGKAP: 'Lengkap',
    SETUJU: 'Disetujui',
};

export default function VedikaClaimItem({
    episode,
    onViewDetail,
    onUpdateStatus,
    onEditDiagnosis,
    onEditProcedure,
    onUploadDocument,
    onViewResume,
    permissions,
}: VedikaClaimItemProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* Left Section: Patient & Episode Info */}
                <div className="flex-1 space-y-3">
                    {/* Header Row: No.Rawat + Status Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {episode.no_rawat}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            RM: {episode.no_rm}
                        </span>
                        <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_STYLES[episode.status]}`}>
                            {STATUS_LABELS[episode.status]}
                        </span>
                    </div>

                    {/* Patient Name + Details */}
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                            {episode.nama_pasien}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(episode.tgl_pelayanan)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {episode.unit}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {episode.dokter}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                {episode.cara_bayar}
                            </span>
                        </div>
                    </div>

                    {/* Jenis Badge */}
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${episode.jenis === 'ralan'
                                ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                            }`}>
                            {episode.jenis === 'ralan' ? 'Rawat Jalan' : 'Rawat Inap'}
                        </span>
                    </div>
                </div>

                {/* Right Section: Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                    {/* View Detail */}
                    {permissions.canRead && (
                        <button
                            onClick={() => onViewDetail(episode.no_rawat)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Detail
                        </button>
                    )}

                    {/* Update Status */}
                    {permissions.canUpdateStatus && (
                        <button
                            onClick={() => onUpdateStatus(episode.no_rawat)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Status
                        </button>
                    )}

                    {/* Edit Diagnosis - Clickable shortcut */}
                    {permissions.canEditMedical && (
                        <button
                            onClick={() => onEditDiagnosis(episode.no_rawat)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Dx. Utama
                        </button>
                    )}

                    {/* Edit Procedure - Clickable shortcut */}
                    {permissions.canEditMedical && (
                        <button
                            onClick={() => onEditProcedure(episode.no_rawat)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 dark:hover:bg-cyan-900/50"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            Pros. Utama
                        </button>
                    )}

                    {/* Upload Documents */}
                    {permissions.canUpload && (
                        <button
                            onClick={() => onUploadDocument(episode.no_rawat)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Berkas
                        </button>
                    )}

                    {/* View Resume */}
                    {permissions.canViewResume && (
                        <button
                            onClick={() => onViewResume(episode.no_rawat)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Resume
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
