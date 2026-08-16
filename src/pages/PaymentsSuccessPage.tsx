import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { transactionsForPostQuery } from '../lib/graphql/payments';
import { PaymentTransactionStatus } from '../enums/payment-status.enum';
import { paths } from '../lib/paths';
import { Card } from '../components/Card';
import { buttonStyles } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function PaymentsSuccessPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('postId');

  const [status, setStatus] = useState<PaymentTransactionStatus | null>(null);
  const [failureReason, setFailureReason] = useState<string | null | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!postId) {
      navigate(paths.myPosts());
      return;
    }
    if (!token) return;
    transactionsForPostQuery(token, postId).then((transactions) => {
      const latestTransaction = transactions[0];
      setStatus(latestTransaction?.status ?? null);
      setFailureReason(latestTransaction?.failureReason);
      setLoaded(true);
    });
  }, [postId, token, navigate]);

  if (!postId || !loaded) {
    return null;
  }

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
