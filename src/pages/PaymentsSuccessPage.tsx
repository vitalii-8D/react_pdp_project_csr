import { Link, Navigate, useSearchParams } from 'react-router-dom';

import { transactionsForPostQuery } from '../lib/graphql/payments';
import { PaymentTransactionStatus } from '../enums/payment-status.enum';
import { paths } from '../lib/paths';
import { Card } from '../components/Card';
import { buttonStyles } from '../components/Button';
import { ErrorMessage, PageSkeleton } from '../components/PageStatus';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '../hooks/useQuery';

export default function PaymentsSuccessPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('postId');

  const { data: transactions, error } = useQuery(token && postId ? `transactions:${postId}` : null, () =>
    transactionsForPostQuery(token ?? '', postId ?? ''),
  );

  if (!postId) {
    return <Navigate to={paths.myPosts()} replace />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!transactions) {
    return <PageSkeleton />;
  }

  const latestTransaction = transactions[0];
  const status = latestTransaction?.status ?? null;
  const failureReason = latestTransaction?.failureReason;

  return (
    <div className="max-w-xl mx-auto">
      <Card className="p-8 text-center">
        {status === PaymentTransactionStatus.Succeeded && (
          <>
            <h1 className="text-2xl font-black text-slate-900">Payment successful</h1>
            <p className="text-slate-500 mt-2">Your post has been published.</p>
          </>
        )}

        {status === PaymentTransactionStatus.Pending && (
          <>
            <h1 className="text-2xl font-black text-slate-900">Payment processing</h1>
            <p className="text-slate-500 mt-2">
              We&apos;re still confirming your payment with Stripe — check back on My Posts shortly.
            </p>
          </>
        )}

        {status === PaymentTransactionStatus.Failed && (
          <>
            <h1 className="text-2xl font-black text-slate-900">Payment failed</h1>
            <p className="text-slate-500 mt-2">{failureReason ?? 'Something went wrong with your payment.'}</p>
          </>
        )}

        {!status && (
          <>
            <h1 className="text-2xl font-black text-slate-900">No payment found</h1>
            <p className="text-slate-500 mt-2">We couldn&apos;t find a payment attempt for this post.</p>
          </>
        )}

        <div className="flex items-center justify-center gap-3 mt-6">
          <Link to={paths.myPosts()} className={buttonStyles({ size: 'lg' })}>
            Go to My Posts
          </Link>
          {status === PaymentTransactionStatus.Failed && postId && (
            <Link to={paths.myPostEdit(postId)} className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
              Back to Post
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
