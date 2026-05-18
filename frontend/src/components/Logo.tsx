import { cn } from "@/lib/utils";
import rawSvg from "@/assets/logo2.svg?raw";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Logo({ className, ...props }: LogoProps) {
  let processedSvg = rawSvg.replace(/#232323/g, "currentColor");
  processedSvg = processedSvg.replace(/<text /g, '<text fill="currentColor" stroke="none" ');

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center text-foreground [&>svg]:w-full [&>svg]:h-full",
        className
      )}
      dangerouslySetInnerHTML={{ __html: processedSvg }}
      {...props}
    />
  );
}
