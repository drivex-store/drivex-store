
const LINK_PROJECTION = `{
  "type": type,
  "href": select(
    type == "internal" => "/" + coalesce(internal.link->uri.current, internal.link->slug.current, ""),
    type == "external" => external,
    type == "email" => "mailto:" + email,
    type == "modal" => "#"
  ),
  "modalId": modalId->_id,
  openInNewTab,
  canDownload
}`

export const HEADER_QUERY = `
  *[_type == "navigation" && navId.current == "nav"][0]{
    "navItems": items[]{
      _key,
      text,
      "link": navigationItemUrl${LINK_PROJECTION}
    },
    "headerCta": headerCta{
      "text": customText,
      ...${LINK_PROJECTION}
    },
    "flyout": {
      "availability": flyoutAvailability,
      "centerImage": flyoutCenterImage{
        image,
        caption,
        "link": link${LINK_PROJECTION}
      },
      "featuredProject": flyoutFeaturedProject{
        caption,
        "project": project->{
          _id,
          title,
          "uri": uri.current
        }
      },
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
        "link": navigationItemUrl${LINK_PROJECTION}
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
