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
    textSize = 'medium',
    style = 'circle',
  }: {
    backgroundColor: string;
    textColor: string;
    intensity: number;
    toFullSize: boolean;
    textSize?: 'small' | 'medium' | 'large';
    style?: 'circle' | 'dot';
  }
): Image {
  const largeSize = 50;
  const smallSize = 35;
  const size = toFullSize ? largeSize : smallSize;

  const largeTextFactor = 0.65;
  const mediumTextFactor = 0.55;
  const smallTextFactor = 0.45;
  let textSizeFactor = mediumTextFactor;
  if (textSize === 'small') {
    textSizeFactor = smallTextFactor;
  } else if (textSize === 'medium') {
    textSizeFactor = mediumTextFactor;
  } else if (textSize === 'large') {
    textSizeFactor = largeTextFactor;
  }

  const drawing = new DrawContext();

  drawing.respectScreenScale = true;
  const contextSize = largeSize;
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

  drawing.setFont(Font.boldSystemFont(size * textSizeFactor));
  drawing.setTextAlignedCenter();
  drawing.setTextColor(new Color(textColor, 1));
  // the text aligns to the bottom of the rectangle while not extending to the
  // top, so y is pulled up here 3 pixels
  const textBox = new Rect(
    (contextSize - size) / 2,
    (contextSize - size * textSizeFactor) / 2 - 3,
    size,
    size * textSizeFactor
  );
  drawing.drawTextInRect(text, textBox);
  return drawing.getImage();
}

export default createDateImage;
