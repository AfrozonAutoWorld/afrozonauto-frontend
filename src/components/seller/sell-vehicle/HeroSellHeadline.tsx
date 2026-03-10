export interface HeroSellHeadlineProps {
  headerText: React.ReactNode;
  descriptionText?: string;
}

export function HeroSellHeadline({ headerText, descriptionText }: HeroSellHeadlineProps) {
  return (
    <div className="flex flex-col justify-center items-center gap-4 sm:gap-[21px] w-full max-w-[602px]">
      <h1 className="font-sans font-bold text-2xl sm:text-3xl md:text-[48px] md:leading-[60px] leading-tight sm:leading-snug text-black text-left w-full shrink-0 order-0" dangerouslySetInnerHTML={{ __html: headerText as string }}>
      
      </h1>
      {descriptionText && (
        <p className="font-body font-medium text-base sm:text-[18px] sm:leading-7 leading-relaxed text-black w-full shrink-0 order-1 text-left">
          {descriptionText}
        </p>
      )}
    </div>
  );
}
