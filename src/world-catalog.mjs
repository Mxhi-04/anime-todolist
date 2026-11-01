export function selectWorlds(worlds, query = "", genre = "All") {
  const normalize = (value) =>
    String(value).normalize("NFKD").replace(/[’']/g, "").toLowerCase();
  const search = normalize(query).trim();
  return worlds.filter((world) => {
    const categoryMatches =
      genre === "All" ||
      (genre === "Popular 50"
        ? Number.isInteger(world.popularPosition)
        : world.genres.includes(genre));
    return (
      categoryMatches &&
      normalize(`${world.title} ${(world.aliases || []).join(" ")}`).includes(
        search,
      )
    );
  });
}
