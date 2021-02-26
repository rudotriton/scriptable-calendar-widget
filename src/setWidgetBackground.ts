import getImageUrl from "./getImageUrl";

/**
 * Sets the background of the WidgetStack to the given imageName
 *
 * @param widget
 * @param imageName
 */
function setWidgetBackground(widget: ListWidget, imageName: string): void {
  const imageUrl = getImageUrl(imageName);
  const image = Image.fromFile(imageUrl);
  widget.backgroundImage = image;
}

export default setWidgetBackground;
