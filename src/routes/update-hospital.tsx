import { createFileRoute, Link } from "@tanstack/react-router";
import { HospitalUpdateForm } from "@/components/stroke/hospital-update-form";

export const Route = createFileRoute("/update-hospital")({
  component: UpdateHospitalPage,
});

function UpdateHospitalPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <img src="/brand/arunai.png" alt="Arunai Neuro Foundation" className="h-8 w-auto max-w-[8rem]" />
        <Link to="/" className="text-sm font-semibold text-[#1b4fad]">
          Back
        </Link>
      </header>
      <h1 className="font-display mt-6 text-3xl leading-tight">Update a hospital</h1>
      <p className="font-tamil mt-1 text-base text-ink-soft">மருத்துவமனை விவரத்தை அனுப்ப</p>
      <div className="mt-5">
        <HospitalUpdateForm />
      </div>
    </main>
  );
}
