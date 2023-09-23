function getImageFromBase64(base64String: string): Image {
  const data = Data.fromBase64String(base64String);
  return Image.fromData(data);
}

export default getImageFromBase64;