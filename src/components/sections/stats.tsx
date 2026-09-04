import { stats } from "@/content/site";
import { Container } from "@/components/ui/container";

export function Stats() {
  return (
    <section className="border-y border-border bg-surface/60">
      <Container className="grid grid-cols-2 gap-8 py-12 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1.5 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
