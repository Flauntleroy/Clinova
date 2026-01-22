// VedikaIndex - Main Index Workbench page for claim management
// Features: Filter panel, claim list, and all modal/drawer interactions

import { useState, useCallback } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import VedikaFilterPanel, { type FilterValues } from './components/VedikaFilterPanel';
import VedikaClaimItem from './components/VedikaClaimItem';
import StatusModal from './components/StatusModal';
import DiagnosisModal from './components/DiagnosisModal';
import ProcedureModal from './components/ProcedureModal';
import ResumeDrawer from './components/ResumeDrawer';
import { vedikaService, type IndexEpisode, type IndexFilter } from '../../services/vedikaService';
import { usePermissions } from '../../hooks/usePermissions';

// Modal state type
interface ModalState {
    type: 'status' | 'diagnosis' | 'procedure' | 'resume' | 'detail' | null;
    noRawat: string;
}

export default function VedikaIndex() {
    // Data state
    const [episodes, setEpisodes] = useState<IndexEpisode[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [currentFilter, setCurrentFilter] = useState<FilterValues | null>(null);

    // Loading/Error states
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Modal states
    const [modalState, setModalState] = useState<ModalState>({ type: null, noRawat: '' });

    // Permission checks - using existing usePermissions hook pattern
    const { hasPermission } = usePermissions();

    const permissions = {
        canRead: hasPermission('vedika.claim.read'),
        canUpdateStatus: hasPermission('vedika.claim.update_status'),
        canEditMedical: hasPermission('vedika.claim.edit_medical_data'),
        canUpload: hasPermission('vedika.claim.upload_document'),
        canViewResume: hasPermission('vedika.claim.read_resume'),
    };

    // Fetch data
    const fetchData = useCallback(async (filter: FilterValues, page: number = 1) => {
        setIsLoading(true);
        setError(null);

        try {
            const params: IndexFilter = {
                date_from: filter.date_from,
                date_to: filter.date_to,
                status: filter.status,
                jenis: filter.jenis,
                search: filter.search || undefined,
                page,
                limit: pagination.limit,
            };

            const response = await vedikaService.getIndex(params);
            setEpisodes(response.data.items);
            setPagination({
                page: response.data.pagination.page,
                limit: response.data.pagination.limit,
                total: response.data.pagination.total,
            });
            setCurrentFilter(filter);
            setHasSearched(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat data');
            setEpisodes([]);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.limit]);

    // Handle filter apply
    const handleApplyFilter = (values: FilterValues) => {
        fetchData(values, 1);
    };

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        if (currentFilter) {
            fetchData(currentFilter, newPage);
        }
    };

    // Modal handlers
    const openModal = (type: ModalState['type'], noRawat: string) => {
        setModalState({ type, noRawat });
    };

    const closeModal = () => {
        setModalState({ type: null, noRawat: '' });
    };

    // Action handlers with refresh
    const handleStatusUpdate = async (data: { status: string; catatan?: string }) => {
        setIsSubmitting(true);
        try {
            await vedikaService.updateClaimStatus(modalState.noRawat, data as Parameters<typeof vedikaService.updateClaimStatus>[1]);
            // Refresh data after successful update
            if (currentFilter) {
                await fetchData(currentFilter, pagination.page);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDiagnosisUpdate = async (data: Parameters<typeof vedikaService.updateDiagnosis>[1]) => {
        setIsSubmitting(true);
        try {
            await vedikaService.updateDiagnosis(modalState.noRawat, data);
            // Refresh data after successful update
            if (currentFilter) {
                await fetchData(currentFilter, pagination.page);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProcedureUpdate = async (data: Parameters<typeof vedikaService.updateProcedure>[1]) => {
        setIsSubmitting(true);
        try {
            await vedikaService.updateProcedure(modalState.noRawat, data);
            // Refresh data after successful update
            if (currentFilter) {
                await fetchData(currentFilter, pagination.page);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate pagination info
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const startItem = (pagination.page - 1) * pagination.limit + 1;
    const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

    return (
        <>
            <PageMeta title="Index Vedika" description="Kelola klaim BPJS" />
            <PageBreadcrumb pageTitle="Index Vedika" />

            <div className="space-y-4">
                {/* Filter Panel */}
                <VedikaFilterPanel
                    onApplyFilter={handleApplyFilter}
                    isLoading={isLoading}
                />

                {/* Results Section */}
                <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    {/* Header with count */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                                Daftar Klaim
                            </h3>
                            {hasSearched && (
                                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                    {pagination.total} item
                                </span>
                            )}
                        </div>
                        {currentFilter && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {currentFilter.date_from} s/d {currentFilter.date_to}
                            </span>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="p-4">
                        {/* Initial State - No Search Yet */}
                        {!hasSearched && !isLoading && (
                            <div className="py-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <p className="mt-3 text-gray-500 dark:text-gray-400">
                                    Gunakan filter di atas untuk mencari data klaim
                                </p>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                                        <div className="flex justify-between">
                                            <div className="space-y-2">
                                                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                                                <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                                                <div className="h-3 w-64 rounded bg-gray-200 dark:bg-gray-700" />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                                                <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error State */}
                        {error && !isLoading && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
                                <div className="flex items-start gap-3">
                                    <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-red-700 dark:text-red-300">Gagal memuat data</p>
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
                                        <button
                                            onClick={() => currentFilter && fetchData(currentFilter, pagination.page)}
                                            className="mt-2 text-sm font-medium text-red-700 hover:text-red-800 dark:text-red-400"
                                        >
                                            Coba lagi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {hasSearched && !isLoading && !error && episodes.length === 0 && (
                            <div className="py-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="mt-3 font-medium text-gray-700 dark:text-gray-300">
                                    Tidak ada data klaim
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Coba ubah kriteria filter atau rentang tanggal
                                </p>
                            </div>
                        )}

                        {/* Claim List */}
                        {!isLoading && !error && episodes.length > 0 && (
                            <div className="space-y-3">
                                {episodes.map((episode) => (
                                    <VedikaClaimItem
                                        key={episode.no_rawat}
                                        episode={episode}
                                        permissions={permissions}
                                        onViewDetail={(noRawat) => window.open(`/vedika/detail/${noRawat}`, '_blank')}
                                        onUpdateStatus={(noRawat) => openModal('status', noRawat)}
                                        onEditDiagnosis={(noRawat) => openModal('diagnosis', noRawat)}
                                        onEditProcedure={(noRawat) => openModal('procedure', noRawat)}
                                        onUploadDocument={() => {/* TODO: Implement document upload modal */ }}
                                        onViewResume={(noRawat) => openModal('resume', noRawat)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {hasSearched && !isLoading && pagination.total > 0 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Menampilkan {startItem} - {endItem} dari {pagination.total} data
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Sebelumnya
                                </button>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Hal {pagination.page} dari {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= totalPages}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <StatusModal
                isOpen={modalState.type === 'status'}
                onClose={closeModal}
                noRawat={modalState.noRawat}
                onSubmit={handleStatusUpdate}
                isLoading={isSubmitting}
            />

            <DiagnosisModal
                isOpen={modalState.type === 'diagnosis'}
                onClose={closeModal}
                noRawat={modalState.noRawat}
                onSubmit={handleDiagnosisUpdate}
                isLoading={isSubmitting}
            />

            <ProcedureModal
                isOpen={modalState.type === 'procedure'}
                onClose={closeModal}
                noRawat={modalState.noRawat}
                onSubmit={handleProcedureUpdate}
                isLoading={isSubmitting}
            />

            <ResumeDrawer
                isOpen={modalState.type === 'resume'}
                onClose={closeModal}
                noRawat={modalState.noRawat}
            />
        </>
    );
}
