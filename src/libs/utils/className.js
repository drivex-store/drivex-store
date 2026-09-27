import { extendTailwindMerge } from "tailwind-merge";
import { cx as clsx } from "class-variance-authority";

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

export function cx(...inputs) {
  return twMerge(clsx(...inputs));
}

export function cva(config = {}) {
  const { base = [], variants = {}, compoundVariants = [], defaultVariants = {} } = config;

  return (props = {}) => {
    const { className, ...variantProps } = props ?? {};
    const classes = [base];

    for (const variantName of Object.keys(variants)) {
      const variantOptions = variants[variantName];
      const selected = variantProps[variantName] ?? defaultVariants[variantName];
      if (selected != null && variantOptions[selected] != null) {
        classes.push(variantOptions[selected]);
      }
    }

    for (const compound of compoundVariants) {
      const { class: compoundClass, className: compoundClassName, ...conditions } = compound;
      const matches = Object.entries(conditions).every(([key, value]) => {
        const actual = variantProps[key] ?? defaultVariants[key];
        return Array.isArray(value) ? value.includes(actual) : actual === value;
      });
      if (matches) classes.push(compoundClass ?? compoundClassName);
    }

    classes.push(className);

    return cx(...classes);
  };
}
