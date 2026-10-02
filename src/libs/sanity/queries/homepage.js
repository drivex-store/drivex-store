import { groq } from 'next-sanity'

const LINK = groq`{
  "text": customText,
  type,
  openInNewTab,
  canDownload,
  "href": select(
    type == "internal" => select(
      string::startsWith(coalesce(internal.link->uri.current, ""), "/") => internal.link->uri.current,
      "/" + coalesce(internal.link->uri.current, internal.link->slug.current, "")
    ),
    type == "external" => external,
    type == "email" => "mailto:" + email,
    type == "modal" => "#"
  ),
  "modalId": modalId->_id
}`

export const homepageQuery = groq`*[_type == "page" && _id == $id][0]{
  title,
  pageBuilder{
    sectionsArray[]{
      _key,
      _type,
      sectionSettings,
      sectionContent{
        ...,
        "asciiImageUrl": asciiImage.asset->url,
        "mobileImageUrl": parallaxMobileImage.asset->url,
        "depthMapUrl": depthMap.asset->url,
        ctas{
          ...,
          buttons[]{
            _key, size, theme, variant,
            "link": link${LINK}
          }
        }
      }
    }
  }
}`
