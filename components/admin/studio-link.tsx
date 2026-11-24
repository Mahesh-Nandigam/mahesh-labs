import NextLink from "next/link";
import type { ComponentProps } from "react";

export function StudioLink(props: ComponentProps<typeof NextLink>) {
  return <NextLink {...props} prefetch={false} />;
}
