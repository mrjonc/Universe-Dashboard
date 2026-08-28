import { supabase } from "./supabaseClient.js";

export async function getTagTeams() {
  const { data, error } = await supabase
    .from("tag_teams")
    .select(
      `id, name, image_url, brands (id, name, image_url), tag_team_members (superstars (id, name, image_url))`,
    );

  if (error) {
    console.error("Erro ao carregar Tag Teams: ", error.message);
    return [];
  }

  return data.map((team) => ({
    id: team.id,
    name: team.name,
    image_url: team.image_url,
    brand: team.brands,
    members: team.tag_team_members.map((m) => m.superstars),
  }));
}

export async function addTagTeam(
  name,
  brandId,
  imageURL,
  selectedSuperstarsIds,
) {
  try {
    const { data: teamData, error: teamError } = await supabase
      .from("tag_teams")
      .insert([
        { name, brand_id: brandId || null, image_url: imageURL || null },
      ])
      .select()
      .single();
    if (teamError) throw teamError;

    const membersData = selectedSuperstarsIds.map((superstarId) => ({
      tag_team_id: teamData.id,
      superstar_id: superstarId,
    }));

    const { error: membersError } = await supabase
      .from("tag_team_members")
      .insert(membersData);

    if (membersError) throw membersError;

    return { success: true, data: teamData };
  } catch (error) {
    console.error("Erro ao cadastrar Tag Team:", error.message);
    return { success: false, error: error.message };
  }
}
