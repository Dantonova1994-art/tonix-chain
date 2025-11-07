import Hero from "@/components/Hero";
import TicketCard from "@/components/TicketCard";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center w-full pb-24">
      <Hero />
      <div id="lottery" className="w-full flex justify-center">
        <TicketCard />
      </div>
      <Footer />
    </main>
  );
}
