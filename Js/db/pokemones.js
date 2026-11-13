const artwork = (id, shiny = false) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${shiny ? "shiny/" : ""}${id}.png`;
const localArtwork = (name) => `./assets/img/${name.toLowerCase()}.png`;
const cry = (id) => `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;

const entries = [
  [25, "Pikachu", ["Eléctrico"], "Un Pokémon eléctrico que almacena energía en las bolsas de sus mejillas.", 0.4, 6, 1, 35, 55, 90, 40, "Electricidad estática", true, "Raichu", 22, "Raro", true],
  [134, "Vaporeon", ["Agua"], "Su estructura celular es similar a la composición molecular del agua.", 1, 29, 1, 130, 65, 65, 60, "Absorbe agua", false, null, null, "Raro", true],
  [94, "Gengar", ["Fantasma", "Veneno"], "Se esconde en las sombras y disfruta asustando a quienes pasan cerca.", 1.5, 40.5, 1, 60, 65, 110, 60, "Cuerpo maldito", false, null, null, "Épico", true],
  [183, "Marill", ["Agua", "Hada"], "Su cola funciona como un flotador para poder nadar sin esfuerzo.", 0.4, 8.5, 2, 70, 20, 40, 50, "Sebo", true, "Azumarill", 18, "Común", true],
  [4, "Charmander", ["Fuego"], "La llama de su cola refleja su estado de ánimo y su salud.", 0.6, 8.5, 1, 39, 52, 65, 43, "Mar llamas", true, "Charmeleon", 16, "Común", true],
  [7, "Squirtle", ["Agua"], "Se protege con su caparazón y lanza potentes chorros de agua.", 0.5, 9, 1, 44, 48, 43, 65, "Torrente", true, "Wartortle", 16, "Común", true],
  [393, "Piplup", ["Agua"], "Es orgulloso y excelente nadador, aunque suele tropezarse al caminar.", 0.4, 5.2, 4, 53, 51, 40, 53, "Torrente", true, "Prinplup", 16, "Poco común", true],
  [1, "Bulbasaur", ["Planta", "Veneno"], "Bulbasaur es conocido por la semilla que lleva en su espalda, la cual crece a medida que evoluciona.", 0.7, 6.9, 1, 45, 49, 45, 49, "Espesura", true, "Ivysaur", 16, "Común", true]
];

export const initialPokemon = entries.map(([
  id, nombre, tipo, descripcion, altura, peso, generacion, hp, ataque,
  velocidad, defensa, habilidad, tieneEvolucion, evolucion, nivelEvolucion,
  rareza, shiny
]) => ({
  id,
  nombre,
  tipo,
  descripcion,
  altura,
  peso,
  generacion,
  hp,
  ataque,
  velocidad,
  defensa,
  habilidad,
  tieneEvolucion,
  evolucion,
  nivelEvolucion,
  rareza,
  imagen: localArtwork(nombre),
  sonido: cry(id),
  shiny,
  imagenShiny: shiny ? artwork(id, true) : ""
}));
