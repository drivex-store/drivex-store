import { HeroSection } from '@/sections/homepage/HeroSection'

const sectionMap = {
  heroSectionField: HeroSection,
  // နောက်ပိုင်း cardsSectionField စတာတွေ ဒီမှာ ထပ်ထည့်မယ်
}

export function SectionRenderer({ sections = [] }) {
  return sections.map((s) => {
    const Component = sectionMap[s._type]
    if (!Component) return null
    return <Component key={s._key} content={s.sectionContent} settings={s.sectionSettings} />
  })
}
