export async function generateTags(
  filename: string
) {
  const name =
    filename.toLowerCase();

  const tags = new Set<string>();

  if (
    name.includes("taj") ||
    name.includes("mahal")
  ) {
    tags.add("monument");
    tags.add("architecture");
    tags.add("travel");
  }

  if (
    name.includes("football") ||
    name.includes("cricket")
  ) {
    tags.add("sports");
    tags.add("outdoor");
  }

  if (
    name.includes("mountain")
  ) {
    tags.add("nature");
    tags.add("landscape");
  }

  if (
    name.includes("beach")
  ) {
    tags.add("travel");
    tags.add("vacation");
  }

  if (
    name.includes("selfie")
  ) {
    tags.add("person");
    tags.add("portrait");
  }

  return Array.from(tags);
}