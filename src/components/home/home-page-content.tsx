import { AboutSection } from "./about-section";
import { BenefitsSection } from "./benefits-section";
import { FeaturedCollectionsSection } from "./featured-collections-section";
import { HeroSection } from "./hero-section";
import { NewsletterSection } from "./newsletter-section";
import { TestimonialsSection } from "./testimonials-section";

export function HomePageContent() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10">
      <HeroSection />
      <BenefitsSection />
      <FeaturedCollectionsSection />
      <AboutSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  );
}
