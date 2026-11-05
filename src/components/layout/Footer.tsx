import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
export const Footer = () => <footer className="site-footer page-width"><div><Link to="/" className="footer-brand">ezpath.</Link><p>A little more freedom, every day.</p></div><div className="footer-links"><Link to="/plan">Plan a journey <ArrowUpRight size={14} /></Link><Link to="/operator/network">Network status <ArrowUpRight size={14} /></Link><span>Made for a more accessible world.</span></div></footer>;
