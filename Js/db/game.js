export const battleScenes = {
  start: {
    title: "¡Un Pokémon salvaje apareció!",
    text: "Un Eevee salvaje se interpone en tu camino. ¿Qué querés hacer?",
    options: [
      { label: "Atacar", next: "attack" },
      { label: "Usar poción", next: "potion" }
    ]
  },
  attack: {
    title: "¡Buen movimiento!",
    text: "Tu Pokémon esquiva el contraataque. Eevee está cansado. ¿Cómo sigue el turno?",
    options: [
      { label: "Lanzar Poké Ball", next: "win" },
      { label: "Volver a atacar", next: "final-attack" }
    ]
  },
  potion: {
    title: "¡Poción utilizada!",
    text: "Tu Pokémon recupera fuerzas y Eevee se acerca con curiosidad. ¿Qué hacés?",
    options: [
      { label: "Lanzar Poké Ball", next: "win" },
      { label: "Atacar", next: "attack" }
    ]
  },
  "final-attack": {
    title: "¡Eevee se debilitó!",
    text: "La batalla terminó. Siempre podés volver a intentarlo con otra estrategia.",
    options: [{ label: "Jugar de nuevo", next: "start" }]
  },
  win: {
    title: "¡Pokémon capturado!",
    text: "¡Eevee se une a tu equipo! La aventura continúa en la Pokédex.",
    options: [
      { label: "Volver a jugar", next: "start" },
      { label: "Ir a la Pokédex", route: "pokedex" }
    ]
  }
};
