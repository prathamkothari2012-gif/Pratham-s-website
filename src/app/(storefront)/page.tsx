import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { Services } from "@/components/sections/services";
import { Featured } from "@/components/sections/featured";
import { Materials } from "@/components/sections/materials";
import { Process } from "@/components/sections/process";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { Cta } from "@/components/sections/cta";

/** The catalog is edited from the dashboard, so this renders per request
 *  rather than being frozen at build time. It also keeps the build from
 *  needing the datastore, which is not reachable while building. */
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Services />
      <Featured />
      <Materials />
      <Process />
      <Testimonials />
      <Faq />
      <Cta />
    </>
  );
}
