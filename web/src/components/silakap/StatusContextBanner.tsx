"use client";

type BannerVariant = "action" | "waiting" | "warning" | "success" | "info";

interface BannerConfig {
  variant: BannerVariant;
  icon: string;
  title: string;
  desc: string;
}

const getBannerConfig = (
  status: string,
  tahap: string | null,
  role: string,
): BannerConfig | null => {
  if (status === "Selesai") return {
    variant: "success",
    icon: "task_alt",
    title: "Layanan selesai diproses",
    desc: "Usulan telah disetujui. Dokumen hasil tersedia di bawah jika sudah diunggah petugas.",
  };

  if (status === "Ditolak" || status === "Diarsipkan") return null;

  if (status === "Draft") {
    if (role === "Pengelola_OPD") return {
      variant: "action",
      icon: "pending_actions",
      title: "Usulan masih Draft",
      desc: "Lengkapi dokumen persyaratan di bawah, lalu klik Submit untuk mengirim ke Analis Pertama.",
    };
    return {
      variant: "info",
      icon: "edit_note",
      title: "Usulan sedang disiapkan",
      desc: "Pemohon sedang melengkapi data dan dokumen.",
    };
  }

  if (status === "Dikembalikan") {
    if (role === "Pengelola_OPD") return {
      variant: "warning",
      icon: "assignment_return",
      title: "Usulan dikembalikan untuk perbaikan",
      desc: "Perbaiki data atau unggah ulang dokumen sesuai catatan, lalu klik Kirim Ulang.",
    };
    return {
      variant: "warning",
      icon: "assignment_return",
      title: "Menunggu perbaikan dari pemohon",
      desc: "Pemohon perlu memperbaiki dan mengirim ulang usulan ini.",
    };
  }

  if (status === "Diajukan") {
    if (role === "Analis_Pertama") return {
      variant: "action",
      icon: "inbox",
      title: "Usulan baru masuk — giliran Anda",
      desc: "Klik Terima untuk memulai proses verifikasi oleh Analis Pertama.",
    };
    if (role === "Pengelola_OPD") return {
      variant: "waiting",
      icon: "hourglass_top",
      title: "Menunggu konfirmasi Analis Pertama",
      desc: "Usulan telah dikirim. Analis Pertama akan segera memproses.",
    };
    return {
      variant: "waiting",
      icon: "hourglass_top",
      title: "Menunggu Analis Pertama",
      desc: "Usulan telah masuk dan menunggu diterima.",
    };
  }

  const TAHAP_CONFIG: Record<string, { activeRole: string; activeDesc: string; waitingDesc: string }> = {
    AP: {
      activeRole: "Analis_Pertama",
      activeDesc: "Periksa kelengkapan dokumen usulan ini, lalu Teruskan ke Analis Muda atau Kembalikan ke pemohon.",
      waitingDesc: "Usulan sedang diverifikasi oleh Analis Pertama.",
    },
    AM: {
      activeRole: "Analis_Muda",
      activeDesc: "Lakukan verifikasi dan analisis, lalu Teruskan ke Analis Madya atau Kembalikan.",
      waitingDesc: "Usulan sedang diverifikasi oleh Analis Muda.",
    },
    AD: {
      activeRole: "Analis_Madya",
      activeDesc: "Lakukan quality control, lalu Teruskan ke Kabid atau Kembalikan.",
      waitingDesc: "Usulan sedang dalam quality control Analis Madya.",
    },
    Kabid: {
      activeRole: "Kabid",
      activeDesc: "Usulan menunggu persetujuan Anda. Klik Setujui untuk meneruskan atau Kembalikan untuk perbaikan.",
      waitingDesc: "Usulan sedang menunggu persetujuan Kabid.",
    },
    KepalaBadan: {
      activeRole: "Kepala_Badan",
      activeDesc: "Usulan menunggu persetujuan akhir Anda. Klik Setujui untuk menyelesaikan proses.",
      waitingDesc: "Usulan sedang menunggu persetujuan Kepala Badan.",
    },
  };

  if (tahap && TAHAP_CONFIG[tahap]) {
    const cfg = TAHAP_CONFIG[tahap];
    const isMyTurn = role === cfg.activeRole;
    return {
      variant: isMyTurn ? "action" : "waiting",
      icon: isMyTurn ? "assignment_turned_in" : "hourglass_top",
      title: isMyTurn ? "Giliran Anda — tindakan diperlukan" : "Sedang diproses",
      desc: isMyTurn ? cfg.activeDesc : cfg.waitingDesc,
    };
  }

  return null;
};

const STYLES: Record<BannerVariant, { wrap: string; iconColor: string; titleColor: string; descColor: string }> = {
  action: {
    wrap: "bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800/40",
    iconColor: "text-primary-600 dark:text-primary-400",
    titleColor: "text-primary-800 dark:text-primary-200",
    descColor: "text-primary-700 dark:text-primary-300",
  },
  waiting: {
    wrap: "bg-gray-50 border-gray-200 dark:bg-[#15203c] dark:border-[#172036]",
    iconColor: "text-gray-400",
    titleColor: "text-gray-700 dark:text-gray-300",
    descColor: "text-gray-500 dark:text-gray-400",
  },
  warning: {
    wrap: "bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800/40",
    iconColor: "text-warning-600 dark:text-warning-400",
    titleColor: "text-warning-800 dark:text-warning-200",
    descColor: "text-warning-700 dark:text-warning-300",
  },
  success: {
    wrap: "bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800/40",
    iconColor: "text-success-600 dark:text-success-400",
    titleColor: "text-success-800 dark:text-success-200",
    descColor: "text-success-700 dark:text-success-300",
  },
  info: {
    wrap: "bg-gray-50 border-gray-200 dark:bg-[#15203c] dark:border-[#172036]",
    iconColor: "text-gray-500 dark:text-gray-400",
    titleColor: "text-gray-700 dark:text-gray-300",
    descColor: "text-gray-500 dark:text-gray-400",
  },
};

interface Props {
  status: string;
  tahapSaatIni: string | null;
  userRole: string;
}

export default function StatusContextBanner({ status, tahapSaatIni, userRole }: Props) {
  const config = getBannerConfig(status, tahapSaatIni, userRole);
  if (!config) return null;

  const s = STYLES[config.variant];

  return (
    <div className={`rounded-xl border px-4 py-3.5 flex items-start gap-3 ${s.wrap}`}>
      {config.variant === "action" ? (
        <span className="relative flex h-2.5 w-2.5 mt-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500" />
        </span>
      ) : (
        <i className={`material-symbols-outlined !text-[20px] shrink-0 mt-0.5 ${s.iconColor}`}>
          {config.icon}
        </i>
      )}
      <div className="min-w-0">
        <p className={`font-semibold text-sm ${s.titleColor}`}>{config.title}</p>
        <p className={`text-sm mt-0.5 leading-relaxed ${s.descColor}`}>{config.desc}</p>
      </div>
    </div>
  );
}
