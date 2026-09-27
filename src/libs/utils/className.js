import { extendTailwindMerge } from "tailwind-merge";
import {
  compose as createCompose,
  cva as createCva,
  cx as createCx,
} from "class-variance-authority";

const TEXT_TOKENS = [
  "display",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "subheadline",
  "body-lg",
  "body-sm",
  "body",
  "accent-lg",
  "accent",
];

const COLOR_TOKENS = [
  "background",
  "background-muted",
  "foreground",
  "foreground-muted",
  "brand",
  "brand-muted",
  "border",
  "border-muted",
  "surface",
  "black",
  "white",
  "transparent",
  "current",
  "inherit",
];

const FONT_FAMILIES = ["sans", "mono"];

const matchesToken = (value, tokens, allowModifiers = false) =>
  tokens.some((token) =>
    allowModifiers
      ? value === token || value.startsWith(`${token}-`)
      : value === token,
  );

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        (value) => matchesToken(value, TEXT_TOKENS, true),
      ],
      color: [
        (value) => matchesToken(value, COLOR_TOKENS),
      ],
    },
    classGroups: {
      "font-family": [
        {
          font: [...FONT_FAMILIES],
        },
      ],
    },
  },
});

const withTailwindMerge = {
  hooks: {
    onComplete: twMerge,
  },
};

export const cva = createCva(withTailwindMerge);
export const cx = createCx(withTailwindMerge);
export const compose = createCompose(withTailwindMerge);
