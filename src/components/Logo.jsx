// Logo de River ID: el escudo de River Plate (archivo en public/images).
// "size" es el alto; el ancho se ajusta a la proporción del escudo.
function Logo({ size = 40 }) {
  return <img className="logo" src="/images/escudo-river.png" alt="" height={size} width={Math.round(size * 0.81)} />
}

export default Logo
