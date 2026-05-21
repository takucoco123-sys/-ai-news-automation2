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
      try { importData(ev.target?.result as string); alert('インポートしました。ページを再読み込みします。'); window.location.reload(); }
      catch { alert('ファイルが正しくありません'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">設定</h1>
        <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: '#7a6f5e' }}>Settings</p>
      </div>
      <div className="glass rounded-2xl p-6 space-y-5 max-w-sm">
        <div>
          <h2 className="text-sm font-semibold mb-1" style={{ color: '#e8e4da' }}>データのバックアップ</h2>
          <p className="text-xs" style={{ color: '#7a6f5e' }}>データはこの端末のブラウザに保存されています。機種変更前にエクスポートしておくと安心です。</p>
        </div>
        <button onClick={handleExport} className="btn-gold w-full py-3 rounded-xl text-sm">
          データをエクスポート
        </button>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <p className="text-xs mb-2" style={{ color: '#7a6f5e' }}>バックアップファイルから復元する</p>
          <button onClick={() => fileRef.current?.click()}
            className="w-full py-3 rounded-xl text-sm transition-all"
            style={{ background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#c9a84c' }}>
            データをインポート
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>
    </div>
  );
}
