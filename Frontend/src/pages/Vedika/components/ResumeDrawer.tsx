// ResumeDrawer - Slide-in drawer for viewing medical resume (read-only)

import { useEffect, useState } from 'react';
import type { MedicalResume } from '../../../services/vedikaService';
import { vedikaService } from '../../../services/vedikaService';

interface ResumeDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    noRawat: string;
}

export default function ResumeDrawer({
    isOpen,
    onClose,
    noRawat,
}: ResumeDrawerProps) {
    const [resume, setResume] = useState<MedicalResume | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && noRawat) {
            fetchResume();
        }
    }, [isOpen, noRawat]);

    const fetchResume = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await vedikaService.getResume(noRawat);
            setResume(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat resume medis');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setResume(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/50 transition-opacity"
                onClick={handleClose}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg transform overflow-y-auto bg-white shadow-xl transition-transform dark:bg-gray-900">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Resume Medis
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No. Rawat: <span className="font-mono">{noRawat}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <svg className="h-8 w-8 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Memuat resume...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            <button
                                onClick={fetchResume}
                                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                                Coba lagi
                            </button>
                        </div>
                    )}

                    {/* Resume Content */}
                    {resume && !isLoading && (
                        <div className="space-y-6">
                            {/* Jenis Badge */}
                            <div>
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${resume.jenis === 'ralan'
                                        ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300'
                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                                    }`}>
                                    {resume.jenis === 'ralan' ? 'Resume Rawat Jalan' : 'Resume Rawat Inap'}
                                </span>
                            </div>

                            {/* Keluhan Utama */}
                            <ResumeSection
                                title="Keluhan Utama"
                                content={resume.keluhan_utama}
                                icon={
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                }
                            />

                            {/* Pemeriksaan Fisik */}
                            <ResumeSection
                                title="Pemeriksaan Fisik"
                                content={resume.pemeriksaan_fisik}
                                icon={
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                }
                            />

                            {/* Diagnosa Akhir */}
                            <ResumeSection
                                title="Diagnosa Akhir"
                                content={resume.diagnosa_akhir}
                                icon={
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                }
                            />

                            {/* Terapi */}
                            <ResumeSection
                                title="Terapi / Tindakan"
                                content={resume.terapi}
                                icon={
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                }
                            />

                            {/* Anjuran */}
                            <ResumeSection
                                title="Anjuran / Instruksi"
                                content={resume.anjuran}
                                icon={
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                }
                            />

                            {/* Dokter PJ */}
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/50">
                                        <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Dokter Penanggung Jawab</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{resume.dokter_pj || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!resume && !isLoading && !error && (
                        <div className="py-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Resume medis tidak ditemukan</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// Helper component for resume sections
function ResumeSection({
    title,
    content,
    icon
}: {
    title: string;
    content: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="mb-2 flex items-center gap-2 text-gray-500 dark:text-gray-400">
                {icon}
                <h4 className="text-sm font-medium">{title}</h4>
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {content || <span className="italic text-gray-400">Tidak ada data</span>}
            </p>
        </div>
    );
}
