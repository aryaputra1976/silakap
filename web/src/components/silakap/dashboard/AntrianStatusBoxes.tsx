interface Props {
  menunggu: number;
  diproses: number;
  slaKritis: number;
}

export default function AntrianStatusBoxes({ menunggu, diproses, slaKritis }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-4 text-center">
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{menunggu}</p>
        <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">Menunggu</p>
      </div>
      <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 p-4 text-center">
        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{diproses}</p>
        <p className="mt-1 text-xs text-orange-500 dark:text-orange-400">Diproses</p>
      </div>
      <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 p-4 text-center">
        <p className="text-3xl font-bold text-red-500 dark:text-red-400">{slaKritis}</p>
        <p className="mt-1 text-xs text-red-400 dark:text-red-400">SLA kritis</p>
      </div>
    </div>
  );
}
