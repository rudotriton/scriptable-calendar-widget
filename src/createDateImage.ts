// Todo render smaller images for bounding months
function createDateImage(
  date: string,
  backgroundColor: string,
  textColor: string,
  intensity: number,
  size = 50
) {
  const drawing = new DrawContext();
  drawing.respectScreenScale = true;
  drawing.size = new Size(size, size);
  drawing.opaque = false;
  drawing.setFillColor(new Color(backgroundColor, intensity));
  drawing.fillEllipse(new Rect(1, 1, size - 2, size - 2));
  drawing.setFont(Font.boldSystemFont(25));
  drawing.setTextAlignedCenter();
  drawing.setTextColor(new Color(textColor, 1));
  drawing.drawTextInRect(date, new Rect(0, 10, size, size));
  return drawing.getImage();
}

export default createDateImage;
