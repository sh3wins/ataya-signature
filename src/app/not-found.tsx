import Scoop from "@/components/art/Scoop";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-5 pt-20 text-center">
      <div>
        <Scoop flavour="vanilla" cone dripping className="mx-auto h-60 w-auto" />
        <h1 className="mt-6 font-display text-5xl">This one melted.</h1>
        <p className="mt-3 text-muted">The page you wanted isn&apos;t in the freezer.</p>
        <ButtonLink href="/" className="mt-8">
          Back to Ataya
        </ButtonLink>
      </div>
    </div>
  );
}
