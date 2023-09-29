/**
 * Creates the image for a date, if set, also draws the circular background
 * indicating events, for bounding months these are drawn smaller
 */
function createDateImage(
  text: string,
  {
    backgroundColor,
    textColor,
    intensity,
    toFullSize,
    style = 'circle',
  }: {
    backgroundColor: string;
    textColor: string;
    intensity: number;
    toFullSize: boolean;
    style?: 'circle' | 'dot';
  }
): Image {
  const size = toFullSize ? 50 : 35;

  const drawing = new DrawContext();

  drawing.respectScreenScale = true;
  const contextSize = 50;
  drawing.size = new Size(contextSize, contextSize);
  // won't show a drawing sized square background
  drawing.opaque = false;

  // circle color
  drawing.setFillColor(new Color(backgroundColor, intensity));

  if (style === 'circle') {
    // so that edges stay round and are not clipped by the box
    // 50 48 1
    // (contextSize - (size - 2)) / 2
    // size - 2 makes them a bit smaller than the drawing context
    drawing.fillEllipse(
      new Rect(
        (contextSize - (size - 2)) / 2,
        (contextSize - (size - 2)) / 2,
        size - 2,
        size - 2
      )
    );
  } else if (style === 'dot') {
    const dotSize = contextSize / 5;
    drawing.fillEllipse(
      new Rect(
        contextSize / 2 - dotSize / 2, // center the dot
        contextSize - dotSize, // below the text
        dotSize,
        dotSize,
      )
    );
  }

  drawing.setFont(Font.boldSystemFont(size * 0.5));
  drawing.setTextAlignedCenter();
  drawing.setTextColor(new Color(textColor, 1));
  // the text aligns to the bottom of the rectangle while not extending to the
  // top, so y is pulled up here 3 pixels
  const textBox = new Rect(
    (contextSize - size) / 2,
    (contextSize - size * 0.5) / 2 - 3,
    size,
    size * 0.5
  );
  drawing.drawTextInRect(text, textBox);
  return drawing.getImage();
}

export default createDateImage;
