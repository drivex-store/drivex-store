export const HEADER_QUERY = `
  *[_type == "navigation" && navId.current == "nav"][0]{
    "navItems": items[]{
      _key,
      text,
      navigationItemUrl
    },
    "headerCta": headerCta,
    "flyout": {
      "availability": flyoutAvailability,
      "centerImage": flyoutCenterImage,
      "featuredProject": flyoutFeaturedProject,
      "contact": flyoutContact,
      "team": flyoutTeam,
      "socials": flyoutSocials,
      "location": flyoutLocation
    }
  }
`

export const FOOTER_QUERY = `
  *[_type == "footer"][0]{
    title,
    "navigation": navigation->{
      "navItems": items[]{
        _key,
        text,
        navigationItemUrl
      },
      flyoutAvailability,
      flyoutContact,
      flyoutTeam,
      flyoutSocials,
      flyoutLocation
    },
    leftText,
    contactInformation,
    copyrightNotice,
    showWatermark,

    "asciiImage": asciiImage.asset->url,
    "asciiDepthMap": asciiDepthMap.asset->url,
    "asciiMobileFallback": asciiMobileFallback.asset->url,
    asciiColor,
    asciiColorDark,
    asciiCellSize,
    asciiParallaxIntensity,
    asciiRevealOriginX,
    asciiRevealOriginY,

    "asciiImageLeft": asciiImageLeft.asset->url,
    "asciiDepthMapLeft": asciiDepthMapLeft.asset->url,
    "asciiMobileFallbackLeft": asciiMobileFallbackLeft.asset->url,
    asciiColorLeft,
    asciiColorDarkLeft,
    asciiCellSizeLeft,
    asciiParallaxIntensityLeft,
    asciiRevealOriginXLeft,
    asciiRevealOriginYLeft
  }
`
