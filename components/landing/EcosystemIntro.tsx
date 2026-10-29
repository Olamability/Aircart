import Container from "@/components/Container";
import { ArrowDownRight } from "lucide-react";

const highlights = ["Shopping", "Payments", "Services", "Delivery"];

export default function EcosystemIntro() {
  return (
    <section className="bg-white py-8 sm:py1-8 lg:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mx-auto flex items-center justify-center sm:mx-0 text-sm font-semibold uppercase tracking-widest text-shop-light-green">
              The Airmart experience
            </p>

            <div className="mt-5 flex items-start gap-4">
              <span className="mt-2 hidden text-shop-light-green sm:block">
                <ArrowDownRight size={28} strokeWidth={1.5} />
              </span>

              <h2 className="mx-auto text-center font-heading text-2xl font-semibold text-darkColor sm:mx-0 sm:text-left sm:text-5xl lg:text-6xl">
                One app.
                <span className="block text-shop-dark-green">
                  Easy ways to live.
                </span>
              </h2>
            </div>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-2xl text-sm sm:text-lg text-shop-light-color">
              From everyday shopping to bills, deliveries and essential
              services, Airmart brings more of what you need into one connected
              experience.
            </p>

            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-slate-200 pt-6">
              {highlights.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm font-semibold text-darkColor"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-shop-lighter-green/30 text-xs font-bold text-shop-dark-green">
                    0{index + 1}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
