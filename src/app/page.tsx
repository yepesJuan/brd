import { createServerSupabaseClient } from '@/lib/supabase-server';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { Footer } from '@/components/landing/Footer';

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen">
      <HeroSection isLoggedIn={!!user} />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
