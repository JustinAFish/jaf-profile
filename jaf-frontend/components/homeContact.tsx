import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ContactForm } from "@/components/ContactForm";

export default function HomeContact() {
  return (
    <section id="contact" className="py-20 px-16 bg-surface-container-low">
      <Card className="group relative rounded-md bg-surface-container-high/90 glass-surface border-0 shadow-none transition-all duration-300 hover:shadow-[0_40px_60px_rgba(129,236,255,0.08)]">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-md" />
        </div>
        <CardHeader>
          <h2 className="text-4xl font-heading font-bold mb-4 text-header">
            Contact Me
          </h2>
          <p className="text-lg md:text-xl text-paragraph mb-2">
            I&apos;m currently open to new opportunities and collaborations.
            Feel free to reach out if you&apos;d like to discuss potential
            opportunities
          </p>
        </CardHeader>
        <CardContent className="px-8 relative z-10">
          <ContactForm />
        </CardContent>
      </Card>
    </section>
  );
}
