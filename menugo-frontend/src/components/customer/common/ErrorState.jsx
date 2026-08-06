

export default function ErrorState({message}) {
  return <div className="error">{message || 'Something went wrong'}</div>;
}
