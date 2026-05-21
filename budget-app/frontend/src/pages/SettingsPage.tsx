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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">設定</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 max-w-md">
        <h2 className="text-sm font-semibold text-gray-700">データのバックアップ</h2>
        <p className="text-xs text-gray-500">データはこの端末のブラウザに保存されています。機種変更の前にエクスポートしておくと安心です。</p>
        <button onClick={handleExport} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">📥 データをエクスポート（バックアップ）</button>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 mb-2">バックアップファイルから復元する</p>
          <button onClick={() => fileRef.current?.click()} className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">📤 データをインポート（復元）</button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>
    </div>
  );
}
