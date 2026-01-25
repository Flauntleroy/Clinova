import React from 'react';
import { MedicalAction } from '../../../services/vedikaService';

interface ActionsSectionProps {
    data: MedicalAction[];
}

const ActionsSection: React.FC<ActionsSectionProps> = ({ data }) => {
    return (
        <div className="bg-white mb-6 border border-gray-300 overflow-hidden">
            <div className="bg-gray-800 p-2 flex items-center text-white border-b border-gray-300">
                <div className="w-1.5 h-3 bg-emerald-500 mr-2 rounded-full"></div>
                <h3 className="text-xs font-bold uppercase tracking-wider">Tindakan Medis & Prosedur Hospital</h3>
            </div>
            <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-300 text-[10px] font-bold uppercase">
                <div className="col-span-2 border-r border-gray-300 px-3 py-1">Tindakan Medis</div>
                <div className="col-span-3 border-r border-gray-300 px-3 py-1">Nama Tindakan</div>
                <div className="col-span-3 border-r border-gray-300 px-3 py-1">Dokter / Petugas</div>
                <div className="col-span-2 border-r border-gray-300 px-3 py-1 text-center">Tanggal & Jam</div>
                <div className="col-span-2 px-3 py-1 text-center">Kategori</div>
            </div>

            {(!data || data.length === 0) ? (
                <div className="p-2 text-center text-gray-400 text-[10px]">Tidak ada data tindakan medis.</div>
            ) : (
                data.map((action, idx) => (
                    <div key={idx} className="grid grid-cols-12 text-[10px] border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                        <div className="col-span-2 border-r border-gray-300 px-3 py-0.5 bg-gray-50 font-medium">#{idx + 1} ({action?.kode || '-'})</div>
                        <div className="col-span-3 border-r border-gray-300 px-3 py-0.5 uppercase">{action?.nama || '-'}</div>
                        <div className="col-span-3 border-r border-gray-300 px-3 py-0.5 truncate italic">
                            {action?.dokter || action?.petugas || '-'}
                        </div>
                        <div className="col-span-2 border-r border-gray-300 px-3 py-0.5 text-center font-mono">
                            {action?.tanggal} {action?.jam}
                        </div>
                        <div className="col-span-2 px-3 py-0.5 flex justify-center items-center">
                            <span className="px-2 py-0.5 rounded-[4px] text-[8px] font-bold text-white uppercase tracking-tight bg-emerald-600 shadow-sm">
                                {action?.kategori?.includes?.('(Ranap)') ? 'Rawat Inap' : 'Rawat Jalan'}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default ActionsSection;
