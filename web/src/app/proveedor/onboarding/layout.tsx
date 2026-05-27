export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f5f7] flex justify-center pt-[96px] pb-16 px-4">
      <div className="w-full max-w-[560px]">{children}</div>
    </div>
  );
}
