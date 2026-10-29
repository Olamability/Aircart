
import {
    ArrowRight,
    Headphones,
    Leaf,
    ReceiptText,
    ShoppingBag,
    Smartphone,
    Store,
    Truck,
} from "lucide-react";

type ServiceVariant =
    | "groceries"
    | "bills"
    | "gadgets"
    | "marketplace"
    | "logistics";

type ServicePreview = {
    title: string;
    subtitle: string;
    variant: ServiceVariant;
    icon: typeof ShoppingBag;
    position: string;
};

const serviceStyles: Record<
    ServiceVariant,
    {
        background: string;
        border: string;
        title: string;
        subtitle: string;
        icon: string;
    }
> = {
    groceries: {
        background: "#3E614B",
        border: "rgba(255,255,255,0.20)",
        title: "#FFFFFF",
        subtitle: "#E0EBE3",
        icon: "rgba(255,255,255,0.15)",
    },
    bills: {
        background: "#34537C",
        border: "rgba(255,255,255,0.20)",
        title: "#FFFFFF",
        subtitle: "#E0E9F5",
        icon: "rgba(255,255,255,0.15)",
    },
    gadgets: {
        background: "#FA7A12",
        border: "rgba(255,255,255,0.32)",
        title: "#492508",
        subtitle: "#542F13",
        icon: "rgba(255,255,255,0.38)",
    },
    marketplace: {
        background: "#56536C",
        border: "rgba(255,255,255,0.20)",
        title: "#FFFFFF",
        subtitle: "#E8E4F0",
        icon: "rgba(255,255,255,0.15)",
    },
    logistics: {
        background: "#063C28",
        border: "rgba(255,255,255,0.18)",
        title: "#FFFFFF",
        subtitle: "#D4E7DC",
        icon: "rgba(255,255,255,0.14)",
    },
};

const heroServices: ServicePreview[] = [
    {
        title: "Groceries",
        subtitle: "Fresh everyday essentials",
        variant: "groceries",
        icon: Leaf,
        position: "left-0 top-[12%] -rotate-3",
    },
    {
        title: "Pay Bills",
        subtitle: "Electricity, TV & data",
        variant: "bills",
        icon: ReceiptText,
        position: "right-0 top-[5%] rotate-3",
    },
    {
        title: "Shop Gadgets",
        subtitle: "Tech & accessories",
        variant: "gadgets",
        icon: Headphones,
        position: "left-0 bottom-[9%] rotate-2",
    },
    {
        title: "Marketplace",
        subtitle: "Discover stores & brands",
        variant: "marketplace",
        icon: Store,
        position: "right-0 bottom-[5%] -rotate-2",
    },
];

type ServicePreviewCardProps = {
    service: ServicePreview;
};

function ServicePreviewCard({ service }: ServicePreviewCardProps) {
    const Icon = service.icon;
    const colors = serviceStyles[service.variant];

    return (
        <div
            className={`absolute z-30 hidden min-h-[110px] w-[44%] max-w-[180px] overflow-hidden rounded-[18px] border p-3 shadow-lg shadow-[#26382D]/10 transition-transform duration-300 hover:scale-[1.03] sm:block ${service.position}`}
            style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
            }}
        >
            <div className="relative z-[2] max-w-[82%]">
                <p
                    className="text-sm font-extrabold leading-[19px] tracking-tight"
                    style={{ color: colors.title }}
                >
                    {service.title}
                </p>

                <p
                    className="mt-1 text-[10px] font-medium leading-[14px]"
                    style={{ color: colors.subtitle }}
                >
                    {service.subtitle}
                </p>
            </div>

            <div
                className="absolute bottom-2 right-2 flex size-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: colors.icon }}
            >
                <Icon
                    size={20}
                    strokeWidth={1.8}
                    style={{ color: colors.title }}
                />
            </div>

            <div
                className="absolute -bottom-7 -right-5 size-20 rounded-full opacity-[0.08]"
                style={{ backgroundColor: "#FFFFFF" }}
            />
        </div>
    );
}

type HeroAppPreviewProps = {
    className?: string;
};

export default function HeroAppPreview({
    className = "",
}: HeroAppPreviewProps) {
    return (
        <div
            className={`relative mx-auto flex aspect-square w-full max-w-lg items-center justify-center ${className}`}
            aria-label="Preview of Airmart mobile app services"
        >
            {/* Decorative backdrop */}
            <div
                aria-hidden="true"
                className="absolute size-[68%] rotate-3 rounded-[28px] bg-[#063C28] shadow-2xl shadow-[#063C28]/20 sm:rounded-[32px]"
            />

            <div
                aria-hidden="true"
                className="absolute size-[58%] rounded-full bg-[#3B9C3C]/15 blur-3xl"
            />

            {/* Mobile phone mockup */}
            <div className="relative z-20 aspect-[1/2] w-[42%] -rotate-3 overflow-hidden rounded-[26px] border-[4px] border-[#202820] bg-[#F7FAF7] shadow-2xl sm:rounded-[30px]">
                {/* Phone speaker */}
                <div className="absolute left-1/2 top-1.5 z-10 h-3 w-12 -translate-x-1/2 rounded-full bg-[#202820]" />

                <div className="flex h-full flex-col px-3 pb-3 pt-7 sm:px-4 sm:pt-9">
                    {/* App header */}
                    <div className="flex items-center justify-between gap-1">
                        <div>
                            <p className="text-[9px] font-medium text-[#737B73] sm:text-[10px]">
                                Welcome back
                            </p>

                            <p className="text-xs font-extrabold text-[#063C28] sm:text-sm">
                                Airmart
                            </p>
                        </div>

                        <div className="flex size-7 items-center justify-center rounded-full bg-[#EEF7F2] text-[#063C28] sm:size-8">
                            <Smartphone size={14} />
                        </div>
                    </div>

                    {/* Featured banner */}
                    <div className="mt-3 rounded-[14px] bg-[#063C28] p-2.5 text-white sm:mt-5 sm:rounded-2xl sm:p-3">
                        <p className="text-[8px] text-white/70 sm:text-[10px]">
                            Everything you need
                        </p>

                        <p className="mt-1 text-[11px] font-extrabold leading-tight sm:text-sm">
                            All in one place.
                        </p>

                        <div className="mt-2 h-1 w-10 rounded-full bg-[#F28C28] sm:mt-3 sm:w-14" />
                    </div>

                    <p className="mt-3 text-[9px] font-extrabold text-[#26382D] sm:mt-5 sm:text-[10px]">
                        Explore Airmart
                    </p>

                    {/* Mini service cards */}
                    <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-2">
                        <div className="rounded-[10px] border border-[#D4E8DC] bg-[#EEF7F2] p-1.5 sm:rounded-xl sm:p-2">
                            <Leaf size={13} className="text-[#063C28] sm:size-4" />

                            <p className="mt-1 text-[8px] font-bold text-[#063C28] sm:text-[9px]">
                                Groceries
                            </p>
                        </div>

                        <div className="rounded-[10px] border border-[#D3E1EE] bg-[#EEF4FA] p-1.5 sm:rounded-xl sm:p-2">
                            <ReceiptText size={13} className="text-[#163B61] sm:size-4" />

                            <p className="mt-1 text-[8px] font-bold text-[#163B61] sm:text-[9px]">
                                Bills
                            </p>
                        </div>

                        <div className="rounded-[10px] border border-[#F5DFCE] bg-[#FEF5EE] p-1.5 sm:rounded-xl sm:p-2">
                            <Headphones size={13} className="text-[#7A3F10] sm:size-4" />

                            <p className="mt-1 text-[8px] font-bold text-[#7A3F10] sm:text-[9px]">
                                Gadgets
                            </p>
                        </div>

                        <div className="rounded-[10px] border border-[#E1D6ED] bg-[#F4EFF9] p-1.5 sm:rounded-xl sm:p-2">
                            <Store size={13} className="text-[#4A2A70] sm:size-4" />

                            <p className="mt-1 text-[8px] font-bold text-[#4A2A70] sm:text-[9px]">
                                Marketplace
                            </p>
                        </div>
                    </div>

                    {/* Logistics banner */}
                    <div className="mt-auto flex items-center gap-2 rounded-xl bg-[#063C28] p-2 text-white sm:p-3">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F28C28] text-white">
                            <Truck size={14} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-[9px] font-extrabold sm:text-[10px]">
                                Airmart Logistics
                            </p>

                            <p className="mt-0.5 text-[8px] text-[#D4E7DC]">
                                Deliver with ease
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating cards use the mobile app's actual card colors */}
            {heroServices.map((service) => (
                <ServicePreviewCard key={service.variant} service={service} />
            ))}

            {/* Decorative accents */}
            <div
                aria-hidden="true"
                className="absolute right-[13%] top-[28%] size-3 rounded-full bg-[#F28C28]"
            />

            <div
                aria-hidden="true"
                className="absolute bottom-[15%] left-[13%] size-5 rounded-full border-4 border-[#D4E8DC]"
            />
        </div>
    );
}
