/**
 * Adds WidgetText to WidgetStack
 *
 */
function addWidgetTextLine(
  text: string,
  widget: WidgetStack,
  {
    textColor = "#ffffff",
    textSize = 12,
    opacity = 1,
    align,
    font,
    lineLimit = 0,
  }: {
    textColor?: string;
    textSize?: number;
    opacity?: number;
    align?: string;
    font?: Font;
    lineLimit?: number;
  }
): void {
  const textLine = widget.addText(text);
  textLine.textColor = new Color(textColor, 1);
  textLine.lineLimit = lineLimit;
  if (typeof font === "string") {
    textLine.font = new Font(font, textSize);
  } else {
    textLine.font = font;
  }
  textLine.textOpacity = opacity;
  switch (align) {
    case "left":
      textLine.leftAlignText();
      break;
    case "center":
      textLine.centerAlignText();
      break;
    case "right":
      textLine.rightAlignText();
      break;
    default:
      textLine.leftAlignText();
      break;
  }
}

export default addWidgetTextLine;
