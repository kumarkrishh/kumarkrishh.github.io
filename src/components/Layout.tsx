import React from 'react';
import Header from './Header';

function Footer() {
  return (
    <footer className="container-fluid my-3"><br />
      <p>&copy; Govind Pimpale, MIT Licensed</p>
    </footer>
  )
}

type LayoutProps = {
    children: React.ReactNodeArray | React.ReactNode
}

const Layout: React.FunctionComponent<LayoutProps > = props =>
  <>
    <Header />
    {props.children}
    <Footer />
  </>

export default Layout;
