
import Image from "next/image";
import {
    ArrowRight,
    ReceiptText,
    ShoppingBasket,
    ShoppingCart,
    Smartphone,
    Sparkles,
    Store,
    Truck,
} from "lucide-react";

type ServiceVariant = "groceries" | "bills" | "gadgets" | "marketplace";

const services = [
    {
        label: "Groceries",
        subtitle: "Fresh everyday essentials",
        variant: "groceries" as const,
        Icon: ShoppingBasket,
    },
    {
        label: "Pay Bills",
        subtitle: "Easy payments",
        variant: "bills" as const,
        Icon: ReceiptText,
    },
    {
        label: "Shop Gadgets",
        subtitle: "Tech and accessories",
        variant: "gadgets" as const,
        Icon: Smartphone,
    },
    {
        label: "Airmart Marketplace",
        subtitle: "Explore trusted vendors",
        variant: "marketplace" as const,
        Icon: Store,
    },
];

const serviceColors: Record<ServiceVariant, string> = {
    groceries: "#3E614B",
    bills: "#34537C",
    gadgets: "#FA7A12",
    marketplace: "#56536C",
};

function ServiceCard({
    label,
    subtitle,
    variant,
    Icon,
}: (typeof services)[number]) {
    const isTall = variant === "groceries" || variant === "marketplace";

    return (
        <div
            className={`flex w-full flex-col justify-between overflow-hidden rounded-[13px] border p-2.5 text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 ${isTall ? "h-[88px] sm:h-[94px]" : "h-[70px] sm:h-[76px]"
                }`}
            style={{
                backgroundColor: serviceColors[variant],
                borderColor: serviceColors[variant],
            }}
        >
            <div className="min-w-0">
                <p className="text-[11px] font-bold leading-tight">{label}</p>
                <p className="mt-1 text-[8px] leading-tight text-white/80">
                    {subtitle}
                </p>
            </div>

            <Icon
                size={18}
                strokeWidth={1.8}
                className="shrink-0 self-end"
                aria-hidden="true"
            />
        </div>
    );
}

function MarketplaceSpotlightPreview() {
    return (
        <div className="relative isolate flex h-[132px] w-full overflow-hidden rounded-[14px] border border-white/15 shadow-md sm:h-[140px]">
            <Image
                src="/Images/Ryan.jpeg"
                alt=""
                fill
                sizes="260px"
                className="object-cover"
                aria-hidden="true"
            />

            <div
                className="absolute inset-0"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(6,60,40,0.95), rgba(10,74,51,0.92))",
                }}
            />

            <div
                className="absolute -right-8 -top-8 h-28 w-28 rounded-full"
                style={{ backgroundColor: "rgba(59,156,60,0.18)" }}
            />

            <div className="relative z-10 flex min-w-0 flex-1 flex-col items-start justify-center py-2 pl-3 pr-0">
                <div className="mb-1 inline-flex items-center gap-1 rounded-lg bg-white/[0.12] px-1.5 py-[3px]">
                    <Sparkles size={9} color="#F28C28" aria-hidden="true" />
                    <span className="text-[7px] font-bold tracking-wide text-white">
                        EXCLUSIVE DEAL
                    </span>
                </div>

                <h3 className="text-[15px] font-extrabold leading-tight tracking-tight text-white">
                    Today&apos;s Top Deals
                </h3>

                <p className="mt-1 max-w-[125px] text-[8px] font-medium leading-[1.4] text-[#D4E7DC]">
                    Save up to 25% on everyday essentials &amp; tech
                </p>

                <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#F28C28] px-2 py-1.5 text-[9px] font-bold text-white shadow-md">
                    Shop Now
                    <ArrowRight size={10} aria-hidden="true" />
                </div>
            </div>

            <div className="relative z-[1] w-[76px] shrink-0">
                <span className="absolute right-1.5 top-2 z-20 rounded-md bg-[#E26D5C] px-1.5 py-0.5 text-[9px] font-extrabold text-white shadow-md">
                    -25%
                </span>

                <Image
                    src="/Images/Ryan.jpeg"
                    alt="Featured marketplace deal"
                    width={120}
                    height={120}
                    sizes="90px"
                    className="absolute -bottom-2 -right-2 h-[94px] w-[94px] max-w-none rounded-xl object-cover shadow-lg"
                />
            </div>
        </div>
    );
}

function LogisticsPreview() {
    return (
        <div className="flex min-h-[51px] items-center gap-2 overflow-hidden rounded-[12px] bg-[#063C28] px-2.5 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F28C28]">
                <Truck size={17} color="#FFFFFF" aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-white">
                    Logistics &amp; Delivery
                </p>
                <p className="mt-0.5 text-[8px] text-[#D4E7DC]">
                    Get your orders delivered
                </p>
            </div>

            <ArrowRight size={13} color="#F28C28" aria-hidden="true" />
        </div>
    );
}

function FloatingCard({
    variant,
    className,
}: {
    variant: ServiceVariant;
    className: string;
}) {
    const content = {
        groceries: {
            Icon: ShoppingBasket,
            title: "Groceries",
            subtitle: "Everyday essentials",
            iconColor: "#3E614B",
            background: "#EEF7F2",
            border: "#D4E8DC",
            titleColor: "#3E614B",
            subtitleColor: "#556D5C",
        },
        bills: {
            Icon: ReceiptText,
            title: "Pay Bills",
            subtitle: "Simple payments",
            iconColor: "#34537C",
            background: "#EEF4FA",
            border: "#D3E1EE",
            titleColor: "#34537C",
            subtitleColor: "#5D738A",
        },
        gadgets: {
            Icon: Smartphone,
            title: "Shop Gadgets",
            subtitle: "Discover new tech",
            iconColor: "#FA7A12",
            background: "#FEF5EE",
            border: "#F5DFCE",
            titleColor: "#7A3F10",
            subtitleColor: "#856A54",
        },
        marketplace: {
            Icon: Store,
            title: "Airmart Marketplace",
            subtitle: "Trusted vendors",
            iconColor: "#56536C",
            background: "#F4EFF9",
            border: "#E1D6ED",
            titleColor: "#56536C",
            subtitleColor: "#745E8E",
        },
    }[variant];

    const { Icon } = content;

    return (
        <div
            className={`pointer-events-none absolute z-20 hidden w-[118px] rounded-[14px] border p-2.5 shadow-lg sm:block lg:w-[130px] ${className}`}
            style={{
                backgroundColor: content.background,
                borderColor: content.border,
            }}
        >
            <Icon size={17} color={content.iconColor} aria-hidden="true" />

            <p
                className="mt-1.5 text-[10px] font-bold leading-tight"
                style={{ color: content.titleColor }}
            >
                {content.title}
            </p>

            <p
                className="mt-1 text-[9px] leading-tight"
                style={{ color: content.subtitleColor }}
            >
                {content.subtitle}
            </p>
        </div>
    );
}

export default function HeroAppPrevieww({
    className = "",
}: {
    className?: string;
}) {
    return (
        <div
            className={`relative mx-auto w-full max-w-[380px] ${className}`}
        >
            {/* Soft decorative background */}
            <div className="absolute inset-x-10 inset-y-10 rounded-full bg-emerald-100/60 blur-3xl" />

            {/* Compact phone mockup */}
            <div className="relative z-10 mx-auto w-[220px] rounded-[29px] border-[4px] border-[#202923] bg-[#202923] p-[3px] shadow-2xl sm:w-[235px]">
                <div className="overflow-hidden rounded-[22px] bg-white">
                    {/* Phone status bar */}
                    <div className="flex h-5 items-center justify-between px-3.5 text-[8px] font-semibold text-[#26352B]">
                        <span>9:41</span>
                        <div className="h-[4px] w-10 rounded-full bg-[#202923]" />
                        <span>● ▮</span>
                    </div>

                    <div className="px-2 pb-2">
                        {/* App header */}
                        <div className="mb-2 flex items-center justify-between">
                            <div>
                                <p className="text-[8px] text-[#737B73]">
                                    Welcome to
                                </p>
                                <h2 className="text-[16px] font-extrabold tracking-tight text-[#063C28]">
                                    Airmart<span className="text-[#F28C28]">.</span>
                                </h2>
                            </div>

                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF7F2]">
                                <ShoppingCart
                                    size={14}
                                    color="#063C28"
                                    aria-hidden="true"
                                />
                            </div>
                        </div>

                        {/* Spotlight */}
                        <div className="mb-2">
                            <MarketplaceSpotlightPreview />
                        </div>

                        {/* Uneven service cards */}
                        <div className="mb-2 grid grid-cols-2 items-start gap-1.5">
                            {services.map((service) => (
                                <ServiceCard
                                    key={service.variant}
                                    {...service}
                                />
                            ))}
                        </div>

                        {/* Logistics */}
                        <LogisticsPreview />
                    </div>

                    {/* Phone bottom bezel */}
                    <div className="flex h-1.5 items-center justify-center bg-white">
                        <div className="h-1 w-12 rounded-full bg-[#202923]/20" />
                    </div>
                </div>
            </div>

            {/* Smaller floating service cards */}
            <FloatingCard
                variant="groceries"
                className="left-0 top-[17%] sm:-left-3 lg:-left-5"
            />

            <FloatingCard
                variant="bills"
                className="right-0 top-[27%] sm:-right-3 lg:-right-5"
            />

            <FloatingCard
                variant="gadgets"
                className="bottom-[23%] left-0 sm:-left-3 lg:-left-5"
            />

            <FloatingCard
                variant="marketplace"
                className="bottom-[12%] right-0 sm:-right-3 lg:-right-5"
            />
        </div>
    );
}
