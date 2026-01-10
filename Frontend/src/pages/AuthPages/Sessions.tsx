import PageMeta from "../../components/common/PageMeta";
import { useState, useEffect } from "react";
import { authService, SessionItem } from "../../services/authService";
import Button from "../../components/ui/button/Button";

export default function Sessions() {
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSessions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await authService.getSessions();
            setSessions(data);
        } catch {
            setError("Failed to load sessions");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadSessions();
    }, []);

    const handleRevoke = async (sessionId: string, isCurrent: boolean) => {
        if (isCurrent) {
            if (!confirm("This will log you out. Continue?")) {
                return;
            }
        }

        try {
            await authService.revokeSession(sessionId);
            if (isCurrent) {
                await authService.logout();
                window.location.href = "/signin";
            } else {
                loadSessions();
            }
        } catch {
            setError("Failed to revoke session");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <>
            <PageMeta
                title="Active Sessions | SIMRS"
                description="Manage your active login sessions"
            />
            <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Active Sessions
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage your login sessions across different devices.
                    </p>
                </div>

                {error && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : sessions.length === 0 ? (
                    <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No active sessions found.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`p-4 border rounded-lg ${session.is_current
                                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10"
                                        : "border-gray-200 dark:border-gray-700"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-800 dark:text-white">
                                                {session.device_info || "Unknown Device"}
                                            </span>
                                            {session.is_current && (
                                                <span className="px-2 py-0.5 text-xs font-medium text-brand-600 bg-brand-100 rounded dark:bg-brand-900/30 dark:text-brand-400">
                                                    Current Session
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            IP: {session.ip_address || "Unknown"}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Created: {formatDate(session.created_at)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Last seen: {formatDate(session.last_seen_at)}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRevoke(session.id, session.is_current)}
                                    >
                                        {session.is_current ? "Logout" : "Revoke"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
