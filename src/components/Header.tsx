import { ThreeDotsVertical } from 'react-bootstrap-icons'

const ArticlesUrl = '/articles.html';
const ResumeUrl = '/resume.html';
const ProjectsUrl = '/projects.html';

const Header = () =>
  <header className="pb-5">
    <nav className={"navbar navbar-expand-lg py-3 fixed-top bg-secondary"}>
      <div className="container d-flex">
        <a className="navbar-brand" href="/"><strong>Govind Pimpale</strong></a>
        {/*Collapsible Button*/}
        <button type="button" className="navbar-toggler"
          data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"
        >
          <ThreeDotsVertical className="text-body" />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {/*Right Aligned*/}
          <div className="navbar-nav ms-auto">
            <a href={ResumeUrl} className="nav-item nav-link"><strong>Resume</strong></a>
            <a href={ProjectsUrl} className="nav-item nav-link"><strong>Projects</strong></a>
            <a href={ArticlesUrl} className="nav-item nav-link"><strong>Articles</strong></a>
          </div>
        </div>
      </div>
    </nav>
  </header>

export default Header;
