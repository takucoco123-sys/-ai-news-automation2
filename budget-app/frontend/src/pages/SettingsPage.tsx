import { useRef } from 'react';
import { exportData, importData } from '../api/client';

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kakeibo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importData(ev.target?.result as string);
        alert('インポートしました。ページを再読み込みします。');
        window.location.reload();
      } catch { alert('ファイルが正しくありません'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">設定</h1>
        <p className="text-sm text-gray-500 mt-1">バックアップとデータ管理</p>
      </div>
      <div className="glass rounded-2xl p-6 space-y-4 max-w-md">
        <div>
          <h2 className="text-sm font-semibold text-gray-200 tracking-wide">データのバックアップ</h2>
          <p className="text-xs text-gray-500 mt-1">データはこの端末のブラウザに保存されています。機種変更の前にエクスポートしておくと安心です。</p>
        </div>
        <button onClick={handleExport} className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.6)] transition-all">
          データをエクスポート
        </button>
        <div className="border-t border-white/5 pt-4">
          <p className="text-xs text-gray-500 mb-2">バックアップファイルから復元する</p>
          <button onClick={() => fileRef.current?.click()} className="w-full bg-white/5 border border-white/10 text-gray-200 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
            データをインポート
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>
    </div>
  );
}
