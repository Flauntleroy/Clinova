import { useAppearance, colorPresets, fontFamilies } from '../../context/AppearanceContext';

// Icons for settings
const SunIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

const ContrastIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18" />
        <path d="M12 3a9 9 0 010 18" fill="currentColor" opacity="0.3" />
    </svg>
);

const RTLIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
);

const CompactIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ResetIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

// Toggle Switch Component
function Toggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
        ${checked ? 'bg-[var(--primary-color)]' : 'bg-gray-200 dark:bg-gray-700'}
      `}
        >
            <span
                className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
            />
        </button>
    );
}

// Setting Card Component
function SettingCard({
    icon,
    label,
    checked,
    onChange,
    info,
}: {
    icon: React.ReactNode;
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
    info?: string;
}) {
    return (
        <div
            className={`
        relative flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer transition-all duration-200
        border-2 hover:shadow-md
        ${checked
                    ? 'border-[var(--primary-color)] bg-[var(--primary-color-light)] dark:bg-[var(--primary-color)]/10'
                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'}
      `}
            onClick={() => onChange(!checked)}
        >
            <div className={`p-2 rounded-xl ${checked ? 'text-[var(--primary-color)]' : 'text-gray-500 dark:text-gray-400'}`}>
                {icon}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <div className="absolute top-3 right-3">
                <Toggle checked={checked} onChange={onChange} />
            </div>
            {info && (
                <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </span>
            )}
        </div>
    );
}

// Section Label Component
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-semibold">
            {children}
        </div>
    );
}

// Navigation Layout Option
function NavLayoutOption({
    type,
    selected,
    onClick,
}: {
    type: 'sidebar' | 'minimal' | 'top';
    selected: boolean;
    onClick: () => void;
}) {
    const layouts = {
        sidebar: (
            <div className="flex gap-1 h-full">
                <div className="w-4 h-full rounded bg-[var(--primary-color)]/30 flex flex-col gap-0.5 p-0.5">
                    <div className="w-full h-1 rounded-sm bg-[var(--primary-color)]" />
                    <div className="w-full h-1 rounded-sm bg-gray-300 dark:bg-gray-600" />
                    <div className="w-full h-1 rounded-sm bg-gray-300 dark:bg-gray-600" />
                </div>
                <div className="flex-1 rounded bg-gray-100 dark:bg-gray-700" />
            </div>
        ),
        minimal: (
            <div className="flex gap-1 h-full">
                <div className="w-2 h-full rounded bg-gray-200 dark:bg-gray-700 flex flex-col gap-0.5 justify-center items-center p-0.5">
                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                </div>
                <div className="flex-1 rounded bg-gray-100 dark:bg-gray-700" />
            </div>
        ),
        top: (
            <div className="flex flex-col gap-1 h-full">
                <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 rounded bg-gray-100 dark:bg-gray-700" />
            </div>
        ),
    };

    return (
        <button
            onClick={onClick}
            className={`
        w-20 h-14 p-2 rounded-xl transition-all duration-200 border-2
        ${selected
                    ? 'border-[var(--primary-color)] bg-[var(--primary-color-light)] dark:bg-[var(--primary-color)]/10'
                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200'}
      `}
        >
            {layouts[type]}
        </button>
    );
}

// Font Family Card
function FontFamilyCard({
    name,
    selected,
    onClick,
}: {
    name: string;
    selected: boolean;
    onClick: () => void;
}) {
    const fontValue = fontFamilies.find(f => f.name === name)?.value || name;

    return (
        <button
            onClick={onClick}
            className={`
        flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 border-2
        ${selected
                    ? 'border-[var(--primary-color)] bg-[var(--primary-color-light)] dark:bg-[var(--primary-color)]/10'
                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200'}
      `}
        >
            <span
                className={`text-2xl font-medium ${selected ? 'text-[var(--primary-color)]' : 'text-gray-600 dark:text-gray-400'}`}
                style={{ fontFamily: fontValue }}
            >
                Aa
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">{name}</span>
        </button>
    );
}

// Color Preset Button
function ColorPresetButton({
    color,
    selected,
    onClick,
}: {
    color: { name: string; value: string };
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            title={color.name}
            className={`
        relative w-12 h-12 rounded-xl transition-all duration-200 flex items-center justify-center
        ${selected ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900' : 'hover:scale-110'}
      `}
            style={{ backgroundColor: `${color.value}20` }}
        >
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: color.value }}
            >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="3" width="14" height="18" rx="2" />
                    <line x1="9" y1="7" x2="15" y2="7" />
                    <line x1="9" y1="11" x2="15" y2="11" />
                </svg>
            </div>
        </button>
    );
}

// Main Settings Panel Component
export default function SettingsPanel() {
    const {
        appearance,
        updateAppearance,
        resetAppearance,
        isSettingsOpen,
        closeSettings
    } = useAppearance();

    if (!isSettingsOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] transition-opacity"
                onClick={closeSettings}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl z-[9999] overflow-y-auto animate-slide-in-right">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={resetAppearance}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Reset to defaults"
                        >
                            <ResetIcon />
                        </button>
                        <button
                            onClick={closeSettings}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">
                    {/* Mode & Contrast */}
                    <div className="grid grid-cols-2 gap-3">
                        <SettingCard
                            icon={appearance.mode === 'dark' ? <MoonIcon /> : <SunIcon />}
                            label="Mode"
                            checked={appearance.mode === 'dark'}
                            onChange={(val) => updateAppearance('mode', val ? 'dark' : 'light')}
                        />
                        <SettingCard
                            icon={<ContrastIcon />}
                            label="Contrast"
                            checked={appearance.contrast === 'high'}
                            onChange={(val) => updateAppearance('contrast', val ? 'high' : 'normal')}
                        />
                    </div>

                    {/* Direction & Density */}
                    <div className="grid grid-cols-2 gap-3">
                        <SettingCard
                            icon={<RTLIcon />}
                            label="Right to left"
                            checked={appearance.direction === 'rtl'}
                            onChange={(val) => updateAppearance('direction', val ? 'rtl' : 'ltr')}
                        />
                        <SettingCard
                            icon={<CompactIcon />}
                            label="Compact"
                            checked={appearance.density === 'compact'}
                            onChange={(val) => updateAppearance('density', val ? 'compact' : 'comfortable')}
                            info="i"
                        />
                    </div>

                    {/* Navigation Section */}
                    <div className="space-y-4">
                        <SectionLabel>
                            Nav
                            <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px]">3</span>
                        </SectionLabel>

                        <div className="space-y-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Layout</p>
                            <div className="flex gap-3">
                                <NavLayoutOption
                                    type="sidebar"
                                    selected={appearance.navLayout === 'sidebar'}
                                    onClick={() => updateAppearance('navLayout', 'sidebar')}
                                />
                                <NavLayoutOption
                                    type="minimal"
                                    selected={appearance.navLayout === 'minimal'}
                                    onClick={() => updateAppearance('navLayout', 'minimal')}
                                />
                                <NavLayoutOption
                                    type="top"
                                    selected={appearance.navLayout === 'top'}
                                    onClick={() => updateAppearance('navLayout', 'top')}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Color</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => updateAppearance('navStyle', 'integrate')}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all
                    ${appearance.navStyle === 'integrate'
                                            ? 'border-[var(--primary-color)] bg-[var(--primary-color-light)] dark:bg-[var(--primary-color)]/10'
                                            : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'}
                  `}
                                >
                                    <div className="w-5 h-5 rounded border-2 border-[var(--primary-color)] flex items-center justify-center">
                                        <div className="w-2 h-2 bg-[var(--primary-color)] rounded-sm" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Integrate</span>
                                </button>
                                <button
                                    onClick={() => updateAppearance('navStyle', 'apparent')}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all
                    ${appearance.navStyle === 'apparent'
                                            ? 'border-[var(--primary-color)] bg-[var(--primary-color-light)] dark:bg-[var(--primary-color)]/10'
                                            : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'}
                  `}
                                >
                                    <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-gray-400 rounded-sm" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Apparent</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Presets Section */}
                    <div className="space-y-4">
                        <SectionLabel>Presets</SectionLabel>
                        <div className="grid grid-cols-3 gap-3">
                            {colorPresets.map((color) => (
                                <ColorPresetButton
                                    key={color.value}
                                    color={color}
                                    selected={appearance.primaryColor === color.value}
                                    onClick={() => updateAppearance('primaryColor', color.value)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Font Section */}
                    <div className="space-y-4">
                        <SectionLabel>Font</SectionLabel>

                        <div className="space-y-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Family</p>
                            <div className="grid grid-cols-2 gap-3">
                                {fontFamilies.map((font) => (
                                    <FontFamilyCard
                                        key={font.name}
                                        name={font.name}
                                        selected={appearance.fontFamily === font.name}
                                        onClick={() => updateAppearance('fontFamily', font.name)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Size</p>
                            <div className="space-y-2">
                                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-center">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {appearance.fontSize}px
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="14"
                                    max="20"
                                    step="1"
                                    value={appearance.fontSize}
                                    onChange={(e) => updateAppearance('fontSize', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gradient-to-r from-[var(--primary-color)] to-cyan-400 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-5
                    [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-gray-200
                    [&::-webkit-slider-thumb]:cursor-pointer
                  "
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer spacing */}
                <div className="h-8" />
            </div>

            {/* Animation Styles */}
            <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
        </>
    );
}
