import { useState, useEffect } from 'react'
import { getSummary, getExpenseByCategory, getMonthlySummary, getBudgetProgress } from '../api/dashboard'
import StatCard from '../components/StatCard'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import './Dashboard.css'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)
}

function formatMonth(str) {
  if (!str) return str
  const [y, m] = str.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [expensePie, setExpensePie] = useState([])
  const [monthly, setMonthly] = useState([])
  const [budgetProgress, setBudgetProgress] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch dashboard summary, charts data, and budget progress concurrently
  useEffect(() => {
    Promise.all([
      getSummary(),
      getExpenseByCategory(),
      getMonthlySummary(),
      getBudgetProgress(),
    ]).then(([s, pie, mon, bp]) => {
      setSummary(s)
      setExpensePie(pie)
      setMonthly(mon)
      setBudgetProgress(bp)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '60vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your financial overview at a glance</p>
      </div>

      <div className="grid-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(summary?.total_income)}
          icon={TrendingUp}
          color="green"
          subtitle="All time"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary?.total_expense)}
          icon={TrendingDown}
          color="red"
          subtitle="All time"
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(summary?.balance)}
          icon={Wallet}
          color={summary?.balance >= 0 ? 'accent' : 'red'}
          subtitle="Income minus expenses"
        />
        <StatCard
          title="Monthly Budget"
          value={formatCurrency(summary?.total_budget)}
          icon={Target}
          color="yellow"
          subtitle={`Spent: ${formatCurrency(summary?.budget_spent)}`}
        />
      </div>

      <div className="dashboard-charts">
        <div className="card chart-card">
          <h2 className="chart-title">Monthly Income vs Expenses</h2>
          {monthly.length === 0 ? (
            <div className="empty-state" style={{ height: 220 }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthly} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelFormatter={formatMonth}
                  formatter={v => formatCurrency(v)}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ paddingTop: 12, fontSize: 13 }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <h2 className="chart-title">Expense Distribution</h2>
          {expensePie.length === 0 ? (
            <div className="empty-state" style={{ height: 220 }}>No expense data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={expensePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {expensePie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  formatter={v => formatCurrency(v)}
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="card chart-card">
          <h2 className="chart-title">Budget vs Actual Spending</h2>
          {budgetProgress.length === 0 ? (
            <div className="empty-state" style={{ height: 180 }}>No budgets set for this month</div>
          ) : (
            <div className="budget-list">
              {budgetProgress.map((b, i) => (
                <div key={i} className="budget-item">
                  <div className="budget-item-header">
                    <span className="budget-category">{b.category}</span>
                    <div className="budget-amounts">
                      <span style={{ color: b.exceeded ? 'var(--red)' : 'var(--text-secondary)' }}>
                        {formatCurrency(b.spent)}
                      </span>
                      <span className="text-muted"> / {formatCurrency(b.budget)}</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${b.exceeded ? 'exceeded' : b.percentage > 75 ? 'warning' : ''}`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                  {b.exceeded && (
                    <p className="budget-alert">⚠ Over budget by {formatCurrency(b.spent - b.budget)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="chart-title">Recent Transactions</h2>
          {!summary?.recent_transactions?.length ? (
            <div className="empty-state" style={{ height: 180 }}>No transactions yet</div>
          ) : (
            <div className="recent-list">
              {summary.recent_transactions.map(t => (
                <div key={t.id} className="recent-item">
                  <div className="recent-icon" style={{ background: t.type === 'income' ? 'var(--green-bg)' : 'var(--red-bg)' }}>
                    {t.type === 'income' ? <ArrowUpRight size={16} color="var(--green)" /> : <ArrowDownRight size={16} color="var(--red)" />}
                  </div>
                  <div className="recent-info">
                    <p className="recent-title">{t.title}</p>
                    <p className="recent-date">{t.date} {t.category_name && `• ${t.category_name}`}</p>
                  </div>
                  <span className={`recent-amount ${t.type === 'income' ? 'text-green' : 'text-red'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
