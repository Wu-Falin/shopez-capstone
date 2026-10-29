import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState
        title="Page not found"
        text="The link may be old or mistyped."
        action={
          <Link to="/" className="btn btn-primary">
            Go to the shop
          </Link>
        }
      />
    </div>
  );
}
