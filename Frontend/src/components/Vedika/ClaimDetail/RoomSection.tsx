import React from 'react';
import { RoomStay } from '../../../services/vedikaService';

interface RoomSectionProps {
    data: RoomStay[];
}

const RoomSection: React.FC<RoomSectionProps> = ({ data }) => {
    if (!data || data.length === 0) return null; // Only show if there's data (Ranap)

    return (
        <div className="bg-white mb-6 border border-gray-300 overflow-hidden">
            <div className="bg-gray-800 p-2 flex items-center text-white border-b border-gray-300">
                <div className="w-1.5 h-3 bg-emerald-500 mr-2 rounded-full"></div>
                <h3 className="text-xs font-bold uppercase tracking-wider">Kamar & Bangsal Rawat Inap</h3>
            </div>
            <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-300 text-[10px] font-bold uppercase">
                <div className="col-span-3 border-r border-gray-300 px-3 py-1">Kamar & Bangsal</div>
                <div className="col-span-2 border-r border-gray-300 px-3 py-1 text-center">Masuk</div>
                <div className="col-span-2 border-r border-gray-300 px-3 py-1 text-center">Keluar</div>
                <div className="col-span-1 border-r border-gray-300 px-3 py-1 text-center">Lama</div>
                <div className="col-span-2 border-r border-gray-300 px-3 py-1 text-right">Tarif</div>
                <div className="col-span-2 px-3 py-1 text-center">Status</div>
            </div>

            {data.map((stay, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[10px] border-b border-gray-200 last:border-b-0">
                    <div className="col-span-3 border-r border-gray-300 px-3 py-0.5 font-bold uppercase">
                        {stay?.kamar || '-'} / {stay?.bangsal || '-'}
                    </div>
                    <div className="col-span-2 border-r border-gray-300 px-3 py-0.5 text-center">
                        {stay?.tgl_masuk} {stay?.jam_masuk}
                    </div>
                    <div className="col-span-2 border-r border-gray-300 px-3 py-0.5 text-center">
                        {stay?.tgl_keluar || '-'} {stay?.jam_keluar}
                    </div>
                    <div className="col-span-1 border-r border-gray-300 px-3 py-0.5 text-center">
                        {stay?.lama_inap || 0} Hari
                    </div>
                    <div className="col-span-2 border-r border-gray-300 px-3 py-0.5 text-right font-mono">
                        {(stay?.tarif || 0).toLocaleString('id-ID')}
                    </div>
                    <div className="col-span-2 px-3 py-0.5 text-center italic">
                        {stay?.status_pulang || '-'}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RoomSection;
