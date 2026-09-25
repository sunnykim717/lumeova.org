import Image from "next/image";

type ImagePlaceholderProps = {
  /** Path under /public, e.g. "/images/hero-main.jpg". If the file doesn't
   * exist yet, pass `exists={false}` (the default) and a styled placeholder
   * renders instead — the layout never breaks waiting on real photography. */
  src?: string;
  exists?: boolean;
  alt: string;
  label?: string;
  className?: string;
  aspect?: "video" | "square" | "portrait" | "wide";
};

const ASPECT_CLASS: Record<NonNullable<ImagePlaceholderProps["aspect"]>, string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
};

/**
 * Placeholder-safe image slot.
 *
 * Per project rule: no stock photos, no AI-generated imagery, ever. Until the
 * organization supplies a real photo at `src`, this renders a quiet textured
 * box in brand tones with a small caption — never a broken image icon, never
 * a fake photo.
 */
export function ImagePlaceholder({
  src,
  exists = false,
  alt,
  label,
  className = "",
  aspect = "video",
}: ImagePlaceholderProps) {
  if (exists && src) {
    return (
      <div className={`relative overflow-hidden ${ASPECT_CLASS[aspect]} ${className}`}>
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${ASPECT_CLASS[aspect]} ${className} flex items-center justify-center bg-sage`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(13,27,42,0.04) 0px, rgba(13,27,42,0.04) 1px, transparent 1px, transparent 14px)",
      }}
      role="img"
      aria-label={alt}
    >
      <span className="text-navy/50 text-xs tracking-wide font-medium px-4 text-center">
        {label ?? "사진 준비중"}
      </span>
    </div>
  );
}
