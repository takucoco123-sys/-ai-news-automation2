import { useEffect, useState } from 'react';
import type { PlannedExpense, PlanSettings } from '../types';
import {
  getPlannedExpenses, createPlannedExpense, updatePlannedExpense, deletePlannedExpense,
  getPlanSettings, savePlanSettings,
  getTransactions,
} from '../api/client';

const thisMonth = () => new Date().toISOString().slice(0, 7);
const fmt = (v: number) => `¥${Math.round(v).toLocaleString()}`;

interface NewExpenseForm {
  name: string;
  amount: string;
  due_day: string;
  recurring: boolean;
}

const BLANK_FORM: NewExpenseForm = { name: '', amount: '', due_day: '1', recurring: true };

export default function PlanningPage() {
  const [yearMonth, setYearMonth] = useState(thisMonth());
  const [planned, setPlanned] = useState<PlannedExpense[]>([]);
  const [settings, setSettings] = useState<PlanSettings>(getPlanSettings());
  const [form, setForm] = useState<NewExpenseForm>(BLANK_FORM);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [actualIncome, setActualIncome] = useState(0);
  const [actualExpense, setActualExpense] = useState(0);

  const load = () => setPlanned(getPlannedExpenses(yearMonth));

  useEffect(() => { load(); }, [yearMonth]);

  useEffect(() => {
    getTransactions({ year_month: yearMonth }).then((txs) => {
      setActualIncome(txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0));
      setActualExpense(txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
    });
  }, [yearMonth]);

  const handleSettingChange = (key: keyof PlanSettings, value: number) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    savePlanSettings(next);
  };

  const handleAddExpense = () => {
    if (!form.name.trim()) { setFormError('支出名を入力してください'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setFormError('金額を入力してください'); return; }
    const day = parseInt(form.due_day);
    if (!form.due_day || isNaN(day) || day < 1 || day > 31) { setFormError('支払日は1〜31で入力してください'); return; }
    setFormError('');
    createPlannedExpense({
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      due_day: day,
      recurring: form.recurring,
      paid: false,
      year_month: yearMonth,
    });
    setForm(BLANK_FORM);
    setShowForm(false);
    load();
  };

  const togglePaid = (e: PlannedExpense) => {
    updatePlannedExpense(e.id, { paid: !e.paid });
    load();
  };

  const handleDelete = (id: number) => {
    if (!confirm('削除しますか？')) return;
    deletePlannedExpense(id);
    load();
  };

  // ── Calculations ──────────────────────────────────────────────────────────
  const totalPlanned = planned.reduce((s, e) => s + e.amount, 0);
  const paidAmount = planned.filter((e) => e.paid).reduce((s, e) => s + e.amount, 0);
  const remainingPlanned = totalPlanned - paidAmount;

  const totalMonthlyNeed = totalPlanned + settings.living_budget + settings.savings_target;
  const variableIncomeNeeded = Math.max(0, totalMonthlyNeed - settings.fixed_income);
  const dailyTarget = settings.working_days > 0 ? variableIncomeNeeded / settings.working_days : 0;

  const effectiveTarget = settings.monthly_income_target > 0 ? settings.monthly_income_target : totalMonthlyNeed;
  const progressPct = effectiveTarget > 0 ? Math.min(100, (actualIncome / effectiveTarget) * 100) : 0;

  const [y, m] = yearMonth.split('-');
  const today = new Date();
  const daysInMonth = new Date(parseInt(y), parseInt(m), 0).getDate();
  const daysPassed = yearMonth === thisMonth() ? today.getDate() : daysInMonth;
  const daysLeft = Math.max(0, daysInMonth - daysPassed);

  const shortfall = Math.max(0, effectiveTarget - actualIncome);
  const dailyNeededNow = daysLeft > 0 ? shortfall / daysLeft : 0;

  const inputCls = "rounded-xl px-3 py-2 text-sm focus:outline-none w-full";
  const inputStyle = { background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#e8e4da' };

  return (
    <div className="max-w-2xl mx-auto md:max-w-none space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">収支計画</h1>
          <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: '#7a6f5e' }}>Daily Target Planner</p>
        </div>
        <input type="month" value={yearMonth} onChange={(e) => setYearMonth(e.target.value)}
          className="rounded-xl px-3 py-1.5 text-sm focus:outline-none"
          style={{ background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#c9a84c' }} />
      </div>

      {/* ── Monthly Income Target Card ── */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid var(--gold-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs tracking-widest uppercase" style={{ color: '#7a6f5e' }}>月間目標稼ぎ</p>
            {settings.monthly_income_target === 0 && (
              <p className="text-[10px] mt-0.5" style={{ color: '#4a4035' }}>自動計算（支出合計 + 貯金目標）</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#7a6f5e' }}>¥</span>
            <input
              type="number" min={0} placeholder="自動"
              value={settings.monthly_income_target || ''}
              onChange={(e) => handleSettingChange('monthly_income_target', parseFloat(e.target.value) || 0)}
              className="rounded-xl px-3 py-1.5 text-sm w-36 text-right focus:outline-none"
              style={{ background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#c9a84c' }}
            />
            {settings.monthly_income_target > 0 && (
              <button
                onClick={() => handleSettingChange('monthly_income_target', 0)}
                className="text-[10px] px-2 py-1 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#7a6f5e' }}
              >
                リセット
              </button>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-3xl font-bold" style={{ color: '#c9a84c' }}>{fmt(effectiveTarget)}</p>
            <p className="text-xs mt-0.5" style={{ color: '#7a6f5e' }}>
              稼いだ <span style={{ color: '#4ade80' }}>{fmt(actualIncome)}</span>
              　残り <span style={{ color: shortfall > 0 ? '#fb7185' : '#4ade80' }}>{fmt(shortfall)}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: progressPct >= 100 ? '#4ade80' : '#e8e4da' }}>
              {Math.round(progressPct)}%
            </p>
            <p className="text-[10px]" style={{ color: '#7a6f5e' }}>達成</p>
          </div>
        </div>

        <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-3 rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: progressPct >= 100
                ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                : 'linear-gradient(90deg, #c9a84c, #dfc17a)',
              boxShadow: '0 0 10px rgba(201,168,76,0.5)',
            }} />
        </div>
      </div>

      {/* ── Daily Target Card ── */}
      <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid var(--gold-border)' }}>
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.1), transparent)' }} />
        <p className="text-xs tracking-widest uppercase mb-1" style={{ color: '#7a6f5e' }}>1日あたり目標稼ぎ</p>
        <p className="text-5xl font-bold mb-1" style={{ color: '#c9a84c' }}>{fmt(dailyTarget)}</p>
        <p className="text-xs mb-4" style={{ color: '#7a6f5e' }}>
          変動収入必要額 {fmt(variableIncomeNeeded)} ÷ 稼働日数 {settings.working_days}日
        </p>

        {/* Today's adjustment if month is in progress */}
        {yearMonth === thisMonth() && daysLeft > 0 && (
          <div className="rounded-xl p-3 mt-2" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
            <p className="text-xs mb-1" style={{ color: '#7a6f5e' }}>今日からの残り{daysLeft}日で達成するには</p>
            <p className="text-2xl font-bold" style={{ color: shortfall > 0 ? '#fb7185' : '#4ade80' }}>
              {fmt(dailyNeededNow)} / 日
            </p>
            <p className="text-xs mt-1" style={{ color: '#7a6f5e' }}>
              現在の収入 {fmt(actualIncome)} / 目標 {fmt(effectiveTarget)}
            </p>
          </div>
        )}

      </div>

      {/* ── Settings ── */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#7a6f5e' }}>計算設定</h3>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'working_days' as const,    label: '稼働日数 (日/月)',  unit: '日', min: 1 },
            { key: 'fixed_income' as const,    label: '確定収入 (給与等)', unit: '¥', min: 0 },
            { key: 'living_budget' as const,   label: '生活費予算',        unit: '¥', min: 0 },
            { key: 'savings_target' as const,  label: '月間貯金目標',      unit: '¥', min: 0 },
          ] as const).map(({ key, label, unit, min }) => (
            <div key={key}>
              <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: '#7a6f5e' }}>{label}</label>
              <div className="flex items-center gap-1">
                {unit === '¥' && <span className="text-xs" style={{ color: '#7a6f5e' }}>¥</span>}
                <input
                  type="number" min={min}
                  value={settings[key]}
                  onChange={(e) => handleSettingChange(key, parseFloat(e.target.value) || 0)}
                  className={inputCls} style={inputStyle}
                />
                {unit === '日' && <span className="text-xs flex-shrink-0" style={{ color: '#7a6f5e' }}>日</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Monthly breakdown ── */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#7a6f5e' }}>月間シミュレーション</h3>
        <div className="space-y-2">
          {[
            { label: '予定支出合計',   value: -totalPlanned,              color: '#fb7185' },
            { label: '生活費予算',     value: -settings.living_budget,    color: '#fb923c' },
            { label: '貯金目標',       value: -settings.savings_target,   color: '#c9a84c' },
            { label: '確定収入',       value: settings.fixed_income,      color: '#4ade80' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-sm" style={{ color: '#a09880' }}>{label}</span>
              <span className="text-sm font-semibold" style={{ color }}>{value >= 0 ? '+' : ''}{fmt(value)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-semibold" style={{ color: '#e8e4da' }}>変動収入で必要な額</span>
            <span className="text-lg font-bold" style={{ color: '#c9a84c' }}>{fmt(variableIncomeNeeded)}</span>
          </div>
        </div>
      </div>

      {/* ── Planned Expenses ── */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#7a6f5e' }}>予定支出</h3>
            <p className="text-xs mt-0.5" style={{ color: '#4a4035' }}>
              残り {fmt(remainingPlanned)} / 合計 {fmt(totalPlanned)}
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-gold px-3 py-1.5 rounded-xl text-xs">+ 追加</button>
        </div>

        {showForm && (
          <div className="rounded-xl p-4 mb-4 space-y-3" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid var(--gold-border)' }}>
            {formError && <p className="text-xs text-rose-400">{formError}</p>}
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <input type="text" placeholder="支出名 (例: バイク返済)" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputCls} style={inputStyle} />
              </div>
              <div>
                <input type="number" placeholder="金額" value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className={inputCls} style={inputStyle} />
              </div>
              <div>
                <input type="number" placeholder="支払日 (1-31)" min="1" max="31" value={form.due_day}
                  onChange={(e) => setForm((f) => ({ ...f, due_day: e.target.value }))}
                  className={inputCls} style={inputStyle} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#a09880' }}>
              <input type="checkbox" checked={form.recurring}
                onChange={(e) => setForm((f) => ({ ...f, recurring: e.target.checked }))}
                className="rounded" />
              毎月繰り返す
            </label>
            <div className="flex gap-2">
              <button onClick={handleAddExpense} className="btn-gold flex-1 py-2 rounded-xl text-sm">追加</button>
              <button onClick={() => { setShowForm(false); setForm(BLANK_FORM); setFormError(''); }}
                className="flex-1 py-2 rounded-xl text-sm"
                style={{ background: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', color: '#7a6f5e' }}>
                キャンセル
              </button>
            </div>
          </div>
        )}

        {planned.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: '#666055' }}>予定支出がありません</p>
        )}

        <div className="space-y-2">
          {planned.map((e) => {
            const today2 = new Date();
            const dueDate = new Date(parseInt(y), parseInt(m) - 1, e.due_day);
            const isOverdue = !e.paid && dueDate < today2 && yearMonth === thisMonth();
            return (
              <div key={e.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${e.paid ? 'opacity-50' : ''}`}
                style={{ background: isOverdue ? 'rgba(251,113,133,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isOverdue ? 'rgba(251,113,133,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                <button onClick={() => togglePaid(e)}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ borderColor: e.paid ? '#c9a84c' : '#666055', background: e.paid ? '#c9a84c' : 'transparent' }}>
                  {e.paid && <span className="text-[10px] text-[#1a1410]">✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: e.paid ? '#666055' : '#e8e4da', textDecoration: e.paid ? 'line-through' : 'none' }}>
                    {e.name}
                    {e.recurring && <span className="ml-1 text-[10px] px-1 py-0.5 rounded" style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>毎月</span>}
                  </p>
                  <p className="text-xs" style={{ color: isOverdue ? '#fb7185' : '#666055' }}>
                    {e.due_day}日{isOverdue ? ' ⚠️ 期限超過' : ''}
                  </p>
                </div>
                <span className="text-sm font-semibold" style={{ color: e.paid ? '#666055' : '#fb7185' }}>
                  -{fmt(e.amount)}
                </span>
                <button onClick={() => handleDelete(e.id)} className="text-xs px-1 transition-colors" style={{ color: '#4a4035' }}
                  onMouseEnter={(e2) => (e2.currentTarget.style.color = '#fb7185')}
                  onMouseLeave={(e2) => (e2.currentTarget.style.color = '#4a4035')}>
                  削除
                </button>
              </div>
            );
          })}
        </div>

        {planned.length > 0 && (
          <div className="flex justify-between pt-4 mt-2 text-sm font-semibold" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#7a6f5e' }}>済み</span>
            <span style={{ color: '#4ade80' }}>{fmt(paidAmount)}</span>
            <span style={{ color: '#7a6f5e' }}>未払い</span>
            <span style={{ color: '#fb7185' }}>{fmt(remainingPlanned)}</span>
          </div>
        )}
      </div>

      {/* ── Actual vs Plan ── */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#7a6f5e' }}>実績との比較</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: '実際の収入', value: actualIncome, color: '#4ade80' },
            { label: '実際の支出', value: -actualExpense, color: '#fb7185' },
            { label: '実際の残高', value: actualIncome - actualExpense, color: (actualIncome - actualExpense) >= 0 ? '#c9a84c' : '#fb7185' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#7a6f5e' }}>{label}</p>
              <p className="text-base font-bold" style={{ color }}>{value >= 0 ? '' : '-'}{fmt(Math.abs(value))}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
