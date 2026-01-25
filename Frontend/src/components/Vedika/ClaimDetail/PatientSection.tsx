import React from 'react';
import { PatientRegistration } from '../../../services/vedikaService';

interface PatientSectionProps {
    data: PatientRegistration;
}

const PatientSection: React.FC<PatientSectionProps> = ({ data }) => {
    return (
        <div className="bg-white mb-6 border border-gray-300 overflow-hidden">
            <div className="bg-gray-800 p-2 flex items-center text-white border-b border-gray-300">
                <div className="w-1.5 h-3 bg-emerald-500 mr-2 rounded-full"></div>
                <h3 className="text-xs font-bold uppercase tracking-wider">SOAP dan Riwayat Perawatan</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-px bg-gray-300 border border-gray-300">
                <PatientRow label="No.RM" value={data.no_rm} />
                <PatientRow label="Nama Pasien" value={data.nama_pasien} className="uppercase font-bold" />
                <PatientRow label="Alamat" value={`${data.alamat}, ${data.kecamatan}, ${data.kabupaten}`} />
                <PatientRow label="Umur" value={data.umur} />
                <PatientRow label="Tempat & Tanggal Lahir" value={`${data.tempat_lahir}, ${data.tgl_lahir}`} />
                <PatientRow label="Ibu Kandung" value={data.ibu_kandung || '-'} />
                <PatientRow label="Golongan Darah" value={data.gol_darah || '-'} />
                <PatientRow label="Status Nikah" value={data.status_nikah} />
                <PatientRow label="Agama" value={data.agama} />
                <PatientRow label="Pendidikan Terakhir" value={data.pendidikan || '-'} />
                <PatientRow label="Pertama Daftar" value={data.tgl_pertama_daftar} />
                <PatientRow label="No.Rawat" value={data.no_rawat} className="font-mono" />
                <PatientRow label="No.Registrasi" value={data.no_reg} />
                <PatientRow label="Tanggal Registrasi" value={`${data.tgl_registrasi} ${data.jam_reg}`} />
                <PatientRow label="Unit/Poliklinik" value={data.unit} />
                <PatientRow label="Dokter" value={data.dokter} />
                <PatientRow label="Cara Bayar" value={data.cara_bayar} />
                <PatientRow label="Penanggung Jawab" value={data.penanggung_jawab} />
                <PatientRow label="Alamat P.J." value={data.alamat_pj} />
                <PatientRow label="Hubungan P.J." value={data.hubungan_pj} />
                <PatientRow label="Status" value={data.status_lanjut} />
            </div>
        </div>
    );
};

const PatientRow: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className = "" }) => (
    <div className="flex bg-white">
        <div className="w-1/3 px-3 py-1 border-r border-gray-300 font-medium text-xs">{label}</div>
        <div className="w-[10px] py-1 border-r border-gray-300 flex justify-center text-xs">:</div>
        <div className={`flex-1 px-3 py-1 text-xs ${className}`}>{value}</div>
    </div>
);

export default PatientSection;
