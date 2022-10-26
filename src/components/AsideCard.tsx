import React from 'react';

type AsideCardProps = {
  title: string,
  id?: string,
  children: React.ReactNode | React.ReactNodeArray,
}


const AsideCard: React.FunctionComponent<AsideCardProps> = props =>
  <div className="card mx-5 mb-4" id={props.id}>
    <div className="card-body">
      <h6 className="card-title text-decoration-underline">{props.title}</h6>
      <div className="card-text">{props.children}</div>
    </div>
  </div>

export default AsideCard;
