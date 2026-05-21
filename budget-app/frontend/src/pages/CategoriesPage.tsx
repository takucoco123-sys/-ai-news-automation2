import CategoryManager from '../components/CategoryManager';

export default function CategoriesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">カテゴリ</h1>
        <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: '#7a6f5e' }}>Category Management</p>
      </div>
      <CategoryManager />
    </div>
  );
}
