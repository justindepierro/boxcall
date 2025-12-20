export async function fetchUrlAsFile(params: {
  url: string;
  filename: string;
}): Promise<File> {
  const { url, filename } = params;

  const response = await fetch(url);
  const blob = await response.blob();

  return new File([blob], filename, {
    type: blob.type,
  });
}
