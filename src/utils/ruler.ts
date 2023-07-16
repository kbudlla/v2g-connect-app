export const measureTextSize = (text: string, style: React.CSSProperties = {}) => {
  const textElement = document.createElement('span');
  document.body.appendChild(textElement);

  // Apply the provided style
  for (const key of Object.keys(style)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (textElement.style[key as any] as any) = style[key as keyof React.CSSProperties];
  }

  textElement.style.height = 'auto';
  textElement.style.width = 'auto';
  textElement.style.position = 'absolute';
  textElement.style.whiteSpace = 'no-wrap';
  textElement.innerHTML = text;

  const width = textElement.clientWidth;
  const height = textElement.clientHeight;
  document.body.removeChild(textElement);

  return { width, height };
};
