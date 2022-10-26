import React from 'react';

import ArticleLayout from '../components/ArticleLayout';
import Articles from '../components/Articles';

// Bootstrap CSS & JS
import '../styles/style.scss';
import 'bootstrap/dist/js/bootstrap';

const ArticlesPage = () => <ArticleLayout>{
  ({ Citation, CitationBank }) => <Articles/>
}</ArticleLayout>


// Bootstrap CSS & JS
import '../styles/style.scss';
import 'bootstrap/dist/js/bootstrap';

import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ArticlesPage />
  </React.StrictMode>,
);
