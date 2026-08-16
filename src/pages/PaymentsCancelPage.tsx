import { Link, useSearchParams } from 'react-router-dom';

import { paths } from '../lib/paths';
import { Card } from '../components/Card';
import { buttonStyles } from '../components/Button';

export default function PaymentsCancelPage() {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('postId');

  return (
    <div className="max-w-xl mx-auto">
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-black text-slate-900">Payment cancelled</h1>
        <p className="text-slate-500 mt-2">Your post hasn&apos;t been published. You can try again any time.</p>

        <div className="flex items-center justify-center gap-3 mt-6">
          {postId && (
            <Link to={paths.myPostEdit(postId)} className={buttonStyles({ size: 'lg' })}>
              Back to Post
            </Link>
          )}
          <Link to={paths.myPosts()} className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
            Go to My Posts
          </Link>
        </div>
      </Card>
    </div>
  );
}
