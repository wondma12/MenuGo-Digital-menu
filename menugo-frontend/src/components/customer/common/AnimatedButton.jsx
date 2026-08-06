

export default function AnimatedButton({children, ...props}) {
  return (
    <button className="animated-button" {...props}>
      {children}
    </button>
  );
}
