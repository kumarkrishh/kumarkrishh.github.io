import { vec3 } from 'gl-matrix';


function normalize(v: number[]) :vec3{
  const dist = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return vec3.fromValues(v[0] / dist, v[1] / dist, v[2] / dist);
}


export function genIcosahedron(): vec3[] {

  // the golden ratio
  const gr = (1 + Math.sqrt(5)) / 2;

  const vertexes:vec3[] = [];

  vertexes.push(normalize([-1, gr, 0]));
  vertexes.push(normalize([1, gr, 0]));
  vertexes.push(normalize([-1, -gr, 0]));
  vertexes.push(normalize([1, -gr, 0]));

  vertexes.push(normalize([0, -1, gr]));
  vertexes.push(normalize([0, 1, gr]));
  vertexes.push(normalize([0, -1, -gr]));
  vertexes.push(normalize([0, 1, -gr]));

  vertexes.push(normalize([gr, 0, -1]));
  vertexes.push(normalize([gr, 0, 1]));
  vertexes.push(normalize([-gr, 0, -1]));
  vertexes.push(normalize([-gr, 0, 1]));


  function addFace(arr: vec3[], i1: number, i2: number, i3: number) {
    arr.push(vec3.clone(vertexes[i1]));
    arr.push(vec3.clone(vertexes[i2]));
    arr.push(vec3.clone(vertexes[i3]));
  }


  // create 20 triangles of the icosahedron
  const faces:vec3[] = [];

  // 5 faces around point 0
  addFace(faces, 0, 11, 5);
  addFace(faces, 0, 5, 1);
  addFace(faces, 0, 1, 7);
  addFace(faces, 0, 7, 10);
  addFace(faces, 0, 10, 11);

  // 5 adjacent faces
  addFace(faces, 1, 5, 9);
  addFace(faces, 5, 11, 4);
  addFace(faces, 11, 10, 2);
  addFace(faces, 10, 7, 6);
  addFace(faces, 7, 1, 8);

  // 5 faces around point 3
  addFace(faces, 3, 9, 4);
  addFace(faces, 3, 4, 2);
  addFace(faces, 3, 2, 6);
  addFace(faces, 3, 6, 8);
  addFace(faces, 3, 8, 9);

  // 5 adjacent faces
  addFace(faces, 4, 9, 5);
  addFace(faces, 2, 4, 11);
  addFace(faces, 6, 2, 10);
  addFace(faces, 8, 6, 7);
  addFace(faces, 9, 8, 1);

  return faces;
}
