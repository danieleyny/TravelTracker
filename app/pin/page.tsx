import PinForm from "./PinForm";

export const dynamic = "force-dynamic";

export default function PinPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <div className="mt-16 sm:mt-24">
      <div className="mx-auto max-w-sm">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-center">Travel Tracker</h1>
        <p className="mb-8 text-center text-sm text-black/50">Enter the 4-digit code to continue.</p>
        <PinForm next={searchParams.next ?? "/"} />
      </div>
    </div>
  );
}
