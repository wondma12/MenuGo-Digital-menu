

export default function EmptyState({children}) {
  return <div className="empty">{children || 'No items'}</div>;
}
