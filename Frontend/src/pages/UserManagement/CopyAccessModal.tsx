import { useState, useEffect } from 'react';
import { User, userManagementService } from '../../services/userManagementService';
import { useUI } from '../../context/UIContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
    username: string;
}

export default function CopyAccessModal({ isOpen, onClose, onSuccess, userId, username }: Props) {
    const { toast, confirm } = useUI();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingUsers, setFetchingUsers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFetchingUsers(true);
            userManagementService.getUsers({ limit: 100 })
                .then(data => {
                    // Filter out current user
                    setUsers(data.users.filter(u => u.id !== userId));
                })
                .catch(console.error)
                .finally(() => setFetchingUsers(false));

            setSelectedUserId('');
            setSearchTerm('');
        }
    }, [isOpen, userId]);

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedUser = users.find(u => u.id === selectedUserId);

    const handleSubmit = async () => {
        if (!selectedUserId) {
            toast('Pilih pengguna sumber', { type: 'warning' });
            return;
        }

        const confirmed = await confirm(
            `Apakah Anda yakin ingin menyalin akses dari "${selectedUser?.username}" ke "${username}"? Semua role dan permission override yang ada akan diganti.`,
            { title: 'Konfirmasi Salin Akses', variant: 'warning', confirmText: 'Ya, Salin', cancelText: 'Batal' }
        );

        if (!confirmed) return;

        setLoading(true);
        try {
            await userManagementService.copyAccess(userId, { source_user_id: selectedUserId });
            toast('Akses berhasil disalin', { type: 'success' });
            onSuccess();
        } catch (error) {
            console.error('Failed to copy access:', error);
            toast('Gagal menyalin akses', { type: 'error' });
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
                    Salin Akses
                </h2>

                <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <strong>Peringatan:</strong> Semua role dan permission override dari pengguna tujuan ({username}) akan diganti dengan akses dari pengguna sumber.
                </div>

                <div className="mb-4">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cari Pengguna Sumber
                    </label>
                    <input
                        type="text"
                        placeholder="Cari username atau email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                </div>

                {fetchingUsers ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="mb-4 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        {filteredUsers.length === 0 ? (
                            <p className="p-3 text-center text-sm text-gray-500">Tidak ada pengguna ditemukan</p>
                        ) : (
                            filteredUsers.map(user => (
                                <label
                                    key={user.id}
                                    className={`flex cursor-pointer items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedUserId === user.id ? 'bg-brand-50 dark:bg-brand-900/20' : ''
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="sourceUser"
                                        checked={selectedUserId === user.id}
                                        onChange={() => setSelectedUserId(user.id)}
                                        className="h-4 w-4 border-gray-300 text-brand-500 focus:ring-brand-500"
                                    />
                                    <div>
                                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                                            {user.username}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {user.email} • {user.roles?.map(r => r.name).join(', ') || 'No roles'}
                                        </div>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !selectedUserId}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                        {loading ? 'Menyalin...' : 'Salin Akses'}
                    </button>
                </div>
            </div>
        </>
    );
}
