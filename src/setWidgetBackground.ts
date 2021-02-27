/**
 * Sets the background of the WidgetStack to the given imageName
 *
 */
function setWidgetBackground(widget: ListWidget, imageName: string): void {
  const imageUrl = getImageUrl(imageName);
  const image = Image.fromFile(imageUrl);
  widget.backgroundImage = image;
}

/**
 * Creates a path for the given image name
 *
 */
function getImageUrl(name: string): string {
  let fm: FileManager = FileManager.iCloud();
  let dir: string = fm.documentsDirectory();
  return fm.joinPath(dir, `${name}`);
}

export default setWidgetBackground;
