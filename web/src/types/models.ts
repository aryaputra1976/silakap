export type RoleName =
  | "Pengelola_OPD"
  | "Analis_Pertama"
  | "Analis_Muda"
  | "Analis_Madya"
  | "Kabid"
  | "Kepala_Badan"
  | "Admin_Sistem";

export interface User {
  id: string;
  username: string;
  namaLengkap: string;
  email: string | null;
  nomorHp: string | null;
  unitOrganisasiId: string | null;
  asnId: string | null;
  roleId: string;
  roleNama: RoleName;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export type StatusUsulan =
  | "Draft"
  | "Diajukan"
  | "VerifikasiAP"
  | "VerifikasiAM"
  | "QualityControl"
  | "ApprovalKabid"
  | "ApprovalKepalaBadan"
  | "Selesai"
  | "Ditolak"
  | "Dikembalikan"
  | "Diarsipkan";

export type TahapUsulan = "AP" | "AM" | "AD" | "Kabid" | "KepalaBadan";

export interface UsulanLayanan {
  id: string;
  nomorUsulan: string;
  jenisLayananId: string;
  asnId: string;
  unitOrganisasiId: string;
  diajukanOlehId: string | null;
  tanggalUsulan: string;
  status: StatusUsulan;
  tahapSaatIni: TahapUsulan | null;
  tglSelesai: string | null;
  alasanPenolakan: string | null;
  createdAt: string;
  updatedAt: string;
  asn?: { id: string; nipBaru: string; nama: string };
  jenisLayanan?: { id: string; kode: string; nama: string };
  unitOrganisasi?: { id: string; nama: string };
}

export interface Asn {
  id: string;
  nipBaru: string;
  nipLama: string | null;
  nama: string;
  gelarDepan: string | null;
  gelarBelakang: string | null;
  statusPegawai: "Aktif" | "Pensiun" | "Meninggal" | "Keluar";
  unitOrganisasiId: string | null;
  golonganId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notifikasi {
  id: string;
  userId: string;
  type: string;
  judul: string;
  isi: string;
  link: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface WorkflowLog {
  id: string;
  usulanLayananId: string;
  dariTahap: TahapUsulan | null;
  keTahap: TahapUsulan | null;
  aksi: string;
  catatan: string | null;
  createdAt: string;
  dilakukanOleh: { id: string; namaLengkap: string } | null;
}

export interface SlaTracker {
  id: string;
  usulanId: string;
  tahapSaat: TahapUsulan;
  masukTahap: string;
  slaHabisAt: string;
  statusSla: "OK" | "Warning" | "Overdue";
  selesaiAt: string | null;
}

export interface UsulanDokumen {
  id: string;
  usulanLayananId: string;
  jenisDokumen: string | null;
  namaFile: string;
  pathFile: string;
  ukuran: string | null;
  mimeType: string | null;
  createdAt: string;
}

export interface UsulanDokumenOutput {
  id: string;
  usulanLayananId: string;
  jenisDokumen: string | null;
  nomorDokumen: string | null;
  namaFile: string | null;
  statusTte: "Draft" | "PendingTte" | "Signed";
  tglTte: string | null;
  createdAt: string;
}

export interface UsulanRevisi {
  id: string;
  usulanId: string;
  nomorRevisi: number;
  dariTahap: TahapUsulan;
  alasanDikembalikan: string;
  statusRevisi: "Menunggu" | "Direvisi" | "Selesai";
  tglDikembalikan: string;
  dikembalikanOleh: { namaLengkap: string } | null;
}

export interface UsulanDetail extends UsulanLayanan {
  jenisLayanan: {
    id: string;
    kode: string;
    nama: string;
    butuhTteKepalaBadan: boolean;
  };
  asn: {
    id: string;
    nipBaru: string;
    nama: string;
    unitOrganisasiId: string | null;
  };
  unitOrganisasi: { id: string; nama: string };
  workflowLog: WorkflowLog[];
  slaTracker: SlaTracker[];
  dokumen: UsulanDokumen[];
  dokumenOutput: UsulanDokumenOutput[];
}

export interface RefJenisLayanan {
  id: string;
  kode: string;
  nama: string;
  butuhTteKepalaBadan: boolean;
  isActive: boolean;
  persyaratanLayanan?: {
    id: string;
    namaPersyaratan: string;
    isRequired: boolean;
    urutan: number;
  }[];
}

export interface AsnDetail extends Asn {
  gelarDepan: string | null;
  gelarBelakang: string | null;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  nik: string | null;
  nomorHp: string | null;
  email: string | null;
  emailGov: string | null;
  alamat: string | null;
  npwp: string | null;
  bpjs: string | null;
  jenisPegawai: string | null;
  kedudukanHukum: string | null;
  nomorSkCpns: string | null;
  tanggalSkCpns: string | null;
  tmtCpns: string | null;
  nomorSkPns: string | null;
  tanggalSkPns: string | null;
  tmtPns: string | null;
  mkTahun: number | null;
  mkBulan: number | null;
  tmtGolongan: string | null;
  tmtJabatan: string | null;
  lokasiKerja: string | null;
  nikValid: boolean;
  flagIkd: boolean;
  golongan: { id: string; nama: string } | null;
  jenisJabatan: { id: string; nama: string } | null;
  unitOrganisasi: { id: string; nama: string } | null;
  tingkatPendidikan: { id: string; nama: string } | null;
  bidangPendidikan: { id: string; nama: string } | null;
  jabatanStruktural: { id: string; nama: string } | null;
  jabatanFungsional: { id: string; nama: string } | null;
  jabatanPelaksana: { id: string; nama: string } | null;
  jenisKelamin: { id: string; nama: string } | null;
  agama: { id: string; nama: string } | null;
  statusKawin: { id: string; nama: string } | null;
}

export interface AsnRiwayat {
  id: string;
  asnId: string;
  jenis: string;
  keterangan: string | null;
  tanggal: string | null;
  createdAt: string;
}

export interface RefSimple {
  id: string;
  nama: string;
}

export interface RefGolongan {
  id: string;
  kode: string;
  nama: string;
}

export interface LaporanHarian {
  id: string;
  tanggalLaporan: string;
  usulanMasuk: number;
  usulanSelesai: number;
  usulanDikembalikan: number;
  melampauiSla: number;
  createdAt: string;
}

export interface LaporanBulanan {
  id: string;
  tahun: number;
  bulan: number;
  totalLayananSelesai?: number;
  capaiSlaPercent?: number | null;
  melampauiSlaCount?: number;
  totalMasuk: number;
  totalSelesai: number;
  totalDikembalikan: number;
  totalBatal: number;
  totalMelampauiSla: number;
  rataRataHariPenyelesaian: number | null;
  createdAt: string;
}

export interface PerencanaanPensiun {
  id: string;
  asnId: string;
  tanggalBup: string;
  tahunBup: number;
  bupUsia: number;
  keterangan: string | null;
  sudahDiproses: boolean;
  createdAt: string;
  asn: {
    id: string;
    nipBaru: string;
    nama: string;
    unitOrganisasiId: string | null;
  } | null;
}

export interface ArsipUsulan {
  id: string;
  usulanLayananId: string;
  alasanArsip: string | null;
  dataSnapshot: Record<string, unknown>;
  createdAt: string;
  usulanLayanan: {
    id: string;
    nomorUsulan: string;
    status: string;
    jenisLayananId: string;
  } | null;
  diarsipkanOleh: { namaLengkap: string } | null;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  userNama: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  newValues: Record<string, unknown> | null;
  oldValues: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotifikasiCount {
  total: number;
  belumDibaca: number;
}

export interface UserAdmin {
  id: string;
  username: string;
  namaLengkap: string;
  email: string | null;
  nomorHp: string | null;
  roleId: string;
  roleNama: string;
  unitOrganisasiId: string | null;
  unitOrganisasi?: { id: string; nama: string } | null;
  asnId: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface Role {
  id: string;
  nama: string;
  deskripsi: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Permission {
  id: string;
  nama: string;
  deskripsi: string | null;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface RefGolonganFull {
  id: string;
  kode: string;
  nama: string;
  roman: string | null;
  tingkat: number | null;
}

export interface UnitOrganisasi {
  id: string;
  nama: string;
  idAtasan: string | null;
  level: number | null;
  isOpd: boolean;
}

export interface JenisLayananFull {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string | null;
  butuhTteKepalaBadan: boolean;
  isActive: boolean;
  persyaratanLayanan: {
    id: string;
    namaPersyaratan: string;
    isRequired: boolean;
    urutan: number;
  }[];
}

export interface RefJenisJabatan {
  id: string;
  nama: string;
  keterangan: string | null;
}

export interface RefJabatanStruktural {
  id: string;
  nama: string;
  unitOrganisasiId: string;
  unitOrganisasi?: { id: string; nama: string };
  eselonId: number | null;
  bup: number;
  kode: string | null;
  idSiasn: string | null;
  isActive: boolean;
}

export interface RefJabatanFungsional {
  id: string;
  kode: string | null;
  nama: string;
  jenjang: string | null;
  bup: number;
  idSiasn: string | null;
  isActive: boolean;
}

export interface RefJabatanPelaksana {
  id: string;
  kode: string | null;
  nama: string;
  idSiasn: string | null;
  isActive: boolean;
}

export interface ConfigSla {
  id: string;
  jenisLayananId: string | null;
  jenisLayanan?: { nama: string } | null;
  jabatan: string;
  slaHari: number;
  slaJam: number;
  eskalasiHari: number | null;
}

export interface EmailStatus {
  configured: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpFrom: string;
}

export interface ConfigNotifikasi {
  id: string;
  eventType: string | null;
  channel: "InApp" | "Email" | "WhatsApp" | "SMS" | null;
  penerimaRole: string | null;
  templateMessage: string | null;
  isActive: boolean;
}

export interface ConfigLaporanOtomatis {
  id: string;
  jenisLaporan: "Harian" | "Bulanan" | null;
  jadwalPengiriman: string | null;
  formatLaporan: "PDF" | "Excel" | null;
  penerimaRole: string | null;
  isActive: boolean;
  lastSent: string | null;
}

export interface SiasnImportLog {
  id: string;
  jenisData: string;
  status: string;
  totalBaris?: number;
  successBaris: number;
  failedBaris: number;
  createdAt: string;
  completedAt?: string | null;
}

export interface AsnPeremajaan {
  id: string;
  asnId: string;
  jenisPerubahan: string;
  dataLama: Record<string, unknown> | null;
  dataBaru: Record<string, unknown>;
  statusApproval: "Pending" | "Approved" | "Rejected";
  catatan: string | null;
  createdAt: string;
  asn?: { id: string; nipBaru: string; nama: string };
  diajukanOleh?: { id: string; namaLengkap: string };
  disetujuiOleh?: { id: string; namaLengkap: string } | null;
}

export interface ValidasiData {
  asnTanpaUnit: number;
  duplikatNik: number;
  duplikatNip: number;
  checkedAt?: string;
}

export interface AdminHealthDashboard {
  status: "ok" | "warning";
  uptimeSeconds: number;
  node: string;
  platform: string;
  db: { connected: boolean; latencyMs: number };
  counts: { users: number; layanan: number };
  storage: {
    uploadDir: string;
    uploadDirReady: boolean;
    backupDir: string;
    backupDirReady: boolean;
    backupCount: number;
    latestBackup: Record<string, unknown> | null;
  };
  memory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  envAudit: {
    ok: boolean;
    warnings: string[];
    errors: string[];
  };
}

export interface MaintenanceArchiveResult {
  cutoff: string;
  archived: number;
  remainingBatchLimit: boolean;
}

export interface MaintenanceBackupResult {
  filename: string;
  path: string;
  size: number;
  retained: number;
}

export interface MaintenanceCleanupResult {
  dryRun: boolean;
  scanned: number;
  referenced: number;
  orphanCount: number;
  orphanFiles: string[];
}
