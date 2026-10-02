import { cx } from '@/libs/utils/className'
import { HeroSectionContent } from '@/sections/contents/HeroSectionContent'
import { HeroScrollPush } from '@/sections/shared/HeroScrollPush'
import { HeroAsciiArt } from '@/sections/shared/HeroAsciiArt'

// Tailwind က class နာမည်ကို အပြည့်အစုံ တွေ့မှ generate လုပ်တာမို့ map နဲ့ ရေးရတယ်
// (none ကလွဲပြီး တန်ဖိုးတွေက ခန့်မှန်းထားတာ -- design ကိုက်အောင် ပြင်ပါ)
const PT = { none: 'pt-0', sm: 'pt-16', md: 'pt-32', lg: 'pt-48', xl: 'pt-64', '2xl': 'pt-96', '3xl': 'pt-128' }
const PB = { none: 'pb-0', sm: 'pb-16', md: 'pb-32', lg: 'pb-48', xl: 'pb-64', '2xl': 'pb-96', '3xl': 'pb-128' }

export function HeroSection({ content: c }) {
  if (!c) return null

  const isAscii = c.variant === 'ascii' && c.asciiImageUrl

  return (
    <section
      data-theme={c.theme}
      data-page-builder-section="heroSection"
      className={cx(
        'relative min-h-svh overflow-hidden bg-background',
        PT[c.paddingTop] ?? PT.none,
        PB[c.paddingBottom] ?? PB.none
      )}
    >
      <HeroScrollPush className="grid-container relative min-h-svh pt-52">
        <div className="grid-layout min-h-[calc(100svh-52px)]">
          <HeroSectionContent
            className="grid-span-12 lg:grid-span-7 pointer-events-none relative z-10 flex grid-rows-[1fr_auto] flex-col items-start justify-between pb-16 lg:pb-32"
            headline={c.headline?.text}
            headlineLevel={c.headline?.level}
            headlineDisplay={c.headlineDisplay}
            subtext={c.subtext}
            ctas={c.ctas}
            trustedBy={c.trustedBy}
          />

          {isAscii && (
            <div className="lg:grid-span-5 absolute top-[35%] right-0 bottom-0 w-9/10 items-center justify-center overflow-hidden lg:relative lg:inset-auto lg:flex lg:w-auto">
              <HeroAsciiArt
                imageSrc={c.asciiImageUrl}
                mobileImageSrc={c.mobileImageUrl}
                depthMapSrc={c.depthMapUrl}
                parallaxIntensity={c.parallaxIntensity}
                cellSize={c.asciiCellSize}
                color={c.asciiColor}
                colorDark={c.asciiColorDark}
                revealOriginX={c.asciiRevealOriginX}
                revealOriginY={c.asciiRevealOriginY}
              />
            </div>
          )}
        </div>
      </HeroScrollPush>
    </section>
  )
}
