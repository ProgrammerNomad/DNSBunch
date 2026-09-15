'use client';

import React from 'react';

import { cn } from '@/lib/utils';

type SxValue = Record<string, unknown> | undefined | null | false;

function spacingToPx(value: unknown): string | number | undefined {
  if (typeof value === 'number') return value * 8;
  if (typeof value === 'string') return value;
  return undefined;
}

function sxToStyle(sx?: SxValue | SxValue[]): React.CSSProperties {
  if (!sx) return {};
  const merged = Array.isArray(sx)
    ? (Object.assign({}, ...sx.filter(Boolean)) as Record<string, unknown>)
    : (sx as Record<string, unknown>);

  const style: React.CSSProperties = {};

  const map: Record<string, keyof React.CSSProperties> = {
    backgroundColor: 'backgroundColor',
    color: 'color',
    fontSize: 'fontSize',
    fontFamily: 'fontFamily',
    fontWeight: 'fontWeight',
    display: 'display',
    flexDirection: 'flexDirection',
    alignItems: 'alignItems',
    justifyContent: 'justifyContent',
    flexWrap: 'flexWrap',
    gap: 'gap',
    textAlign: 'textAlign',
    borderTop: 'borderTop',
    borderRight: 'borderRight',
    borderBottom: 'borderBottom',
    borderColor: 'borderColor',
    borderRadius: 'borderRadius',
    overflow: 'overflow',
    whiteSpace: 'whiteSpace',
    wordBreak: 'wordBreak',
    verticalAlign: 'verticalAlign',
    maxWidth: 'maxWidth',
    minWidth: 'minWidth',
    ml: 'marginLeft',
    mr: 'marginRight',
    mb: 'marginBottom',
    mt: 'marginTop',
    p: 'padding',
    py: 'paddingTop',
    px: 'paddingLeft',
  };

  for (const [key, cssKey] of Object.entries(map)) {
    if (key in merged) {
      let val = merged[key];
      if (['mt', 'mb', 'ml', 'mr', 'p'].includes(key) && typeof val === 'number') {
        val = spacingToPx(val);
      }
      if (key === 'py' && typeof val === 'number') {
        style.paddingTop = spacingToPx(val) as number;
        style.paddingBottom = spacingToPx(val) as number;
        continue;
      }
      if (key === 'px' && typeof val === 'number') {
        style.paddingLeft = spacingToPx(val) as number;
        style.paddingRight = spacingToPx(val) as number;
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (style as any)[cssKey] = val;
    }
  }

  if ('&:hover' in merged) {
    // hover styles ignored for inline shim
  }

  return style;
}

type BoxProps = React.HTMLAttributes<HTMLElement> & {
  sx?: SxValue | SxValue[];
  component?: React.ElementType;
  display?: React.CSSProperties['display'];
};

export function Box({ sx, component, className, style, display, children, ...props }: BoxProps) {
  const Comp = component || 'div';
  return React.createElement(
    Comp,
    {
      className: cn(className),
      style: { ...sxToStyle(sx), ...(display ? { display } : {}), ...style },
      ...props,
    },
    children,
  );
}

type TypographyProps = React.HTMLAttributes<HTMLElement> & {
  variant?: string;
  color?: string;
  gutterBottom?: boolean;
  paragraph?: boolean;
  sx?: SxValue | SxValue[];
  component?: React.ElementType;
};

export function Typography({
  variant,
  color,
  gutterBottom,
  sx,
  component,
  className,
  style,
  children,
  ...props
}: TypographyProps) {
  void variant;
  const Comp = (component || 'p') as 'p';
  const colorStyle: React.CSSProperties =
    color === 'text.secondary'
      ? { color: 'hsl(var(--muted-foreground))' }
      : color === 'error'
        ? { color: 'hsl(var(--destructive))' }
        : color === 'warning.main'
          ? { color: '#ed6c02' }
          : color === 'primary'
            ? { color: 'hsl(var(--primary))' }
            : {};

  return (
    <Comp
      className={cn(gutterBottom && 'mb-2', className)}
      style={{ ...colorStyle, ...sxToStyle(sx), ...style }}
      {...props}
    >
      {children}
    </Comp>
  );
}
