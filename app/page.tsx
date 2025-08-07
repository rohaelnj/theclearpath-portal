import Image from "next/image";
import Button from "../components/Button";

export default function Home() {
  return (
    <main className="bg-[#DFD6C7] min-h-screen font-sans px-4 py-8 md:px-12 md:py-20 flex flex-col justify-center">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Image
          src="/logo.png"
          alt="The Clear Path logo"
          width={80}
          height={80}
          className="sm:w-[100px] sm:h-[100px] w-[72px] h-[72px]"
          priority
        />
      </div>

      {/* Headline */}
      <h1 className="text-center text-[#1F4142] text-3xl sm:text-5xl font-bold mb-4 leading-tight">
        Your Trusted Online Therapy Platform —<br className="hidden sm:block" /> Rooted in the UAE.
      </h1>

      {/* Subheading */}
      <p className="text-center text-[#1F4140] text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
        Confidential care from licensed professionals who understand your culture, language, and lifestyle wherever you are.
      </p>

      {/* CTA */}
      <div className="text-center">
        <Button href="/signup">
          Get Started
        </Button>
      </div>

      {/* Testimonial */}
      <section className="mt-16 bg-[#DED4C8]/80 p-8 rounded-2xl max-w-2xl mx-auto shadow">
        <h2 className="text-[#1F4142] text-center text-2xl font-semibold mb-2">
          Client Feedback
        </h2>
        <p className="text-[#1F4140] italic mt-4 text-center text-lg">
          “The Clear Path helped me find balance. Online therapy that actually works.”
        </p>
        <p className="text-center mt-2 font-bold text-[#1F4140] text-base">
          — A.S., Dubai
        </p>
      </section>
    </main>
  );
}
