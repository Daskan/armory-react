// @flow

import type { EmbedProps } from 'embeds/bootstrap';

import Skills from 'embeds/components/Skills';

export default function (element: HTMLElement, ids: Array<number>) {
  return (props: EmbedProps) => <Skills {...props} ids={ids} />;
}
