import { useState, useEffect } from 'react';
import { Permission, PermissionOverride, userManagementService } from '../../services/userManagementService';
import { useUI } from '../../context/UIContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
    currentOverrides: PermissionOverride[];
}

export default function PermissionOverrideModal({ isOpen, onClose, onSuccess, userId, currentOverrides }: Props) {
    const { toast } = useUI();
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [overrides, setOverrides] = useState<Map<string, 'grant' | 'revoke' | null>>(new Map());
    const [loading, setLoading] = useState(false);
    const [fetchingPerms, setFetchingPerms] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFetchingPerms(true);
            userManagementService.getPermissions()
                .then(setAllPermissions)
                .catch(console.error)
                .finally(() => setFetchingPerms(false));

            // Initialize from current overrides
            const initial = new Map<string, 'grant' | 'revoke' | null>();
            currentOverrides.forEach(o => {
                initial.set(o.permission_id, o.effect);
            });
            setOverrides(initial);
        }
    }, [isOpen, currentOverrides]);

    const handleToggle = (permId: string, effect: 'grant' | 'revoke' | null) => {
        setOverrides(prev => {
            const newMap = new Map(prev);
            if (effect === null) {
                newMap.delete(permId);
            } else {
                newMap.set(permId, effect);
            }
            return newMap;
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const overrideList = Array.from(overrides.entries())
                .filter(([_, effect]) => effect !== null)
                .map(([permission_id, effect]) => ({
                    permission_id,
                    effect: effect as 'grant' | 'revoke',
                }));

            await userManagementService.assignPermissions(userId, { overrides: overrideList });
            toast('Permission override berhasil disimpan', { type: 'success' });
            onSuccess();
        } catch (error) {
            console.error('Failed to save permission overrides:', error);
            toast('Gagal menyimpan permission override', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 z-[60] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                    Permission Override
                </h2>

                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    Grant atau revoke permission spesifik untuk pengguna ini. Override akan menimpa permission dari role.
                </p>

                {fetchingPerms ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="max-h-80 space-y-2 overflow-y-auto">
                        {allPermissions.map(perm => {
                            const currentEffect = overrides.get(perm.id);
                            return (
                                <div
                                    key={perm.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                                >
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                                            {perm.code}
                                        </div>
                                        {perm.description && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {perm.description}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleToggle(perm.id, currentEffect === 'grant' ? null : 'grant')}
                                            className={`rounded px-2 py-1 text-xs font-medium ${currentEffect === 'grant'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-green-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-green-900/30'
                                                }`}
                                        >
                                            Grant
                                        </button>
                                        <button
                                            onClick={() => handleToggle(perm.id, currentEffect === 'revoke' ? null : 'revoke')}
                                            className={`rounded px-2 py-1 text-xs font-medium ${currentEffect === 'revoke'
                                                ? 'bg-red-500 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-red-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/30'
                                                }`}
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>
        </>
    );
}
