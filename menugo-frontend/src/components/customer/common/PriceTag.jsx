

export default function PriceTag({price}) {
  return <span className="price">Br {price ?? '0.00'}</span>;
}
