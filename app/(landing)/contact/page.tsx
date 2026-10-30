import { Mail, MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import Container from "@/components/Container";
import { SubText, SubTitle } from "@/components/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const contactInfo = [
    {
        title: "Call Our Team",
        value: "+234 815 577 6374",
        description: "Speak with us about your enquiry.",
        icon: Phone,
    },
    {
        title: "Email Support",
        value: "Spaazr@gmail.com",
        description: "Send us your questions or feedback.",
        icon: Mail,
    },
    {
        title: "Support Hours",
        value: "Available 24/7",
        description: "Update this if your support hours differ.",
        icon: Clock,
    },
    {
        title: "Service Area",
        value: "Nigeria, West Africa",
        description: "Serving customers across our operating areas.",
        icon: MapPin,
    },
];

export default function ContactPage() {
    return (
        <div className="bg-white text-slate-700">
            {/* Contact Hero */}
            <section className="bg-shop-light-green/10 py-16 md:py-24">
                <Container>
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-shop-dark-green/10 bg-white px-4 py-2 text-sm font-semibold text-shop-dark-green shadow-sm">
                            <MessageCircle size={16} className="text-shop-darkOrange" />
                            We are here to help
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-shop-dark-green sm:text-5xl lg:text-6xl">
                            Let&apos;s talk about
                            <span className="mt-2 block text-shop-darkOrange">
                                what you need.
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg md:leading-8">
                            Have a question about Spaazr, need assistance, or want to
                            explore a partnership? Send us a message and our team will
                            help point you in the right direction.
                        </p>
                    </div>
                </Container>
            </section>


            {/* Contact Details and Form */}
            <section className="py-16 md:py-24">
                <Container>
                    <div className="mx-auto max-w-4xl">
                        {/* Section heading */}
                        <div className="mb-8">
                            <p className="text-sm font-bold uppercase tracking-[0.16em] text-shop-darkOrange">
                                Get in touch
                            </p>
                        </div>

                        {/* Contact Form */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:p-10">
                            <div className="mb-8">
                                <p className="text-sm font-bold uppercase tracking-[0.16em] text-shop-darkOrange">
                                    Send a message
                                </p>

                                <h2 className="mt-2 text-2xl font-bold tracking-tight text-shop-dark-green sm:text-3xl">
                                    How can we help you?
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                    Complete the form with a few details about your enquiry.
                                    Please avoid including passwords or sensitive payment
                                    information.
                                </p>
                            </div>

                            <form action="/api/contact" method="POST" className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Full name
                                        </label>

                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="Enter your full name"
                                            autoComplete="name"
                                            required
                                            className="min-h-12 rounded-xl border-slate-200 focus-visible:ring-shop-dark-green"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Email address
                                        </label>

                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            required
                                            className="min-h-12 rounded-xl border-slate-200 focus-visible:ring-shop-dark-green"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="subject"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Subject
                                    </label>

                                    <Input
                                        id="subject"
                                        name="subject"
                                        type="text"
                                        placeholder="What is your enquiry about?"
                                        required
                                        className="min-h-12 rounded-xl border-slate-200 focus-visible:ring-shop-dark-green"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="message"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Your message
                                    </label>

                                    <Textarea
                                        id="message"
                                        name="message"
                                        placeholder="Tell us how we can help..."
                                        rows={6}
                                        required
                                        className="min-h-36 resize-y rounded-xl border-slate-200 focus-visible:ring-shop-dark-green"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="min-h-12 w-full rounded-xl bg-shop-dark-green font-semibold text-white transition hover:bg-shop-dark-green/90"
                                >
                                    Send Message
                                    <span className="ml-2" aria-hidden="true">
                                        →
                                    </span>
                                </Button>

                                <p className="text-center text-xs leading-5 text-slate-500">
                                    By sending this message, you are contacting the Spaazr
                                    team about your enquiry.
                                </p>
                            </form>
                        </div>

                        {/* Contact Information — after the form */}
                        <div className="mt-14 md:mt-16">
                            <p className="text-sm font-bold uppercase tracking-[0.16em] text-shop-darkOrange">
                                Contact information
                            </p>

                            <SubTitle>We&apos;d love to hear from you.</SubTitle>

                            <SubText className="mt-4 max-w-2xl text-slate-600">
                                Whether you are a customer looking for assistance, a vendor
                                interested in joining Spaazr, or a rider exploring
                                opportunities, choose a contact channel that works for you.
                            </SubText>

                            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {contactInfo.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={item.title}
                                            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-shop-dark-green/20 hover:shadow-md"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-shop-light-green/15 text-shop-dark-green transition group-hover:bg-shop-dark-green group-hover:text-white">
                                                <Icon size={21} strokeWidth={1.8} />
                                            </div>

                                            <h3 className="mt-4 font-semibold text-shop-dark-green">
                                                {item.title}
                                            </h3>

                                            <p className="mt-2 break-words text-sm font-medium text-slate-800">
                                                {item.value}
                                            </p>

                                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                                {item.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Partnership CTA */}
                            <div className="mt-6 rounded-2xl bg-shop-dark-green p-6 text-white sm:p-8">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-shop-darkOrange text-white">
                                            <MessageCircle size={21} />
                                        </div>

                                        <div>
                                            <h3 className="font-semibold">
                                                Interested in working with us?
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-white/80">
                                                Explore opportunities to become a Spaazr vendor
                                                or delivery partner.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 flex-wrap gap-4 sm:pl-14">
                                        <a
                                            href="/become-a-partner/vendor"
                                            className="text-sm font-semibold text-white underline decoration-shop-darkOrange decoration-2 underline-offset-4 transition hover:text-shop-darkOrange"
                                        >
                                            Become a vendor
                                        </a>

                                        <a
                                            href="/become-a-partner/rider"
                                            className="text-sm font-semibold text-white underline decoration-shop-darkOrange decoration-2 underline-offset-4 transition hover:text-shop-darkOrange"
                                        >
                                            Become a rider
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

        </div>
    );
}
