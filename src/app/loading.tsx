import LogoLoader from '@/components/LogoLoader';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <LogoLoader text="Connecting to AKOD Food Network..." size="lg" />
    </div>
  );
}
