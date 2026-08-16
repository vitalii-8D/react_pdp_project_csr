import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { myTransactionsQuery, refundPaymentMutation } from '../lib/graphql/payments';
import { avatarUrl } from '../lib/images';
import { paths } from '../lib/paths';
import { Icons } from '../components/Icons';
import { Card } from '../components/Card';
import { Button, buttonStyles } from '../components/Button';
import { PaymentTransactionStatus } from '../enums/payment-status.enum';
import type { PaymentTransactionEntity } from '../lib/types';

const STATUS_BADGE: Record<PaymentTransactionStatus, string> = {
  [PaymentTransactionStatus.Succeeded]: 'bg-green-50 text-green-700 border-green-100',
  [PaymentTransactionStatus.Pending]: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  [PaymentTransactionStatus.Failed]: 'bg-red-50 text-red-700 border-red-100',
  [PaymentTransactionStatus.Refunded]: 'bg-slate-50 text-slate-500 border-slate-200',
};

const STATUS_LABEL: Record<PaymentTransactionStatus, string> = {
  [PaymentTransactionStatus.Succeeded]: 'Paid',
  [PaymentTransactionStatus.Pending]: 'Pending',
  [PaymentTransactionStatus.Failed]: 'Failed',
  [PaymentTransactionStatus.Refunded]: 'Refunded',
};

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100);
}

function TransactionRow({
  transaction,
  onRefunded,
}: {
  transaction: PaymentTransactionEntity;
  onRefunded: (updated: PaymentTransactionEntity) => void;
}) {
  const { token } = useAuth();
  const [pending, setPending] = useState(false);
  const canRefund = transaction.status === PaymentTransactionStatus.Succeeded;

  async function handleRefund() {
    if (!token || pending) return;
    setPending(true);
    try {
      const updated = await refundPaymentMutation(token, transaction.id);
      onRefunded(updated);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="text-left min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{transaction.post.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{new Date(transaction.createdAt).toLocaleDateString()}</p>
        {transaction.status === PaymentTransactionStatus.Failed && transaction.failureReason && (
          <p className="text-xs text-red-500 mt-0.5">{transaction.failureReason}</p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-bold text-slate-800">
          {formatAmount(transaction.amount, transaction.currency)}
        </span>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_BADGE[transaction.status]}`}
        >
          {STATUS_LABEL[transaction.status]}
        </span>
        {canRefund && (
          <Button type="button" variant="danger" size="sm" disabled={pending} onClick={handleRefund}>
            {pending ? 'Refunding…' : 'Refund'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { token, user } = useAuth();
  const [transactions, setTransactions] = useState<PaymentTransactionEntity[] | null>(null);

  useEffect(() => {
    if (!token) return;
    myTransactionsQuery(token).then(setTransactions);
  }, [token]);

  function handleRefunded(updated: PaymentTransactionEntity) {
    setTransactions((prev) => prev?.map((t) => (t.id === updated.id ? updated : t)) ?? prev);
  }

  return (
    <div className="max-w-xl space-y-6">
      <Card className="p-8 text-center">
        <img
          src={user!.avatar?.url ?? avatarUrl(user!.id)}
          alt={user!.name}
          className="h-24 w-24 rounded-full object-cover mx-auto ring-4 ring-blue-50"
        />
        <h1 className="text-2xl font-black text-slate-900 mt-4">{user!.name}</h1>
        <p className="text-slate-500">{user!.email}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-left">
          <div className="bg-slate-50 rounded-xl p-4">
            <dt className="text-xs font-semibold text-slate-400 uppercase">Age</dt>
            <dd className="text-sm font-bold text-slate-800 mt-1">{user!.age ?? '—'}</dd>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <dt className="text-xs font-semibold text-slate-400 uppercase">Role</dt>
            <dd className="text-sm font-bold text-slate-800 mt-1 capitalize">{user!.role.toLowerCase()}</dd>
          </div>
        </dl>

        <Link to={paths.profileEdit()} className={buttonStyles({ size: 'lg', className: 'mt-6' })}>
          <Icons.Edit />
          Edit Profile
        </Link>
      </Card>

      <Card className="p-8">
        <h2 className="text-lg font-black text-slate-900 mb-4">Transactions</h2>
        {!transactions || transactions.length === 0 ? (
          <p className="text-slate-400 text-sm">{transactions ? 'No payments yet.' : 'Loading…'}</p>
        ) : (
          <div>
            {transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} onRefunded={handleRefunded} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
