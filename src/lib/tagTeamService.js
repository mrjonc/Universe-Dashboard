import { supabase } from "./supabaseClient.js";

export async function getTagTeams() {
  const { data, error } = await supabase
    .from("tag_teams")
    .select(
      `id, name, image_url, brands (id, name, image_url), tag_team_members (superstars (id, name, image_url))`,
    );

  if (error) throw error;

  return data.map((team) => ({
    id: team.id,
    name: team.name,
    image_url: team.image_url,
    brand: team.brands,
    members: team.tag_team_members.map((m) => m.superstars),
  }));
}
