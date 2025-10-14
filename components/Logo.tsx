import Image from 'next/image';

type LogoProps = {
  className?: string;
};

export default function Logo({ className = 'h-7 w-auto' }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="The Clear Path"
      width={180}
      height={40}
      className={className}
      priority
    />
  );
}
