import React from 'react';
import { MedicalResumeRalan, MedicalResumeRanap } from '../../../services/vedikaService';

interface ResumeSectionProps {
    ralan: MedicalResumeRalan | null;
    ranap: MedicalResumeRanap | null;
    jenis: string; // ralan or ranap
}

const ResumeSection: React.FC<ResumeSectionProps> = ({ ralan, ranap, jenis }) => {
    const isRanap = jenis?.toLowerCase() === 'ranap';
    const isRalan = jenis?.toLowerCase() === 'ralan';
    const title = isRanap ? 'Resume Medis Rawat Inap' : 'Resume Medis Rawat Jalan';
    const bgColor = isRanap ? 'bg-amber-600' : 'bg-amber-700';

    return (
        <div className="bg-white mb-6 border border-gray-300">
            <div className={`${bgColor} text-white px-3 py-1 text-[10px] font-bold uppercase text-center`}>
                {title}
            </div>

            {(isRanap && ranap) ? (
                <div className="text-[10px]">
                    <ResumeRow label="Keluhan Utama" value={ranap.keluhan_utama} />
                    <ResumeRow label="Jalannya Penyakit" value={ranap.jalannya_penyakit} />
                    <ResumeRow label="Diagnosa Utama" value={ranap.diagnosa_utama} className="font-bold underline" />
                    <ResumeRow label="Diagnosa Sekunder" value={[ranap.diagnosa_sekunder1, ranap.diagnosa_sekunder2, ranap.diagnosa_sekunder3].filter(Boolean).join(', ')} />
                    <ResumeRow label="Prosedur Utama" value={ranap.prosedur_utama} />
                    <ResumeRow label="Pemeriksaan Fisik" value={ranap.pemeriksaan_fisik} />
                    <ResumeRow label="Pemeriksaan Penunjang" value={ranap.pemeriksaan_penunjang} />
                    <ResumeRow label="Obat Pulang" value={ranap.obat_pulang} />
                    <ResumeRow label="Kondisi Pulang" value={ranap.kondisi_pulang} />
                    <div className="p-3 border-t border-gray-200 text-right italic font-medium">
                        DPJP: {ranap.nama_dokter}
                    </div>
                </div>
            ) : (isRalan && ralan) ? (
                <div className="text-[10px]">
                    <ResumeRow label="Keluhan Utama" value={ralan.keluhan_utama} />
                    <ResumeRow label="Pemeriksaan" value={ralan.pemeriksaan} />
                    <div className="grid grid-cols-4 border-b border-gray-100 bg-gray-50 uppercase text-[9px] font-bold text-gray-500">
                        <div className="px-2 py-0.5 border-r border-gray-200 text-center">Tensi: {ralan.tensi}</div>
                        <div className="px-2 py-0.5 border-r border-gray-200 text-center">Nadi: {ralan.nadi}</div>
                        <div className="px-2 py-0.5 border-r border-gray-200 text-center">RR: {ralan.respirasi}</div>
                        <div className="px-2 py-0.5 text-center">Observasi: {ralan.observasi}</div>
                    </div>
                    <ResumeRow label="Diagnosa Utama" value={ralan.diagnosa_utama} className="font-bold underline" />
                    <ResumeRow label="Diagnosa Sekunder" value={[ralan.diagnosa_sekunder1, ralan.diagnosa_sekunder2].filter(Boolean).join(', ')} />
                    <ResumeRow label="Prosedur Utama" value={ralan.prosedur_utama} />
                    <ResumeRow label="Post Operasi" value={ralan.post_operasi} />
                    <div className="p-3 border-t border-gray-200 text-right italic font-medium">
                        Dokter: {ralan.nama_dokter}
                    </div>
                </div>
            ) : (
                <div className="p-4 text-center text-amber-700 text-[10px] italic">
                    -- Data resume medis untuk kunjungan ini belum tersedia --
                </div>
            )}
        </div>
    );
};

const ResumeRow: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className = "" }) => (
    <div className="flex border-b border-gray-100 last:border-b-0">
        <div className="w-[140px] px-3 py-1.5 border-r border-gray-300 font-bold bg-gray-50 uppercase text-[9px] text-gray-600 flex items-center">{label}</div>
        <div className="flex-1 px-3 py-1.5 whitespace-pre-wrap leading-relaxed min-h-[1.5rem] flex items-center">
            <span className={className}>{value || '-'}</span>
        </div>
    </div>
);

export default ResumeSection;
