import { useState, useEffect } from 'react';
import { Role, userManagementService } from '../../services/userManagementService';
import { useUI } from '../../context/UIContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
    currentRoles: Role[];
}

export default function AssignRolesModal({ isOpen, onClose, onSuccess, userId, currentRoles }: Props) {
    const { toast } = useUI();
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingRoles, setFetchingRoles] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFetchingRoles(true);
            userManagementService.getRoles()
                .then(setAllRoles)
                .catch(console.error)
                .finally(() => setFetchingRoles(false));

            setSelectedRoles(currentRoles.map(r => r.id));
        }
    }, [isOpen, currentRoles]);

    const handleToggleRole = (roleId: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await userManagementService.assignRoles(userId, { role_ids: selectedRoles });
            toast('Role berhasil disimpan', { type: 'success' });
            onSuccess();
        } catch (error) {
            console.error('Failed to assign roles:', error);
            toast('Gagal menyimpan role', { type: 'error' });
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
            <div className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                    Atur Role
                </h2>

                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    Pilih role yang akan ditetapkan untuk pengguna ini. Role yang lama akan diganti.
                </p>

                {fetchingRoles ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="max-h-64 space-y-2 overflow-y-auto">
                        {allRoles.map(role => (
                            <label
                                key={role.id}
                                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedRoles.includes(role.id)}
                                    onChange={() => handleToggleRole(role.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                                />
                                <div>
                                    <div className="text-sm font-medium text-gray-800 dark:text-white">
                                        {role.name}
                                    </div>
                                    {role.description && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {role.description}
                                        </div>
                                    )}
                                </div>
                            </label>
                        ))}
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
