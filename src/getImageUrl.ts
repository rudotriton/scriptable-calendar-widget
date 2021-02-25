/**
 * Creates a path for the given image name
 *
 * @param name
 */
function getImageUrl(name: string): string {
  let fm: FileManager = FileManager.iCloud();
  let dir: string = fm.documentsDirectory();
  return fm.joinPath(dir, `${name}`);
}

export default getImageUrl;