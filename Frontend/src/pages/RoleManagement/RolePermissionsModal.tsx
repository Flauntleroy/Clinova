import { useState, useEffect } from 'react';
import { Role, Permission, userManagementService } from '../../services/userManagementService';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    role: Role | null;
    allPermissions: Permission[];
}

export default function RolePermissionsModal({ isOpen, onClose, onSuccess, role, allPermissions }: Props) {
    const { can } = useAuth();
    const { toast } = useUI();
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    const canWrite = can('rolemanagement.write');

    // Group permissions by domain
    const permissionsByDomain = allPermissions.reduce((acc, p) => {
        if (!acc[p.domain]) acc[p.domain] = [];
        acc[p.domain].push(p);
        return acc;
    }, {} as Record<string, Permission[]>);

    useEffect(() => {
        if (isOpen && role) {
            const currentPermIds = new Set(role.permissions?.map(p => p.id) || []);
            setSelectedPermissions(currentPermIds);
        }
    }, [isOpen, role]);

    const handleToggle = (permId: string) => {
        setSelectedPermissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(permId)) {
                newSet.delete(permId);
            } else {
                newSet.add(permId);
            }
            return newSet;
        });
    };

    const handleToggleDomain = (domain: string, checked: boolean) => {
        const domainPermIds = permissionsByDomain[domain].map(p => p.id);
        setSelectedPermissions(prev => {
            const newSet = new Set(prev);
            domainPermIds.forEach(id => {
                if (checked) {
                    newSet.add(id);
                } else {
                    newSet.delete(id);
                }
            });
            return newSet;
        });
    };

    const isDomainFullySelected = (domain: string) => {
        const domainPermIds = permissionsByDomain[domain].map(p => p.id);
        return domainPermIds.every(id => selectedPermissions.has(id));
    };

    const isDomainPartiallySelected = (domain: string) => {
        const domainPermIds = permissionsByDomain[domain].map(p => p.id);
        const selectedCount = domainPermIds.filter(id => selectedPermissions.has(id)).length;
        return selectedCount > 0 && selectedCount < domainPermIds.length;
    };

    const handleSubmit = async () => {
        if (!role) return;

        setLoading(true);
        try {
            await userManagementService.assignRolePermissions(role.id, Array.from(selectedPermissions));
            toast('Permission berhasil disimpan', { type: 'success' });
            onSuccess();
        } catch (error) {
            console.error('Failed to save permissions:', error);
            toast('Gagal menyimpan permission', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !role) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 z-[60] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
                    Kelola Permission: {role.name}
                </h2>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    Pilih permission yang akan diberikan ke role ini.
                    {selectedPermissions.size} dari {allPermissions.length} permission dipilih.
                </p>

                <div className="max-h-96 space-y-4 overflow-y-auto">
                    {Object.entries(permissionsByDomain).map(([domain, perms]) => (
                        <div key={domain} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            {/* Domain Header with Select All */}
                            <label className="mb-3 flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={isDomainFullySelected(domain)}
                                    ref={(el) => {
                                        if (el) el.indeterminate = isDomainPartiallySelected(domain);
                                    }}
                                    onChange={(e) => handleToggleDomain(domain, e.target.checked)}
                                    disabled={!canWrite}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 disabled:opacity-50"
                                />
                                <span className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300">
                                    {domain}
                                </span>
                                <span className="text-xs text-gray-500">
                                    ({perms.filter(p => selectedPermissions.has(p.id)).length}/{perms.length})
                                </span>
                            </label>

                            {/* Permission List */}
                            <div className="ml-7 space-y-2">
                                {perms.map(perm => (
                                    <label key={perm.id} className="flex cursor-pointer items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedPermissions.has(perm.id)}
                                            onChange={() => handleToggle(perm.id)}
                                            disabled={!canWrite}
                                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 disabled:opacity-50"
                                        />
                                        <div>
                                            <code className="text-sm text-gray-800 dark:text-white">
                                                {perm.code}
                                            </code>
                                            {perm.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {perm.description}
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        {canWrite ? 'Batal' : 'Tutup'}
                    </button>
                    {canWrite && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Permission'}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
