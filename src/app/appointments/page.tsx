"use client";

export default function AppointmentsPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const message =
    "Hi, I'd like to book an appointment at Fouzia Design Studio.";

  const handleBook = () => {
    if (!whatsappNumber) return;
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <p className="text-sm uppercase tracking-[0.2em] text-accent">
        Appointments
      </p>
      <h1 className="mt-2 font-serif text-4xl text-stone-900">
        Book a Studio Appointment
      </h1>
      <p className="mt-6 text-stone-600">
        Prefer a one-on-one consultation for fittings, custom orders, or
        styling advice? Book an appointment with us directly over WhatsApp
        and we&apos;ll get back to you to confirm a time.
      </p>
      <button
        onClick={handleBook}
        className="mt-8 inline-block rounded-full bg-green-700 px-8 py-3 text-sm font-medium text-white transition hover:bg-green-800"
      >
        Book Appointment via WhatsApp
      </button>
      <p className="mt-4 text-sm text-stone-500">+91 98807 88885</p>
    </div>
  );
}
