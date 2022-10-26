import Layout from '../components/Layout';
import Section from '../components/Section';

function Achernar() {
  return <Layout>
  <Section id="motivation" name="Motivation">
    Todo...
  </Section>
  </Layout>
}



import React from 'react';
import ReactDOM from 'react-dom';

// Bootstrap CSS & JS
import '../styles/style.scss';
import 'bootstrap/dist/js/bootstrap';

ReactDOM.render(
  <React.StrictMode>
    <Achernar />
  </React.StrictMode>,
  document.getElementById('root')
);
