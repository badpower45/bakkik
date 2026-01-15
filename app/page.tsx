import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to health check API
  redirect('/api/health');
}
