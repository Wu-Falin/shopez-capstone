import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <Logo />
        <p>Free shipping on orders over $50. Pay cash on delivery.</p>
        <p className="muted">© {new Date().getFullYear()} ShopEZ. A MERN capstone project by Falin.</p>
      </div>
    </footer>
  );
}
