import CategoryManager from '../components/CategoryManager';

export default function CategoriesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">カテゴリ</h1>
        <p className="text-sm text-gray-500 mt-1">収入・支出を分類するためのカテゴリ管理</p>
      </div>
      <CategoryManager />
    </div>
  );
}
